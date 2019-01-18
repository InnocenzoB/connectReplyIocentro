import React, { Component } from "react";
import { PixelRatio, StyleProp, StyleSheet, Text, TextProperties, TextStyle } from "react-native";

import { Dims, IS_TABLET } from "../Platform";

const pixelRatio = PixelRatio.get();
const fontScale = PixelRatio.getFontScale();
const deviceHeight = Dims.windowDimensions.height;
const deviceWidth = Dims.windowDimensions.width;

type ScaleStrategy = (size: number, factor?: number) => number;

interface ScaledTextProps extends TextProperties {
  strategyOrStrategies?: ScaleStrategy | ScaleStrategy[]; // default: ScaleDownIfNeeded
}

export const FontScalingStrategy = {
  None: (fontSize) => fontSize,  // in general None should not be used - just don't pass strategy at all
  ScaleDownIfNeeded: (fontSize, factor = 2, minValue = 0) => (
    Dims.limit(Dims.customScaleH(fontSize, 0, factor), minValue, fontSize)
  ),
  NoScaleOnAndroid: (fontSize) => fontSize / fontScale, // (db): not fully tested, but seems not to work as expected :(
  RNENormalize,
  RNEModifiedNormalize,
};

export class ScaledText extends Component<ScaledTextProps> {
  public static defaultProps = {
    strategyOrStrategies: FontScalingStrategy.ScaleDownIfNeeded,
  };

  public render() {
    const {
      strategyOrStrategies,
      style,
      ...textProps,
    } = this.props;

    const possiblyModifiedStyle = [style] as Array<StyleProp<TextStyle>>;

    if (strategyOrStrategies) {
      const originalStyle: TextStyle = StyleSheet.flatten(style);
      let fontScaleStrategies;
      if (Array.isArray(strategyOrStrategies)) {
        fontScaleStrategies = strategyOrStrategies;
      } else {
        fontScaleStrategies = [strategyOrStrategies];
      }

      const recalculate = (propName) => {
        const originalVal = originalStyle && originalStyle[propName];
        if (originalVal === undefined) {
          return;
        }
        let recalculatedVal = originalVal;
        for (const fontScaleStrategy of fontScaleStrategies) {
          recalculatedVal = fontScaleStrategy(recalculatedVal);
        }

        possiblyModifiedStyle.push({ [propName]: recalculatedVal });
      };

      recalculate("fontSize");
      recalculate("lineHeight");
    }

    return (
      <Text
        style={possiblyModifiedStyle}
        {...textProps}
      />
    );
  }
}

export const TextScaledOnPhone = IS_TABLET ? Text : ScaledText;

/**
 * react-native-elements normalizeText
 *
 * https://github.com/react-native-training/react-native-elements/blob/master/src/helpers/normalizeText.js
 */
function RNENormalize(fontSize) {
  if (pixelRatio >= 2 && pixelRatio < 3) {
    // iphone 5s and older Androids
    if (deviceWidth < 360) {
      return fontSize * 0.95;
    }
    // iphone 5
    if (deviceHeight < 667) {
      return fontSize;
      // iphone 6-6s
    } else if (deviceHeight >= 667 && deviceHeight <= 735) {
      return fontSize * 1.15;
    }
    // older phablets
    return fontSize * 1.25;
  } else if (pixelRatio >= 3 && pixelRatio < 3.5) {
    // catch Android font scaling on small machines
    // where pixel ratio / font scale ratio => 3:3
    if (deviceWidth <= 360) {
      return fontSize;
    }
    // Catch other weird android width sizings
    if (deviceHeight < 667) {
      return fontSize * 1.15;
      // catch in-between size Androids and scale font up
      // a tad but not too much
    }
    if (deviceHeight >= 667 && deviceHeight <= 735) {
      return fontSize * 1.2;
    }
    // catch larger devices
    // ie iphone 6s plus / 7 plus / mi note 等等
    return fontSize * 1.27;
  } else if (pixelRatio >= 3.5) {
    // catch Android font scaling on small machines
    // where pixel ratio / font scale ratio => 3:3
    if (deviceWidth <= 360) {
      return fontSize;
      // Catch other smaller android height sizings
    }
    if (deviceHeight < 667) {
      return fontSize * 1.2;
      // catch in-between size Androids and scale font up
      // a tad but not too much
    }
    if (deviceHeight >= 667 && deviceHeight <= 735) {
      return fontSize * 1.25;
    }
    // catch larger phablet devices
    return fontSize * 1.4;
  } else {
    // if older device ie pixelRatio !== 2 || 3 || 3.5
    return fontSize;
  }
}

/**
 * Modified version of RNENormalize that treats iPhone7 [375 x 667] as referencial platform.
 */
function RNEModifiedNormalize(fontSize) {
  const normalized = RNENormalize(fontSize);
  // (db): RNENormalize returns fontSize * 1.15 for our referencial platform
  //       (where no scaling should be applied). Therefore as an easiest
  //       solution I am dividing it back by 1.15.
  //       This may not always work great though...
  return normalized / 1.15;
}
