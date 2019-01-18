import { RecipeModel } from "iocentro-collection-manager";
import { ValueBase } from "iocentro-datamodel";
import React from "react";
import { StyleSheet, View } from "react-native";

import { Category, CategoryGroupsData } from "../components/Category";
import { CategoryHeader, CategoryHeaderData, SeeMore } from "../components/CategoryHeader";
import { Paper } from "../components/Paper";
import { IS_TABLET, PlatformSelect } from "../Platform";
import { getUiPresentationValue } from "../Utils";
import { VerticalSpacer } from "./dashboard/Common";

export interface CategoryData {
  category: ValueBase;
  data: CategoryGroupsData[];
}

interface CategoryListProps {
  categories: CategoryData[];
  generateHeader?: (category) => CategoryHeaderData;
  simple: boolean;
  onPress?: (id: RecipeModel) => void;
  onSeeMorePress?: (category) => void;
  spacing?: number;
}

const generateTitleHeader = (category) => ({
  title: getUiPresentationValue(category, ""),
});

export const CategoryList = (props: CategoryListProps) => {
  const generateHeader = props.generateHeader || generateTitleHeader;
  const categories = props.categories.map((cat, index) => {
    const { data, category } = cat;

    const footer = IS_TABLET ? null :
      <View style={{ alignItems: "center" }}>
        <SeeMore
          onPress={() => {
            props.onSeeMorePress && props.onSeeMorePress(category);
          }}
        />
      </View>;
    const isFirst = index == 0;
    return (
      <Category
        key={index.toString()}
        data={data}
        onPress={props.onPress}
        footer={footer}>
        {!isFirst && <VerticalSpacer height={props.spacing} />}
        <CategoryHeader
          simple={props.simple}
          {...generateHeader(category) }
          onSeeMorePress={() => {
            props.onSeeMorePress && props.onSeeMorePress(category);
          }}
        />
      </Category>
    );
  });
  return (
    <View style={styles.pageContainer}>
      <Paper>
        {categories}
      </Paper>
    </View>
  );
};

const styles = StyleSheet.create({
  pageContainer: {
    flex: 1,
    borderRadius: 4,
    backgroundColor: "#ffffff",
    shadowColor: "rgba(0, 0, 0, 0.18)",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowRadius: 14,
    shadowOpacity: 1,
    ...PlatformSelect({
      anyTablet: {
        marginTop: 49,
        marginLeft: 15,
        marginBottom: 19,
      },
      anyPhone: {
        marginTop: 24,
        marginLeft: 10,
        marginBottom: 12,
      },
    }),
  },
});
