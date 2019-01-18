import { Env, I18n } from "iocentro-apps-common-bits";
import React, { Component } from "react";
import { Image, StyleProp, StyleSheet, TextStyle, TouchableWithoutFeedback, View, ViewStyle } from "react-native";

import { Configuration } from "../../model/Configuration";
import { Dims, ENABLE_ENV_SWITCHING, IS_TABLET, PlatformSelect } from "../../Platform";
import { TextScaledOnPhone } from "../ScaledText";

const logoImg = require("../../../img/login_screen/kitchenaidLogo.png");

interface HeaderProps {
  message?: string;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
}

export class Header extends Component<HeaderProps> {

  public static defaultProps: HeaderProps = {
    message: "",
    style: {},
    onPress: () => { },
  };

  private lastPress = 0;
  private pressCount = 0;

  constructor(props) {
    super(props);
  }

  public render() {
    return (
      <TouchableWithoutFeedback onPress={ENABLE_ENV_SWITCHING ? this.tapsCounter : undefined}>
        <View style={[styles.container, this.props.style]}>
          <View style={{ opacity: 0.8 }}>
            <TextScaledOnPhone style={styles.welcome}>{I18n.t("welcome_to")}</TextScaledOnPhone>
          </View>
          <Image source={logoImg} style={{ tintColor: this.getImageColor() }} />
          {this.props.message ?
            <TextScaledOnPhone style={[styles.headerMessage, { marginTop: IS_TABLET ? 25 : 20 }]}>
              {this.props.message}
            </TextScaledOnPhone>
            :
            null}
        </View>
      </TouchableWithoutFeedback>
    );
  }

  private tapsCounter = () => {
    const delta = new Date().getTime() - this.lastPress;
    if (delta < 500) {
      this.pressCount++;
    } else {
      this.pressCount = 0;
    }

    if (this.pressCount == 4) {
      switch (Configuration.instance.getEnv()) {
        case Env.production: Configuration.instance.changeEnv(Env.staging); break;
        case Env.staging: Configuration.instance.changeEnv(Env.dev); break;
        case Env.dev: Configuration.instance.changeEnv(Env.production); break;
      }
      this.forceUpdate();
      this.pressCount = 0;
    }
    this.lastPress = new Date().getTime();
  }

  private getImageColor = () => {
    switch (Configuration.instance.getEnv()) {
      case Env.production: return "white";
      case Env.staging: return "red";
      case Env.dev: return "green";
      default: return "white";
    }
  }
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: 64,
    marginBottom: IS_TABLET ? 25 : 20,
  },
  welcome: {
    fontFamily: "Merriweather",
    fontSize: 14,
    fontWeight: "300",
    fontStyle: "italic",
    letterSpacing: 0.5,
    color: "#ffffff",
  },
  headerMessage: {
    ...PlatformSelect<TextStyle>({
      anyTablet: {
        width: Dims.scaleH(450),
        fontSize: 16,
        lineHeight: 24,
        letterSpacing: 0.6,
      },
      anyPhone: {
        fontSize: 14,
        lineHeight: 20,
        letterSpacing: 0.5,
      },
    }),
    fontFamily: "Muli",
    color: "#ffffff",
    textAlign: "center",
  },
});
