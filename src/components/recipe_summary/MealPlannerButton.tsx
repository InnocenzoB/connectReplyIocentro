import React, { Component } from "react";
import { StyleProp } from "react-native";
import { ViewStyle } from "react-native";
import { I18n } from "iocentro-apps-common-bits";

import { IS_TABLET } from "../../Platform";
import { IconAndTextButton } from "./IconAndTextButton";

const calendarIcon = require("../../../img/icons/calendarIcon.png");
const mealPlannerIcon = require("../../../img/icons/mealPlannerIcon.png");

interface MealPlannerButtonProps {
  color?: "white" | "red";
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
}

export class MealPlannerButton extends Component<MealPlannerButtonProps> {
  public render() {
    const { color = "red", style, onPress } = this.props;
    const iconSource = color == "white" ? mealPlannerIcon : calendarIcon;
    const textStyle = color == "white" ? { color: "white"} : undefined;
    return (
      <IconAndTextButton
        style={[{alignItems: "center"}, style]}
        text={I18n.t("plan").toUpperCase()}
        iconSize={IS_TABLET ? 31 : 27}
        {...{
          textStyle,
          iconSource,
          onPress,
        }}
      />
    );
  }
}
