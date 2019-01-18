import { I18n } from "iocentro-apps-common-bits";
import { AtomDescriptor } from "iocentro-collection-manager";
import { ChangeOriginType, Model } from "iocentro-datamodel";

import { COOK_PROCESSOR_TYPE_ID } from "./CookProcessorModel";

export function IsNumber(value: any) {
  return value !== null && value !== "" && !isNaN(value);
}

export function IsDefinedNotNull(value: any) {
  return (value !== undefined && value !== null);
}

export interface ConversionOpts<ValueType> {
  validator?: (value: any) => boolean;
  converter?: (value: any) => ValueType;
}

export function UpdateValue<ItemType, ValueType = void>(
  item: ItemType,
  atom: object,
  propertyName: string,
  opts?: ConversionOpts<ValueType>): boolean {
  if (!atom.hasOwnProperty(propertyName)) {
    return false;
  }
  let value = atom[propertyName];
  if (opts) {
    const { validator, converter } = opts;
    if (validator && !validator(value)) {
      return false;
    }
    if (converter) {
      value = converter(value);
    }
  }
  item[propertyName].updateValue(value, ChangeOriginType.backend);
  return true;
}

export function SerializeToObject(item: Model, properties?: string[]): object {
  /*todo maybe add excludedProperties?: string[]*/
  const serializedObject: any = {};
  const propNames = properties || item.allValues().map((value) => value.name);
  for (const propName of propNames) {
    const propValue = item[propName].sv();
    if (propValue != null) {
      serializedObject[propName] = propValue;
    }
  }
  return serializedObject;
}

export const backendworkaround100: AtomDescriptor = {
  version: "1.0.0",
  type: "backendWorkaround",
};

export const GetBackendWorkaroundAtom = () => ({
  version: backendworkaround100.version,
  type: backendworkaround100.type,
  date: (new Date()).toString(),
});

export function ModelEquals(lhs: Model | null, rhs: Model | null): boolean {
  if (!rhs || !lhs) {
    return rhs == lhs;
  }
  const lhsValues = lhs.allValues();
  const rhsValues = rhs.allValues();

  if (lhsValues.length != rhsValues.length) {
    return false;
  }
  for (let i = 0; i < lhsValues.length; i++) {
    if (lhsValues[i].sv() != rhsValues[i].sv()) {
      return false;
    }
  }

  return true;
}

export function CloneModel<T>(m: Model, destination: T): T {
  for (const val of m.allValues()) {
    // todo deep clone?
    destination[val.name].updateValue(val.sv());
  }
  return destination;
}

export const NumberStrictConversionOpts: ConversionOpts<number> = {
  validator: IsNumber,
  converter: Number,
};

export const NonEmptyStringConversionOpts: ConversionOpts<string> = {
  validator: (str: string) => str != "",
  converter: String,
};

export function DeviceNameFromDeviceTypeId(deviceTypeId: number) {
  switch (deviceTypeId) {
    case COOK_PROCESSOR_TYPE_ID:
      return I18n.t("cook_processor_name");
    default:
      return `${I18n.t("unknown_device_of_type_id")}: ${deviceTypeId}`;
  }
}
