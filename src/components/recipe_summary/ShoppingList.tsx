import { IngredientModel, RecipeModel } from "iocentro-collection-manager";
import React, { Component } from "react";
import { Image, LayoutAnimation, StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { Subscription } from "rxjs";
import { I18n } from "iocentro-apps-common-bits";

import { TouchableScale } from "../../components/TouchableScale";
import { ModelEquals } from "../../model/Helpers";
import { ShoppingListCollectionStore } from "../../model/shopping_list/ShoppingListCollectionStore";
import { ShoppingListItem } from "../../model/shopping_list/ShoppingListItemRxTx";
import { noNull } from "../../Utils";
import { TextScaledOnPhone } from "../ScaledText";
import { Line } from "./Line";
import { TitleGrey, TitleRed } from "./Titles";

interface ShoppingListProps {
  style?: StyleProp<ViewStyle>;
  recipe: RecipeModel;
}

const imported = {
  ingredientIcon: require("../../../img/recipe_summary/ingredientIcon.png"),
  ingredientXIcon: require("../../../img/icons/ingredientXIcon.png"),
};

type ShoppingListMode = "ingredients" | "shoppinglist";

interface ShoppingListState {
  mode: ShoppingListMode;
  savedIngredients: ShoppingListItem[];
}

export class ShoppingList extends Component<ShoppingListProps, ShoppingListState> {
  private _modelSubscription: Subscription;

  constructor(props) {
    super(props);

    this.state = {
      mode: "shoppinglist",
      savedIngredients: [],
    };
  }

  private enterMode(mode: ShoppingListMode) {
    this.setState({ mode });
  }

  public componentWillReceiveProps(nextProps) {
    if (this.props.recipe.id.sv() != nextProps.recipe.id.sv()) {
      this.updateSavedIngredients(nextProps);
    }
  }

  public componentWillMount() {
    ShoppingListCollectionStore.instance.notifySourceReady(() => this.updateSavedIngredients());
    this._modelSubscription = ShoppingListCollectionStore.instance.modelChanged.subscribe(() => {
      this.updateSavedIngredients();
    });
  }

  public componentWillUnmount() {
    this._modelSubscription.unsubscribe();
  }

  private updateSavedIngredients = (props: ShoppingListProps = this.props) => {
    const savedIngredients = ShoppingListCollectionStore.instance.getAllItemsFromRecipe(props.recipe);
    this.setState({ savedIngredients });
  }

  public render() {
    const ingMode = this.state.mode == "ingredients";
    const anythingSaved = this.state.savedIngredients.length > 0;
    const slMode = !ingMode;

    return (
      <View style={this.props.style}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
          }}>
          <TitleGrey
            text={I18n.t("ingredients").toUpperCase()}
          />
          <TitleRed
            style={{ flex: 1, justifyContent: "flex-end" }}
            text={
              ingMode ? I18n.t("shopping_list").toUpperCase() :
                anythingSaved ? I18n.t("remove_all").toUpperCase() : I18n.t("add_all").toUpperCase()
            }
            icon={ingMode ? imported.ingredientIcon : undefined}
            onPress={ingMode ? () => this.enterMode("shoppinglist") : () => {
              if (anythingSaved) {
                ShoppingListCollectionStore.instance.removeAllFromRecipe(this.props.recipe);
              } else {
                ShoppingListCollectionStore.instance.addAllFromRecipe(this.props.recipe);
              }
            }}
          />
        </View>
        <Line />
        <IngredientsList recipe={this.props.recipe} savedIngredients={this.state.savedIngredients} editable={slMode} />
      </View>
    );
  }
}

interface IngredientsListProps {
  editable: boolean;
  recipe: RecipeModel;
  savedIngredients?: ShoppingListItem[];
}

