import { I18n } from "iocentro-apps-common-bits";
import { RecipeModel, Source } from "iocentro-collection-manager";
import React, { Component } from "react";
import { Keyboard, LayoutAnimation, ScrollView, StyleSheet, TextStyle, View } from "react-native";
import { NavigationScreenProps } from "react-navigation";
import { Subscription } from "rxjs";
import XDate from "xdate";

import { sameDate, sameMonth, TimePeriod } from "../calendar_utils";
import { TextButton } from "../components/Buttons";
import { Category, CategoryGroupsData } from "../components/Category";
import { Hr } from "../components/Hr";
import { Loading } from "../components/Loading";
import { DayList } from "../components/meal_planner/DayList";
import { MealPlannerLeftBar } from "../components/meal_planner/MealPlannerLeftBar";
import { MealPlannerQueue } from "../components/meal_planner/MealPlannerQueue";
import { Mode, ModeTabs } from "../components/meal_planner/ModeTabs";
import { RecipeTextCardList } from "../components/meal_planner/RecipeTextCardList";
import { NAV_BAR_PHONE_HEIGHT, NAV_BAR_TABLET_HEIGHT } from "../components/nav_bars/NavBarBase";
import { TitleNavBar } from "../components/nav_bars/TitleNavBar";
import { PaperView } from "../components/Paper";
import { PhoneOverlay } from "../components/PhoneOverlay";
import { PhoneSearchBar } from "../components/PhoneSearchBar";
import { QUICK_CHOICE_BAR_HEIGHT } from "../components/QuickChoiceBottomBar";
import { RecipePage } from "../components/RecipePage";
import { FiltersGroup } from "../components/saved_favorites/Filter";
import { TextScaledOnPhone } from "../components/ScaledText";
import { SearchBar } from "../components/SearchBar";
import { MealPlannerCollectionStore, MealPlannerItem } from "../model/MealPlannerRxTx";
import { CategoryAdder, RecipieGroupsAdder } from "../model/RecipieGroupsAdder";
import { AttributeFilter, Searcher, SearchFilter, SearchFilterGroup, TimeFilter } from "../model/Searcher";
import { Dims, IS_TABLET } from "../Platform";

const imported = {
  clearSearchBarIcon: require("../../img/icons/searchbarXIcon.png"),
  ingredientIcon: require("../../img/recipe_summary/ingredientIcon.png"),
};

interface MealPlannerState {
  selectedDate: XDate;
  selectedDateInDayList?: XDate;
  currentMode: Mode;

  // Recipes Search
  filterText: string;
  filtersData: SearchFilterGroup[];
  recipiesGroups: CategoryGroupsData[];
  recipiesConsumed: number;
  recipesLoading: boolean;

  dailyPlannedItems?: MealPlannerItem[];
  plannedItemsAmount?: Map<string, number>;

  // Phone
  dayDetailsVisible: boolean;
}

const TEXT_SEARCH_TIMEOUT_MS = 1000;

const today = XDate(true);

const ABOUT_A_YEAR = new TimePeriod(today.clone().addDays(-183), today.clone().addDays(183));

export class MealPlanner extends Component<NavigationScreenProps<{}>, MealPlannerState> {
  private _searcher: Searcher;
  private _groupsAdder: RecipieGroupsAdder;
  private _searchTimer: number;
  private _modelSubscription: Subscription;

  constructor(props) {
    super(props);

    this._groupsAdder = new CategoryAdder();

    this.state = {
      selectedDate: XDate(true),
      selectedDateInDayList: XDate(true),
      currentMode: Mode.WEEK,

      filterText: "",
      filtersData: [],
      recipiesGroups: [],
      recipiesConsumed: 0,
      recipesLoading: true,
      dailyPlannedItems: undefined,
      plannedItemsAmount: undefined,

      dayDetailsVisible: false,
    };
  }

  private fetchItemsForSelectedDate = (date?: XDate) => {
    MealPlannerCollectionStore.instance.fetchItemsForDay(
      date || this.state.selectedDate,
      (dailyPlannedItems, requestedDate) => {
        if (sameDate(requestedDate, this.state.selectedDate)) {
          this.setState({ dailyPlannedItems });
        }
      });
  }

