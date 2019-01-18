import { RecipeModel } from "iocentro-collection-manager";
import React, { PureComponent } from "react";
import { Dimensions, StyleProp, StyleSheet, View, ViewStyle } from "react-native";

import { PlatformSelect } from "../Platform";
import { RecipeCard, RecipeCardIconProps } from "./RecipeCard";

export interface RecipesGroupProps {
  data: RecipeModel[];
  style?: StyleProp<ViewStyle>;
  onPress?: (model: RecipeModel) => void;
  recipesIcon?: RecipeCardIconProps;
}

enum CardType {
  Big,
  Small,
  RowThree,
  RowFour,
}

export class RecipesGroup extends PureComponent<RecipesGroupProps, {}> {
  protected renderCard(model: RecipeModel, type: CardType) {
    if (model === undefined) { return <View style={[RecipesGroup.getCardStyle(type), this.props.style]} />; }
    return (
      <RecipeCard
        style={[RecipesGroup.getCardStyle(type), this.props.style]}
        model={model}
        scaleFactor={0.95}
        icon={this.props.recipesIcon}
        onPress={this.props.onPress}
      />
    );
  }

  protected static getCardStyle(type: CardType) {
    switch (type) {
      case CardType.Big: return styles.bigCard;
      case CardType.Small: return styles.smallCard;
      case CardType.RowThree: return styles.rowCard;
      case CardType.RowFour: return styles.smallCard;
    }
  }
}

export class RecipesGroupLeft extends RecipesGroup {
  public static readonly GROUP_SIZE = 5;

  public render() {
    const big = this.renderCard(this.props.data[0], CardType.Big);
    const topLeft = this.renderCard(this.props.data[1], CardType.Small);
    const bottomLeft = this.renderCard(this.props.data[2], CardType.Small);
    const topRight = this.renderCard(this.props.data[3], CardType.Small);
    const bottomRight = this.renderCard(this.props.data[4], CardType.Small);

    return (
      <View style={styles.container}>
        <View style={styles.row}>
          {big}
          <View style={styles.column}>
            {topLeft}
            {bottomLeft}
          </View>
          <View style={styles.column}>
            {topRight}
            {bottomRight}
          </View>
        </View>
      </View>
    );
  }
}

export class RecipesGroupRight extends RecipesGroup {
  public static readonly GROUP_SIZE = 5;

  public render() {
    const topLeft = this.renderCard(this.props.data[0], CardType.Small);
    const bottomLeft = this.renderCard(this.props.data[1], CardType.Small);
    const topRight = this.renderCard(this.props.data[2], CardType.Small);
    const bottomRight = this.renderCard(this.props.data[3], CardType.Small);
    const big = this.renderCard(this.props.data[4], CardType.Big);

    return (
      <View style={styles.container}>
        <View style={styles.row}>
          <View style={styles.column}>
            {topLeft}
            {bottomLeft}
          </View>
          <View style={styles.column}>
            {topRight}
            {bottomRight}
          </View>
          {big}
        </View>
      </View>
    );
  }
}

export class RecipesGroupRowThree extends RecipesGroup {
  public static readonly GROUP_SIZE = 3;

  public render() {
    const left = this.renderCard(this.props.data[0], CardType.RowThree);
    const middle = this.renderCard(this.props.data[1], CardType.RowThree);
    const right = this.renderCard(this.props.data[2], CardType.RowThree);

    return (
      <View style={styles.container}>
        <View style={styles.row}>
          {left}
          {middle}
          {right}
        </View>
      </View>
    );
  }
}

export class RecipesGroupRowFour extends RecipesGroup {
  public static readonly GROUP_SIZE = 4;

  public render() {
    const first = this.renderCard(this.props.data[0], CardType.RowFour);
    const second = this.renderCard(this.props.data[1], CardType.RowFour);
    const third = this.renderCard(this.props.data[2], CardType.RowFour);
    const fourth = this.renderCard(this.props.data[3], CardType.RowFour);

    return (
      <View style={styles.container}>
        <View style={styles.row}>
          {first}
          {second}
          {third}
          {fourth}
        </View>
      </View>
    );
  }
}

export class RecipesGroupSingle extends RecipesGroup {
  public static readonly GROUP_SIZE = 1;

  public render() {
    const card = this.renderCard(this.props.data[0], CardType.Big);

    return (
      <View style={styles.container}>
        <View style={styles.row}>
          {card}
        </View>
      </View>
    );
  }
}

export class RecipesGroupRowTwo extends RecipesGroup {
  public static readonly GROUP_SIZE = 2;

  public render() {
    const left = this.renderCard(this.props.data[0], CardType.Small);
    const right = this.renderCard(this.props.data[1], CardType.Small);

    return (
      <View style={styles.container}>
        <View style={styles.row}>
          {left}
          {right}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    marginBottom: 10,
  },
  bigCard: {
    ...PlatformSelect({
      anyTablet: {
        width: 438,
        height: 519,
      },
      anyPhone: {
        width: Dimensions.get("screen").width - 30,
        height: Dimensions.get("screen").width / 2 + 50,
      },
    }),
  },
  smallCard: {
    ...PlatformSelect({
      anyTablet: {
        width: 209,
        height: 250,
      },
      anyPhone: {
        width: (Dimensions.get("screen").width - 30 - 20) / 2,
        height: (Dimensions.get("screen").width - 30 - 20) / 2 + 50,
      },
    }),
  },
  rowCard: {
    width: 287,
    height: 250,
  },
  column: {
    justifyContent: "space-between",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
