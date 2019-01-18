import React, { Component } from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";

import { TextScaledOnPhone } from "../ScaledText";
import { NavBarBase } from "./NavBarBase";
import { SideIconsNavBar, SideIconsNavBarProps } from "./SideIconsNavBar";

export interface TitleNavBarProps extends SideIconsNavBarProps, TitlesProps {
  noIcons?: boolean;
}

export interface TitlesProps {
  reverseStyles?: boolean;
  title1?: string;
  title2?: string;
  textColor?: string;
  titleContainerStyle?: StyleProp<ViewStyle>;
}

/**
 * Two titles with pre-defined common style that cannot be changed (except textColor).
 */
export const Titles = ({ title1, title2, textColor = "white", titleContainerStyle, reverseStyles }: TitlesProps) => (
  <View style={[{ flexDirection: "row" }, titleContainerStyle]}>
    {!title1 ? null :
      <TextScaledOnPhone style={[reverseStyles ? styles.title2 : styles.title1,
      { color: textColor }]}>{reverseStyles ? title1.toUpperCase() : title1}</TextScaledOnPhone>}
    {!title2 ? null :
      <TextScaledOnPhone style={[reverseStyles ? styles.title1 : styles.title2,
      { color: textColor }]}>{reverseStyles ? title2 : title2.toUpperCase()}</TextScaledOnPhone>}
  </View>
);

/**
 * NavBar variation with titles as middleElement.
 * Based on SideIconsNavBar || NavBarBase - depending on noIcons flag.
 */
export class TitleNavBar extends Component<TitleNavBarProps> {
  public static defaultProps: TitleNavBarProps = {
    title1: "",
    title2: "",
  };

  public render() {
    const {
      middleElement, // middleElement is replaced with titles
      reverseStyles,
      title1,
      title2,
      titleContainerStyle,
      textColor: propsTextColor,
      noIcons,
      ...baseProps,
    } = this.props;

    const textColor = propsTextColor || (this.props.theme == "white" ? "black" : "white");

    const titlesProps: TitlesProps = { reverseStyles, textColor, title1, title2, titleContainerStyle };

    const NavBar = noIcons ? NavBarBase : SideIconsNavBar;

    return (
      <NavBar
        middleElement={<Titles {...titlesProps} />}
        {...baseProps}
      />
    );
  }
}

const styles = StyleSheet.create({
  title1: {
    fontFamily: "Merriweather",
    fontSize: 20,
    fontWeight: "300",
    fontStyle: "italic",
    letterSpacing: 0.83,
  },
  title2: {
    marginLeft: 8,
    fontFamily: "Muli",
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: 0.83,
    color: "#ffffff",
  },
});
