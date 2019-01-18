import { I18n } from "iocentro-apps-common-bits";
import React from "react";
import { Image, StyleProp, TransformsStyle, ViewStyle } from "react-native";

import { GradientTextButton } from "../Buttons";
import { HorizontalSpacer } from "./Overview";

const navright = require("../../../img/steps/navright.png");

export interface NavButtonProps {
  type: "next" | "prev" | "rate" | "finish";
  onPress?: () => void;
}

export const NavButton = (props: NavButtonProps) => {
  const {
    type,
    onPress,
  } = props;
  const params = BUTTON_PARAMS[type];

  return (
    <GradientTextButton
      theme="red"
      style={[{
        height: 43,
        paddingLeft: 25,
        paddingRight: 25,
      }, params.style]}
      text={I18n.t(type).toUpperCase()}
      onPress={onPress}>
      <HorizontalSpacer width={20}/>
      {type != "finish" &&
        <Image
          style={params.imageStyle}
          source={navright}>
        </Image>
      }
    </GradientTextButton>
  );
};

interface ButtonParams {
  style?: StyleProp<ViewStyle>;
  imageStyle?: TransformsStyle;
}

interface IButtonsParams {
  [key: string]: ButtonParams;
}

const BUTTON_PARAMS: IButtonsParams = {
  next: {
    style: {
      flexDirection: "row",
    },
  },
  prev: {
    style: {
      flexDirection: "row-reverse",
    },
    imageStyle: { transform: [{ rotateY: "180deg" }] },
  },
  rate: {
    style: {
      flexDirection: "row",
    },
  },
  finish: {
    style: {
      justifyContent: "center",
    },
  },
};
