import React from "react";
import { StyleSheet, View } from "react-native";
import { I18n } from "iocentro-apps-common-bits";

import { IS_TABLET } from "../Platform";
import { ThemedTextButton } from "./Buttons";
import { TextScaledOnPhone } from "./ScaledText";

interface NoResultsProps {
  filtersSelected?: boolean;
  onRecipesPress?: () => void;
  onSavedFavoritesPress?: () => void;
}

export const NoResults = (props: NoResultsProps) => {
  const {
    filtersSelected,
    onRecipesPress,
    onSavedFavoritesPress,
  } = props;
  return (
    <View style={styles.container}>
      <TextScaledOnPhone style={styles.oops}>{I18n.t("oops")}</TextScaledOnPhone>
      <View style={styles.msgContainer}>
        <TextScaledOnPhone
          style={styles.noResults}>
          {I18n.t(filtersSelected ? "no_results_found_filters" : "no_results_found")}
        </TextScaledOnPhone>
      </View>
      <View style={styles.buttonsContainer}>
        <ThemedTextButton
          theme="red"
          text={I18n.t("recipes")}
          onPress={onRecipesPress}
        />
        <ThemedTextButton
          theme="red"
          style={{marginLeft: 50}}
          text={I18n.t("saved_favorites")}
          onPress={onSavedFavoritesPress}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "transparent",
    width: "100%",
    alignItems: "center",
  },
  oops: {
    marginTop: IS_TABLET ? 100 : 30,
    fontFamily: "Merriweather",
    fontSize: 48,
    fontStyle: "italic",
    color: "#676767",
  },
  msgContainer: {
    opacity: 0.82,
    width: IS_TABLET ? "50%" : "75%",
  },
  noResults: {
    marginTop: IS_TABLET ? 41 : 31,
    fontFamily: "Muli",
    fontSize: IS_TABLET ? 18 : 16,
    fontWeight: "normal",
    fontStyle: "normal",
    color: "#676767",
    textAlign: "center",
  },
  buttonsContainer: {
    marginTop: IS_TABLET ? 73 : 59,
    flexDirection: "row",
  },
});
