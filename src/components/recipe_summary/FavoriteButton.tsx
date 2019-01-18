import React, { Component } from "react";
import { StyleProp, ViewStyle } from "react-native";
import { I18n } from "iocentro-apps-common-bits";

import { IS_TABLET } from "../../Platform";
import { IconAndTextButton } from "./IconAndTextButton";

const recipeFavoriteChecked = require("../../../img/recipe_summary/recipeFavoriteChecked.png");
const recipeFavoriteUnchecked = require("../../../img/recipe_summary/recipeFavoriteUnchecked.png");

const rateRecipeCheckedHeartWhite = require("../../../img/recipe_summary/rateRecipeCheckedHeartWhite.png");
const rateRecipeUncheckedHeartWhite = require("../../../img/recipe_summary/rateRecipeUncheckedHeartWhite.png");

type colors = "red" | "white";

interface CheckedIcons {
  checked: any;
  unchecked: any;
}

const icons: {[key in colors]: CheckedIcons} = {
  red: {
    checked: recipeFavoriteChecked,
    unchecked: recipeFavoriteUnchecked,
  },
  white: {
    checked: rateRecipeCheckedHeartWhite,
    unchecked: rateRecipeUncheckedHeartWhite,
  },
};

interface FavoriteButtonProps {
  color?: colors;
  checked?: boolean;
  style?: StyleProp<ViewStyle>;
  onPress?: (favorite: boolean) => void;
}

export class FavoriteButton extends Component<FavoriteButtonProps, {}> {
  public render() {
    const { color = "red", checked, style, onPress } = this.props;
    const checkedKey = checked ? "checked" : "unchecked";
    const iconSource = icons[color][checkedKey];
    const textStyle = color == "white" ? { color: "white" } : undefined;

    return (
      <IconAndTextButton
        text={I18n.t("save").toUpperCase()}
        onPress={() => { onPress && onPress(!checked); }}
        iconSize={IS_TABLET ? 31 : 27}
        {...{
          style,
          textStyle,
          iconSource,
        }}
      />
    );
  }
}
