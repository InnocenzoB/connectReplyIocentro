import React from "react";
import { Image, ImageURISource, StyleProp, StyleSheet, ViewStyle } from "react-native";

import { StyledButton, TextButton } from "../Buttons";
import { TextScaledOnPhone } from "../ScaledText";

export const TitleGrey = (props: { text: string, onPress?: () => void }) => {
  return (
    <TextButton
      disabled={!props.onPress}
      onPress={props.onPress}
      textStyle={titleStyles.tileFont1}
      text={props.text.toUpperCase()}
    />
  );
};

export const TitleRed = (props: {
  text: string;
  onPress?: () => void;
  icon?: ImageURISource;
  style?: StyleProp<ViewStyle>;
}) => {
  return (
    <StyledButton
      style={[{
        flexDirection: "row",
        alignItems: "center",
      }, props.style]}
      disabled={!props.onPress}
      onPress={props.onPress}
    >
      {props.icon && <Image source={props.icon} style={{ marginRight: 4 }} />}
      <TextScaledOnPhone style={titleStyles.titleFont2}>{props.text.toUpperCase()}</TextScaledOnPhone>
    </StyledButton>
  );
};

const titleStyles = StyleSheet.create({
  tileFont1: {
    opacity: 0.5,
    fontFamily: "Muli",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 2,
    textAlign: "left",
    color: "#000000",
  },
  titleFont2: {
    fontFamily: "Muli",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 2,
    textAlign: "center",
    color: "#cb0000",
  },
});
