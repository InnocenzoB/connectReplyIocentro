import { ValueBase } from "iocentro-datamodel";
import React, { Component } from "react";
import { Keyboard } from "react-native";
import { NavigationScreenProps } from "react-navigation";

import { RecipePage } from "../components/RecipePage";
import { SearchPhoneComponent } from "../components/SearchPhone";

export interface ViewAllParams {
  category?: ValueBase; // if not provided all recipes are loaded
}

interface ViewAllPhoneState {
  isSearching: boolean;
}

export class ViewAllPhone extends Component<NavigationScreenProps<ViewAllParams>, ViewAllPhoneState> {
  constructor(props: NavigationScreenProps<ViewAllParams>) {
    super(props);

    this.state = {
      isSearching: false,
    };
  }

  public render() {
    const category = this.props.navigation.state.params && this.props.navigation.state.params.category;
    return (
      <RecipePage
        scrollProps={{
          showsHorizontalScrollIndicator: false,
          keyboardShouldPersistTaps: "always",
          onScroll: this.onRecipeResultsScroll,
          onScrollBeginDrag: () => Keyboard.dismiss(),
        }}>
        <SearchPhoneComponent
          category={category}
          ref={(instance) => { this._searchPhoneComponent = instance; }}
          navigation={this.props.navigation}
          active="always"
          initialFilter={true}
          renderLoader={(isSearching) => this.setState({ isSearching })}
          filterFavourites={false}
        />
      </RecipePage>
    );
  }

  private onRecipeResultsScroll = (e) => {
    if (!e || this.state.isSearching || !this._searchPhoneComponent) { return; }
    const ne = e.nativeEvent;
    const scrolledNearEnd = (ne.contentOffset.y + ne.layoutMeasurement.height) > (ne.contentSize.height - 20);
    if (scrolledNearEnd) {
      this._searchPhoneComponent.next();
    }
  }

  private _searchPhoneComponent: SearchPhoneComponent | null;
}