  private updatePlannedItems = (date?: XDate) => {
    const mpCollection = MealPlannerCollectionStore.instance;

    const plannedItemsAmount = IS_TABLET ?
      mpCollection.getMonthlyPlannedItemsAmount(date || this.state.selectedDate)
      :
      mpCollection.getPlannedItemsAmount(ABOUT_A_YEAR);
    this.setState({ plannedItemsAmount });
  }

  private getAllRecipies() {
    this._searcher.search((source) => {
      source.fetch();
    });
  }

  private clearResults() {
    this.setState({
      recipiesGroups: [],
      recipiesConsumed: 0,
    });
  }

  private clearFiltersPressed = () => {
    this.clearResults();
    this.setState({
      recipiesGroups: [],
      recipiesConsumed: 0,
      filtersData: Searcher.getAllFilters(),
    });
    this.getAllRecipies();
  }

  public componentWillMount() {
    this._searcher = new Searcher(this.onResultsUpdate, this.onIsLoadingChange, IS_TABLET ? 8 : 4);
    const filtersData = Searcher.getAllFilters();
    this.setState({ filtersData });
    this.getAllRecipies();

    MealPlannerCollectionStore.instance.notifySourceReady((mpCollection) => {
      this.updatePlannedItems();
      this.fetchItemsForSelectedDate();
      this._modelSubscription = mpCollection.modelChanged.subscribe(() => {
        this.updatePlannedItems();
        this.fetchItemsForSelectedDate();
      });
    });
  }

  public componentWillUnmount() {
    this._searcher.dispose();
    if (this._modelSubscription) {
      this._modelSubscription.unsubscribe();
    }
  }

