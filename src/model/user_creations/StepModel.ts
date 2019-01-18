import { Model, ValueBase } from "iocentro-datamodel";
import { MandatoryGetValueTrait } from "iocentro-datamodel/out/base/TraitHelpers";

import { MotorSpeedAsEnum, MotorSpeedAsString } from "../CookProcessorModel";
import {
  CloneModel,
  ConversionOpts,
  NonEmptyStringConversionOpts,
  NumberStrictConversionOpts,
  SerializeToObject,
  UpdateValue,
} from "../Helpers";

export abstract class StepModel extends Model {
  public abstract isValid(): boolean;

  public title: ValueBase;
  public description: ValueBase;

  constructor() {
    super();

    this.title = new ValueBase([], "title");
    this.description = new ValueBase([], "description");
  }

  public clearTitleAndDescription() {
    this.title.updateValue(null);
    this.description.updateValue(null);
  }

  public allValues() {
    return super.allValues().concat([
      this.title, this.description,
    ]);
  }
}

export class CookProcessorStepModel extends StepModel {
  public targetTemp: ValueBase; // number
  public targetTime: ValueBase; // number
  public motorSpeed: ValueBase; // CookMotorSpeed

  constructor() {
    super();
    this.targetTemp = new ValueBase([], "targetTemp");
    this.targetTime = new ValueBase([], "targetTime");
    this.motorSpeed = new ValueBase([], "motorSpeed");

    this.doInit();
  }

  public static From(vb: ValueBase[]) {
    const newCPStepModel = new CookProcessorStepModel();
    newCPStepModel.targetTemp.updateValue(vb[0].sv());
    newCPStepModel.targetTime.updateValue(vb[1].sv());
    newCPStepModel.motorSpeed.updateValue(vb[2].sv());
    return newCPStepModel;
  }

  public clone() {
    return CloneModel(this, new CookProcessorStepModel());
  }

  public allValues() {
    return super.allValues().concat([
      this.targetTemp, this.targetTime, this.motorSpeed,
    ]);
  }

  public isValid(): boolean {
    const isSpeedSet = this.motorSpeed.sv() != null;
    const isTempSet = this.targetTemp.sv() != null ;
    const isTimerSet = this.targetTime.sv() != null && this.targetTime.sv() > 0;
    return isTimerSet && (isSpeedSet || isTempSet);
  }
}

export const CookProcessorStepModelObjectValidator = (o: object): boolean => {
  const hasTargetTime = o.hasOwnProperty("targetTime");
  const hasDescription = o.hasOwnProperty("description");
  if (!hasTargetTime && !hasDescription) {
    return false;
  }
  // targetTemp and motorSpeed are optional
  return true;
};

export const CookProcessorStepModelFromObject = (o: object): CookProcessorStepModel => {
  const step = new CookProcessorStepModel();

  const hasValidTime = UpdateValue(step, o, "targetTime", NumberStrictConversionOpts);
  const hasValidDescription = UpdateValue(step, o, "description", NonEmptyStringConversionOpts);
  if (!(hasValidTime || hasValidDescription)) {
    throw new Error("CookProcessorStepModel does not have neither 'targetTime' nor 'description' value!");
  }
  UpdateValue(step, o, "targetTemp", NumberStrictConversionOpts);
  UpdateValue(step, o, "motorSpeed", { converter: MotorSpeedAsEnum });
  UpdateValue(step, o, "title", { converter: String });

  return step;
};

export const ObjectFromCookProcessorStepModel = (i: CookProcessorStepModel): object => {
  const serialized = SerializeToObject(i) as any;
  if (i.motorSpeed.sv() != null) {
    const trait = MandatoryGetValueTrait(i.motorSpeed);
    if (trait) {
      serialized.motorSpeed = MotorSpeedAsString(trait);
    }
  }
  return serialized;
};

export const CookProcessorStepConversionOpts: ConversionOpts<CookProcessorStepModel> = {
  validator: CookProcessorStepModelObjectValidator,
  converter: CookProcessorStepModelFromObject,
};

export const CookProcessorStepModelArrayFromObjectArray = (a: object[]): CookProcessorStepModel[] => {
  const ret: CookProcessorStepModel[] = [];
  const { validator, converter } = CookProcessorStepConversionOpts;
  if (!converter || !validator) {
    throw new Error("Wrong conversion options for CookProcessorStepModel!");
  }
  a.forEach((o) => {
    if (validator(o)) {
      ret.push(converter(o));
    }
  });
  return ret;
};

export const CookProcessorStepsConversionOpts = {
  validator: Array.isArray,
  converter: CookProcessorStepModelArrayFromObjectArray,
};
