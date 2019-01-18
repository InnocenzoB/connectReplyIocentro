import React from "react";
import { Image, View } from "react-native";

import { RatingData } from "./Rating";

const rateRecipe5StarRatingChecked = require("../../../img/steps/rateRecipe5StarRatingChecked.png");
const rateRecipe5StarRatingUnchecked = require("../../../img/steps/rateRecipe5StarRatingUnchecked.png");

export const StarsRate = (props: RatingData) => {
  const rating = (typeof props.rating != "undefined") ? props.rating : 0;
  const stars: JSX.Element[] = [];
  for (let i = 0; i < 5; i++) {
    stars.push((
      <Image
        key={i.toString()}
        source={rating > i ? rateRecipe5StarRatingChecked : rateRecipe5StarRatingUnchecked}
      />
    ));
  }
  return (
    <View
      style={{
        flexDirection:  "row",
      }}>
      {stars}
    </View>
  );
};
