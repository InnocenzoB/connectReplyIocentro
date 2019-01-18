import { RecipeModel } from "iocentro-collection-manager";
import React from "react";
import { FlatList, ImageRequireSource, ImageURISource, StyleProp, View, ViewStyle } from "react-native";

import { VerticalSpacer } from "../../components/dashboard/Common";
import { RecipeTextCard, RecipeTextCardStyles } from "../../components/RecipeCard";
import { Loading } from "../Loading";

export interface RecipeTextCardListProps {
  data?: Array<RecipeModel | undefined>;
  onRecipePress?: (recipe: RecipeModel, index: number) => void;
  onRecipeLongPress?: (recipe: RecipeModel, index: number) => void;
  onRecipeRemove?: (recipe: RecipeModel, index: number) => void;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  cardStyle: RecipeTextCardStyles;
  highlightedCardStyle?: RecipeTextCardStyles;
  highlightedCardRemoveIcon?: ImageURISource | ImageRequireSource;
  isCardHighlighted?: (recipe: RecipeModel, index: number) => boolean;
  cardSpacing?: number;
}

export const RecipeTextCardList = (props: RecipeTextCardListProps) => (
  props.data ?
    <FlatList
      ItemSeparatorComponent={() => (<VerticalSpacer height={props.cardSpacing} />)}
      keyExtractor={(recipe, index) => (recipe && recipe.id.sv()) + index.toString()}
      style={props.style}
      contentContainerStyle={props.contentContainerStyle}
      data={props.data}
      renderItem={({ item, index }) => {
        if (!item) { return null; }
        const cardStyle = Object.assign({}, props.cardStyle);
        let isHighlighted: undefined | true;
        if (props.isCardHighlighted && props.isCardHighlighted(item, index)) {
          isHighlighted = true;
        }
        if (isHighlighted && props.highlightedCardStyle) {
          // append style with highlighted style
          for (const key of Object.keys(props.highlightedCardStyle)) {
            cardStyle[key] = [cardStyle[key], props.highlightedCardStyle[key]];
          }
        }
        return (
          <RecipeTextCard
            styles={cardStyle}
            model={item}
            onPress={props.onRecipePress ? () => props.onRecipePress && props.onRecipePress(item, index) : undefined}
            onLongPress={props.onRecipeLongPress ?
              () => props.onRecipeLongPress && props.onRecipeLongPress(item, index)
              : undefined}
            onRemove={() => props.onRecipeRemove && props.onRecipeRemove(item, index)}
            removeIconSource={isHighlighted && props.highlightedCardRemoveIcon}
          />
        );
      }}
    />
    :
    <View style={{ minHeight: 70 }}>
      <Loading visible style={[props.contentContainerStyle, { backgroundColor: "transparent" }]} />
    </View>
);
