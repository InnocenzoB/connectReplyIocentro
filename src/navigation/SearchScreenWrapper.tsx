import React, { Component } from "react";
import { View } from "react-native";
import { NavigationRouter, NavigationScreenProps, StackNavigator } from "react-navigation";

import { DashboardModal } from "../components/dashboard/Dashboard";
import { SearchNavBar } from "../components/nav_bars/SearchNavBar";
import { IS_TABLET } from "../Platform";
import { SearchScreen } from "../views/SearchScreen";

const SearchScreenStack = StackNavigator({
  SearchScreen: { screen: SearchScreen },
}, {
    initialRouteName: "SearchScreen",
    headerMode: "none",
});

interface SearchScreenWrapperProps {
  middleElement?: JSX.Element;
}

export class SearchScreenWrapper extends Component<NavigationScreenProps<SearchScreenWrapperProps>> {
  public static router: NavigationRouter<any, any, any> = SearchScreenStack.router;

  public render() {
    const navParams = this.props.navigation.state.params;
    const middleElement = (navParams && navParams.middleElement) || null;
    return (
      <View style={{ flex: 1 }}>
        {IS_TABLET && <DashboardModal ref={(me) => this._dashboardModal = me} navigation={this.props.navigation}/>}
        <SearchScreenStack
          screenProps={{
            wrapperKey: this.props.navigation.state.key,
          }}
          navigation={this.props.navigation}
        />
        <SearchNavBar
          middleElement={middleElement}
          onBackPress={() => this.props.navigation.goBack()}
          onApplianncePress={() => this._dashboardModal && this._dashboardModal.toggle()}
        />
      </View>
    );
  }
  private _dashboardModal: DashboardModal | null = null;
}
