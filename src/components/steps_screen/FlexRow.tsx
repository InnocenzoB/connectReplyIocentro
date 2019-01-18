import React, { ReactNode } from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";

interface FlexRowProps {
  children: ReactNode;
  left?: ReactNode;
  right?: ReactNode;
  leftStyle?: StyleProp<ViewStyle>;
  rightStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
}

export const FlexRow = (props: FlexRowProps) => {
  return (
    <View
      style={[flexRowStyles.container, props.style]}>
      <View style={[flexRowStyles.leftRight, props.leftStyle]}>{props.left}</View>
      {props.children}
      <View style={[flexRowStyles.leftRight, props.rightStyle]}>{props.right}</View>
    </View>
  );
};

const flexRowStyles = StyleSheet.create({
  container: { flex: 1, flexDirection: "row" },
  leftRight: { flex: 1, justifyContent: "center" },
});
