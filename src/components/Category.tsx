import { RecipeModel } from "iocentro-collection-manager";
import React, { PureComponent } from "react";
import { FlatList, ListRenderItemInfo, Platform, View } from "react-native";

import {
  RecipesGroupLeft,
  RecipesGroupRight,
  RecipesGroupRowFour,
  RecipesGroupRowThree,
  RecipesGroupRowTwo,
  RecipesGroupSingle,
} from "../components/RecipesGroup";
import { Size } from "./nav_bars/SideIconsNavBar";
import { RecipeCardIconProps } from "./RecipeCard";

export type CategoryType = "left" | "right" | "row3" | "row4" | "row2" | "single";

export interface CategoryGroupsData {
  type: CategoryType;
  data: RecipeModel[];
  capacity: number;
}

interface CategoryProps {
  onPress?: (model: RecipeModel) => void;
  data: CategoryGroupsData[];
  cardSize?: Size;
  footer?: JSX.Element | null;
  recipesIcon?: RecipeCardIconProps;
}

export class Category extends PureComponent<CategoryProps, {}> {
  private _renderGroup(item: CategoryGroupsData): JSX.Element | null {
    const props = {
      data: item.data,
      onPress: this.props.onPress,
      recipesIcon: this.props.recipesIcon,
      style: {},
    };
    if (this.props.cardSize) {
      Object.assign(props.style, this.props.cardSize);
    }

    switch (item.type) {
      case "left": return <RecipesGroupLeft {...props} />;
      case "right": return <RecipesGroupRight {...props} />;
      case "row3": return <RecipesGroupRowThree {...props} />;
      case "row4": return <RecipesGroupRowFour {...props} />;
      case "row2": return <RecipesGroupRowTwo {...props} />;
      case "single": return <RecipesGroupSingle {...props} />;
      default: return null;
    }
  }

  public render() {
    return (
      <View style={{ width: "100%" }}>
        {this.props.children}
        <FlatList
          style={{ flexGrow: 1 }}
          data={this.props.data}
          renderItem={(data: ListRenderItemInfo<CategoryGroupsData>) => {
            return this._renderGroup(data.item);
          }}
          removeClippedSubviews={Platform.OS == "android"}
          extraData={this.props.recipesIcon}
          keyExtractor={(_item, index) => index.toString()}
        />
        {this.props.footer}
      </View>
    );
  }
}
