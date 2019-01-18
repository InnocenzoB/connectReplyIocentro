import React, { Component, ReactElement } from "react";
import { StatusBar, StyleProp, StyleSheet, View, ViewStyle } from "react-native";

import { IS_TABLET, PlatformSelect } from "../../Platform";

export const NAV_BAR_PHONE_HEIGHT = 55;
export const NAV_BAR_TABLET_HEIGHT = 64;
export const NAV_BAR_HEIGHT = IS_TABLET ? NAV_BAR_TABLET_HEIGHT : NAV_BAR_PHONE_HEIGHT;

export type NavBarElement = ReactElement<any> | boolean | null | undefined;

export type NavBarTheme = "white" | "black" | "transparent";

export interface NavBarNonElementProps {
  theme?: NavBarTheme;
  style?: StyleProp<ViewStyle>;
  statusBarHidden?: boolean;
}

export interface NavBarBaseProps extends NavBarNonElementProps {
  leftElement?: NavBarElement;
  middleElement?: NavBarElement;
  rightElement?: NavBarElement;
}

/**
 * NavBarBase is simple component that takes left, right and middle elements
 * and renders them centered within "row" direction.
 *
 * It comes with pre-defined themes and platform sizes.
 *
 * Every element from props is optional, and it shall be guaranteed that it
 * renders in its place (e.g. middle element in middle, right element on right)
 * in every configuration.
 */
export class NavBarBase extends Component<NavBarBaseProps> {
  public static defaultProps: NavBarBaseProps = {
    theme: "black",
    statusBarHidden: true,
  };

  public render() {
    const {
      style: propStyle,
      theme,
      leftElement,
      middleElement,
      rightElement,
      statusBarHidden,
    } = this.props;

    return (
      <View
        style={[
          styles.bar,
          { backgroundColor: theme },
          statusBarHidden && { paddingTop: 0 },
          propStyle,
        ]}
      >
        <StatusBar
          hidden={statusBarHidden}
          translucent={true}
          backgroundColor={"#00000000"}
          barStyle={theme == "white" ? "dark-content" : "light-content"}
        />
        <View style={{ flex: 1 }}>{leftElement}</View>
        <View style={{ flex: 999, zIndex: -1, alignItems: "center" }}>{middleElement}</View>
        <View style={{ flex: 1, alignItems: "flex-end" }}>{rightElement}</View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  bar: {
    ...PlatformSelect<ViewStyle>({
      anyTablet: {
        height: NAV_BAR_TABLET_HEIGHT,
        paddingTop: 20,
      },
      anyPhone: {
        height: NAV_BAR_PHONE_HEIGHT,
      },
    }),
    flexDirection: "row",
    alignItems: "center",
  },
});
