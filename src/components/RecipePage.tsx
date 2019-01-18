import React, { Component } from "react";
import {
  ImageBackground,
  ScrollView,
  ScrollViewProperties,
  ScrollViewStyle,
  StatusBar,
  StyleProp,
  StyleSheet,
  View,
  ViewProperties,
} from "react-native";

import { IS_TABLET } from "../Platform";
import { Loading } from "./Loading";
import { NAV_BAR_PHONE_HEIGHT, NAV_BAR_TABLET_HEIGHT } from "./nav_bars/NavBarBase";

const backgroundImg = require("../../img/common/woodBackground.png");

interface RecipePageProps {
  scroll?: boolean;
  scrollProps?: ScrollViewProperties | ViewProperties;
  loading?: boolean;
  scrollViewStyle?: StyleProp<ScrollViewStyle>;
}

export class RecipePage extends Component<RecipePageProps, {}> {
  public render() {
    const ContentComponent = (this.props.scroll == false ? View : ScrollView);
    const { contentContainerStyle, ...viewProps } = this.props.scrollProps as any;
    return (
      <ImageBackground
        style={styles.background}
        source={backgroundImg}>
        <StatusBar barStyle="light-content" translucent={true} backgroundColor={"#00000000"} />
        <Loading visible={!!this.props.loading} />
        <ContentComponent
          contentContainerStyle={[{
            paddingTop: IS_TABLET ? NAV_BAR_TABLET_HEIGHT : NAV_BAR_PHONE_HEIGHT,
          }, contentContainerStyle]}
          {...viewProps}
        >
          {this.props.children}
        </ContentComponent>
      </ImageBackground>
    );
  }
}

const styles = StyleSheet.create({
  background: {
    width: "100%",
    height: "100%",
    backgroundColor: "transparent",
  },
});
