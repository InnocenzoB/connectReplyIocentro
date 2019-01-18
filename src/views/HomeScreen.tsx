import { DeviceStore, I18n } from "iocentro-apps-common-bits";
import { ConfigStore, RecipeModel, Source } from "iocentro-collection-manager";
import { MandatoryGetValue } from "iocentro-datamodel";
import React, { Component } from "react";
import { Image, Keyboard, StyleSheet, View, ViewStyle } from "react-native";
import { NavigationScreenProps } from "react-navigation";

import { ThemedTextButton } from "../components/Buttons";
import { CategoryGroupsData } from "../components/Category";
import { CategoryData, CategoryList } from "../components/CategoryList";
import { CarouselData, CarouselDataGetStarted, CarouselDataRecipe } from "../components/home_screen/CarouselData";
import { RecipesCarousel } from "../components/home_screen/RecipesCarousel";
import { QUICK_CHOICE_BAR_HEIGHT } from "../components/QuickChoiceBottomBar";
import { RecipePage } from "../components/RecipePage";
import { SearchPhoneComponent } from "../components/SearchPhone";
import { RecipieGroupsAdder, SimpleAdder } from "../model/RecipieGroupsAdder";
import { AttributeFilter, Searcher } from "../model/Searcher";
import { Dims, IS_TABLET, PlatformSelect } from "../Platform";
import { RecipeScreenParams } from "./RecipeSummaryScreen";

const viewAllArrow = require("../../img/home_screen/viewAllArrow.png");

export interface HomeScreenData {
  carouselData: RecipeModel[];
  categoriesData: CategoryData[];
}

interface HomeScreenState {
  carouselData: CarouselData[];
  categoriesData: CategoryData[];
  isLoadingCarousel: boolean;
  isLoadingCategories: boolean;
  isSearching: boolean;
  searchIsActive: boolean;
}

export class HomeScreen extends Component<NavigationScreenProps<{}>, HomeScreenState> {
  constructor(props: NavigationScreenProps<{}>) {
    super(props);

    this.state = {
      carouselData: [],
      categoriesData: [],
      isLoadingCarousel: true,
      isLoadingCategories: true,
      isSearching: false,
      searchIsActive: false,
    };
  }

  public componentDidMount() {
    const doFetch = () => {
      this._carouselSearcher.search((source) => {
        source.pageSize.updateValue(100);
        source.fetch();
      });
      const filters = Searcher.getCategoryFilters();
      const categoryFilters = filters.data.filter((group) => {
        return !(group.name == "None" || group.name == "Generic");
      });
      this._randomRecipes(categoryFilters as AttributeFilter[]);
    };

    this._carouselSearcher = new Searcher(
      this._onCarouselDataUpdate,
      this._onIsLoadingCarouselUpdate,
    );
    this._categorySearcher = new Searcher(
      this._onCategoriesDataUpdate,
      this._onIsLoadingCategoriesUpdate,
    );
    doFetch();
  }

  private _randomRecipes(categoryFilters: AttributeFilter[]) {
    const filterID = Math.floor(Math.random() * (categoryFilters.length - 1));
    const f = categoryFilters[filterID];
    const _source = ConfigStore.getSource();
    _source.pageSize.updateValue(1);
    _source.filterByAttribute(f.value);
    const getAny = new Promise((resolve) => {
      const subs = _source.isLoading
        .skip(1)
        .subscribe(() => {
          if (_source.isLoading.sv() === false) {
            subs.unsubscribe();
            resolve();
          }
        });
      _source.fetch();
    });
    getAny.then(() => {
      if ((((MandatoryGetValue(_source.items) as RecipeModel[]).length) != 0)) {
        this._categorySearcher.search((source) => {
          source.pageSize.updateValue(13);
          source.filterByAttribute(f.value);
          source.fetch();
        });
      } else {
        const reducedFilters = categoryFilters.filter((filter) => {
          return filter.name != categoryFilters[filterID].name;
        });
        this._randomRecipes(reducedFilters);
      }

      _source.dispose();
    });
  }

  public componentWillUnmount() {
    this._carouselSearcher.dispose();
    this._categorySearcher.dispose();
  }

  public render() {
    const isLoading = this.state.isLoadingCarousel || this.state.isLoadingCategories;
    return (
      <RecipePage
        loading={isLoading}
        scrollProps={{
          showsHorizontalScrollIndicator: false,
          keyboardShouldPersistTaps: "always",
          onScrollBeginDrag: () => Keyboard.dismiss(),
          onScroll: IS_TABLET ? undefined : this.onRecipeResultsScroll,
        }}>
        {!IS_TABLET &&
          <SearchPhoneComponent
            ref={(instance) => { this._searchPhoneComponent = instance; }}
            onActiveChange={(value) => {
              this.setState({
                searchIsActive: value,
              });
            }}
            navigation={this.props.navigation}
            active={this.state.searchIsActive}
            initialFilter={false}
            renderLoader={(isSearching) => {
              this.setState({
                isSearching,
              });
            }}
            filterFavourites={false} />
        }
        {(this.state.searchIsActive || isLoading) ? null : this.renderRecipes()}
      </RecipePage>
    );
  }

