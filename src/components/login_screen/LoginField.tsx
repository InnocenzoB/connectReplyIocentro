import React, { ReactNode } from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";

import { Dims } from "../../Platform";

interface LoginFieldProps {
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
}

export const LoginField = (props: LoginFieldProps) => {
  return (
    <View style={[styles.inputContainer, props.style]}>
      {props.children}
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    justifyContent: "center",
    height: Dims.scaleV(48),
    paddingHorizontal: Dims.scaleH(15),
    borderRadius: 2,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    shadowColor: "rgba(0, 0, 0, 0.1)",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowRadius: 8,
    shadowOpacity: 1,
  },
});
