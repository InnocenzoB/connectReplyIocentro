import React, { Component } from "react";
import { StatusBar, StyleSheet, View } from "react-native";

import { NAV_BAR_TABLET_HEIGHT, NavBarElement } from "./NavBarBase";

interface HomeTabletBarProps {
  leftElement?: NavBarElement;
  middleElement?: NavBarElement;
  rightElement?: NavBarElement;
}

export class HomeTabletBar extends Component<HomeTabletBarProps> {
  public render() {
    const {
      leftElement,
      middleElement,
      rightElement,
    } = this.props;

    return (
      <View
        style={[
          styles.bar,
          { backgroundColor: "transparent" },
        ]}>
        <StatusBar
          hidden={false}
          translucent={true}
          backgroundColor="#00000000"
          barStyle="light-content"
        />
        <View
          style={{
            position: "absolute",
            top: 0,
            width: "100%",
            height: 20,
            backgroundColor: "rgba(0, 0, 0, 0.8)",
          }}
        />
        <View
          style={{
            position: "absolute",
            top: 20,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.8)",
          }}
        />
        <View style={{ position: "absolute", top: 19, width: "100%",  alignItems: "center"}}>{middleElement}</View>
        <View style={{ position: "absolute", top: 20, left: 0 }}>{leftElement}</View>
        <View style={{ position: "absolute", top: 20, right: 0, alignItems: "flex-end" }}>{rightElement}</View>
      </View>
    );
  }
}

const paddingBottom = 5;

const styles = StyleSheet.create({
  bar: {
    width: "100%",
    height: NAV_BAR_TABLET_HEIGHT + paddingBottom,
    paddingTop: 20,
    paddingBottom,
    position: "absolute",
    top: 0,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "transparent",
  },
});
