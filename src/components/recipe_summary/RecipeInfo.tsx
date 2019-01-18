import React, { Component } from "react";
import { StyleSheet, TextStyle, View } from "react-native";

import { PlatformSelect } from "../../Platform";
import { TextScaledOnPhone } from "../ScaledText";

export interface RecipeInfoProps {
  name?: string;
  value?: string;
  marginRight?: number;
}

export class RecipeInfo extends Component<RecipeInfoProps> {
  public static defaultProps: RecipeInfoProps = {
    marginRight: 0,
  };

  public render() {
    return (
      <View style={{marginRight: this.props.marginRight}}>
        <TextScaledOnPhone style={styles.title}>{this.props.name && this.props.name.toUpperCase()}</TextScaledOnPhone>
        <TextScaledOnPhone style={styles.stats}>{this.props.value}</TextScaledOnPhone>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  stats: {
    ...PlatformSelect<TextStyle>({
      anyTablet: {
        fontFamily: "Merriweather",
        fontSize: 23,
        fontWeight: "300",
        textAlign: "left",
        color: "#000000",
      },
      anyPhone: {
        fontFamily: "Merriweather",
        fontSize: 14,
        fontWeight: "300",
        fontStyle: "normal",
        color: "#000000",
      },
    }),
  },
  title: {
    ...PlatformSelect<TextStyle>({
      anyTablet: {
        marginTop: 5,
        fontSize: 11,
        letterSpacing: 2,
      },
      anyPhone: {
        fontSize: 8,
        fontStyle: "normal",
        letterSpacing: 1.45,
        textAlign: "left",
        color: "#000000",
      },
    }),
    opacity: 0.5,
    fontFamily: "Muli",
    fontWeight: "900",
    color: "#000000",
  },
});
