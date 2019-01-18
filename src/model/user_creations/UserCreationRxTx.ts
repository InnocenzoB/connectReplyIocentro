import {
  AtomConsumerDescriptor,
  ExtractAtomsFromUserData,
  PrimaryAtomsHasBeenSuccessul,
  RxProcess,
  UserDataModel,
} from "iocentro-collection-manager";
import { ChangeOriginType, Model, RootModel, ValueBase } from "iocentro-datamodel";
import XDate from "xdate";

import { COOK_PROCESSOR_TYPE_ID } from "../CookProcessorModel";
import { GetBackendWorkaroundAtom, NumberStrictConversionOpts, UpdateValue } from "../Helpers";
import { CookProcessorStepsConversionOpts, ObjectFromCookProcessorStepModel, StepModel } from "./StepModel";

export class UserCreation extends RootModel {
  public title: ValueBase;
  public deviceTypeId: ValueBase;
  public steps: ValueBase;
  public useCount: ValueBase;

  public created: ValueBase;
  public modified: ValueBase;
  public lastUsed: ValueBase;

  constructor() {
    super();
    this.title = new ValueBase([], "title");
    this.deviceTypeId = new ValueBase([], "deviceTypeId");
    this.steps = new ValueBase([], "steps");
    this.useCount = new ValueBase([], "useCount");

    this.created = new ValueBase([], "created");
    this.modified = new ValueBase([], "modified");
    this.lastUsed = new ValueBase([], "lastUsed");

    this.isDirtyTrackingEnabled = true;

    this.doInit();
  }

  public static readonly Create = (title: string, steps: StepModel[], deviceTypeId: number) => {
    const newItem = new UserCreation();
    newItem.useCount.updateValue(0);
    newItem.deviceTypeId.updateValue(deviceTypeId);
    newItem.title.updateValue(title);
    newItem.steps.updateValue(steps);
    newItem.created.updateValue(XDate(true).getTime());
    return newItem;
  }

  public getLastTimestamp(): number {
    const lastUsedVal = this.lastUsed.sv();
    const modifiedVal = this.modified.sv();
    const lastTimeStamp = Math.max(lastUsedVal, modifiedVal);
    return lastTimeStamp || this.created.sv();
  }

  public isValid(): boolean {
    const steps: StepModel[] = this.steps.sv();

    let hasRequiredFields = !!this.title.sv() && this.deviceTypeId.sv() != null;
    hasRequiredFields = hasRequiredFields && steps && Array.isArray(steps);
    hasRequiredFields = hasRequiredFields && this.useCount.sv() != null;
    hasRequiredFields = hasRequiredFields && this.created.sv() != null;

    if (hasRequiredFields) {
      const allStepsValid = steps.every((step) => step.isValid());
      return allStepsValid;
    }

    return false;
  }

  public registerUsage(): void {
    this.useCount.updateValue(this.useCount.sv() + 1);
    this.lastUsed.updateValue(XDate(true).getTime());
  }

  public allValues(): ValueBase[] {
    return super.allValues().concat([
      this.created, this.modified, this.lastUsed,
      this.useCount, this.title, this.deviceTypeId, this.steps,
    ]);
  }
}

const userCreationDescriptor100: AtomConsumerDescriptor = {
  version: "1.0.0",
  type: "userCreation",
  handler: (o: object, ctx: Model): boolean => {
    if (!(ctx && ctx instanceof UserCreation)) {
      return false;
    }
    const item = ctx as UserCreation;

    if (!UpdateValue(item, o, "title", { converter: String })) {
      return false;
    }
    if (!UpdateValue(item, o, "deviceTypeId", NumberStrictConversionOpts)) {
      return false;
    }
    if (!UpdateValue(item, o, "steps", CookProcessorStepsConversionOpts)) {
      return false;
    }
    if (!UpdateValue(item, o, "useCount", NumberStrictConversionOpts)) {
      return false;
    }

    if (!UpdateValue(item, o, "created", NumberStrictConversionOpts)) {
      return false;
    }
    // optionals
    UpdateValue(item, o, "modified", NumberStrictConversionOpts);
    UpdateValue(item, o, "lastUsed", NumberStrictConversionOpts);

    return true;
  },
};

export function UserCreationRx(ud: UserDataModel): (UserCreation | null) {
  try {
    const atoms = ExtractAtomsFromUserData(ud);
    const item = new UserCreation();

    item.id.updateValue(ud.id.sv());

    const results = RxProcess(
      item,
      atoms,
      [
        userCreationDescriptor100,
      ],
      userCreationDescriptor100.type,
    );

    if (PrimaryAtomsHasBeenSuccessul(userCreationDescriptor100.type, results)) {
      item.isDirty.updateValue(false, ChangeOriginType.backend);
      return item;
    }
  } catch (e) { }

  return null;
}

export function UserCreationTx(item: UserCreation): UserDataModel {
  const atoms: object[] = [];
  const userCreationAtom: any = {
    version: userCreationDescriptor100.version,
    type: userCreationDescriptor100.type,
    title: item.title.sv(),
    deviceTypeId: item.deviceTypeId.sv(),
    steps: [],
    created: item.created.sv(),
    useCount: item.useCount.sv(),
  };
  let sv = item.modified.sv();
  if (sv) {
    userCreationAtom.modified = sv;
  }
  sv = item.lastUsed.sv();
  if (sv) {
    userCreationAtom.lastUsed = sv;
  }

  if (userCreationAtom.deviceTypeId == COOK_PROCESSOR_TYPE_ID) { // TODO
    userCreationAtom.steps = item.steps.sv().map(ObjectFromCookProcessorStepModel);
  }

  atoms.push(userCreationAtom);

  atoms.push(GetBackendWorkaroundAtom());

  const ud = new UserDataModel();
  ud.id.updateValue(item.id.sv());
  ud.value.updateValue({ atoms });

  return ud;
}
