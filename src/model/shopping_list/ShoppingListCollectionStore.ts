import { ConfigStore, RxTxableExplicitCollectionStore, Source, SourceUserData } from "iocentro-collection-manager";
import { IngredientModel } from "iocentro-collection-manager/out/implementation/models/recipe/IngredientModel";
import { RecipeModel } from "iocentro-collection-manager/out/implementation/models/recipe/RecipeModel";
import { Subject } from "rxjs/Subject";

import { noNull } from "../../Utils";
import { ModelEquals } from "../Helpers";
import { IngredientModelFromUserText } from "../Ingredient";
import { ShoppingListItem, ShoppingListItemRx, ShoppingListItemTx } from "./ShoppingListItemRxTx";

type SourceReadyListener = (instance: ShoppingListCollectionStore) => void;

export class ShoppingListCollectionStore extends RxTxableExplicitCollectionStore<ShoppingListItem> {
  public static readonly instance = new ShoppingListCollectionStore();

  private _sourceConfListeners: SourceReadyListener[] = [];
  private _recipesFetchSource: Source;

  constructor() {
    super(ShoppingListItemRx, ShoppingListItemTx);
  }

  public static readonly RecipeName = (item: ShoppingListItem): string => {
    const recipeMap =  ShoppingListCollectionStore.instance._recipesInShoppingListMap;
    if (!recipeMap) {
      return "";
    }
    const itemRecipeId = item.recipeIdVal;
    if (!itemRecipeId) {
      return "";
    }
    const fetchedRecipe = recipeMap.get(itemRecipeId);
    if (!fetchedRecipe) {
      return "";
    }
    return noNull(fetchedRecipe.title.sv(), "");
  }

  public static readonly ItemName = (item: ShoppingListItem): string => {
    return item.ingredientVal.ingredient.sv() || "";
  }

  public static readonly SummedUpQuantityText = (list: ShoppingListItem[]) => {
    const quantityMap = new Map();

    list.forEach((i) => {
      const ingredient = i.ingredientVal;
      let unit = noNull(ingredient.unit.sv() as string | null, "");
      if (unit.toLowerCase() == "none") {
        unit = "";
      }
      const quantity = noNull(ingredient.quantity.sv(), "");
      if (quantity == "" || isNaN(quantity)) {
        // non-numeric quantity
        if (quantityMap.get(unit) === undefined) {
          // first non-numeric quantity - set it
          quantityMap.set(unit, quantity);
        } else {
          // more than one non-numeric quantity - mark it
          quantityMap.set(unit, "*");
        }
      } else {
        // numeric quantity
        const summedQuantity = quantityMap.get(unit);
        if (typeof summedQuantity == "string") {
          // non-numeric quantity set - mark it
          quantityMap.set(unit, "*");
        } else {
          // numeric quantity with numeric sum - add it
          quantityMap.set(unit, (summedQuantity || 0) + noNull(Number(quantity), 0));
        }
      }
    });

    let summedUpText = "";
    let first = true;
    for (const [unit, summedQuantity] of quantityMap) {
      if (!first) {
        summedUpText += ", ";
      }
      const summedQuantityAndUnit = summedQuantity + (unit ? (" " + unit) : "");
      summedUpText += summedQuantityAndUnit;
      if (list.length > 1 && !summedQuantityAndUnit) {
        // fix for 'something, , something'
        summedUpText += "*";
      }
      first = false;
    }

    return summedUpText;
  }

  public readonly addUserItem = (value: string) => {
    const newItem = new ShoppingListItem();
    newItem.ingredient.updateValue(IngredientModelFromUserText(value));
    this.add(newItem);
  }

  public readonly addAllFromRecipe = (recipe: RecipeModel) => {
    const ingredients = noNull<IngredientModel[]>(recipe.ingredients.sv(), []);
    for (const ingredient of ingredients) {
      this.addFromRecipe(recipe, ingredient);
    }
  }

  public readonly removeAllFromRecipe = (recipe: RecipeModel) => {
    this.getAllItemsFromRecipe(recipe).forEach((item) => this.remove(item));
  }

  public readonly addFromRecipe = (recipe: RecipeModel, ingredient: IngredientModel) => {
    const newItem = new ShoppingListItem();
    newItem.recipeId.updateValue(recipe.id.sv());
    newItem.ingredient.updateValue(ingredient);
    this.add(newItem);
  }

  public readonly notifySourceReady = (callback: SourceReadyListener): void => {
    this._sourceConfListeners.push(callback);
    if (this.isSourceConfigured()) {
      this.notifyAndClearConfListeners();
    }
  }

