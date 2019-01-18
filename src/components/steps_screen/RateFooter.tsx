import React from "react";
import { StyleSheet, View } from "react-native";

import { IS_TABLET } from "../../Platform";
import { Hr } from "../Hr";
import { FavoriteButton } from "../recipe_summary/FavoriteButton";

export interface RateFooterData {
  favorite?: boolean;
}

interface RateFooterProps extends RateFooterData {
  onFavoritePress?: (favorite: boolean) => void;
}

export const RateFooter = (props: RateFooterProps) => {
  return (
    <View style={styles.container}>
      <View style={{flex: 1, flexDirection: "row"}}>
        <View style={{flex: 1}}/>
        <View style={styles.internalContainer}>
          <Hr/>
          <FavoriteButton
            style={{marginTop: 22}}
            checked={props.favorite}
            onPress={props.onFavoritePress}
          />
        </View>
        <View style={{flex: 1}}/>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    flex: IS_TABLET ? 0.47 : 0.54,
  },
  internalContainer: {
    flex: IS_TABLET ? 3.93 : 15.07,
    alignItems: "center",
  },
});
