import { I18n } from "iocentro-apps-common-bits";
import React, { Component } from "react";
import { Image, StyleSheet, View } from "react-native";
import DeviceInfo from "react-native-device-info";

import { IS_TABLET } from "../../Platform";
import { ThemedTextButton } from "../Buttons";
import { TextScaledOnPhone } from "../ScaledText";
import { MyAccountTemplate, MyAccountTemplateType } from "./MyAccountTemplate";

const logoSmall = require("../../../img/my_account/myAccountAbout.png");

export interface AboutProps {
  onBackClose?: () => void;
  onPrivacy?: () => void;
  onTerms?: () => void;
}

export class About extends Component<AboutProps, {}> {
  public render() {
    const v = DeviceInfo.getVersion();
    const b = `(${DeviceInfo.getBuildNumber()})`;
    return (
      <MyAccountTemplate
        type={MyAccountTemplateType.Back}
        onBackClose={this.props.onBackClose}
        header2={I18n.t("about")}
        containerStyle={{
          justifyContent: "space-between",
          paddingBottom: IS_TABLET ? 5 : 55,
        }}
      >
        <View>
          <View style={{ flexDirection: "row" }}>
            <View style={{ flex: 1 }}>
              <TextScaledOnPhone style={styles.appName}>KITCHENAID</TextScaledOnPhone>
              <TextScaledOnPhone style={styles.appVersion}>{I18n.t("version").toUpperCase()} {v} {b}</TextScaledOnPhone>
            </View>
            <View style={styles.vr} />
            <View style={{ flex: 3, alignItems: "flex-start" }}>
              <ThemedTextButton
                theme="red"
                text={I18n.t("privacy_statement").toUpperCase()}
                style={{ marginBottom: 10 }}
                onPress={this.props.onPrivacy}
              />
              <ThemedTextButton
                theme="red"
                text={I18n.t("terms_and_conditions").toUpperCase()}
                onPress={this.props.onTerms}
              />
            </View>
          </View>
        </View>

        <View style={{ alignSelf: "center", alignItems: "center" }}>
          <Image source={logoSmall} />
          <TextScaledOnPhone style={styles.copyright}>{I18n.t("copyright")}</TextScaledOnPhone>
        </View>
      </MyAccountTemplate>
    );
  }
}

const styles = StyleSheet.create({
  appName: {
    opacity: 0.5,
    fontFamily: "Muli",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 2,
    textAlign: "left",
    color: "#000000",
  },
  appVersion: {
    opacity: 0.5,
    fontFamily: "Muli",
    fontSize: 11,
    letterSpacing: 2,
    textAlign: "left",
    color: "#000000",
  },
  copyright: {
    fontFamily: "Muli",
    fontSize: 12,
    lineHeight: 24,
    letterSpacing: 0.56,
    textAlign: "center",
    color: "#313131",
  },
  vr: {
    width: 2,
    height: "100%",
    opacity: 0.1,
    backgroundColor: "#000000",
    marginLeft: 10,
    marginRight: 39,
  },
});
