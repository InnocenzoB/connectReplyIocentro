import React, { Component } from "react";
import { Image, ImageRequireSource, ImageURISource, StyleProp, StyleSheet, TextStyle, ViewStyle } from "react-native";

import { TextScaledOnPhone } from "../ScaledText";
import { TouchableScale } from "../TouchableScale";

export interface IconAndTextButtonProps {
  iconSource: ImageURISource | ImageURISource[] | ImageRequireSource;
  iconSize?: number;
  text: string;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  onPress?: () => void;
}

export class IconAndTextButton extends Component<IconAndTextButtonProps, {}> {
  public render() {
    const { iconSource, text, iconSize, textStyle, style, onPress } = this.props;
    return (
      <TouchableScale
        style={[{ alignItems: "center" }, style]}
        onPress={onPress}>
        <Image
          style={iconSize == undefined ? undefined : {
            alignItems: "center", justifyContent: "center",
            width: iconSize, height: iconSize,
          }}
          resizeMode={iconSize == undefined ? undefined : "cover"}
          source={iconSource}
        />
        <TextScaledOnPhone style={[styles.font, textStyle]}>{text}</TextScaledOnPhone>
      </TouchableScale>
    );
  }
}

const styles = StyleSheet.create({
  font: {
    fontFamily: "Muli",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 2,
    textAlign: "center",
    color: "#cb0000",
  },
});
