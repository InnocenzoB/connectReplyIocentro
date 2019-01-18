import React, { Component } from "react";
import { Image, ImageStyle, StyleProp, StyleSheet, TextStyle } from "react-native";

import { IS_TABLET, PlatformSelect } from "../Platform";
import { GradientButton } from "./Buttons";
import { TextScaledOnPhone } from "./ScaledText";

const applianceIcon = require("../../img/icons/applianceIcon.png");
const unitsIcon = require("../../img/icons/unitsIcon.png");
const aboutIcon = require("../../img/icons/aboutIcon.png");
const signOutIcon = require("../../img/icons/signOutIcon.png");
const playIcon = require("../../img/icons/createPlayButton.png");
const pauseIcon = require("../../img/icons/pauseIcon.png");

export enum RoundButtonType {
  Appliance = "appliance",
  Units = "units",
  About = "about",
  SignOut = "signOut",
  Play = "play",
  Pause = "pause",
}

interface RoundButtonStyle {
  width?: number;
  height?: number;
}

export interface RoundButtonProps {
  type: RoundButtonType;
  grayed?: boolean;
  onPress?: () => void;
  style?: StyleProp<RoundButtonStyle>;
  text?: string;
  disabled?: boolean;
}

interface RoundButtonDefaultProps {
  icon: any;
  iconStyle?: StyleProp<ImageStyle>;
  textStyle?: StyleProp<TextStyle>;
}

const buttonsTypeProps: {[key in RoundButtonType]: RoundButtonDefaultProps} = {
  appliance: {
    icon: applianceIcon,
  },
  units: {
    icon: unitsIcon,
  },
  about: {
    icon: aboutIcon,
  },
  signOut: {
    icon: signOutIcon,
  },
  play: {
    icon: playIcon,
    iconStyle: IS_TABLET ? undefined : {
      transform: [{ scale: 0.7 }],
    },
    textStyle: IS_TABLET ? undefined : {
      fontSize: 8,
    },
  },
  pause: {
    icon: pauseIcon,
  },
};

const redGradient = ["#d4000dff", "#c00000ff"];
const grayGradient = ["#757575ff", "#585858ff"];

export class RoundButton extends Component<RoundButtonProps> {

  public render() {
    const gradient = this.props.grayed ? grayGradient : redGradient;
    const buttonTypeProps = buttonsTypeProps[this.props.type];
    return (
      <GradientButton
        disabled={!!this.props.disabled}
        onPress={() => { if (this.props.onPress) { this.props.onPress(); } }}
        colors={gradient}
        disableReversing
        style={[
          this.props.text ? styles.textBtnGradient : styles.gradient,
          styles.touchable,
          this.props.style,
        ]}
      >
          <Image source={buttonTypeProps.icon} style={buttonTypeProps.iconStyle} />
          {this.props.text &&
            <TextScaledOnPhone style={[styles.text, buttonTypeProps.textStyle]}>
              {this.props.text}
            </TextScaledOnPhone>
          }
      </GradientButton>
    );
  }
}

const styles = StyleSheet.create({
  gradient: {
    ...PlatformSelect({
      anyTablet: {
        width: 96,
        height: 96,

      },
      anyPhone: {
        width: 70,
        height: 70,
      },
    }),
    borderRadius: 100,
    shadowColor: "rgba(0,0,0,0.2)",
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 10,
    shadowOpacity: 1,
  },
  textBtnGradient: {
    ...PlatformSelect({
      anyTablet: {
        width: 96,
        height: 96,
      },
      anyPhone: {
        width: 70,
        height: 70,
      },
    }),
    borderRadius: 100,
    shadowColor: "rgba(0, 0, 0, 0.3)",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowRadius: 14,
    shadowOpacity: 1,
  },
  touchable: {
    ...PlatformSelect({
      anyTablet: {
        width: 96,
        height: 96,
      },
      anyPhone: {
        width: 70,
        height: 70,
      },
    }),
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontFamily: "Muli",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 2,
    color: "#ffffff",
    backgroundColor: "transparent",
    marginTop: IS_TABLET ? 7.4 : 3.4,
  },
});
