import { I18n } from "iocentro-apps-common-bits";
import { Source } from "iocentro-collection-manager";
import { ChangeOriginType, ValueTrait } from "iocentro-datamodel";
import React, { Component } from "react";
import { Keyboard, StyleSheet, View, ViewStyle } from "react-native";
import { NavigationScreenProps } from "react-navigation";

import { ThemedTextButton } from "../components/Buttons";
import { Loading } from "../components/Loading";
import { RecipePage } from "../components/RecipePage";
import { FiltersGroup } from "../components/saved_favorites/Filter";
import { SearchBaseComponent } from "../components/SearchBase";
import { SearchPhoneComponent } from "../components/SearchPhone";
import { Searcher, SearchFilter, SearchFilterGroup } from "../model/Searcher";
import { IS_TABLET, PlatformSelect } from "../Platform";
import { SearchStates } from "./SearchScreen";

interface SavedFavoritesScreenState {
  runSearch: boolean;
  blockResults: boolean;
  isLoading: boolean;
  filtersData: SearchFilterGroup[];
  selectedFilters: SearchFilter[];
  searchState: SearchStates;
}

export class SavedFavoritesScreen extends Component<NavigationScreenProps<{}>, SavedFavoritesScreenState> {
  private filtersGroup: FiltersGroup | null;
  private navFocusListener;
  private source: Source;
  private searchBaseComponent: SearchBaseComponent | null;
  private searchPhoneComponent: SearchPhoneComponent | null;

  constructor(props: NavigationScreenProps<{}>) {
    super(props);

    this.state = {
      runSearch: false,
      blockResults: false,
      isLoading: false,
      filtersData: [],
      selectedFilters: [],
      searchState: SearchStates.SEARCHING,
    };
  }

  public componentWillMount() {
    // @types does not yet support lates version and addListener causes err
    const navigation = this.props.navigation as any;
    this.navFocusListener = navigation.addListener(
      "willFocus",
      this.onScreenFocused,
    );

    this.getFilters().then(() => {
      this.setState({ runSearch: true });
    });
  }

  public componentWillUnmount() {
    this.navFocusListener.remove();
  }

  public render() {
    if (IS_TABLET) {
      return (this.renderTablet());
    } else {
      return (this.renderPhone());
    }
  }

  private renderPhone = () => {
    return (
      <RecipePage
        scrollProps={{
          showsHorizontalScrollIndicator: false,
          keyboardShouldPersistTaps: "always",
          onScrollBeginDrag: () => Keyboard.dismiss(),
          onScroll: this.onRecipeResultsScroll,
        }}>
        <SearchPhoneComponent
          ref={(instance) => { this.searchPhoneComponent = instance; }}
          navigation={this.props.navigation}
          active="always"
          initialFilter={true}
          savedFavorites={true}
          renderLoader={(isSearching) => {
            this.setState({
              searchState: isSearching ? SearchStates.SEARCHING : SearchStates.RESULTS,
            });
          }}
          filterFavourites={true}
        />
      </RecipePage>
    );
  }

  private renderTablet = () => {
    const {
      runSearch,
      filtersData,
      selectedFilters,
      searchState,
    } = this.state;
    return (
      <RecipePage
        loading={searchState == SearchStates.SEARCHING}
        scrollProps={{
          showsHorizontalScrollIndicator: false,
          scrollEnabled: searchState == SearchStates.RESULTS,
          onScroll: this.onRecipeResultsScroll,
        }}>

        {/* There isn't hints on tablet */}

        <View style={styles.headerContainer}>
          <FiltersGroup
            ref={(comp) => { this.filtersGroup = comp as FiltersGroup | null; }}
            data={filtersData}
            onFilterSearch={this.onFiltersSelected}
          />
          <ThemedTextButton
            theme="white"
            style={styles.clearFilters}
            onPress={this.onClearFilters}
            text={I18n.t("clear_filters")}
          />
        </View>

        <SearchBaseComponent
          ref={(instance) => { this.searchBaseComponent = instance; }}
          isVisible={searchState == SearchStates.RESULTS}
          stringFilter={""}
          runSearch={runSearch}
          maxGroups="unlimited"
          skipStringFilter={true}
          favoritesOnly={true}
          selectedFilters={selectedFilters}
          onRecipePress={(recipe) => { this.props.navigation.navigate("RecipeSummary", { recipe }); }}
          onIsLoadingUpdate={(isLoading) => this.setState({ isLoading })}
          onSearch={this.onSearch}
          onResults={this.onResults}
          navigateToRecipiesPress={() => { this.props.navigation.goBack(); }}
          navigateToSavedFavoritesPress={() => { this.props.navigation.navigate("SavedFavorites"); }}
          getSource={this.getSource}
        />
        <Loading
          style={{
            position: "relative",
            marginVertical: 50,
            backgroundColor: "transparent",
          }}
          visible={this.state.searchState == SearchStates.RESULTS && this.state.isLoading}
        />
      </RecipePage>
    );
  }

  private readonly onRecipeResultsScroll = (e) => {
    const searchComponent = this.searchBaseComponent || this.searchPhoneComponent;
    if (!e
      || this.state.searchState != SearchStates.RESULTS
      || !searchComponent) {
      return;
    }
    const ne = e.nativeEvent;
    const scrolledNearEnd = (ne.contentOffset.y + ne.layoutMeasurement.height) > (ne.contentSize.height - 20);
    if (scrolledNearEnd) {
      searchComponent.next();
    }
  }

  private getFilters() {
    return new Promise((resolve) => {
      this.setState({
        filtersData: Searcher.getAllFilters(),
      }, () => {
        resolve();
      });
    });
  }

  private onSearch = () => {
    this.setState({
      runSearch: false,
      searchState: SearchStates.SEARCHING,
    });
  }

  private onResults = () => {
    if (!this.state.blockResults) {
      this.setState({
        searchState: SearchStates.RESULTS,
      });
    }
  }

  private onFiltersSelected = (filters: SearchFilter[]) => {
    this.setState({
      selectedFilters: filters,
      runSearch: true,
    });
  }

  private onClearFilters = () => {
    this.setState({
      selectedFilters: [],
    }, () => {
      this.getFilters().then(() => {
        this.filtersGroup && this.filtersGroup.searchWithFilters();
      });
    });
  }

  private onScreenFocused = () => {
    if (this.source && (this.source.recentlyRemoved.sv() == true || this.source.shouldRefetch.sv() == true)) {
      this.setState({ runSearch: true });
      this.source.recentlyRemoved.update(new ValueTrait(false), ChangeOriginType.model);
      this.source.shouldRefetch.update(new ValueTrait(false), ChangeOriginType.model);
    }
  }

  private getSource = (source) => {
    this.source = source;
  }
}

const styles = StyleSheet.create({
  headerContainer: Object.assign({
    flexDirection: "row",
  },
    PlatformSelect<ViewStyle>({
      anyTablet: {
        marginTop: 27,
        marginLeft: 66,
        marginRight: 18,
        justifyContent: "space-between",
      },
      anyPhone: {
        justifyContent: "center",
        marginTop: 16,
      },
    }),
  ),
  clearFilters: {
    marginTop: 4,
    backgroundColor: "transparent",
  },
});
