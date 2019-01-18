import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { I18n } from "iocentro-apps-common-bits";

import { PlatformSelect } from "../../Platform";
import { TextScaledOnPhone } from "../ScaledText";

export const QuickTip = ({text}: {text?: string}) => {
  return (
    <View style={styles.container}>
      <Vr/>
      <ScrollView
        style={{
          marginLeft: 8,
        }}>
        <TextScaledOnPhone>
          <TextScaledOnPhone style={styles.tipFont1}>{`${I18n.t("quick")} `}</TextScaledOnPhone>
          <TextScaledOnPhone style={styles.tipFont2}>{I18n.t("tip")}</TextScaledOnPhone>
        </TextScaledOnPhone>
        <TextScaledOnPhone style={styles.tipFont3}>{text}</TextScaledOnPhone>
      </ScrollView>
    </View>
  );
};

const Vr = () => <View style={styles.line}/>;

const styles = StyleSheet.create({
  container: {
    ...PlatformSelect({
      anyTablet: {
        marginRight: 48, // same as margin in StepsHeader
      },
    }),
    flexDirection: "row",
  },
  line: {
    width: 2,
    height: 37,
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#cb0000",
  },
  tipFont1: {
    fontFamily: "Merriweather",
    fontSize: 13,
    fontStyle: "italic",
    letterSpacing: 1.18,
    color: "#676767",
  },
  tipFont2: {
    fontFamily: "Muli",
    fontSize: 11,
    letterSpacing: 2,
    color: "#676767",
    fontWeight: "900",
  },
  tipFont3: {
    marginTop: 4,
    fontFamily: "Merriweather",
    fontSize: 12,
    fontWeight: "300",
    fontStyle: "italic",
    lineHeight: 22,
    textAlign: "left",
    color: "#676767",
  },
});
