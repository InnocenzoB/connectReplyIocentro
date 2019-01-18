import { DefaultMirrorer } from "iocentro-apps-common-bits";
import { RecipeModel, RecipeStepModel } from "iocentro-collection-manager";
import {
    ioCentroCommandExecParams,
    ioCentroCommandListTask,
    ioCentroDispatch,
    ioCentroEndpoint,
    ioCentroEndpointParam,
    ioCentroEndpointType,
    ioCentroProgramRecipeTask,
    ioCentroRequest,
    ioCentroResult,
    ioCentroTaskStatus,
    ioCentroTaskStatusValue,
    ioCentroUserAuthentication,
    ioCentroUtility,
} from "iocentro-connectivity";
import {
    ChangeOriginType,
    MandatoryGetValueTrait,
    OptionalBackendCommandParameterMapping,
    ValueBase,
} from "iocentro-datamodel";

import { Configuration } from "./Configuration";
import { CookProcessorMode, CookProcessorModel, CookProcessorState } from "./CookProcessorModel";

export function CookProcessorMirrorer(model: CookProcessorModel, changeSource: ValueBase): (void) {
    const doTheCommand = (commandCode: string, commandParams: any[]) => {
        const endpointParam = new ioCentroEndpointParam(ioCentroEndpointType.deviceCommandExecution);
        endpointParam.setValue(model.id.sv());

        ioCentroDispatch.request(
            new ioCentroRequest(
                new ioCentroEndpoint(
                    endpointParam,
                    new ioCentroCommandExecParams(commandCode, commandParams),
                ),
                (result: ioCentroResult) => {
                    if (result.isFailure()) {
                        model.connectionErrorOccured.updateValue(true);
                    }
                },
            ),
        );
    };

    const handleStateChange = () => {
        const currentState = model.currentState.sv();
        const targetState = model.targetState.sv();

        switch (targetState) {
            case CookProcessorState.Running:
                const paramsFromStateVbs =
                    [
                        model.mode,
                        model.targetTime,
                        model.targetTemp,
                        model.motorSpeed,
                    ]
                        .filter((v) => {
                            const commandParamsMapper = OptionalBackendCommandParameterMapping(v);
                            return commandParamsMapper !== undefined && commandParamsMapper.paramValueTransform;
                        })
                        .map((v) => {
                            const commandParamsMapper = OptionalBackendCommandParameterMapping(v)!;

                            return {
                                parameterKey: commandParamsMapper.paramKey,
                                parameterValue: commandParamsMapper.paramValueTransform(MandatoryGetValueTrait(v)!),
                            };
                        });

                const paramsStatic =
                    [
                        { k: "ScaleReset", v: "false" },
                        { k: "Message", v: "" },
                        { k: "OperationsOperationStart", v: "" },
                        { k: "ProcessCompleteAction", v: "ProcessCmpltActionKeepWarm" },
                        { k: "Icon", v: "CookProcIconNone" },
                    ]
                        .map((v) => {
                            return {
                                parameterKey: v.k,
                                parameterValue: v.v,
                            };
                        });

                if (currentState === CookProcessorState.Pause) {
                    doTheCommand("OperationsOperationResume", []);
                } else {
                    doTheCommand("CycleOperationStart", paramsStatic.concat(paramsFromStateVbs));
                }
                break;

            case CookProcessorState.Pause:
                doTheCommand("OperationsOperationPause", []);
                break;

            case CookProcessorState.Idle:
                doTheCommand("OperationsOperationCancelCustomCycle", [{ parameterKey: "Cooker_OpSetOperations", parameterValue: "7" }]);
                break;
            case CookProcessorState.Complete:
                doTheCommand("OperationsOperationCancel", []);
                break;
        }
    };

    const handleModeChange = () => {
        const mode = model.mode.sv();

        if (mode === CookProcessorMode.Weight) {
            doTheCommand("ScaleResetFeature", [{
                parameterKey: "ScaleReset",
                parameterValue: true,
            }]);

            doTheCommand("IncrementalAmountFeature", [{
                parameterKey: "IncrementalAmount",
                parameterValue: 3000,
            }]);
        } else {
            model.weight.updateValue(0, ChangeOriginType.backend);
        }
    };

    const handleRequestedProgramOrCustomRecipeChange = () => {
        const markFinishOfProgramUpload = (failed: boolean) => {
            model.requestedProgram.updateValue(null, ChangeOriginType.model);
            model.requestedCustomRecipe.updateValue(null);
            model.requestedProgramUploadFailed.updateValue(failed);
        };

        const pollProgramExecutionState = (transactionId: string) => {
            const endpointParam = new ioCentroEndpointParam(ioCentroEndpointType.deviceTaskExecutionStatus);
            endpointParam.setValue([ioCentroUserAuthentication.instance.userCode(), transactionId]);

            ioCentroDispatch.request(
                new ioCentroRequest(
                    new ioCentroEndpoint(
                        endpointParam,
                    ),
                    (result: ioCentroResult): void => {
                        const success = ioCentroUtility.successResult(result);

                        if (success) {
                            const checkResult = success.parsedObject as ioCentroTaskStatus;
                            if (checkResult.status === ioCentroTaskStatusValue.error || checkResult.status === ioCentroTaskStatusValue.completed) {
                                markFinishOfProgramUpload(checkResult.status === ioCentroTaskStatusValue.error);
                            } else {
                                setTimeout(() => {
                                    pollProgramExecutionState(transactionId);
                                }, 1200);
                            }
                        } else {
                            markFinishOfProgramUpload(true);
                        }
                    },
                ),
            );
        };

        const rp = model.requestedProgram.sv();
        const cr = model.requestedCustomRecipe.sv() as RecipeModel;
        model.requestedProgramInProgress.updateValue(rp !== null || cr !== null);

        if (rp !== null || cr !== null) {
            model.requestedProgramUploadFailed.updateValue(false);
            model.requestedStep.updateValue(null);
            model.currentStep.updateValue(1);

            const endpointParam = new ioCentroEndpointParam(ioCentroEndpointType.deviceTaskExecution);
            endpointParam.setValue(ioCentroUserAuthentication.instance.userCode());

            let payload;
            if (rp !== null) {
                payload = new ioCentroProgramRecipeTask(
                    model.id.sv(),
                    model.requestedProgram.sv(),
                    "base",
                    Configuration.instance.getLanguageLimitedByAllowed(),
                );
            } else if (cr !== null) {
                const title = cr.title.sv() ? cr.title.sv() : "";
                const cmds = (cr.steps.sv() as RecipeStepModel[]).map((v) => {
                    return v.commands.sv()[0];
                });
                payload = new ioCentroCommandListTask(model.id.sv(), title, cmds);
            }

            ioCentroDispatch.request(
                new ioCentroRequest(
                    new ioCentroEndpoint(
                        endpointParam,
                        payload,
                    ),
                    (result: ioCentroResult): void => {
                        const success = ioCentroUtility.successResult(result);
                        if (success && success.rawResponse) {
                            const location = success.rawResponse.headers.get("location");

                            if (location && location.length > 0) {
                                const transactionID = location.split("/").pop();
                                pollProgramExecutionState(transactionID!);
                            } else {
                                markFinishOfProgramUpload(true);
                            }
                        } else {
                            markFinishOfProgramUpload(true);
                        }
                    },
                ),
            );
        }
    };

    if (changeSource === model.targetState) {
        handleStateChange();
    } else if (changeSource === model.requestedProgram || changeSource === model.requestedCustomRecipe) {
        handleRequestedProgramOrCustomRecipeChange();
    } else {
        DefaultMirrorer(model, changeSource, (result: ioCentroResult) => {
            if (result.isFailure()) {
                model.connectionErrorOccured.updateValue(true);
            }
        });

        if (changeSource === model.mode) {
            handleModeChange();
        }
    }
}
