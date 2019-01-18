import React from "react";
import { FlatList, ListRenderItemInfo, StyleSheet, View } from "react-native";

import { Size } from "../../components/nav_bars/SideIconsNavBar";
import { RecipeCard } from "../../components/RecipeCard";
import { HorizontalSpacer } from "../../components/steps_screen/Overview";
import { MealPlannerItem } from "../../model/MealPlannerRxTx";
import { Loading } from "../Loading";

const imported = {
  ingredientXIcon: require("../../../img/icons/ingredientXIcon.png"),
};

const RECIPE_IN_QUEUE_SIZE: Size = { width: 140, height: 140 };

const EmptyRecipe = ({ size }: { size: Size }) => (
  <View
    style={Object.assign({
      borderStyle: "dashed",
      borderWidth: 0.9,
      borderColor: "#979797",
    }, size)}
  />
);

export interface MealPlannerQueueProps {
  data: Array<MealPlannerItem | undefined>;
  loading?: boolean;
  onItemPress?: (item: MealPlannerItem) => void;
  onItemXIconPress?: (item: MealPlannerItem) => void;
}

export const MealPlannerQueue = ({ data, loading, onItemPress, onItemXIconPress }: MealPlannerQueueProps) => (
  <View>
    <FlatList
      showsHorizontalScrollIndicator={false}
      horizontal={true}
      data={data}
      keyExtractor={(item, index) => (item && item.id.sv()) + index.toString()}
      contentContainerStyle={{ paddingRight: 12 }}
      ItemSeparatorComponent={() => (<HorizontalSpacer width={12} />)}
      renderItem={({ item }: ListRenderItemInfo<MealPlannerItem | undefined>) => (
        item && item.fetchedRecipe ?
          <RecipeCard
            style={RECIPE_IN_QUEUE_SIZE}
            cardDescriptionStyle={styles.descriptionContainer}
            nameTextStyle={styles.recipeName}
            model={item.fetchedRecipe}
            icon={{
              source: imported.ingredientXIcon,
              onPress: () => onItemXIconPress && onItemXIconPress(item),
            }}
            onPress={() => onItemPress && onItemPress(item)}
          />
          :
          <EmptyRecipe size={RECIPE_IN_QUEUE_SIZE} />
      )}
      style={{
        maxHeight: 168,
      }}
    />
    <Loading style={{ backgroundColor: "transparent" }} visible={!!loading} />
  </View>
);

const styles = StyleSheet.create({
  descriptionContainer: {
    paddingTop: 4,
    paddingLeft: 3,
    paddingRight: 3,
    paddingBottom: 3,
  },
  recipeName: {
    fontSize: 11,
    letterSpacing: 0.85,
  },
});
