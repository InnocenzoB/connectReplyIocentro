import {
    BaseDeviceModel,
    DeviceUpdateDescriptor,
    I18n,
} from "iocentro-apps-common-bits";
import { RecipeModel } from "iocentro-collection-manager";
import {
    BackendCommandCodeMapping,
    BackendCommandParameterMapping,
    BackendCommandTargetType,
    BackendStatusValueExtractionDescription,
    BackendStatusValueExtractionWithTransformDescription,
    ChangeOriginType,
    CooldownDescription,
    Trait,
    TriggerDescriptor,
    TriggerType,
    ValueBase,
    ValueTrait,
} from "iocentro-datamodel";
import { StringToNumber } from "iocentro-toolkit";

import {
    ioCentroDeviceRegistrationPayload, ioCentroDispatch, ioCentroEndpoint,
    ioCentroEndpointParam, ioCentroEndpointType, ioCentroRequest, ioCentroUtility,
} from "iocentro-connectivity";

export enum CookProcessorState {
    Idle,
    Running,
    Pause,
    Complete,
}

export enum CookProcessorMode {
    Manual,
    Recipe,
    Weight,
}

export enum CookMotorSpeed {
    MotorSpeedOff,
    MotorSpeed01,
    MotorSpeed02,
    MotorSpeed03,
    MotorSpeed04,
    MotorSpeed05,
    MotorSpeed06,
    MotorSpeed07,
    MotorSpeed08,
    MotorSpeed09,
    MotorSpeed10,
    MotorSpeedIntermittent,
    MotorSpeedPulse,
}

export enum CookOperation {
    None = 0,
    Cancel = 1,
    Pause = 5,
    CancelCustomCycle = 7,
}

export function UiFormatMotorSpeed(value) {
    if (value === 0) {
        return I18n.t("off");
    }

    return value.toString();
}

export function OperationAsEnum(v: string): (CookOperation | null) {
    switch (v) {
        case "OperationNone":
            return CookOperation.None;
        case "OperationCancel":
            return CookOperation.Cancel;
        case "OperationPause":
            return CookOperation.Pause;
        case "OperationCancelCustomCycle":
            return CookOperation.CancelCustomCycle;
    }

    return null;
}

export function OperationAsString(vt: ValueTrait): any {
    const v = vt.value;

    switch (v) {
        case CookOperation.None:
            return "OperationNone";
        case CookOperation.Cancel:
            return "OperationCancel";
        case CookOperation.Pause:
            return "OperationPause";
        case CookOperation.CancelCustomCycle:
            return "OperationCancelCustomCycle";
    }

    return null;
}

export function StateAsEnum(v: string): (CookProcessorState | null) {
    switch (v) {
        case "StateIdle":
            return CookProcessorState.Idle;
        case "StateRunning":
            return CookProcessorState.Running;
        case "StatePause":
            return CookProcessorState.Pause;
        case "StateComplete":
            return CookProcessorState.Complete;
    }

    return null;
}

export function MotorSpeedAsEnum(v: string): (CookMotorSpeed | null) {
    switch (v) {
        case "MotorSpeedOff":
            return CookMotorSpeed.MotorSpeedOff;
        case "MotorSpeed01":
            return CookMotorSpeed.MotorSpeed01;
        case "MotorSpeed02":
            return CookMotorSpeed.MotorSpeed02;
        case "MotorSpeed03":
            return CookMotorSpeed.MotorSpeed03;
        case "MotorSpeed04":
            return CookMotorSpeed.MotorSpeed04;
        case "MotorSpeed05":
            return CookMotorSpeed.MotorSpeed05;
        case "MotorSpeed06":
            return CookMotorSpeed.MotorSpeed06;
        case "MotorSpeed07":
            return CookMotorSpeed.MotorSpeed07;
        case "MotorSpeed08":
            return CookMotorSpeed.MotorSpeed08;
        case "MotorSpeed09":
            return CookMotorSpeed.MotorSpeed09;
        case "MotorSpeed10":
            return CookMotorSpeed.MotorSpeed10;
        case "MotorSpeedIntermittent":
            return CookMotorSpeed.MotorSpeedIntermittent;
        case "MotorSpeedPulse":
            return CookMotorSpeed.MotorSpeedPulse;
    }

    return null;
}

