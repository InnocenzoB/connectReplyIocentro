import { I18n } from "iocentro-apps-common-bits";
import { RecipeModel } from "iocentro-collection-manager";
import React, { Component } from "react";
import {
  FlatList,
  Image,
  ImageStyle,
  ImageURISource,
  Keyboard,
  LayoutAnimation,
  ScrollView,
  ScrollViewStyle,
  Share,
  StatusBar,
  StyleProp,
  StyleSheet,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { NavigationScreenProps } from "react-navigation";
import { Subscription } from "rxjs";

import { IconButton } from "../components/Buttons";
import { CollapsableComponent } from "../components/dashboard/Settings";
import { Hr } from "../components/Hr";
import { Loading } from "../components/Loading";
import { RecipeTextCardList } from "../components/meal_planner/RecipeTextCardList";
import { NAV_BAR_PHONE_HEIGHT, NAV_BAR_TABLET_HEIGHT, NavBarBase } from "../components/nav_bars/NavBarBase";
import { Titles } from "../components/nav_bars/TitleNavBar";
import { PaperView } from "../components/Paper";
import { PhoneSearchBar } from "../components/PhoneSearchBar";
import { QUICK_CHOICE_BAR_HEIGHT } from "../components/QuickChoiceBottomBar";
import { RecipeCard } from "../components/RecipeCard";
import { RecipePage } from "../components/RecipePage";
import { TextScaledOnPhone } from "../components/ScaledText";
import { SearchBar } from "../components/SearchBar";
import { HorizontalSpacer } from "../components/steps_screen/Overview";
import { TouchableScale } from "../components/TouchableScale";
import { ShoppingListCollectionStore } from "../model/shopping_list/ShoppingListCollectionStore";
import { ShoppingListItem } from "../model/shopping_list/ShoppingListItemRxTx";
import { IS_TABLET } from "../Platform";

const imported = {
  clearSearchBarIcon: require("../../img/icons/searchbarXIcon.png"),
  shareIcon: require("../../img/icons/shareIcon.png"),
  shareIconWhite: require("../../img/icons/shareIconWhite.png"),
  expandableArrowIcon: require("../../img/icons/expandableArrowIcon.png"),
  collapseArrowIcon: require("../../img/icons/collapseArrowIcon.png"),
  ingredientXIcon: require("../../img/icons/ingredientXIcon.png"),
  ingredientXIconRed: require("../../img/icons/ingredientXIconRed.png"),
  ingredientXIconWhite: require("../../img/icons/ingredientXIconWhite.png"),
};

interface ShoppingListState {
  data?: ShoppingListItem[];
  highlightedRecipe?: RecipeModel;
  recipesFromShoppingList?: RecipeModel[];
}

export class ShoppingListScreen extends Component<NavigationScreenProps<{}>, ShoppingListState> {
  private _modelSubscription: Subscription;
  private _recipesSubscription: Subscription;

  constructor(props: NavigationScreenProps<{}>) {
    super(props);

    this.state = {
      data: [],
      highlightedRecipe: undefined,
      recipesFromShoppingList: undefined,
    };
  }

  public componentDidMount() {
    ShoppingListCollectionStore.instance.notifySourceReady((slCollection) => {
      this.updateShoppingListData();
      const recipes = slCollection.getFetchedRecipes();
      if (recipes) {
        this.updateShoppingListRecipes(recipes);
      }
      this._modelSubscription = slCollection.modelChanged.subscribe(this.updateShoppingListData);
      this._recipesSubscription = slCollection.recipes.subscribe(this.updateShoppingListRecipes);
    });
  }

  public componentWillUnmount() {
    this._modelSubscription.unsubscribe();
    this._recipesSubscription.unsubscribe();
  }

  private updateShoppingListRecipes = (recipesFromShoppingList: RecipeModel[]) => {
    const { highlightedRecipe } = this.state;
    if (highlightedRecipe) {
      if (!recipesFromShoppingList.some((recipe) => recipe.id.sv() == highlightedRecipe.id.sv())) {
        // highlightedRecipe no longer exits in shopping list - unhighlight it
        setImmediate(this.unHighlightRecipe); // setImmediate bc there was rendering issues
      }
    }
    this.setState({ recipesFromShoppingList });
  }

  private updateShoppingListData = () => {
    const slCollection = ShoppingListCollectionStore.instance;
    this.setState({ data: slCollection.getAllItems() });
  }

  public render() {
    return (
      <View>
        <RecipePage
          loading={!this.state.data}
          scroll={false}
          scrollProps={{
            style: { flex: 1, backgroundColor: "transparent" },
            showsHorizontalScrollIndicator: false,
          }}>
          <StatusBar hidden={!IS_TABLET} barStyle="light-content" translucent={true} backgroundColor="#00000000" />
          {this._renderHeader()}
          {this.state.data && this._renderContent()}
        </RecipePage>
        {!IS_TABLET &&
          <NavBarBase
            style={{
              backgroundColor: "rgba(0, 0, 0, 0.8)",
              position: "absolute",
              top: 0,
              width: "100%",
            }}
            middleElement={<Titles title1={I18n.t("shopping")} title2={I18n.t("list")} />}
            rightElement={this.renderShareIcon("white")}
          />
        }
      </View>
    );
  }

  private _renderHeader = () => (
    IS_TABLET ?
      <View style={{ marginTop: 48 + NAV_BAR_TABLET_HEIGHT }} />
      :
      <View style={{ alignItems: "center", marginBottom: 20, marginTop: NAV_BAR_PHONE_HEIGHT + 16 }}>
        <PhoneSearchBar
          placeholder={I18n.t("add_to_list")}
          clearOnSubmit
          onSubmitEditing={this.onAddItemToListSubmit}
        />
      </View>
  )

  private _renderContent() {
    return (
      <PaperView
        outerStyle={{
          marginLeft: 10,
          borderBottomRightRadius: 0,
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

  private _renderPhoneContent = () => (
    <View style={{ flex: 1 }}>
      {this.state.recipesFromShoppingList ?
        <FlatList
          style={{ padding: 12, maxHeight: 164 }}
          showsHorizontalScrollIndicator={false}
          horizontal={true}
          data={this.state.recipesFromShoppingList}
          keyExtractor={(recipe, index) => (recipe && recipe.id.sv()) + index.toString()}
          contentContainerStyle={{ paddingRight: 22 }}
          ItemSeparatorComponent={() => (<HorizontalSpacer width={12} />)}
          renderItem={({ item }) => {
            let opacity = 1;
            if (this.state.highlightedRecipe && this.state.highlightedRecipe.id.sv() != item.id.sv()) {
              opacity = 0.61;
            }
            return (
              <RecipeCard
                model={item}
                style={{ width: 140, height: 140, opacity }}
                icon={{
                  source: imported.ingredientXIcon,
                  onPress: this.onRecipeXIconPressed,
                }}
                hideInfo={true}
                onPress={this.highlightRecipe}
                onLongPress={this.openRecipe}
              />
            );
          }}
        />
        :
        <Loading visible style={{ backgroundColor: "transparent" }} />
      }
      <View style={styles.phoneIngredientContainer}>
        <IngredientList
          style={{ paddingTop: 10 }}
          contentContainerStyle={{
            paddingBottom: QUICK_CHOICE_BAR_HEIGHT,
            paddingRight: 11,
          }}
          data={this.state.data || []}
          highlightedRecipe={this.state.highlightedRecipe}
        />
        <LinearGradient
          style={{ position: "absolute", top: 11, height: 10, width: "100%" }}
          colors={["white", "rgba(255,255,255,0.8)", "rgba(255,255,255,0.5)"]}
        />
      </View>
    </View>
  )

  private _renderTabletContent = () => (
    <View style={{ flex: 1, flexDirection: "row" }}>
      <View style={{ width: 302, marginHorizontal: 19, marginVertical: 13 }}>
        <TextScaledOnPhone style={styles.recipesText}>{I18n.t("recipes").toUpperCase()}</TextScaledOnPhone>
        <RecipeTextCardList
          data={this.state.recipesFromShoppingList}
          cardSpacing={10}
          style={{ marginTop: 15 }}
          cardStyle={{
            style: {
              paddingLeft: 41,
              paddingRight: 61,
              paddingVertical: 9,
            },
            removeIconContainerStyle: {
              position: "absolute",
              top: 8, left: 9,
              display: (this.state.highlightedRecipe != undefined ? "none" : undefined),
            },
            textContainerStyle: {
              opacity: 0.5,
            },
            recipeTitle: {
              fontSize: 11,
            },
          }}
          highlightedCardStyle={{
            style: {
              backgroundColor: "#be1b00",
            },
            removeIconContainerStyle: {
              display: undefined,
            },
            textContainerStyle: {
              opacity: 1,
            },
            text: {
              color: "white",
            },
          }}
          isCardHighlighted={(recipe) => {
            if (this.state.highlightedRecipe) {
              return recipe.id.sv() == this.state.highlightedRecipe.id.sv();
            }
            return false;
          }}
          highlightedCardRemoveIcon={imported.ingredientXIconWhite}
          onRecipeRemove={this.onRecipeXIconPressed}
          onRecipePress={this.highlightRecipe}
          onRecipeLongPress={this.openRecipe}
        />
      </View>
      <View style={styles.rightView}>
        <View style={{ flexDirection: "row", alignSelf: "flex-end" }}>
          {this.renderShareIcon("red")}
          <SearchBar
            placeholder={I18n.t("add_to_list")}
            barStyle={styles.searchBar}
            style={styles.searchBarText}
            placeholderTextColor={StyleSheet.flatten<TextStyle>(styles.searchBarText).color}
            clearIcon={imported.clearSearchBarIcon}
            touchableExpandSize={10}
            clearOnSubmit
            onSubmitEditing={this.onAddItemToListSubmit}
          />
        </View>
        <Hr style={{ marginTop: 16 }} />
        <IngredientList
          style={{
            paddingTop: 17,
            marginLeft: 10,
            marginRight: 30,
          }}
          data={this.state.data || []}
          highlightedRecipe={this.state.highlightedRecipe}
        />
      </View>
    </View>
  )

  private onAddItemToListSubmit = ({ nativeEvent: { text } }) => {
    if (text) {
      ShoppingListCollectionStore.instance.addUserItem(text);
    }
  }

  private openRecipe = (recipe: RecipeModel) => {
    this.props.navigation.navigate("RecipeSummary", { recipe });
  }

  private highlightRecipe = (recipe: RecipeModel) => {
    if (this.state.highlightedRecipe) {
      if (recipe.id.sv() == this.state.highlightedRecipe.id.sv()) {
        this.setState({ highlightedRecipe: undefined });
        return;
      }
    }
    this.setState({ highlightedRecipe: recipe });
  }
  private unHighlightRecipe = () => this.setState({ highlightedRecipe: undefined });
  private onRecipeXIconPressed = (recipe: RecipeModel) => {
    ShoppingListCollectionStore.instance.removeAllFromRecipe(recipe);
  }
  private getSerializedShoppingList() {
    return (this.state.data || []).reduce((previousVal, element) => {
      const itemName = ShoppingListCollectionStore.ItemName(element);
      const summedQuantity = ShoppingListCollectionStore.SummedUpQuantityText([element]);
      return `${previousVal}\n - ${itemName}${summedQuantity ? ", " + summedQuantity : ""}`;
    }, "");
  }

  private renderShareIcon = (theme: ShareIconTheme) => (
    <ShareIcon
      title={`${I18n.t("shopping_list_for")} ${new Date().toLocaleDateString()}`}
      message={this.getSerializedShoppingList()}
      style={{ marginRight: 21 }}
      theme={theme}
    />
  )
}

type ShareIconTheme = "white" | "red";

interface ShareIconProps {
  title?: string;
  message: string;
  style?: StyleProp<ImageStyle>;
  theme?: ShareIconTheme;
}

const ShareIcon = ({ title, message, style, theme }: ShareIconProps) => (
  <IconButton
    onPress={() => {
      Share.share({
        message: title + "\n" + message,
        title,
      }, {
          // Android only:
          dialogTitle: I18n.t("share_shopping_list"),
        });
    }}
    icon={theme == "red" ? imported.shareIcon : imported.shareIconWhite}
    iconStyle={style}
  />
);

interface IngredientListProps {
  data: ShoppingListItem[];
  style?: StyleProp<ScrollViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  highlightedRecipe?: RecipeModel;
}

const IngredientList = ({ data, style, contentContainerStyle, highlightedRecipe }: IngredientListProps) => {
  const mergedIngredients = new Map<string, ShoppingListItem[]>();
  data.forEach((i) => {
    const ingredientName = ShoppingListCollectionStore.ItemName(i);
    const sameIngredients = (mergedIngredients.get(ingredientName) || []);
    sameIngredients.push(i);
    mergedIngredients.set(ingredientName, sameIngredients);
  });
  const mergedIngredientsArray = Array.from(mergedIngredients.values());
  let mergedIngredientsArrayFirstHalf: ShoppingListItem[][] = [];
  if (IS_TABLET) {
    const firstHalfLength = Math.ceil(mergedIngredientsArray.length / 2);
    mergedIngredientsArrayFirstHalf = mergedIngredientsArray.splice(0, firstHalfLength);
  }

  return (
    <ScrollView
      style={style}
      contentContainerStyle={contentContainerStyle}
      showsVerticalScrollIndicator={false}
      onScrollBeginDrag={() => Keyboard.dismiss()}
    >
      <ScrollView horizontal alwaysBounceHorizontal={false}>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <View>
            {mergedIngredientsArrayFirstHalf.map((ingredients, index) => (
              <Ingredients
                initialyCollapsed
                key={index.toString()}
                data={ingredients}
                highlightedRecipe={highlightedRecipe}
              />
            ))
            }
          </View>
          <HorizontalSpacer width={20} />
          <View>
            {mergedIngredientsArray.map((ingredients, index) => (
              <Ingredients
                initialyCollapsed
                key={index.toString()}
                data={ingredients}
                highlightedRecipe={highlightedRecipe}
              />
            ))
            }
          </View>
        </View>
      </ScrollView>
    </ScrollView>
  );
};

interface IngredientsProps {
  data: ShoppingListItem[];
  highlightedRecipe?: RecipeModel;
}

class Ingredients extends CollapsableComponent<IngredientsProps> {
  public componentWillUpdate() {
    // animate transition
    LayoutAnimation.configureNext(LayoutAnimation.Presets.linear);
  }

  public componentWillReceiveProps(nextProps) {
    if (nextProps.highlightedRecipe &&
      this.hasIngredientFromRecipe(nextProps.highlightedRecipe) &&
      this.state.collapsed) {
      this.setState({ collapsed: false }); // uncollapse after highlighting recipe
    }
  }

  private hasIngredientFromRecipe(recipe: RecipeModel): boolean {
    return this.props.data.some((i) => {
      if (i.recipeId == undefined) { return false; }
      return i.recipeId.sv() == recipe.id.sv();
    });
  }

  public render() {
    const list = this.props.data;
    if (!(list && list.length)) { return null; }
    const moreThanOne = list.length > 1;

    let icon = imported.ingredientXIconRed;
    if (moreThanOne) {
      icon = this.state.collapsed ? imported.expandableArrowIcon : imported.collapseArrowIcon;
    }

    let topBlurred = false;
    if (this.props.highlightedRecipe && !this.hasIngredientFromRecipe(this.props.highlightedRecipe)) {
      topBlurred = true;
    }

    return (
      <View>
        <IngredientListEntry
          icon={icon}
          style={{ marginBottom: 15 }}
          boldedText={ShoppingListCollectionStore.ItemName(list[0])}
          text={ShoppingListCollectionStore.SummedUpQuantityText(list)}
          onPress={() => {
            if (moreThanOne) {
              this._toggleCollapsed();
            } else {
              this.removeIngredient(list[0]);
            }
          }}
          blurred={topBlurred}
        />
        <View style={{ marginLeft: 28 }}>
          {moreThanOne && !this.state.collapsed &&
            list.map((i, index) => {
              let itemBlurred = topBlurred;
              if (!itemBlurred && this.props.highlightedRecipe) {
                const recipeIdVal = i.recipeIdVal;
                if (recipeIdVal) {
                  // items with recipe are blurred only if they are from different recipe than highlighted one
                  itemBlurred = this.props.highlightedRecipe.id.sv() != recipeIdVal;
                } else {
                  // items without recipe are blurred after highlighting
                  itemBlurred = true;
                }
              }
              return (
                <IngredientListEntry
                  key={index.toString()}
                  icon={imported.ingredientXIconRed}
                  style={{ marginBottom: 15 }}
                  boldedText={ShoppingListCollectionStore.ItemName(i)}
                  text={ShoppingListCollectionStore.SummedUpQuantityText([i])}
                  bottomText={ShoppingListCollectionStore.RecipeName(i).toUpperCase()}
                  onPress={() => this.removeIngredient(i)}
                  blurred={itemBlurred}
                />
              );
            })
          }
        </View>
      </View>
    );
  }

  private removeIngredient(item: ShoppingListItem) {
    ShoppingListCollectionStore.instance.remove(item);
  }
}

interface IngredientListEntryProps {
  onPress?: () => void;
  icon: ImageURISource;
  boldedText: string;
  text?: string;
  bottomText?: string;
  blurred?: boolean;
  style?: StyleProp<ViewStyle>;
}

const IngredientListEntry = (props: IngredientListEntryProps) => (
  <TouchableScale
    style={[{ alignSelf: "baseline" }, props.style]}
    onPress={props.onPress}
    disabled={props.blurred}
  >
    <View style={{ flexDirection: "row" }}>
      <View style={{ alignItems: "center", width: 15, marginRight: 13, marginTop: 5 }}>
        <Image source={props.icon} />
      </View>
      <View>
        <TextScaledOnPhone style={styles.ingredientText}>
          {props.boldedText + (props.text ? ", " : "")}
          <TextScaledOnPhone style={{ fontWeight: "normal" }}>
            {props.text}
          </TextScaledOnPhone>
        </TextScaledOnPhone>
        <TextScaledOnPhone style={styles.recipeNameSmallText}>
          {props.bottomText}
        </TextScaledOnPhone>
      </View>
    </View>
    {props.blurred && // (db): blur looks bad so I am using semi-opaque white covering view
      <View
        style={[{
          backgroundColor: "rgba(255,255,255,0.7)",
        }, StyleSheet.absoluteFillObject]}
      />
    }
  </TouchableScale>
);

const styles = StyleSheet.create({
  rightView: {
    flex: 1,
    paddingRight: 33,
    paddingLeft: 62,
    paddingVertical: 24,

    borderRadius: 2,
    backgroundColor: "#ffffff",
    shadowColor: "rgba(0, 0, 0, 0.2)",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowRadius: 10,
    shadowOpacity: 1,
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.1)",
  },
  recipesText: {
    opacity: 0.5,
    fontFamily: "Muli",
    fontSize: 11,
    fontWeight: "900",
    fontStyle: "normal",
    letterSpacing: 2,
    textAlign: "left",
    color: "#000000",
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
  ingredientText: {
    fontFamily: "Muli",
    fontSize: 16,
    fontWeight: "bold",
    fontStyle: "normal",
    letterSpacing: 1,
    textAlign: "left",
    color: "#000000",
  },
  recipeNameSmallText: {
    opacity: 0.5,
    fontFamily: "Muli",
    fontSize: 8,
    fontWeight: "bold",
    fontStyle: "normal",
    letterSpacing: 1.6,
    textAlign: "left",
    color: "#000000",
  },
  phoneIngredientContainer: {
    flex: 1,
    paddingTop: 11,

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
});
