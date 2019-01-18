import { RecipeModel } from "iocentro-collection-manager";
import React, { Component } from "react";
import { StyleSheet, View } from "react-native";
import { I18n } from "iocentro-apps-common-bits";

import { IS_TABLET } from "../../Platform";
import { RecipesGroupRowThree, RecipesGroupRowTwo } from "../RecipesGroup";
import { TextScaledOnPhone } from "../ScaledText";
import { Line } from "./Line";

interface ComplimentaryDishesProps {
  data: RecipeModel[];
  onPress?: (model: RecipeModel) => void;
}

export class ComplimentaryDishes extends Component<ComplimentaryDishesProps, {}> {
  public render() {
    return (
      <View style={{}}>
        {this._renderTitle(`${I18n.t("complimentary")}`, `${I18n.t("dishes").toUpperCase()}`)}
        <Line />
        {IS_TABLET ? (
          <RecipesGroupRowThree
            style={{
              width: 252,
              height: 207,
            }}
            data={this.props.data}
            onPress={this.props.onPress}
          />
        ) : (
            <RecipesGroupRowTwo
              style={{
                width: 147,
                height: 163,
              }}
              data={this.props.data}
              onPress={this.props.onPress}
            />
          )}
      </View>
    );
  }
  private _renderTitle(t1?: string, t2: string = "") {
    return (
      <TextScaledOnPhone>
        <TextScaledOnPhone style={styles.header1}>{t1}</TextScaledOnPhone>
        <TextScaledOnPhone style={styles.header2}>{" " + t2.toUpperCase()}</TextScaledOnPhone>
      </TextScaledOnPhone>
    );
  }
}

const styles = StyleSheet.create({
  header2: {
    opacity: 0.5,
    fontFamily: "Muli",
    fontSize: 11,
    lineHeight: 18,
    fontWeight: "900",
    letterSpacing: 2,
    textAlign: "left",
    color: "rgb(103,103,103)",
  },
  header1: {
    fontFamily: "Merriweather",
    fontSize: 16,
    lineHeight: 18,
    fontStyle: "italic",
    letterSpacing: 0.3,
    textAlign: "left",
    color: "rgb(103,103,103)",
  },
});
