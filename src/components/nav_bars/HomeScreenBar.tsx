import React, { Component } from "react";
import { Keyboard, View } from "react-native";
import { I18n } from "iocentro-apps-common-bits";

import { IS_TABLET } from "../../Platform";
import { IconButton, IconButtonProps } from "../Buttons";
import { HorizontalSpacer } from "../steps_screen/Overview";
import { PhoneTabs, TabletTabs } from "../Tabs";
import { HomeTabletBar } from "./HomeTabletBar";
import { NavBarBase } from "./NavBarBase";

const userIconUnselected = require("../../../img/home_screen/userIconUnselected.png");
const searchIconUnselected = require("../../../img/home_screen/searchIconUnselected.png");
const navbarAppliancesIcon = require("../../../img/home_screen/navbarAppliancesIcon.png");

interface HomeScreenNavBarProps {
  navigate: (routeName: string) => void;
  onUserIconPress?: () => void;
  onApplianncePress?: () => void;
  currentRouteName?: string;
}

export class HomeScreenNavBar extends Component<HomeScreenNavBarProps> {
  public shouldComponentUpdate(nextProps) {
    return (this.props.currentRouteName != nextProps.currentRouteName) && (nextProps.currentRouteName != "");
  }

  public componentWillUpdate() {
    Keyboard.dismiss();
  }

  public render() {
    const props = this.props;

    if (IS_TABLET) {
      return (
        <HomeTabletBar
          leftElement={
            <View style={{ flexDirection: "row", alignItems: "center", marginLeft: 15, marginTop: 10 }}>
              <ActivableIcon
                onPress={props.onUserIconPress}
                icon={userIconUnselected}
              />
              <HorizontalSpacer width={15} />
              <ActivableIcon
                onPress={() => props.navigate("Search")}
                active={props.currentRouteName == "Search"}
                icon={searchIconUnselected}
              />
            </View>
          }
          middleElement={
            <TabletTabs
              navigate={props.navigate}
              currentRouteName={props.currentRouteName}
              tabs={[
                {
                  text: I18n.t("my_creations").toUpperCase(),
                  routeNames: ["MyCreations"],
                },
                {
                  text: I18n.t("favorites").toUpperCase(),
                  routeNames: ["SavedFavorites"],
                },
                {
                  text: I18n.t("recipes").toUpperCase(),
                  routeNames: ["Home", "ViewAll"],
                },
                {
                  text: I18n.t("meal_planning").toUpperCase(),
                  routeNames: ["MealPlanner"],
                },
                {
                  text: I18n.t("shopping_list").toUpperCase(),
                  routeNames: ["ShoppingList"],
                },
              ]}
            />
          }
          rightElement={
            <ActivableIcon
              onPress={props.onApplianncePress}
              icon={navbarAppliancesIcon}
              style={{ marginRight: 20, marginTop: 10 }}
            />
          }
        />
      );
    } else {
      return (
        <NavBarBase
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            alignItems: "flex-end",
            position: "absolute",
            top: 0,
            width: "100%",
          }}
          statusBarHidden={true}
          middleElement={
            <PhoneTabs
              navigate={props.navigate}
              currentRouteName={props.currentRouteName}
              tabs={[
                {
                  text: I18n.t("my_creations").toUpperCase(),
                  routeNames: ["MyCreations"],
                },
                {
                  text: I18n.t("recipes").toUpperCase(),
                  routeNames: ["Home", "ViewAll"],
                },
                {
                  text: I18n.t("favorites").toUpperCase(),
                  routeNames: ["SavedFavorites"],
                },
              ]}
            />
          }
        />
      );
    }
  }
}

interface ActivableIconProps extends IconButtonProps {
  active?: boolean;
}

const ActivableIcon = ({ style, active, ...rest }: ActivableIconProps) => (
  <IconButton
    centered
    size={32}
    round
    style={[{
      backgroundColor: active ? "#cb0000" : "transparent",
    }, style]}
    {...rest}
  />
);
