import { I18n } from "iocentro-apps-common-bits";
import { ValueBase } from "iocentro-datamodel";
import React, { Component } from "react";
import { StyleProp, StyleSheet, TextInput, View, ViewStyle } from "react-native";
import { NavigationActions, NavigationScreenProps } from "react-navigation";

import { ThemedTextButton } from "../components/Buttons";
import { KATextInput } from "../components/KATextInput";
import { Loading } from "../components/Loading";
import { RecipePage } from "../components/RecipePage";
import { FiltersGroup } from "../components/saved_favorites/Filter";
import { SearchBar } from "../components/search_screen/SearchBar";
import { SearchHints } from "../components/search_screen/SearchHints";
import { SearchBaseComponent } from "../components/SearchBase";
import { AttributeFilter, Searcher, SearchFilter, SearchFilterGroup } from "../model/Searcher";
import { PlatformSelect } from "../Platform";

export enum SearchStates {
  SHOW_HINTS,
  SEARCHING,
  RESULTS,
}

export interface CommonSearchState {
  barText: string;
  stringFilter: string;
  runSearch: boolean;
  skipStringFilter: boolean;
  blockResults: boolean;
  filtersData: SearchFilterGroup[];
  selectedFilters: SearchFilter[];
  searchState: SearchStates;
}

interface SearchScreenState extends CommonSearchState {
  searchRecipesHasFocus: boolean;
  categoryFilter?: ValueBase | null;
  isLoading: boolean;
}

export interface SearchScreenParams {
  category?: ValueBase | null;
}

export class SearchScreen extends Component<NavigationScreenProps<SearchScreenParams>, SearchScreenState> {
  // note: do not use clear() use onTextChange("") instead
  private searchInput: TextInput | null = null;
  private searchBaseomponent: SearchBaseComponent | null;
  private wrapperKey: string;

  constructor(props: NavigationScreenProps<SearchScreenParams>) {
    super(props);

    const wrapperKey: string | undefined = this.props.screenProps && this.props.screenProps.wrapperKey;
    if (typeof wrapperKey != "string") {
      throw new Error("screenProps.wrapperKey is undefined");
    }
    this.wrapperKey = wrapperKey;

    const categoryFilter = props.navigation.state.params && props.navigation.state.params.category;

    this.state = {
      barText: "",
      stringFilter: "",
      runSearch: categoryFilter !== undefined,
      skipStringFilter: false,
      blockResults: false,
      filtersData: [],
      selectedFilters: [],
      searchState: categoryFilter === undefined ? SearchStates.SHOW_HINTS : SearchStates.SEARCHING,
      searchRecipesHasFocus: false,
      categoryFilter,
      isLoading: false,
    };
  }

  public componentWillMount() {
    this.getFilters();
    this.renderSearchBar(this.state.barText);
    if (this.state.categoryFilter) {
      const filter = new AttributeFilter(this.state.categoryFilter, "category");
      filter.selected = true;
      this.setState({
        runSearch: true,
        selectedFilters: [filter],
      });
    }
  }

