import React from "react";
import { Image, StyleSheet, View } from "react-native";
import { IS_TABLET } from "../../Platform";

const starRatingsChecked = IS_TABLET ?
  require("../../../img/recipe_summary/starRatingsChecked.png") :
  require("../../../img/recipe_summary/starRatingsCheckedPhone.png");

const starRatingsUnchecked = IS_TABLET ?
  require("../../../img/recipe_summary/starRatingsUnchecked.png") :
  require("../../../img/recipe_summary/starRatingsUncheckedPhone.png");

export const Stars = (props: {rating: number}) => {
  const stars: JSX.Element[] = [];
  for (let i = 0; i < 5; i++) {
    stars[i] = (
      <Image
        key={i.toString()}
        source={(props.rating >= (i + 1) ? starRatingsChecked : starRatingsUnchecked)}
      />);
  }
  return (
    <View style={styles.starsRow}>
      {stars}
    </View>
  );
};

const styles = StyleSheet.create({
  starsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: IS_TABLET ? 94 : 60,
  },
});