const IngredientsList = (props: IngredientsListProps) => {
  const ingredients = noNull<IngredientModel[]>(props.recipe.ingredients.sv(), []);
  return (
    <View>
      {ingredients.map((ingredient, index) => {
        const savedIngredient = (props.savedIngredients || []).find((savedItem) => (
          ModelEquals(savedItem.ingredientVal, ingredient)
        ));
        return (
          <Ingredient
            savedIngredient={savedIngredient}
            recipe={props.recipe}
            key={index.toString()}
            data={ingredient}
            editable={props.editable}
          />
        );
      })}
    </View>
  );
};

interface IngredientProps {
  data: IngredientModel;
  savedIngredient?: ShoppingListItem;
  editable: boolean;
  recipe: RecipeModel;
}

type ModificationType = "added" | "removed";

interface IngredientState {
  modification?: ModificationType;
}

const MODIFICATION_TIMEOUT_MS = 2000;

function IngredientToString(ingredient?: IngredientModel): string {
  if (!ingredient) { return ""; }

  const ingVals: Array<string | null> = [];
  ingVals.push(ingredient.quantity.sv());
  ingVals.push(ingredient.unit.sv());
  ingVals.push(ingredient.ingredient.sv());

  const iStr = ingVals.filter((ingS) => {
    if (ingS) {
      return ingS.toLowerCase() != "none";
    }
    return false;
  });
  let ingredientLabel;
  if (iStr.length != 3) {
    ingredientLabel = iStr.join(" ").trim();
  } else {
    ingredientLabel = iStr[0]! + iStr[1]! + " " + iStr[2]!;
  }
  const howToPrepare = ingredient!.howToPrepare.sv();
  if (howToPrepare) {
    return ingredientLabel + ", " + howToPrepare.toLowerCase();
  }
  return ingredientLabel;
}

class Ingredient extends Component<IngredientProps, IngredientState> {
  private _modificationTimer;
  public state: IngredientState = {
    modification: undefined,
  };

  public componentWillUpdate() {
    // animate transition
    LayoutAnimation.configureNext(LayoutAnimation.Presets.linear);
  }

  public render() {
    const { recipe, data: ingredient, savedIngredient } = this.props;
    const text = IngredientToString(this.props.data);

    return (
      <TouchableScale
        style={{ marginBottom: 20 }}
        disabled={!this.props.editable}
        onPress={() => {
          if (this.state.modification) {
            this.setState({ modification: undefined }); // early exit
          } else {
            this.setState({ modification: savedIngredient ? "removed" : "added" });
            if (savedIngredient) {
              ShoppingListCollectionStore.instance.remove(savedIngredient);
            } else {
              ShoppingListCollectionStore.instance.addFromRecipe(recipe, ingredient);
            }
            this._modificationTimer = setTimeout(() => {
              this.setState({ modification: undefined });
            }, MODIFICATION_TIMEOUT_MS);
          }
        }}
      >
        {this.state.modification ?
          this.renderModificationInfo()
          :
          <View style={{ flexDirection: "row" }}>
            {this.props.editable &&
              <Image
                source={savedIngredient ? imported.ingredientXIcon : imported.ingredientIcon}
                style={{ marginRight: 12, marginTop: 4 }}
              />
            }
            <TextScaledOnPhone style={styles.ingredientText}>
              {text}
            </TextScaledOnPhone>
          </View>
        }
      </TouchableScale>
    );
  }

  private renderModificationInfo() {
    const modificationText = (this.state.modification == "added") ? I18n.t("added_to") : I18n.t("removed_from");
    return (
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <TextScaledOnPhone style={styles.ingredientText}>
          {`${I18n.t("item_singular")} ${modificationText} `}
        </TextScaledOnPhone>
        <TitleRed text={I18n.t("shopping_list").toUpperCase()} />
      </View>
    );
  }

  public componentWillUnmount() {
    clearTimeout(this._modificationTimer);
  }
}

const styles = StyleSheet.create({
  ingredientText: {
    fontFamily: "Muli",
    fontSize: 14,
    lineHeight: 22,
    textAlign: "left",
    color: "#000000",
    width: undefined,
    flex: 1,
  },
});
