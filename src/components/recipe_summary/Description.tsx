import React, { Component } from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { I18n } from "iocentro-apps-common-bits";

import { IS_TABLET, PlatformSelect } from "../../Platform";
import { TextScaledOnPhone } from "../ScaledText";
import { TouchableScale } from "../TouchableScale";
import { DropDownAnimated, DropDownArrow } from "./DropDown";
import { Line } from "./Line";
import { TitleGrey } from "./Titles";

interface DescriptionProps {
  style?: StyleProp<ViewStyle>;
  text?: string;
}

interface DescriptionState {
  isCollapsed: boolean;
}

export class Description extends Component<DescriptionProps, DescriptionState> {
  constructor(props) {
    super(props);
    this.state = {
      isCollapsed: false,
    };
  }

  public render() {
    if (this.props.text) {
      return (
        <View style={this.props.style}>
          <TouchableScale
            disabled={IS_TABLET}
            onPress={this._toggleCollapsed}
            style={{
              flexDirection: "row",
              alignItems: "center",
            }}>
            <TitleGrey text={I18n.t("description")} />
            {!IS_TABLET && <DropDownArrow isCollapsed={this.state.isCollapsed} />}
          </TouchableScale>
          <Line />
          <DropDownAnimated isCollapsed={this.state.isCollapsed}>
            <TextScaledOnPhone style={styles.stepFont}>{this.props.text}</TextScaledOnPhone>
          </DropDownAnimated>
        </View>
      );
    } else {
      return null;
    }
  }

  private readonly _toggleCollapsed = () => {
    this.setState((prevState) => {
      return {
        isCollapsed: !prevState.isCollapsed,
      };
    });
  }
}

const styles = StyleSheet.create({
  stepFont: {
    ...PlatformSelect({
      anyTablet: {
        fontSize: 18,
        lineHeight: 24,
      },
      anyPhone: {
        fontSize: 12,
        lineHeight: 16,
      },
    }),
    fontFamily: "Muli",
    color: "#000000",
    fontWeight: "normal",
    fontStyle: "normal",
  },
});
