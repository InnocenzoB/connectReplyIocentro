import React from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";

import { noNull } from "../../Utils";
import { TextScaledOnPhone } from "../ScaledText";
import { FlexRow } from "./FlexRow";
import { StepData } from "./Footer";

interface DirectionsProps extends StepData {
  style?: StyleProp<ViewStyle>;
}

export const Directions = (props: DirectionsProps) => {
  const title = noNull(props.currentStepModel.title.sv(), "?");
  const description = noNull(props.currentStepModel.description.sv(), "");

  return (
    <FlexRow>
      <View
        style={[{
          flex: 1.7,
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1,
        }, props.style]}>
        <TextScaledOnPhone style={styles.font1}>
          {title}
        </TextScaledOnPhone>
        <TextScaledOnPhone style={styles.font2}>{description}</TextScaledOnPhone>
      </View>
    </FlexRow>
  );
};

const styles = StyleSheet.create({
  font1: {
    fontFamily: "Muli",
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 2.36,
    color: "#000000",
    textAlign: "center",
  },
  font2: {
    marginTop: 12,
    fontFamily: "Muli",
    fontSize: 16,
    lineHeight: 22,
    color: "#000000",
    textAlign: "center",
  },
});