  public render() {
    const {
      stringFilter,
      runSearch,
      skipStringFilter,
      filtersData,
      selectedFilters,
      categoryFilter,
      searchState,
    } = this.state;

    return (
      <RecipePage
        loading={searchState == SearchStates.SEARCHING}
        scrollProps={{
          keyboardShouldPersistTaps: "handled",
          showsHorizontalScrollIndicator: false,
          scrollEnabled: searchState != SearchStates.SEARCHING,
          onScrollBeginDrag: () => this.searchInput && this.searchInput.blur(),
          onScroll: this.onRecipeResultsScroll,
        }}>
        {searchState == SearchStates.SHOW_HINTS ? (
          <Hints
            filtersData={filtersData}
            onHintPress={this.onHintPress}
          />
        ) : (
            <View style={styles.headerContainer}>
              <FiltersGroup
                data={filtersData}
                onFilterSearch={this.onFilterSearch}
              />
              <ThemedTextButton
                theme="white"
                style={styles.clearFilters}
                onPress={this.onClearFilters}
                text={I18n.t("clear_filters")}
              />
            </View>
          )}
        <SearchBaseComponent
          ref={(instance) => { this.searchBaseomponent = instance; }}
          maxGroups="unlimited"
          isVisible={searchState == SearchStates.RESULTS}
          stringFilter={stringFilter}
          runSearch={runSearch}
          categoryFilter={categoryFilter}
          skipStringFilter={skipStringFilter}
          favoritesOnly={false}
          selectedFilters={selectedFilters}
          onRecipePress={(recipe) => { this.props.navigation.navigate("RecipeSummary", { recipe }); }}
          onSearch={this.onSearch}
          onResults={this.onResults}
          onIsLoadingUpdate={(isLoading) => this.setState({isLoading})}
          navigateToRecipiesPress={() => { this.props.navigation.navigate("Home"); }}
          navigateToSavedFavoritesPress={() => { this.props.navigation.navigate("SavedFavorites"); }}
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

  private renderSearchBar(text: string) {
    this.props.navigation.dispatch(NavigationActions.setParams({
      params: {
        middleElement: (
          <SearchBar
            onClearPress={this.onClearBarPress}>
            <KATextInput
              textInputRef={(textInput) => { this.searchInput = textInput as TextInput | null; }}
              style={styles.textInput}
              selectionColor="white"
              placeholder={I18n.t("search_all_recipes")}
              placeholderTextColor="white"
              autoFocus={this.state.categoryFilter === undefined}
              returnKeyType={"done"}
              onChangeText={this.onTextChange}
              onSubmitEditing={this.onSubmit}
              value={text}
            />
          </SearchBar>
        ),
      },
      key: this.wrapperKey,
    }));
  }

  private getFilters() {
    this.setState({
      filtersData: Searcher.getAllFilters(),
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

  private readonly onRecipeResultsScroll = (e) => {
    if (!e
      || this.state.searchState != SearchStates.RESULTS
      || this.searchBaseomponent == null) {
      return;
    }
    const ne = e.nativeEvent;
    const scrolledNearEnd = (ne.contentOffset.y + ne.layoutMeasurement.height) > (ne.contentSize.height - 20);
    if (scrolledNearEnd) {
      this.searchBaseomponent.next();
    }
  }

  private onHintPress = (filter: SearchFilter) => {
    const text = filter.name;
    this.searchInput && this.searchInput.blur();

    filter.selected = true;

    this.setState({
      selectedFilters: [filter],
      runSearch: true,
      stringFilter: text, skipStringFilter: true, // set results for text but filter by attributes
      blockResults: false,
    });
    this.onTextChange("");
  }

  private onFilterSearch = (filters: SearchFilter[]) => {
    this.setState({
      selectedFilters: filters,
      runSearch: true,
      blockResults: false,
      categoryFilter: undefined,
    });
  }

  private onClearFilters = () => {
    this.setState({
      selectedFilters: [],
      blockResults: true,
      searchState: SearchStates.SHOW_HINTS,
      categoryFilter: undefined,
    }, () => this.getFilters());
  }

  private onTextChange = (barText: string, callback?: () => void) => {
    this.renderSearchBar(barText);
    this.setState({ barText }, callback);
  }

  private onSubmit = () => {
    this.setState({
      runSearch: true,
      skipStringFilter: false,
      stringFilter: this.state.barText.trim(),
      blockResults: false,
    });
  }

  private onClearBarPress = () => {
    if (this.searchInput) {
      this.onTextChange("", () => {
        this.searchInput && this.searchInput.focus();
        this.setState({
          stringFilter: "",
          skipStringFilter: true,
        });
        if (this.state.searchState != SearchStates.SHOW_HINTS) {
          this.setState({
            runSearch: true,
            blockResults: false,
          });
        }
      });
    }
  }
}

interface HintsProps {
  onHintPress?: (filterName: SearchFilter) => void;
  filtersData: SearchFilterGroup[];
  style?: StyleProp<ViewStyle>;
}

export class Hints extends Component<HintsProps> {
  public render() {
    const {
      style,
      filtersData,
      onHintPress,
    } = this.props;

    const searchHints = [
      {
        title: `${I18n.t("search_by").toLowerCase()} ${I18n.t("category").toLowerCase()}`,
        filters: filtersData[0].data,
      },
      {
        title: `${I18n.t("search_by").toLowerCase()} ${I18n.t("cuisine").toLowerCase()}`,
        filters: filtersData[1].data,
      },
      {
        title: `${I18n.t("search_by").toLowerCase()} ${I18n.t("difficulty").toLowerCase()}`,
        filters: filtersData[2].data,
      },
      {
        title: `${I18n.t("search_by").toLowerCase()} ${I18n.t("total_time").toLowerCase()}`,
        filters: filtersData[3].data,
      },
    ];

    return (
      <View style={style}>
        <SearchHints
          data={searchHints}
          onPress={onHintPress}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  pageContainer: {
    flex: 1,
    marginTop: 20,
    marginLeft: 15,
    marginBottom: 19,
    borderRadius: 4,
    backgroundColor: "#ffffff",
    shadowColor: "rgba(0, 0, 0, 0.18)",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowRadius: 14,
    shadowOpacity: 1,
  },
  textInput: {
    flex: 1,
    fontFamily: "Muli",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 2,
    color: "#ffffff",
    textAlign: "center",
  },
  resultsHeaderContainer: {
    marginTop: 38,
    marginLeft: 63,
    opacity: 0.6,
  },
  headerContainer: {
    ...PlatformSelect<ViewStyle>({
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
    flexDirection: "row",
  },
  clearFilters: {
    marginTop: 4,
    backgroundColor: "transparent",
  },
});