export function lockStartDueToHighSpeed(motorSpeed: CookMotorSpeed): boolean {
    return (motorSpeed <= 2 || motorSpeed == CookMotorSpeed.MotorSpeedIntermittent) ? false : true;
}

export function MotorSpeedAsString(vt: ValueTrait): any {
    const v = vt.value;

    switch (v) {
        case CookMotorSpeed.MotorSpeedOff:
            return "MotorSpeedOff";
        case CookMotorSpeed.MotorSpeed01:
            return "MotorSpeed01";
        case CookMotorSpeed.MotorSpeed02:
            return "MotorSpeed02";
        case CookMotorSpeed.MotorSpeed03:
            return "MotorSpeed03";
        case CookMotorSpeed.MotorSpeed04:
            return "MotorSpeed04";
        case CookMotorSpeed.MotorSpeed05:
            return "MotorSpeed05";
        case CookMotorSpeed.MotorSpeed06:
            return "MotorSpeed06";
        case CookMotorSpeed.MotorSpeed07:
            return "MotorSpeed07";
        case CookMotorSpeed.MotorSpeed08:
            return "MotorSpeed08";
        case CookMotorSpeed.MotorSpeed09:
            return "MotorSpeed09";
        case CookMotorSpeed.MotorSpeed10:
            return "MotorSpeed10";
        case CookMotorSpeed.MotorSpeedIntermittent:
            return "MotorSpeedIntermittent";
        case CookMotorSpeed.MotorSpeedPulse:
            return "MotorSpeedPulse";
    }

    return "";
}

export function ModeAsEnum(v: string): (CookProcessorMode | null) {
    switch (v) {
        case "CookProcModeManual":
            return CookProcessorMode.Manual;
        case "CookProcModeRecipe":
            return CookProcessorMode.Recipe;
        case "CookProcModeWeigh":
            return CookProcessorMode.Weight;
    }

    return null;
}

export function ModeEnumAsString(vt: ValueTrait): any {
    const v = vt.value;

    switch (v) {
        case CookProcessorMode.Manual:
            return "CookProcModeManual";
        case CookProcessorMode.Recipe:
            return "CookProcModeRecipe";
        case CookProcessorMode.Weight:
            return "CookProcModeWeigh";
    }

    return "";
}

function Passthrough(value: ValueTrait): any {
    return value.value;
}

export const COOK_PROCESSOR_TYPE_ID = 8;

export class CookProcessorModel extends BaseDeviceModel {
    public readonly attributeDeviceCustomName = "deviceCustomName";

    public name: ValueBase;

    public isLidUnlocked: ValueBase;
    public currentStep: ValueBase;
    public requestedStep: ValueBase;
    public motorSpeed: ValueBase; // Should be dynamicValue
    public mode: ValueBase;

    public currentTemp: ValueBase;
    public targetTemp: ValueBase;

    public currentTimeRemaining: ValueBase;
    public targetTime: ValueBase;

    public weight: ValueBase;
    public weightIncrementalAmount: ValueBase;
    public weightTargetOverfill: ValueBase;
    public weightTargetReached: ValueBase;

    public currentState: ValueBase;
    public targetState: ValueBase;

    public isDirectlyConnected: ValueBase;
    public requestedProgram: ValueBase;
    public requestedCustomRecipe: ValueBase;
    public requestedProgramInProgress: ValueBase;
    public requestedProgramUploadFailed: ValueBase;
    public operation: ValueBase;

    public connectionErrorOccured: ValueBase;

