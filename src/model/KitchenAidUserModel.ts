import {
    ValueBase,
    ValueTrait,
    ChangeOriginType,
    BackendCommandTargetType,
    BackendCommandParameterMapping,
    BackendStatusValueExtractionWithTransformDescription,
} from 'iocentro-datamodel';

import {
    UserModel,
} from 'iocentro-apps-common-bits';

import {
    StrictStringToBool,
} from 'iocentro-toolkit';

export enum UnitSystem {
    Metric,
    Imperial,
}

function StringToUnitSystem(input: string): UnitSystem {
    if (input.toLowerCase() === 'imperial') {
        return UnitSystem.Imperial;
    }

    return UnitSystem.Metric;
}

function UnitSystemToString(vt: ValueTrait): string {
    if (vt.value === UnitSystem.Imperial) {
        return 'imperial';
    }

    return 'metric';
}

function BoolToString(vt: ValueTrait): string {
    if (vt.value) {
        return 'true';
    }

    return 'false';
}

export class KitchenAidUserModel extends UserModel {
    unit: ValueBase;
    notificationOnTimerComplete: ValueBase;
    notificationOnRecipeComplete: ValueBase;
    notificationOnError: ValueBase;

    constructor() {
        super();

        this.unit = new ValueBase([], 'unit');
        this.unit.update([
            new BackendStatusValueExtractionWithTransformDescription(
                `${UserModel.preferencesGroupKey}/unit`,
                '',
                'metric',
                StringToUnitSystem,
            ),
            new BackendCommandParameterMapping(
                'unit',
                UnitSystemToString,
                BackendCommandTargetType.Attribute,
            ),
        ], ChangeOriginType.model);

        this.notificationOnTimerComplete = new ValueBase([], 'notificationOnTimerComplete');
        this.notificationOnTimerComplete.update([
            new BackendStatusValueExtractionWithTransformDescription(
                `${UserModel.preferencesGroupKey}/notification.timerComplete`,
                '',
                'false',
                StrictStringToBool,
            ),
            new BackendCommandParameterMapping(
                'notification.timerComplete',
                BoolToString,
                BackendCommandTargetType.Attribute,
            ),
        ], ChangeOriginType.model);

        this.notificationOnRecipeComplete = new ValueBase([], 'notificationOnRecipeComplete');
        this.notificationOnRecipeComplete.update([
            new BackendStatusValueExtractionWithTransformDescription(
                `${UserModel.preferencesGroupKey}/notification.recipeComplete`,
                '',
                'false',
                StrictStringToBool,
            ),
            new BackendCommandParameterMapping(
                'notification.recipeComplete',
                BoolToString,
                BackendCommandTargetType.Attribute,
            ),
        ], ChangeOriginType.model);

        this.notificationOnError = new ValueBase([], 'notificationOnError');
        this.notificationOnError.update([
            new BackendStatusValueExtractionWithTransformDescription(
                `${UserModel.preferencesGroupKey}/notification.applianceError`,
                '',
                'false',
                StrictStringToBool,
            ),
            new BackendCommandParameterMapping(
                'notification.applianceError',
                BoolToString,
                BackendCommandTargetType.Attribute,
            ),
        ], ChangeOriginType.model);

        this.doInit();
    }

    flipUnit() {
        const u = this.unit.sv();

        let nu = UnitSystem.Metric;
        if (u === UnitSystem.Metric) {
            nu = UnitSystem.Imperial;
        }

        this.unit.updateValue(nu);
    }

    allValues(): ValueBase[] {
        return super.allValues().concat([
            this.unit, this.notificationOnTimerComplete, this.notificationOnRecipeComplete, this.notificationOnError,
        ]);
    }
}