  public render() {
    const topNavigator = IS_TABLET ? null : (
      <TitleNavBar
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          position: "absolute",
          top: 0,
          width: "100%",
          zIndex: 1,
        }}
        title1={I18n.t("meal")}
        title2={I18n.t("plan")}
        noIcons
      />
    );
    return (
      <View>
        <RecipePage
          scroll={!IS_TABLET}
          scrollProps={{
            style: { flex: 1, backgroundColor: "transparent" },
            onScroll: this.onRecipeResultsScroll,
            onScrollBeginDrag: () => Keyboard.dismiss(),
          }}>
          <View style={{
            flex: 1,
            flexDirection: "column",
            alignItems: "stretch",
          }}>
            {this._renderHeader()}
            {this._renderContent()}
          </View>
        </RecipePage>
        {!IS_TABLET && this._renderDayDetails(topNavigator)}
        {topNavigator}
      </View>
    );
  }

  private _renderHeader() {
    return (
      IS_TABLET ?
        <ModeTabs
          style={{ marginTop: 25 + NAV_BAR_TABLET_HEIGHT, marginLeft: 50, marginBottom: 9 }}
          currentMode={this.state.currentMode}
          textStyle={{ opacity: 0.49 }}
          currentTextStyle={{ opacity: 1 }}
          onModeChange={(currentMode) => this.setState({ currentMode })}
        />
        :
        <View style={{ alignItems: "center", marginVertical: 20 }}>
          <PhoneSearchBar
            placeholder={I18n.t("search_saved_favourites")}
            onChangeText={this.searchByText}
            onClear={() => this.setState({ filterText: "" })}
            filtersData={this.state.filtersData}
            onFilterSearch={this.onFiltersChanged}
            onClearFilters={this.clearFiltersPressed}
          />
        </View>
    );
  }

  private _renderContent = () => {
    return (
      <PaperView
        outerStyle={{
          marginLeft: 10,
          flex: 1,
          marginBottom: IS_TABLET ? undefined : QUICK_CHOICE_BAR_HEIGHT + 10,
        }}
        innerStyle={{
          marginRight: -4, paddingRight: +4, /*radius workaround*/
        }}
      >
        {IS_TABLET ?
          this._renderTabletContent()
          :
          this._renderPhoneContent()
        }
      </PaperView>
    );
  }

  private onRecipeResultsScroll = (e) => {
    if (!e || this.state.recipesLoading) { return; }
    const ne = e.nativeEvent;
    const scrolledNearEnd = (ne.contentOffset.y + ne.layoutMeasurement.height) > (ne.contentSize.height - 20);
    if (scrolledNearEnd) {
      this._searcher.next();
    }
  }

  private _renderPhoneContent() {
    const {
      selectedDateInDayList,
      plannedItemsAmount,
    } = this.state;

    return (
      <View style={{ flex: 1, paddingVertical: 12, paddingLeft: 12 }}>
        <DayList
          style={{ paddingBottom: 19 }}
          contentContainerStyle={{ paddingRight: 12 }}
          dayToItemsAmountMap={plannedItemsAmount}
          period={ABOUT_A_YEAR}
          initialDate={today}
          highlightedDate={selectedDateInDayList}
          horizontal
          onDayPress={this.onDayListDayPress}
          onDayLongPress={this.onDayListDayLongPress}
        />
        <View style={{ marginRight: 16 }}>
          <Hr style={{ marginBottom: 15 }} />
          <Category
            recipesIcon={{
              source: imported.ingredientIcon,
              onPress: this.tryAddRecipeToPlan,
            }}
            data={this.state.recipiesGroups}
            onPress={this.openRecipe}
            cardSize={{
              width: Dims.scaleH(161, 52),
              height: Dims.scaleV(193),
            }}
          />
          <Loading
            style={{
              position: "relative",
              marginVertical: 50,
              backgroundColor: "transparent",
            }}
            visible={this.state.recipesLoading}
          />
        </View>
      </View>
    );
  }

  private _renderDayDetails(topElement) {
    const { selectedDate, dailyPlannedItems } = this.state;

    const itemsForSelectedDay = (dailyPlannedItems || []).slice();
    const recipeList = dailyPlannedItems && dailyPlannedItems.map((item) => item.fetchedRecipe);
    return (
      <PhoneOverlay
        isVisible={this.state.dayDetailsVisible}
        onHideRequest={this.hideDayDetalis}
      >
        {topElement}
        <View style={styles.phoneOverlayView}>
          <QueueTitle date={selectedDate} />
          <Hr style={{ marginTop: 4, marginBottom: 19 }} />
          <RecipeTextCardList
            style={{ padding: 15, margin: -15 }} // shadows workaround
            contentContainerStyle={{ paddingBottom: 25 }}
            cardStyle={{
              style: styles.recipeTextCard,
              removeIconContainerStyle: styles.recipeTextCardRemoveIcon,
            }}
            cardSpacing={10}
            data={recipeList}
            onRecipeRemove={(_recipe, index) => this.removeItem(itemsForSelectedDay[index])}
            onRecipePress={(recipe) => {
              this.hideDayDetalis(() => this.openRecipe(recipe));
            }}
          />
        </View>
      </PhoneOverlay>
    );
  }

  private readonly removeItem = (item: MealPlannerItem) => {
    MealPlannerCollectionStore.instance.remove(item);
  }

  private _renderTabletContent() {
    const { selectedDate, dailyPlannedItems, plannedItemsAmount, selectedDateInDayList } = this.state;

    const itemsForSelectedDay = (dailyPlannedItems || []).slice();
    // eight seems to be reasonable max amount for meals per day ;)
    if (itemsForSelectedDay.length < 8) { itemsForSelectedDay.length = 8; }

    const recipeList = dailyPlannedItems && dailyPlannedItems.map((item) => item.fetchedRecipe);

    return (
      <View style={{ flex: 1, flexDirection: "row" }}>
        <MealPlannerLeftBar
          dayToItemsAmountMap={plannedItemsAmount}
          mode={this.state.currentMode}
          onCalendarDayPress={this.updateSelectedDate}
          onCalendarArrowPress={this.onCalendarArrowPress}
          recipeList={recipeList}
          onRecipeXIconPressed={(_recipe, index) => this.removeItem(itemsForSelectedDay[index])}
          onRecipePress={this.openRecipe}
          selectedDate={selectedDate}
          highlightedDay={selectedDateInDayList}
          onDaylistDayPress={this.onDayListDayPress}
          style={[styles.leftBar, styles.topLeftRadius]}
        />
        <View style={styles.rightView}>
          <QueueTitle date={selectedDate} />
          <Hr style={{ marginTop: 7, marginBottom: 9 }} />
          <MealPlannerQueue
            loading={!dailyPlannedItems}
            data={itemsForSelectedDay}
            onItemPress={this.openItem}
            onItemXIconPress={this.removeItem}
          />
          <View style={{ flex: 1, paddingRight: 17, paddingTop: 18 }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <TextButton
                textStyle={styles.clearFiltersText}
                text={I18n.t("clear_filters")}
                onPress={this.clearFiltersPressed}
              />
              <SearchBar
                placeholder={I18n.t("search_saved_favourites")}
                barStyle={styles.searchBar}
                style={styles.searchBarText}
                placeholderTextColor={StyleSheet.flatten<TextStyle>(styles.searchBarText).color}
                clearIcon={imported.clearSearchBarIcon}
                touchableExpandSize={10}
                onChangeText={this.searchByText}
                onClear={() => this.setState({ filterText: "" })}
              />
            </View>
            <Hr style={{ marginTop: 9, marginBottom: 17 }} />
            <ScrollView onScroll={this.onRecipeResultsScroll}>
              <FiltersGroup
                data={this.state.filtersData}
                onFilterSearch={this.onFiltersChanged}
                theme="dark"
              />
              <Category
                recipesIcon={{
                  source: this.isAddingPossible() ? imported.ingredientIcon : undefined,
                  onPress: this.isAddingPossible() ? this.tryAddRecipeToPlan : undefined,
                }}
                data={this.state.recipiesGroups}
                onPress={this.openRecipe}
                cardSize={{ width: 162, height: 200 }}
              />
              <Loading
                style={{
                  position: "relative",
                  marginVertical: 50,
                  backgroundColor: "transparent",
                }}
                visible={this.state.recipesLoading}
              />
            </ScrollView>
          </View>
        </View>
      </View>
    );
  }

  private openItem = (item: MealPlannerItem) => {
    if (item.fetchedRecipe) {
      this.openRecipe(item.fetchedRecipe);
    }
  }

  private openRecipe = (recipe: RecipeModel) => {
    this.props.navigation.navigate("RecipeSummary", { recipe });
  }

  private isAddingPossible = (): boolean => {
    return this.state.currentMode == Mode.TODAY || this.state.selectedDateInDayList != undefined;
  }

  private tryAddRecipeToPlan = (recipe: RecipeModel) => {
    if (!this.isAddingPossible()) {
      return;
    }
    const dateOfAddition = this.state.selectedDateInDayList || this.state.selectedDate;

    MealPlannerCollectionStore.instance.addNewItem(dateOfAddition, recipe);
  }

  private clearSelectedWeekDay = () => {
    this.setState({ selectedDateInDayList: undefined });
  }

  private onDayListDayPress = (day: XDate) => {
    if (sameDate(day, this.state.selectedDateInDayList)) {
      if (IS_TABLET) {
        this.clearSelectedWeekDay();
      } else {
        this.updateSelectedDate(day, this.showDayDetalis);
      }
    } else {
      this.updateSelectedDate(day);
    }
  }

  private showDayDetalis = () => {
    this.setState({ dayDetailsVisible: true });
  }

  private hideDayDetalis = (callback?: () => void) => {
    this.setState({ dayDetailsVisible: false }, callback);
  }

  private onDayListDayLongPress = (day: XDate) => {
    if (IS_TABLET) {
      this.onDayListDayPress(day);
    } else {
      this.updateSelectedDate(day, this.showDayDetalis);
    }
  }

  private updateSelectedDate = (day: XDate, callback?: () => void) => {
    this.setState((prevState) => {
      const stateToSet: Partial<MealPlannerState> = { selectedDate: day, selectedDateInDayList: day };
      if (!sameDate(prevState.selectedDate, day)) {
        stateToSet.dailyPlannedItems = undefined;
        setTimeout(() => this.fetchItemsForSelectedDate(day));
      }
      if (IS_TABLET && !sameMonth(prevState.selectedDate, day)) {
        stateToSet.plannedItemsAmount = undefined;
        setTimeout(() => this.updatePlannedItems(day));
      }
      LayoutAnimation.configureNext(LayoutAnimation.Presets.linear);
      return stateToSet as any;
    }, callback);
  }

  private onCalendarArrowPress = (direction: "next" | "prev") => {
    const newDate = this.state.selectedDate.clone();
    if (this.state.currentMode == Mode.TODAY) {
      newDate.addWeeks(direction == "next" ? +1 : -1);
    } else {
      newDate.addMonths(direction == "next" ? +1 : -1);
    }
    this.updateSelectedDate(newDate);
  }

  private onFiltersChanged = (filters: SearchFilter[]) => {
    this._searcher.search((source) => {
      filters.forEach((f) => {
        if (f instanceof AttributeFilter) {
          source.filterByAttribute(f.value);
        } else if (f instanceof TimeFilter) {
          source.filterByTotalTime(f.value);
        }
      });
      if (this.state.filterText !== "") {
        source.filterByText(this.state.filterText.trim());
      }
      source.fetch();
    });

    this.clearResults();
  }

  private searchByText = (text: string) => {
    clearTimeout(this._searchTimer);
    this._searchTimer = setTimeout(() => {
      this.setState({
        filterText: text.trim(),
      });
      this._searcher.search((source) => {
        this.state.filtersData.forEach((filter) => {
          filter.data.forEach((f) => {
            if (f.selected) {
              if (f instanceof AttributeFilter) {
                source.filterByAttribute(f.value);
              } else if (f instanceof TimeFilter) {
                source.filterByTotalTime(f.value);
              }
            }
          });
        });
        if (text !== "") {
          source.filterByText(text.trim());
        }
        source.fetch();
      });
      this.clearResults();
    }, TEXT_SEARCH_TIMEOUT_MS);
  }

  private onResultsUpdate = (results: RecipeModel[], source: Source) => {
    const recipiesGroups = this._groupsAdder.addGroups(
      results,
      this.state.recipiesConsumed,
      source,
      this.state.recipiesGroups.slice(),
    );
    const recipiesConsumed = results.length;

    this.setState({
      recipiesGroups,
      recipiesConsumed,
    });
  }

  private onIsLoadingChange = (isLoading: boolean) => {
    this.setState({ recipesLoading: isLoading });
  }
}

