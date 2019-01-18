import { I18n } from "iocentro-apps-common-bits";
import { RecipeModel, Source } from "iocentro-collection-manager";
import { ValueBase } from "iocentro-datamodel";
import React, { Component } from "react";
import { StyleSheet, View } from "react-native";

import { Category, CategoryGroupsData } from "../components/Category";
import { Paper } from "../components/Paper";
import { RecipieGroupsAdder, SimpleAdder } from "../model/RecipieGroupsAdder";
import { AttributeFilter, Searcher, SearchFilter, TimeFilter } from "../model/Searcher";
import { IS_TABLET } from "../Platform";
import { getUiPresentationValue } from "../Utils";
import { CategoryHeader } from "./CategoryHeader";
import { NoResults } from "./NoResults";
import { TextScaledOnPhone } from "./ScaledText";

interface SearchBaseData {
  recipiesGroups: CategoryGroupsData[];
  recipiesConsumed: number;
}

interface SearchBaseProps {
  isVisible: boolean; // hide component without unmouting
  stringFilter: string; // string for filtering
  runSearch: boolean; // set to start search
  skipStringFilter: boolean; // set to skip stringFilter in search
  favoritesOnly: boolean; // if set, results will contain only favorite recipes
  selectedFilters: SearchFilter[]; // filters for search
  categoryFilter?: ValueBase | null; // if provided `All {x} recipes` text is displayed in header
  onRecipePress: (recipe: RecipeModel) => void; // called when recipe was pressed
  onSearch: () => void; // called if search was started
  onResults: () => void; // called if results was updated or all results was fetched from server
  onIsLoadingUpdate?: (isLoading: boolean) => void;
  navigateToRecipiesPress?: () => void;
  navigateToSavedFavoritesPress?: () => void;
  maxGroups?: number | "unlimited"; // when maxGroups == "unlimited" recipes are not loaded sequentially; defaults to 10
  getSource?: (source: Source) => void;
}

export class SearchBaseComponent extends Component<SearchBaseProps, SearchBaseData> {
  private searcher: Searcher;
  private groupsAdder: RecipieGroupsAdder;
  private maxGroups: number | "unlimited";

  constructor(props) {
    super(props);

    this.maxGroups = props.maxGroups === undefined ? 10 : props.maxGroups;
    this.groupsAdder = new SimpleAdder(this.maxGroups == "unlimited" ? undefined : this.maxGroups);

    this.state = {
      recipiesGroups: [],
      recipiesConsumed: 0,
    };
  }

  public next = () => {
    this.searcher.next();
  }

  public componentWillMount() {
    this.searcher = new Searcher(
      this.onResultsUpdate,
      this.onIsLoadingUpdate,
    );

    if (this.props.runSearch) {
      this.doSearch(this.props);
      this.props.onSearch();
    }
  }

  public componentWillUnmount() {
    this.searcher.dispose();
  }

  public componentWillReceiveProps(nextProps: SearchBaseProps) {
    if (nextProps.runSearch) {
      this.doSearch(nextProps);
      this.props.onSearch();
    }
  }

  public render() {
    const {
      isVisible,
      selectedFilters,
      stringFilter,
      categoryFilter,
      onRecipePress,
      navigateToRecipiesPress,
      navigateToSavedFavoritesPress,
    } = this.props;
    const {
      recipiesGroups,
    } = this.state;

    if (!isVisible) { return null; }

    const catFilterTxt = categoryFilter ? getUiPresentationValue(categoryFilter, "") + " " : "";
    const hasResults = recipiesGroups.length > 0;

    const headerText1 = stringFilter != ""
      ? I18n.t("results_for")
      : hasResults
        ? `${I18n.t("all")} ${catFilterTxt}`
        : "";
    const headerText2 = stringFilter != ""
      ? (" " + stringFilter)
      : hasResults
        ? I18n.t("recipes").toUpperCase()
        : "";

    return (
      <View style={{ backgroundColor: "transparent" }}>
        {IS_TABLET && (stringFilter != "" || categoryFilter !== undefined) &&
          <ResultsHeader
            text1={headerText1}
            text2={headerText2}
          />
        }
        <View style={styles.pageContainer}>
          <Paper>
            {!IS_TABLET && categoryFilter !== undefined &&
              <CategoryHeader
                simple={false}
                title={headerText1}
                subtitle={headerText2}
              />
            }
            {hasResults ? (
              <Category
                data={recipiesGroups}
                onPress={onRecipePress}
              />
            ) : (
                <NoResults
                  filtersSelected={selectedFilters.length > 0}
                  onRecipesPress={navigateToRecipiesPress}
                  onSavedFavoritesPress={navigateToSavedFavoritesPress}
                />
              )}
          </Paper>
        </View>
      </View>
    );
  }

  private onResultsUpdate = (results: RecipeModel[], source: Source) => {
    const recipiesGroups = this.groupsAdder.addGroups(
      results,
      this.state.recipiesConsumed,
      source,
      this.state.recipiesGroups.slice());
    const recipiesConsumed = results.length;

    this.setState({
      recipiesGroups,
      recipiesConsumed,
    }, () => {
      this.props.onResults && this.props.onResults();
    });
  }

  private onIsLoadingUpdate = (isLoading: boolean, source: Source) => {
    if (source.isEndReached.sv() === true) {
      this.props.onResults && this.props.onResults();
    } else if (isLoading === false) {
      if (this.maxGroups != "unlimited") {
        if (this.state.recipiesGroups.length > 0 &&
          this.state.recipiesGroups.length < this.maxGroups) {
          source.next();
        }
      }
    }
    this.props.onIsLoadingUpdate && this.props.onIsLoadingUpdate(isLoading);
  }

  private doSearch = (props: SearchBaseProps) => {
    this.setState({ recipiesGroups: [], recipiesConsumed: 0 }, () => {
      this.searcher.search((source) => {
        const {
          selectedFilters,
          favoritesOnly,
          stringFilter,
          skipStringFilter,
        } = props;
        this.props.getSource && this.props.getSource(source);
        if (selectedFilters) {
          for (const filter of selectedFilters) {
            if (filter instanceof AttributeFilter) {
              source.filterByAttribute(filter.value);
            } else if (filter instanceof TimeFilter) {
              source.filterByTotalTime(filter.value);
            }
          }
        }
        if (favoritesOnly) {
          source.filterByBelongingToFavorites();
        }
        if (stringFilter != "" && !skipStringFilter) {
          source.filterByText(stringFilter);
        }
        source.fetch();
      });
    });
  }
}

const ResultsHeader = ({ text1, text2 }) => (
  <TextScaledOnPhone style={styles.resultsHeaderContainer}>
    <TextScaledOnPhone style={styles.resultsFont1}>{text1}</TextScaledOnPhone>
    <TextScaledOnPhone style={styles.resultsFont2}>{text2}</TextScaledOnPhone>
  </TextScaledOnPhone>
);

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
  resultsHeaderContainer: {
    marginTop: 38,
    marginLeft: 63,
    opacity: 0.6,
  },
  resultsFont1: {
    fontFamily: "Merriweather",
    fontStyle: "italic",
    fontSize: 24,
    fontWeight: "300",
    letterSpacing: 1,
    color: "#ffffff",
  },
  resultsFont2: {
    fontFamily: "Muli",
    fontSize: 19,
    fontWeight: "900",
    letterSpacing: 2.71,
    color: "rgb(255, 255, 255)",
  },
});
