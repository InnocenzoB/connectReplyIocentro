import React, { Component } from "react";
import { StyleProp, StyleSheet, TextStyle, ViewStyle } from "react-native";

import { Dims, PlatformSelect } from "../../Platform";
import { IconButton } from "../Buttons";
import { TextScaledOnPhone } from "../ScaledText";

const uncheckedImg = require("../../../img/login_screen/unchecked.png");
const checkedImg = require("../../../img/login_screen/checked.png");

interface CheckBoxProps {
  checked: boolean;
  text?: string;
  style?: StyleProp<ViewStyle>;
  textStyle?: TextStyle;
  onPress?: () => void;
}

export class CheckBox extends Component<CheckBoxProps> {
  public static defaultProps = {
    textStyle: { color: "#ffffff" },
  };

  public render() {
    return (
      <IconButton
        style={[
          styles.container,
          this.props.style,
        ]}
        onPress={this.props.onPress}
        iconStyle={[PlatformSelect({
          anyTablet: {},
          anyPhone: { width: 28, height: 28 },
        }),
        { tintColor: this.props.textStyle!.color }]}
        icon={this.props.checked ? checkedImg : uncheckedImg}
      >
        {(this.props.text !== undefined) &&
          <TextScaledOnPhone style={[styles.font, this.props.textStyle]}>{this.props.text}</TextScaledOnPhone>
        }
      </IconButton>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  font: {
    fontFamily: "Muli",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 2,
    color: "#ffffff",
    marginLeft: Dims.scaleH(6),
  },
});
