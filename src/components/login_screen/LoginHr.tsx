import React from "react";
import { StyleSheet, View } from "react-native";

import { Dims, IS_TABLET } from "../../Platform";
import { Hr } from "../Hr";

export const LoginHr = (props) => {
  return IS_TABLET ? <Hr style={[styles.line, props.style]} /> : <View />;
};

const styles = StyleSheet.create({
  line: {
    alignSelf: "center",
    width: Dims.scaleH(896),
    opacity: 0.2,
    backgroundColor: "#ffffff",
  },
});