    constructor() {
        super();

        // Override setting of remoteControl from the status
        // TODO: Improve trait removal API
        this.remoteControl.remove(new BackendStatusValueExtractionWithTransformDescription(
            "fake",
            "",
            "",
            StringToNumber,
        ), ChangeOriginType.model);
        this.remoteControl.update(new BackendStatusValueExtractionDescription(
            "RemoteControlEnable",
            false,
            false,
        ), ChangeOriginType.model);

        // TODO: Improve trait removal API
        this.cloudConnected.remove(new BackendStatusValueExtractionWithTransformDescription(
            "fake",
            "",
            "",
            StringToNumber,
        ), ChangeOriginType.model);
        this.cloudConnected.update(new BackendStatusValueExtractionDescription(
            "cloudConnected",
            false,
            false,
        ), ChangeOriginType.model);
        // Override ends

        this.name = new ValueBase([], "name");
        this.name.update([
            new BackendCommandParameterMapping(
                this.attributeDeviceCustomName,
                Passthrough,
                BackendCommandTargetType.Attribute,
            ),
        ], ChangeOriginType.model);

        this.isLidUnlocked = new ValueBase([], "isLidUnlocked");
        this.isLidUnlocked.update(new BackendStatusValueExtractionDescription(
            "CoverOpen",
            false,
            false,
        ), ChangeOriginType.model);

        this.currentStep = new ValueBase([], "currentStep");
        this.currentStep.update(new BackendStatusValueExtractionWithTransformDescription(
            "Step",
            "",
            null,
            StringToNumber,
        ), ChangeOriginType.model);

        this.requestedStep = new ValueBase([], "requestedStep");
        this.requestedStep.update([
            new BackendCommandCodeMapping("StepFeature"),
            new BackendCommandParameterMapping(
                "Step",
                Passthrough,
                BackendCommandTargetType.Command,
            ),
        ], ChangeOriginType.model);

        this.motorSpeed = new ValueBase([], "motorSpeed");
        this.motorSpeed.update(new BackendStatusValueExtractionWithTransformDescription(
            "MotorSpeed",
            "",
            null,
            MotorSpeedAsEnum,
        ), ChangeOriginType.model);
        this.motorSpeed.update([
            new BackendCommandCodeMapping("MotorSpeedFeature"),
            new BackendCommandParameterMapping(
                "MotorSpeed",
                MotorSpeedAsString,
                BackendCommandTargetType.Command,
            ),
        ], ChangeOriginType.model);

        this.mode = new ValueBase([], "mode");
        this.mode.update([
            new BackendStatusValueExtractionWithTransformDescription(
                "Mode",
                "",
                null,
                ModeAsEnum,
            ),
            new BackendCommandCodeMapping("ModeFeature"),
            new BackendCommandParameterMapping(
                "Mode",
                ModeEnumAsString,
                BackendCommandTargetType.Command,
            ),
        ], ChangeOriginType.model);

        this.currentTemp = new ValueBase([], "currentTemp");
        this.currentTemp.update(new BackendStatusValueExtractionWithTransformDescription(
            "Temperature",
            "",
            "0",
            StringToNumber,
        ), ChangeOriginType.model);

        this.targetTemp = new ValueBase([], "targetTemp");
        this.targetTemp.update(new BackendStatusValueExtractionWithTransformDescription(
            "TargetTemp",
            "",
            "0",
            StringToNumber,
        ), ChangeOriginType.model);
        this.targetTemp.update([
            new BackendCommandCodeMapping("TargetTempFeature"),
            new BackendCommandParameterMapping(
                "TargetTemp",
                Passthrough,
                BackendCommandTargetType.Command,
            ),
        ], ChangeOriginType.model);

        this.currentTimeRemaining = new ValueBase([], "currentTimeRemaining");
        this.currentTimeRemaining.update(new BackendStatusValueExtractionWithTransformDescription(
            "ProcessTimeRemaining",
            "",
            "0",
            StringToNumber,
        ), ChangeOriginType.model);

        this.targetTime = new ValueBase([], "targetTime");
        this.targetTime.update(new BackendStatusValueExtractionWithTransformDescription(
            "ProcessTimeSet",
            "",
            "0",
            StringToNumber,
        ), ChangeOriginType.model);
        this.targetTime.update([
            new BackendCommandCodeMapping("ProcessTimeSetFeature"),
            new BackendCommandParameterMapping(
                "ProcessTimeSet",
                Passthrough,
                BackendCommandTargetType.Command,
            ),
        ], ChangeOriginType.model);

        const weightValueTransformer = (v: string): number => {
            if (this.isDirectlyConnected.sv()) {
                return this.weight.sv();
            }

            return StringToNumber(v);
        };
        this.weight = new ValueBase([], "weight");
        this.weight.update(new BackendStatusValueExtractionWithTransformDescription(
            "Weight",
            "",
            "0",
            weightValueTransformer,
        ), ChangeOriginType.model);

        this.weightIncrementalAmount = new ValueBase([], "weightIncrementalAmount");
        this.weightIncrementalAmount.update(new BackendStatusValueExtractionWithTransformDescription(
            "IncrementalAmount",
            "",
            "0",
            StringToNumber,
        ), ChangeOriginType.model);

        this.weightTargetOverfill = new ValueBase([], "weightTargetOverfill");
        this.weightTargetOverfill.update(new BackendStatusValueExtractionDescription(
            "WeightTargetOverfill",
            false,
            false,
        ), ChangeOriginType.model);

        this.weightTargetReached = new ValueBase([], "weightTargetReached");
        this.weightTargetReached.update(new BackendStatusValueExtractionDescription(
            "WeightTargetReached",
            false,
            false,
        ), ChangeOriginType.model);

        this.currentState = new ValueBase([], "currentState");
        this.currentState.update(new BackendStatusValueExtractionWithTransformDescription(
            "State",
            "",
            null,
            StateAsEnum,
        ), ChangeOriginType.model);

        this.targetState = new ValueBase([], "targetState");
        this.isDirectlyConnected = new ValueBase(new ValueTrait(false), "isDirectlyConnected");
        this.requestedProgram = new ValueBase([], "requestedProgram");
        this.requestedCustomRecipe = new ValueBase([], "requestedCustomRecipe");
        this.requestedProgramInProgress = new ValueBase([], "requestedProgramInProgress");
        this.requestedProgramUploadFailed = new ValueBase(new ValueTrait(false), "requestedProgramUploadFailed");

        this.operation = new ValueBase([], "operation");
        this.operation.update([
            new BackendStatusValueExtractionWithTransformDescription(
                "Operations",
                "",
                null,
                OperationAsEnum,
            ),
            new BackendCommandCodeMapping("OperationsFeature"),
            new BackendCommandParameterMapping(
                "Operations",
                OperationAsString,
                BackendCommandTargetType.Command,
            ),
        ], ChangeOriginType.model);

        [this.motorSpeed, this.targetTemp, this.targetTime]
        .forEach((v) => {
            const protectFromUpdates: TriggerDescriptor = {
                id: "protect-from-updates-inserter",
                action: (traits: Trait[]): Trait[] => {
                    const t = traits.filter((vv) => (vv instanceof CooldownDescription) === false);
                    t.push(new CooldownDescription(new Date(Date.now() + 3 * 1000)));
                    return t;
                },
                type: TriggerType.Update,
                changeTypeActivator: [ChangeOriginType.ui],
            };

            v.addTrigger(protectFromUpdates);
        });

        [
            this.weight, this.weightIncrementalAmount,
            this.weightTargetOverfill, this.weightTargetReached,
            this.motorSpeed, this.targetTemp, this.targetTime,
        ].forEach((v) => {
            const protectFromUpdates: TriggerDescriptor = {
                id: "protect-from-updates-inserter-fake",
                action: (traits: Trait[]): Trait[] => {
                    const t = traits
                        .filter((vv) => {
                            return (vv instanceof CooldownDescription) === false;
                        });

                    t.push(new CooldownDescription(new Date(Date.now() + 3 * 2000)));

                    return t;
                },
                type: TriggerType.Update,
                changeTypeActivator: [ChangeOriginType.model],
            };

            v.addTrigger(protectFromUpdates);
        });

        this.connectionErrorOccured = new ValueBase(new ValueTrait(false), "connectionErrorOccured");

        super.doInit();
    }

