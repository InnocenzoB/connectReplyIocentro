import React from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";

import { IS_TABLET } from "../../Platform";
import { NavButton } from "./NavButton";

export type NavigationMode = "first" | "middle" | "last" | "rating" | "lastNoRating" | "firstAndOnly";

export interface NavigationData {
  mode: NavigationMode;
}

export interface NavigationCallbacks {
  onPrevPress?: () => void;
  onNextPress?: () => void;
  onFinishPress?: () => void;
}

interface NavigationProps extends NavigationData, NavigationCallbacks {
  style?: StyleProp<ViewStyle>;
}

export const Navigation = (props: NavigationProps) => {
  switch (props.mode) {
    case "first":
      return (
        <View style={[styles.navButtonsContainer, { flexDirection: "row-reverse" }, props.style]}>
          <NavButton
            type={"next"}
            onPress={props.onNextPress}
          />
        </View>
      );
    case "middle":
      return (
        <View style={[styles.navButtonsContainer, { flexDirection: "row" }, props.style]}>
          <NavButton
            type={"prev"}
            onPress={props.onPrevPress}
          />
          <NavButton
            type={"next"}
            onPress={props.onNextPress}
          />
        </View>
      );
    case "last":
      return (
        <View style={[styles.navButtonsContainer, { flexDirection: "row" }, props.style]}>
          <NavButton
            type={"prev"}
            onPress={props.onPrevPress}
          />
          <NavButton
            type={"rate"}
            onPress={props.onNextPress}
          />
        </View>
      );
    case "lastNoRating":
      return (
        <View style={[styles.navButtonsContainer, { flexDirection: "row" }, props.style]}>
          <NavButton
            type={"prev"}
            onPress={props.onPrevPress}
          />
          <NavButton
            type={"finish"}
            onPress={props.onFinishPress}
          />
        </View>
      );
    case "firstAndOnly":
      return (
        <View style={[styles.navButtonsContainer, { flexDirection: "row-reverse" }, props.style]}>
          <NavButton
            type={"finish"}
            onPress={props.onFinishPress}
          />
        </View>
      );
    case "rating":
      return (
        <View style={[styles.navButtonsContainer, { alignItems: IS_TABLET ? "flex-end" : "center" }, props.style]}>
          <NavButton
            type={"finish"}
            onPress={props.onFinishPress}
          />
        </View>
      );
  }
};

export const getNavigationMode = (
  rating: number | undefined,
  currentStep: number,
  allSteps: number,
  noRating: boolean = false) => {
  let mode: NavigationMode = "middle";
  if (rating !== undefined) {
    mode = "rating";
  } else if (currentStep == 1) {
    if (currentStep == allSteps) {
      mode = "firstAndOnly";
    } else {
      mode = "first";
    }
  } else if (currentStep == allSteps) {
    if (noRating) {
      mode = "lastNoRating";
    } else {
      mode = "last";
    }
  }
  return mode;
};

const styles = StyleSheet.create({
  navButtonsContainer: {
    justifyContent: "space-between",
  },
});
