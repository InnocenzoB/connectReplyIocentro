import { I18n } from "iocentro-apps-common-bits";
import { ChangeOriginType, ValueBase, ValueTrait } from "iocentro-datamodel";
import React, { Component } from "react";
import { StyleSheet, TextInput, View } from "react-native";

import { CloseableBlurredModal } from "../components/CloseableBlurredModal";
import { SearchBaseComponent } from "../components/SearchBase";
import { AttributeFilter, Searcher, SearchFilter } from "../model/Searcher";
import { CommonSearchState, Hints, SearchStates } from "../views/SearchScreen";
import { ThemedTextButton } from "./Buttons";
import { Hr } from "./Hr";
import { Loading } from "./Loading";
import { QUICK_CHOICE_BAR_HEIGHT } from "./QuickChoiceBottomBar";
import { FiltersGroup } from "./saved_favorites/Filter";
import { SearchBar } from "./SearchBar";

const imported = {
  filterIconRed: require("../../img/icons/FilteredResultsMobile.png"),
  filterIconGray: require("../../img/icons/filterIcon.png"),
  searchIcon: require("../../img/icons/searchIconSelected.png"),
  clearIcon: require("../../img/icons/searchbarXIcon.png"),
};

interface SearchPhoneState extends CommonSearchState {
  modalFilterVisible: boolean;
  isLoading: boolean;
  categoryFilter?: ValueBase | null;
}

interface SearchPhoneProps {
  onActiveChange?: (value: boolean) => void;
  active: boolean | "always";
  navigation;
  initialFilter: boolean;
  renderLoader: (x: boolean) => void;
  filterFavourites: boolean;
  savedFavorites?: boolean;
  category?: ValueBase | null;
}

export class SearchPhoneComponent extends Component<SearchPhoneProps, SearchPhoneState> {
  private searchInput: TextInput | null;
  private filterGroup: FiltersGroup | null;
  private searchBaseComponent: SearchBaseComponent | null;
  private navFocusListener;
  private source;

  public static defaultProps: SearchPhoneProps = {
    renderLoader: () => { },
    initialFilter: false,
    navigation: null,
    filterFavourites: false,
    savedFavorites: false,
    active: true,
  };

  constructor(props) {
    super(props);

    this.state = {
      barText: "",
      stringFilter: "",
      runSearch: this.props.initialFilter,
      skipStringFilter: false,
      blockResults: false,
      filtersData: [],
      selectedFilters: [],
      searchState: SearchStates.SHOW_HINTS,
      modalFilterVisible: false,
      isLoading: false,
      categoryFilter: this.props.category,
    };

    this.onCategoryFilterChange();
  }

  private onCategoryFilterChange = () => {
    if (this.state.categoryFilter === undefined) {
      return;
    }
    const filters: SearchFilter[] = [];
    if (this.state.categoryFilter) {
      const filter = new AttributeFilter(this.state.categoryFilter, "category");
      filter.selected = true;
      filters.push(filter);
    }
    // deselect all filters
    this.state.filtersData.forEach((fg) => fg.data.forEach((f) => f.selected = false));
    this.setState({
      runSearch: true,
      selectedFilters: filters,
      stringFilter: "",
      barText: "",
      blockResults: false,
    });
  }

  public componentWillReceiveProps(nextProps: SearchPhoneProps) {
    const currentCategory = this.props.category;
    const newCategory = nextProps.category;

    if (currentCategory !== newCategory) { // TODO ValueBase object comparison
      this.setState({ categoryFilter: newCategory }, this.onCategoryFilterChange);
    }
  }

  public componentWillMount() {
    this.getFilters();

    // @types does not yet support lates version and addListener causes err
    const navigation = this.props.navigation as any;

    if (this.props.savedFavorites) {
      this.navFocusListener = navigation.addListener(
        "willFocus",
        this.onScreenFocused,
      );
    }
  }

  public componentWillUnmount() {
    if (this.navFocusListener) {
      this.navFocusListener.remove();
    }
  }

  private isActive = () => !!(this.props.active); // catch "always" and true

