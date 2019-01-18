import React, { Component } from "react";
import { View } from "react-native";
import { NavigationRouteConfig, NavigationRouter, NavigationScreenProps, TabNavigator } from "react-navigation";

import { DashboardModal } from "../components/dashboard/Dashboard";
import { HomeScreenNavBar } from "../components/nav_bars/HomeScreenBar";
import { IS_TABLET, PlatformSelect } from "../Platform";
import { HomeScreen } from "../views/HomeScreen";
import { MealPlanner } from "../views/MealPlanner";
import { MyAccountModal, MyAccountScreenClass } from "../views/MyAccountScreens";
import { MyCreations } from "../views/MyCreations";
import { SavedFavoritesScreen } from "../views/SavedFavoritesScreen";
import { ShoppingListScreen } from "../views/ShoppingList";
import { ViewAllPhone } from "../views/ViewAllPhone";
import { getCurrentRouteName } from "./CommonNavigation";

const HomeScreenNavigator = TabNavigator(
  PlatformSelect<NavigationRouteConfig<any>>({
    anyTablet: {
      MyCreations: {
        screen: MyCreations,
      },
      SavedFavorites: {
        screen: SavedFavoritesScreen,
      },
      Home: {
        screen: HomeScreen,
      },
      MealPlanner: {
        screen: MealPlanner,
      },
      ShoppingList: {
        screen: ShoppingListScreen,
      },
    },
    anyPhone: {
      MyCreations: {
        screen: MyCreations,
      },
      Home: {
        screen: HomeScreen,
      },
      SavedFavorites: {
        screen: SavedFavoritesScreen,
      },
      ViewAll: { screen: ViewAllPhone },
    },
  }), {
    initialRouteName: "Home",
    animationEnabled: true,
    swipeEnabled: false,
    navigationOptions: {
      tabBarVisible: false,
    },
    lazy: false, // BIOT-9700
  },
);

export class HomeTabsWrapper extends Component<NavigationScreenProps<{}>> {
  public static router: NavigationRouter<any, any, any> = HomeScreenNavigator.router;

  public render() {
    const routeName = getCurrentRouteName(this.props.navigation.state);
    return (
      <View style={{ flex: 1 }}>
        {IS_TABLET && <DashboardModal ref={(me) => this._dashboardModal = me} navigation={this.props.navigation} />}
        <HomeScreenNavigator navigation={this.props.navigation} />
        <HomeScreenNavBar
          currentRouteName={routeName}
          navigate={(id) => this.props.navigation.navigate(id)}
          onUserIconPress={() => this._myAccount && this._myAccount.show()}
          onApplianncePress={() => this._dashboardModal && this._dashboardModal.toggle()}
        />
        <MyAccountModal
          ref={(me) => this._myAccount = me}
          onAddAppliance={() => this.props.navigation.navigate("ApplianceWizard")}
          onSignOut={() => this.props.navigation.navigate("LogOut")}
        />
      </View>
    );
  }

  private _myAccount: MyAccountScreenClass | null = null;
  private _dashboardModal: DashboardModal | null = null;
}