const QueueTitle = ({ date }) => (
  <View style={{ flexDirection: "row" }}>
    <TextScaledOnPhone style={styles.queueDateText}>
      {date.toString("dddd, MMMM d ")}
    </TextScaledOnPhone>
    <TextScaledOnPhone style={styles.queueText}>{I18n.t("queue").toUpperCase()}</TextScaledOnPhone>
  </View>
);

const styles = StyleSheet.create({
  topLeftRadius: {
    borderTopLeftRadius: 4,
  },
  leftBar: {
    paddingTop: 17,
    width: 275,
    overflow: "hidden",
    backgroundColor: "#ffffff",
    shadowColor: "rgba(0, 0, 0, 0.2)",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowRadius: 4,
    shadowOpacity: 1,
  },
  rightView: {
    flex: 1,
    paddingLeft: 30,
    paddingTop: 17,
  },
  queueDateText: {
    fontFamily: "Merriweather",
    fontSize: 14,
    fontWeight: "300",
    fontStyle: "italic",
    letterSpacing: 2,
    color: "#000000",
  },
  queueText: {
    fontFamily: "Muli",
    fontSize: 14,
    fontWeight: "bold",
    fontStyle: "normal",
    letterSpacing: 1.5,
  },
  clearFiltersText: {
    opacity: 0.5,
    fontFamily: "Muli",
    fontSize: 11,
    fontWeight: "900",
    fontStyle: "normal",
    letterSpacing: 2,
    color: "#676767",
  },
  searchBar: {
    justifyContent: "center",
    paddingHorizontal: 14,
    width: 274,
    height: 35,
    borderRadius: 2,
    backgroundColor: "#ffffff",
    shadowColor: "rgba(0, 0, 0, 0.1)",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowRadius: 10,
    shadowOpacity: 1,
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#b3b3b3",
  },
  searchBarText: {
    opacity: 0.5,
    fontFamily: "Muli",
    fontSize: 11,
    fontWeight: "900",
    fontStyle: "normal",
    letterSpacing: 2,
    color: "#676767",
  },
  recipeTextCard: {
    paddingVertical: 9,
    paddingLeft: 13,
    paddingRight: 26,
  },
  recipeTextCardRemoveIcon: {
    position: "absolute",
    top: 9, right: 9,
  },
  phoneOverlayView: {
    marginTop: NAV_BAR_PHONE_HEIGHT,
    paddingLeft: 23,
    paddingRight: 18,
    paddingBottom: 0,
    paddingTop: 25,
    maxHeight: Dims.scaleV(500),

    backgroundColor: "#fafafa",
    shadowColor: "rgba(0, 0, 0, 0.5)",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowRadius: 4,
    shadowOpacity: 1,
  },
});
