import React, { Component, ReactNode } from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";

import { Dims } from "../../Platform";
import { TextScaledOnPhone } from "../ScaledText";
import { LoginField } from "./LoginField";

interface DescriptionProps {
  style?: StyleProp<ViewStyle>;
}

export class Description extends Component<DescriptionProps> {
  public render() {
    return (
      <View
        style={[
          {
            opacity: 0.5,
            marginBottom: Dims.scaleV(7),
            flexDirection: "row",
            justifyContent: "space-between",
          },
          this.props.style,
        ]}>
        {this.props.children}
      </View>
    );
  }
}

interface DescribedFieldProps {
  description?: string;
  customDescription?: ReactNode;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  desciprtionStyle?: StyleProp<ViewStyle>;
  fieldStyle?: StyleProp<ViewStyle>;
}

export const DescribedField = (props: DescribedFieldProps) => {
  return (
    <View style={[{flex: 1}, props.style]}>
      {props.customDescription || (
        <Description style={props.desciprtionStyle}>
          <TextScaledOnPhone style={styles.inputDescription}>{props.description}</TextScaledOnPhone>
        </Description>
      )}
      <LoginField style={props.fieldStyle}>
        {props.children}
      </LoginField>
    </View>
  );
};

const styles = StyleSheet.create({
  inputDescription: {
    fontFamily: "Muli",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 2,
    color: "#ffffff",
  },
});