    public seedFromStatus(status: object, payloadDescriptor?: (DeviceUpdateDescriptor | undefined)): void {
        super.seedFromStatus(status, payloadDescriptor);

        const rs = this.requestedStep.sv();
        if (rs !== undefined && rs !== null) {
            if (rs === this.currentStep.sv()) {
                this.requestedStep.updateValue(null, ChangeOriginType.backend);
            }
        }

        const attrs = this.attributes.sv() as Array<{ key, value }>;
        const name = attrs
            .filter((v) => v.key === this.attributeDeviceCustomName)
            .reduce((_, cv) => cv.value, I18n.t("cook_processor_name"));
        if (this.name.sv() != name) {
            this.name.updateValue(name, ChangeOriginType.backend);
        }
    }

    public cancelRecipeExecution() {
        this.operation.updateValue(CookOperation.CancelCustomCycle);
    }

    public uploadMyCreation(recipe: RecipeModel) {
        this.requestedCustomRecipe.updateValue(recipe);
    }

    public isReallyRunning(): boolean {
        let paused = false;
        let finished = false;

        const ts: CookProcessorState | null = this.targetState.sv();
        const cs: CookProcessorState | null = this.currentState.sv();

        paused = ts === CookProcessorState.Pause || cs === CookProcessorState.Pause;
        finished = cs === CookProcessorState.Complete;

        return cs === CookProcessorState.Running || finished || paused;
    }

