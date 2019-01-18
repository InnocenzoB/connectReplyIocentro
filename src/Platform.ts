import { Dimensions, Platform, PlatformOSType } from "react-native";
import DeviceInfo from "react-native-device-info";

import { ENV_SWITCHING_ENABLED } from "./build_config";

export type AdditionalPlatforms =
  "androidTablet" | "iosTablet" | "anyTablet" |
  "androidPhone" | "iosPhone" | "anyPhone";

export type AllPlatforms = PlatformOSType | AdditionalPlatforms;

const aspectRatio = (() => {
  const { width, height } = Dimensions.get("screen");
  return Math.max(width, height) / Math.min(width, height);
})();

const STEP_SCREEN_TABLET_HEIGHT = 701;

export const isTablet = () => {
  const { width, height } = Dimensions.get("screen");

  if (aspectRatio >= 1.6 && (Math.min(width, height) < STEP_SCREEN_TABLET_HEIGHT)) {
    // BIOT-10008, BIOT-10043
    // Treat "rectangular" and small devices as phones due to layout problems
    return false;
  }
  return DeviceInfo.isTablet();
};

export const IS_TABLET = isTablet();

export const PlatformSelect = <T>(specifics: { [platform in AllPlatforms]?: T }): T => {
  {
    // tslint:disable:no-string-literal
    if (IS_TABLET) {
      if ("anyTablet" in specifics) {
        return specifics["anyTablet"] as T;
      }
      if (Platform.OS == "android" && "androidTablet" in specifics) {
        return specifics["androidTablet"] as T;
      }
      if (Platform.OS == "ios" && "iosTablet" in specifics) {
        return specifics["iosTablet"] as T;
      }
    } else {
      if ("anyPhone" in specifics) {
        return specifics["anyPhone"] as T;
      }
      if (Platform.OS == "android" && "androidPhone" in specifics) {
        return specifics["androidPhone"] as T;
      }
      if (Platform.OS == "ios" && "iosPhone" in specifics) {
        return specifics["iosPhone"] as T;
      }
    }
    // tslint:enable:no-string-literal
  }
  // fallback to default impl
  return Platform.select(specifics);
};

const windowDimensions = (() => {
  let { width, height } = Dimensions.get("window");
  const flipDims = () => {
    const w = height;
    height = width;
    width = w;
  };
  if (IS_TABLET) {
    if (width < height) {
      flipDims();
    }
  } else {
    if (width > height) {
      flipDims();
    }
  }
  return { width, height };
})();

const ipadDimensions = { width: 1024, height: 768 };
const iphoneDimensions = { width: 375, height: 667 };

const referenceDimentions = IS_TABLET ? ipadDimensions : iphoneDimensions;

const scaleHImpl = (size: number, constPart: number = 0) => {
  return (windowDimensions.width - constPart) / (referenceDimentions.width - constPart) * size;
};

const scaleVImpl = (size: number, constPart: number = 0) => {
  return (windowDimensions.height - constPart) / (referenceDimentions.height - constPart) * size;
};

const customScaleHImpl = (size: number, constPart: number = 0, factor: number = 0.5) => {
  return size + (scaleHImpl(size, constPart) - size) * factor;
};

const customScaleVImpl = (size: number, constPart: number = 0, factor: number = 0.5) => {
  return size + (scaleVImpl(size, constPart) - size) * factor;
};

const limit = (value: number, min?: number, max?: number) => {
  let retVal = value;
  if (min !== undefined) {
    retVal = Math.max(retVal, min);
  }
  if (max !== undefined) {
    retVal = Math.min(retVal, max);
  }
  return retVal;
};

const scaledDimensions = {
  width: scaleHImpl(referenceDimentions.width),
  height: scaleVImpl(referenceDimentions.height),
};

export class Dims {
  public static readonly ipadDimensions = ipadDimensions;
  public static readonly iphoneDimensions = iphoneDimensions;
  public static readonly windowDimensions = windowDimensions;
  public static readonly referenceDimentions = referenceDimentions;
  public static readonly scaledDimensions = scaledDimensions;
  public static readonly aspectRatio = aspectRatio;

  public static readonly scaleH = scaleHImpl;
  public static readonly scaleV = scaleVImpl;

  public static readonly customScaleH = customScaleHImpl;
  public static readonly customScaleV = customScaleVImpl;

  public static readonly limit = limit;
}

export const ENABLE_ENV_SWITCHING = (() => {
  if (Platform.OS == "android") {
    return ENV_SWITCHING_ENABLED;
  } else {
    if (DeviceInfo.getBundleId() === "com.reply.KitchenAid") {
      return true;
    }
  }
  return false;
})();