  public render() {
    const filterActive = this.state.filtersData.some((filterGroup) => (
      filterGroup.data.some((filter) => filter.selected)
    ));

    const tintIcon = this.props.active === true ||
      (this.props.active === "always" && this.state.searchState == SearchStates.SHOW_HINTS);

    return (
      <View
        style={{
          backgroundColor: "transparent",
          paddingBottom: this.isActive() ? QUICK_CHOICE_BAR_HEIGHT : 0,
        }}>

        {this.renderFilterModal()}

        <SearchBar
          barStyle={styles.searchBar}
          touchableExpandSize={5}
          placeholder={I18n.t("input_search_phrase")}
          style={styles.searchBarText}
          rightIcon={filterActive ? imported.filterIconRed : imported.filterIconGray}
          onRightButtonClick={this.toggleModal}
          leftIcon={imported.searchIcon}
          leftIconStyle={tintIcon && { tintColor: "rgb(203, 0, 0)" }}
          onLeftButtonClick={() => {
            if (this.props.active === "always") {
              if (this.state.searchState == SearchStates.SHOW_HINTS) {
                this.setState({
                  searchState: SearchStates.RESULTS,
                });
              } else {
                this.showSearch();
              }
            } else if (this.isActive()) {
              this.hideSearch();
              this.onClearFilters();
              this.searchInput && this.searchInput.blur();
            } else {
              this.showSearch();
            }
          }}
          clearIcon={imported.clearIcon}
          onFocus={() => {
            if (!this.isActive()) {
              this.showSearch();
            }
          }}
          onChangeText={this.onTextChange}
          onClear={this.onClearBarPress}
          onSubmitEditing={this.onSubmit}
          value={this.state.barText}
          textInputRef={(instance) => { this.searchInput = instance; }}
        />

        {this.isActive() && this.state.searchState == SearchStates.SHOW_HINTS &&
          <Hints
            filtersData={this.state.filtersData}
            onHintPress={this.onHintPress}
          />
        }

        <SearchBaseComponent
          ref={(instance) => { this.searchBaseComponent = instance; }}
          isVisible={this.isActive() && this.state.searchState == SearchStates.RESULTS}
          stringFilter={this.state.stringFilter}
          runSearch={this.state.runSearch}
          skipStringFilter={this.state.skipStringFilter}
          favoritesOnly={this.props.filterFavourites}
          selectedFilters={this.state.selectedFilters}
          onRecipePress={(recipe) => { this.props.navigation.navigate("RecipeSummary", { recipe }); }}
          onSearch={this.onSearch}
          onResults={this.onResults}
          categoryFilter={this.state.categoryFilter}
          maxGroups="unlimited"
          onIsLoadingUpdate={(isLoading) => this.setState({ isLoading })}
          navigateToRecipiesPress={() => { this.props.navigation.navigate("Home"); }}
          navigateToSavedFavoritesPress={() => { this.props.navigation.navigate("SavedFavorites"); }}
          getSource={this.getSource}
        />
        <Loading
          style={{
            position: "relative",
            marginVertical: 50,
            backgroundColor: "transparent",
          }}
          visible={this.state.isLoading}
        />
      </View>
    );
  }

  public next = () => {
    if (this.state.searchState != SearchStates.RESULTS) {
      return;
    }
    this.searchBaseComponent && this.searchBaseComponent.next();
  }

  private renderFilterModal() {
    return (
      <CloseableBlurredModal
        visible={this.state.modalFilterVisible}
        onRequestClose={this.toggleModal}
      >
        <Hr style={{ marginTop: 75, marginBottom: 13, height: 1, backgroundColor: "rgb(255,255,255)" }} />
        <FiltersGroup
          ref={(instance) => { this.filterGroup = instance as FiltersGroup | null; }}
          data={this.state.filtersData}
          onFilterSearch={this.onFilterSearch}
          style={{ flexDirection: "column" }}
          horizontal={false}
        >
          <Hr style={{ marginTop: 13, marginBottom: 13, height: 1, backgroundColor: "rgb(255,255,255)" }} />
        </FiltersGroup>
        <View style={{ width: "100%", height: 80, alignItems: "center", justifyContent: "center" }}>
          <ThemedTextButton
            theme="white"
            onPress={this.onClearFilters}
            text={I18n.t("clear_all_filters")}
          />
        </View>
      </CloseableBlurredModal>
    );
  }

  private getFilters() {
    this.setState({
      filtersData: Searcher.getAllFilters(),
    });
  }

  private showSearch = () => {
    this.props.onActiveChange && this.props.onActiveChange(true);
    this.setState({
      selectedFilters: [],
      stringFilter: "",
      blockResults: true,
      searchState: SearchStates.SHOW_HINTS,
    });
  }

  private hideSearch = () => {
    this.props.onActiveChange && this.props.onActiveChange(false);
    this.setState({
      barText: "",
      blockResults: true,
    });
  }

  private toggleModal = () => {
    const currentlyVisible = this.state.modalFilterVisible;
    if (currentlyVisible) {
      // will be hidden
      this.filterGroup && this.filterGroup.searchWithFilters();
    }
    this.setState({ modalFilterVisible: !currentlyVisible });
  }

  private onSearch = () => {
    this.props.renderLoader(true);

    this.setState({
      runSearch: false,
      searchState: SearchStates.SEARCHING,
    });
  }

  private onResults = () => {
    this.props.renderLoader(false);

    if (!this.state.blockResults) {
      this.setState({
        searchState: SearchStates.RESULTS,
      });
    }
  }

  private onHintPress = (filter: SearchFilter) => {
    this.searchInput && this.searchInput.blur();

    filter.selected = true;

    this.setState({
      selectedFilters: [filter],
      stringFilter: "",
      runSearch: true,
      blockResults: false,
    });
  }

  private onFilterSearch = (filters: SearchFilter[]) => {
    this.props.onActiveChange && this.props.onActiveChange(true);
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

  private onTextChange = (barText: string) => {
    this.setState({ barText });
    if (barText.length === 0) {
      this.setState({
        searchState: SearchStates.SHOW_HINTS,
      });
    }
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
      this.setState({
        barText: "",
        stringFilter: "",
        searchState: SearchStates.SHOW_HINTS,
      });
      this.searchInput.focus();
    }
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
  searchBar: {
    paddingHorizontal: 6,
    paddingTop: 6,
    paddingBottom: 5,

    borderRadius: 2,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    shadowColor: "rgba(0, 0, 0, 0.1)",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowRadius: 8,
    shadowOpacity: 1,
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.5)",
    width: "90%",
    alignSelf: "center",
    marginTop: 16
  },
  searchBarText: {
    //opacity: 0.5,
    fontFamily: "Muli",
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 2,
    color: "#000",
    //color: "#676767"
  }
});
