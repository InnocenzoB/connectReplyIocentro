import React from "react";
import { StyleSheet, View } from "react-native";
import { I18n } from "iocentro-apps-common-bits";

import { Dims } from "../../Platform";
import { GradientTextButton } from "../Buttons";
import { TextScaledOnPhone } from "../ScaledText";

export const NoAppliances = (props: { onAddPressed: () => void }) => {
  return (
    <View style={styles.view}>
      <TextScaledOnPhone style={styles.header}>{I18n.t("no_appliances_details")}</TextScaledOnPhone>
      <TextScaledOnPhone style={styles.body}>
        {I18n.t("no_appliances_help")}
      </TextScaledOnPhone>
      <GradientTextButton
        theme="red"
        style={{width: Dims.scaleH(180), height: Dims.scaleV(48)}}
        text={I18n.t("no_appliances_add").toLocaleUpperCase()}
        onPress={props.onAddPressed}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  view: {
    alignItems: "center",
  },
  header: {
    marginTop: 63,
    marginLeft: 20,
    marginRight: 20,
    fontFamily: "Merriweather",
    fontSize: 18,
    fontWeight: "300",
    fontStyle: "italic",
    letterSpacing: 0.64,
    textAlign: "center",
  },
  body: {
    marginTop: 8,
    marginBottom: 37,
    marginLeft: 20,
    marginRight: 20,
    fontFamily: "Muli",
    fontSize: 16,
    fontWeight: "normal",
    fontStyle: "normal",
    lineHeight: 17,
    letterSpacing: 0,
    textAlign: "center",
  },
});
