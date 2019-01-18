import React from "react";
import { StyleProp, TextStyle, View, ViewStyle } from "react-native";

import { TextScaledOnPhone } from "../ScaledText";

export interface NumberCircleProps {
  number: number;
  size?: number; // shortcut for width, height, fotSize and radius setting
  format?: (number: number) => (string | number);
  style?: StyleProp<ViewStyle>;
  numberStyle?: StyleProp<TextStyle>;
}

export const NumberCircle = ({ number, format, size, style, numberStyle }: NumberCircleProps) => (
  <View style={[{
    justifyContent: "center",
    alignItems: "center",
    width: size,
    height: size,
    borderRadius: size,
    backgroundColor: "#cb0000",
  }, style]}>
    <TextScaledOnPhone style={[{
      fontFamily: "Muli",
      fontSize: size && (0.54 * size),
      fontWeight: "900",
      color: "#ffffff",
      backgroundColor: "transparent",
    }, numberStyle]}>
      {format ? format(number) : number}
    </TextScaledOnPhone>
  </View>
);

export interface ColoredNumberCircleProps extends NumberCircleProps {
  color: string;
  numberColor?: string;
}

export const ColoredNumberCircle = (props: ColoredNumberCircleProps) => {
  const { style, numberStyle, color, numberColor, size, ...rest } = props;

  return (
    <NumberCircle
      style={[{
        borderColor: color,
        backgroundColor: (numberColor ? color : "transparent"),
        borderStyle: "solid",
        borderWidth: size ? (size / 15) : 2,
      }, style]}
      numberStyle={[{ color: (numberColor || color) }, numberStyle]}
      size={size}
      {...rest}
    />
  );
};