  public readonly getAllItems = () => {
    __DEV__ && this.throwIfNotValid();
    return this.items.sv() as ShoppingListItem[];
  }

  /**
   * Return undefined until first fetching is finished.
   */
  public readonly getFetchedRecipes = (): RecipeModel[] | undefined => {
    if (this._recipesInShoppingListMap == undefined) {
      return;
    }
    const recipes = Array.from(this._recipesInShoppingListMap.values());
    return recipes.filter((value) => value != undefined) as RecipeModel[];
  }

  public readonly getAllItemsFromRecipe = (recipe: RecipeModel) => {
    return this.getAllItems().filter((item) => (
      item.recipeIdVal == recipe.id.sv()
    ));
  }

  public readonly findItem = (recipe: RecipeModel, ingredient: IngredientModel) => {
    const itemsFromRecipe = this.getAllItemsFromRecipe(recipe);
    return itemsFromRecipe.find((item) => ModelEquals(item.ingredientVal, ingredient));
  }

  public addSource(source: SourceUserData): void {
    super.addSource(source);
    this._recipesFetchSource = ConfigStore.getSource();
    this.modelChanged.subscribe(this.updateRecipesIfNeeded);
    this.notifyAndClearConfListeners();
    this.setUpRecipes();
  }

  private notifyAndClearConfListeners = () => {
    this._sourceConfListeners.forEach((l) => l(this));
    this._sourceConfListeners = [];
  }

  private throwIfNotValid = () => {
    if (!this.isSourceConfigured()) {
      throw new Error("ShoppingListCollectionStore used without source");
    }
  }

  public recipes = new Subject<RecipeModel[]>();
  private _recipesInShoppingListMap: Map<string, RecipeModel | undefined>;

  /**
   * Returns unique, non-null, sorted recipe ids from shopping list items
   */
  private getAllRecipeIds = (): string[] => {
    const recipeIds = this.getAllItems().map((item) => item.recipeId.sv());
    const uniqueNonNullRecipes = Array.from(new Set(recipeIds)).filter((recipeId) => recipeId != null);
    return uniqueNonNullRecipes.sort();
  }

  private setUpRecipes = () => {
    const recipeIds = this.getAllRecipeIds();
    this._recipesFetchSource.fetchDetailedByIds(recipeIds).then((recipes) => {
      this._recipesInShoppingListMap = new Map();
      recipeIds.forEach((recipeId) => {
        this._recipesInShoppingListMap!.set(recipeId, undefined);
      });
      if (!recipes) {
        // failed to fetch recipes notify empty list
        this.notifyRecipeListChanged();
      } else {
        this.onRecipesFetched(recipes);
      }
      this.updateRecipesIfNeeded(); // update in case if something has changed in the meantime
    });
  }

  private updateRecipesIfNeeded = () => {
    if (!this._recipesInShoppingListMap) {
      // first fetch not yet finished
      return;
    }
    const recipeIds = this.getAllRecipeIds();
    const missingRecipeIds: string[] = [];
    const previousRecipes = this._recipesInShoppingListMap;
    this._recipesInShoppingListMap = new Map();

    recipeIds.forEach((recipeId) => {
      if (previousRecipes.has(recipeId)) {
        this._recipesInShoppingListMap.set(recipeId, previousRecipes.get(recipeId));
        previousRecipes.delete(recipeId);
      } else {
        this._recipesInShoppingListMap.set(recipeId, undefined);
        missingRecipeIds.push(recipeId);
      }
    });

    if (previousRecipes.size) {
      // there are some leftovers - some recipe does no longer exist in shopping list
      this.notifyRecipeListChanged();
    }

    if (missingRecipeIds.length) {
      this._recipesFetchSource.fetchDetailedByIds(missingRecipeIds).then(this.onRecipesFetched);
    }
  }

  private onRecipesFetched = (recipes: RecipeModel[] | null) => {
    let complemented = false;
    if (!recipes) {
      return;
    }
    recipes.forEach((recipe) => {
      const recipeId = recipe.id.sv();
      if (this._recipesInShoppingListMap.has(recipeId)) {
        if (!this._recipesInShoppingListMap.get(recipeId)) {
          complemented = true;
        }
        // todo insert with some caching timeout?
        this._recipesInShoppingListMap.set(recipeId, recipe);
      }
    });
    if (complemented) {
      this.notifyRecipeListChanged();
    }
  }

  private notifyRecipeListChanged = () => {
    this.recipes.next(this.getFetchedRecipes());
  }
}
