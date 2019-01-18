import React, { Component } from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { I18n } from "iocentro-apps-common-bits";

import { TextScaledOnPhone } from "../ScaledText";
import { Line } from "./Line";
import { TitleGrey } from "./Titles";

interface NutritionData {
  name: string;
  value: string;
}

interface NutritionProps {
  style?: StyleProp<ViewStyle>;
  dataLeft: NutritionData[];
  dataRight: NutritionData[];
}

export class Nutrition extends Component<NutritionProps, {}> {
  public render() {
    return (
      <View style={this.props.style}>
        <TitleGrey text={I18n.t("nutrition").toUpperCase()}/>
        <Line/>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
          }}>
          <NutritionList style={{width: 207}} data={this.props.dataLeft}/>
          <NutritionList style={{width: 202}} data={this.props.dataRight}/>
        </View>
      </View>
    );
  }
}

const NutritionElement = (props: NutritionData) => {
  return (
    <View
      style={{
        flex: 1,
        flexDirection: "row",
        justifyContent: "space-between",
      }}>
      <TextScaledOnPhone style={styles.font1}>{props.name}</TextScaledOnPhone>
      <TextScaledOnPhone style={styles.font2}>{props.value}</TextScaledOnPhone>
    </View>
  );
};

const NutritionList = (props: {style?: StyleProp<ViewStyle>, data: NutritionData[]}) => {
  return (
    <View style={props.style}>
      {props.data.map((item, index) =>
        <NutritionElement key={index.toString()} {...item} />)
      }
    </View>
  );
};

const styles = StyleSheet.create({
  font1: {
    fontFamily: "Muli",
    fontSize: 14,
    lineHeight: 22,
    textAlign: "left",
    color: "#000000",
  },
  font2: {
    opacity: 0.5,
    fontFamily: "Muli",
    fontSize: 11,
    lineHeight: 22,
    textAlign: "right",
    color: "#000000",
  },
});
