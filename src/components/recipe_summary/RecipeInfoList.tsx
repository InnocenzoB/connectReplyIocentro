import React from "react";
import { StyleProp, View, ViewStyle } from "react-native";

import { RecipeInfo, RecipeInfoProps } from "./RecipeInfo";

interface RecipeInfoListProps {
  data?: RecipeInfoProps[];
  style?: StyleProp<ViewStyle>;
  spaceBetweenItems?: number;
}

export const RecipeInfoList = (props: RecipeInfoListProps) => {
  return (
    <View style={props.style}>
      {props.data && props.data.map((element, index) => {
          const isLast = index + 1 === props.data!.length;

          return (<RecipeInfo
            key={index.toString()}
            name={element.name}
            value={element.value}
            marginRight={props.spaceBetweenItems && !isLast ? props.spaceBetweenItems : 0}
          />);
        })
      }
    </View>
  );
};
