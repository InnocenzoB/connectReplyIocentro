import React, { Component } from "react";
import { StatusBar, View } from "react-native";
import { NavigationRouter, NavigationScreenProps, StackNavigator, TabNavigator } from "react-navigation";

import { Dashboard } from "../components/dashboard/Dashboard";
import { QUICK_CHOICE_LIST, QuickChoiceBottomBar } from "../components/QuickChoiceBottomBar";
import { MealPlanner } from "../views/MealPlanner";
import { MyAccountNavigator } from "../views/MyAccountScreens";
import { ShoppingListScreen } from "../views/ShoppingList";
import { commonSignedInNavRoutes, goBackTo, scanCurrentRoute } from "./CommonNavigation";
import { HomeTabsWrapper } from "./HomeTabsWrapper";

const PhoneBotomTabs = TabNavigator({
  MyAccount: { screen: MyAccountNavigator },
  HomeTabs: { screen: HomeTabsWrapper },
  ShoppingList: { screen: ShoppingListScreen },
  Dashboard: { screen: Dashboard },
  MealPlanner: { screen: MealPlanner },
}, {
  initialRouteName: "HomeTabs",
  animationEnabled: true, // BIOT-9700
  swipeEnabled: false,
  navigationOptions: {
    tabBarVisible: false,
  },
  lazy: false, // BIOT-9700
});

const SignedInNavigatorPhone = StackNavigator({
  MainTabs: {
    screen: PhoneBotomTabs,
  },
  ...commonSignedInNavRoutes,
 }, {
  initialRouteName: "MainTabs",
  headerMode: "none",
  navigationOptions: {
    gesturesEnabled: false,
  },
});

interface PhoneNavigatorWrapperProps {
  // Used to override function that is used to navigate when user clicks on quick choice bottom bar
  quickChoiceNavigate?: (routeName: string, originalNavigate: (routeName: string) => void) => void;
}

class PhoneNavigatorWrapper extends Component<NavigationScreenProps<PhoneNavigatorWrapperProps>> {
  public static router: NavigationRouter<any, any, any> = SignedInNavigatorPhone.router;

  public render() {
    const navState = this.props.navigation.state;
    const routeName = scanCurrentRoute(navState, QUICK_CHOICE_LIST);

    const quickChoiceNavigate = (navState.params && navState.params.quickChoiceNavigate) || null;

    return (
      <View style={{ flex: 1 }}>
        <StatusBar hidden={true} />
        <SignedInNavigatorPhone
          screenProps={{
            wrapperKey: this.props.navigation.state.key,
          }}
          navigation={this.props.navigation}
        />
        <QuickChoiceBottomBar
          currentPage={QuickChoiceBottomBar.RouteNameIndex(routeName)}
          onNavRequest={(route) => {
            if (quickChoiceNavigate) {
              quickChoiceNavigate(route, this._onNavRequest);
            } else {
              this._onNavRequest(route);
            }
          }}
        />
      </View>
    );
  }

  private _onNavRequest = (routeName) => {
    if (!goBackTo(routeName, this.props.navigation)) {
      if (routeName == "HomeTabs") {
        this.props.navigation.navigate("Home");
      }
    }
  }
}

export const PhoneNavigator = StackNavigator({
  Main: { screen: PhoneNavigatorWrapper },
}, {
  initialRouteName: "Main",
  headerMode: "none",
  navigationOptions: {
    gesturesEnabled: false,
  },
});