  private _onViewAllPressed() {
    this.openCategory(null);
  }

  private openCategory = (category) => {
    this.props.navigation.navigate("ViewAll", { category });
  }

  private readonly onRecipeResultsScroll = (e) => {
    if (!e
      || this.state.isSearching
      || !this.state.searchIsActive
      || this._searchPhoneComponent == null) {
      return;
    }
    const ne = e.nativeEvent;
    const scrolledNearEnd = (ne.contentOffset.y + ne.layoutMeasurement.height) > (ne.contentSize.height - 20);
    if (scrolledNearEnd) {
      this._searchPhoneComponent.next();
    }
  }

  private _onCarouselDataUpdate = (_: RecipeModel[], source: Source) => {
    const randomRecipes = source.pickRandom(10);
    const data: CarouselData[] = randomRecipes.map((v) => {
      return new CarouselDataRecipe(v, this._onRecipePress);
    });

    this.injectGetStartedCard(data);
    this.setState({
      carouselData: data,
    });
  }

  private injectGetStartedCard = (data) => {
    if (DeviceStore.instance.getDevices().length == 0) {
      data.splice(1, 0,
        new CarouselDataGetStarted(() => { this.props.navigation.navigate("ApplianceWizard"); }));
    }
  }

  private _onRecipePress = (model: any) => {
    if (model instanceof RecipeModel) {
      const params: RecipeScreenParams = {
        recipe: model,
      };
      this.props.navigation.navigate("RecipeSummary", params);
    }
  }

  private _onCategoriesDataUpdate = (results: RecipeModel[], source: Source) => {
    this._recipiesGroups = this._groupsAdder.addGroups(
      results,
      0,
      source,
      this._recipiesGroups);
  }

  private _onIsLoadingCarouselUpdate = (isLoading: boolean) => {
    this.setState({
      isLoadingCarousel: isLoading,
    });
  }

  private _onIsLoadingCategoriesUpdate = (isLoading: boolean) => {
    if (isLoading) {
      return;
    }
    if (this._recipiesGroups.length) {
      const categories = this._recipiesGroups.slice();
      this._recipiesGroups = [];
      this.setState((prevState) => {
        const attributes = this._categorySearcher.getAttributeFilters();
        if (!(attributes && attributes.length)) {
          throw new Error("_categorySearcher does not filter by category attribute??");
        }
        const category = attributes[0];

        const categoryData: CategoryData = {
          category,
          data: categories,
        };

        return {
          isLoadingCategories: false,
          categoriesData: prevState.categoriesData.concat(categoryData),
        };
      });
    }
  }

  private renderRecipes = (): JSX.Element => {
    return (
      <View style={{ paddingBottom: IS_TABLET ? 0 : QUICK_CHOICE_BAR_HEIGHT }}>
        <RecipesCarousel
          style={styles.carouselContainer}
          data={this.state.carouselData}
          onPress={(model) => { this._onRecipePress(model); }}
        />
        <ViewAllArrow onPress={() => { this._onViewAllPressed(); }} />
        <CategoryList
          simple={false}
          categories={this.state.categoriesData}
          onPress={this._onRecipePress.bind(this)}
          onSeeMorePress={this.openCategory}
        />
      </View>
    );
  }

  private _carouselSearcher: Searcher;
  private _categorySearcher: Searcher;
  private _groupsAdder: RecipieGroupsAdder = new SimpleAdder(maxGroups);
  private _recipiesGroups: CategoryGroupsData[] = [];
  private _searchPhoneComponent: SearchPhoneComponent | null;
}

const maxGroups = 3;

const ViewAllArrow = (props: { onPress: () => void }) => {
  return (
    <View style={styles.viewAll}>
      <ThemedTextButton
        theme="white"
        onPress={props.onPress}
        style={styles.viewAllContainer}
        text={I18n.t("view_all").toUpperCase()}
      >
        <Image source={viewAllArrow} />
      </ThemedTextButton>
    </View>
  );
};

const styles = StyleSheet.create({
  carouselContainer: {
    marginTop: Dims.scaleV(34),
  },
  viewAll: {
    ...PlatformSelect<ViewStyle>({
      anyTablet: {
        position: "absolute",
        top: Dims.scaleV(31),
        right: 59,
      },
      anyPhone: {
        marginTop: 25,
        alignItems: "center",
      },
    }),
  },
  viewAllContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "transparent",
  },
});