    public isProbablyRunning(): boolean {
        let running = false;
        let paused = false;
        let finished = false;

        const ts: CookProcessorState | null = this.targetState.sv();
        const cs: CookProcessorState | null = this.currentState.sv();

        running = ts === CookProcessorState.Running || cs === CookProcessorState.Running;
        paused = ts === CookProcessorState.Pause || cs === CookProcessorState.Pause;
        finished = cs === CookProcessorState.Complete;

        return running || finished || paused;
    }

    public static _registerDevice = (serialNumber: string, macAddress: string): Promise<void> => {
        return new Promise<void>((resolve, reject) => {
            const endpoint = new ioCentroEndpoint(
                new ioCentroEndpointParam(ioCentroEndpointType.deviceRegister),
                new ioCentroDeviceRegistrationPayload(
                    serialNumber,
                    macAddress,
                    "cookprocessor",
                ),
            );
            const request = new ioCentroRequest(
                endpoint,
                (result, _) => {
                    const success = ioCentroUtility.successResult(result);
                    if (success !== undefined) {
                        /* tslint:disable:no-console */
                        console.log(`[Provisioning] Device provisioning succeeded!`);
                        resolve();
                    } else {
                        console.log(`[Provisioning] Device provisioning failed!`);
                        reject();
                        /* tslint:enable */
                    }
                },
            );
            ioCentroDispatch.request(request);
        });
    }

    public allValues() {
        return super.allValues().concat([
            this.name, this.isLidUnlocked, this.currentStep, this.requestedStep, this.motorSpeed,
            this.mode, this.currentTemp, this.targetTemp, this.currentTimeRemaining,
            this.targetTime, this.weight, this.weightIncrementalAmount, this.weightTargetOverfill,
            this.weightTargetReached, this.currentState, this.targetState, this.isDirectlyConnected,
            this.requestedProgram, this.requestedCustomRecipe, this.requestedProgramInProgress,
            this.requestedProgramUploadFailed, this.operation,
        ]);
    }
}
