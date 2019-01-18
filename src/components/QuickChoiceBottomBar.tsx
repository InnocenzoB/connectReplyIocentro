import React, { Component } from "react";
import { Image, ImageRequireSource, ImageURISource } from "react-native";
import Tabs from "react-native-tabs";

const imported = {
  userIconUnselected: require("../../img/home_screen/userIconUnselected.png"),
  homeIcon: require("../../img/icons/homeIcon.png"),
  shoppingListIcon: require("../../img/icons/shoppingListIcon.png"),
  navbarAppliancesIcon: require("../../img/home_screen/navbarAppliancesIcon.png"),
  mealPlannerIcon: require("../../img/icons/mealPlannerIcon.png"),
};

export const QUICK_CHOICE_BAR_HEIGHT = 50;

export const QUICK_CHOICE_LIST = [
  { routeName: "MyAccount", iconSource: imported.userIconUnselected },
  { routeName: "HomeTabs", iconSource: imported.homeIcon },
  { routeName: "ShoppingList", iconSource: imported.shoppingListIcon },
  { routeName: "Dashboard", iconSource: imported.navbarAppliancesIcon },
  { routeName: "MealPlanner", iconSource: imported.mealPlannerIcon },
];

interface QuickChoiceBottomBarProps {
  currentPage: number;
  onNavRequest: (routeName: string) => void;
}

export class QuickChoiceBottomBar extends Component<QuickChoiceBottomBarProps> {
  public static RouteNameIndex(routeName: string | null) {
    return QUICK_CHOICE_LIST.findIndex((x) => (x.routeName == routeName));
  }

  public shouldComponentUpdate(nextProps: QuickChoiceBottomBarProps) {
    return (this.props.currentPage != nextProps.currentPage) && (nextProps.currentPage != -1);
  }

  public render() {
    return (
      <Tabs
        selected={this.props.currentPage}
        selectedIconStyle={{ borderBottomWidth: 5, borderBottomColor: "#ca0000" }}
        iconStyle={{ maxWidth: 30 }}
        style={{
          justifyContent: "space-between",
          paddingHorizontal: 22,
          paddingTop: 12,
          paddingBottom: 10,
          height: QUICK_CHOICE_BAR_HEIGHT,

          backgroundColor: "rgba(0, 0, 0, 0.9)",
          shadowColor: "rgba(0, 0, 0, 0.2)",
          shadowOffset: {
            width: 0,
            height: 0,
          },
          shadowRadius: 4,
          shadowOpacity: 1,
        }}
      >
        {QUICK_CHOICE_LIST.map((element, index) => (
          <NamedIcon key={index} name={index} source={element.iconSource}
            onSelect={() => element.routeName ? this._quickChoice(element.routeName) : alert("TODO")} />
        ))}
      </Tabs>
    );
  }

  private _quickChoice(routeName: string) {
    this.props.onNavRequest(routeName);
  }
}

interface NamedIconProps {
  name: number | string;
  source: ImageURISource | ImageURISource[] | ImageRequireSource;
  onSelect?: () => void;
}

const NamedIcon = (props: NamedIconProps) => (
  <Image source={props.source} />
);
