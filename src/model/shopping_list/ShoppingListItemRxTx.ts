import {
  AtomConsumerDescriptor,
  ExtractAtomsFromUserData,
  IngredientModel,
  PrimaryAtomsHasBeenSuccessul,
  RxProcess,
  UserDataModel,
} from "iocentro-collection-manager";
import { ChangeOriginType, Model, RootModel, ValueBase } from "iocentro-datamodel";

import { GetBackendWorkaroundAtom, IsDefinedNotNull, UpdateValue } from "../Helpers";
import { IngredientConversionOpts, ObjectFromIngredientModel } from "../Ingredient";

export class ShoppingListItem extends RootModel {
  public ingredient: ValueBase;
  public recipeId: ValueBase; // optional

  constructor() {
    super();

    this.ingredient = new ValueBase([], "ingredient");
    this.recipeId = new ValueBase([], "recipeId");

    this.isDirtyTrackingEnabled = true;

    this.doInit();
  }

  public allValues(): ValueBase[] {
    return super.allValues().concat([
      this.ingredient,
      this.recipeId,
    ]);
  }

  get recipeIdVal() {
    return this.recipeId.sv() as string | null;
  }
  get ingredientVal() {
    return this.ingredient.sv() as IngredientModel;
  }
}

const shoppingListItemDescriptor100: AtomConsumerDescriptor = {
  version: "1.0.0",
  type: "shoppingListItem",
  handler: (o: object, ctx: Model): boolean => {
    if (!(ctx && ctx instanceof ShoppingListItem)) {
      return false;
    }
    const item = ctx as ShoppingListItem;

    if (!UpdateValue(item, o, "ingredient", IngredientConversionOpts)) {
      return false;
    }
    UpdateValue(item, o, "recipeId", { validator: IsDefinedNotNull, converter: String });

    return true;
  },
};

export function ShoppingListItemRx(ud: UserDataModel): (ShoppingListItem | null) {
  try {
    const atoms = ExtractAtomsFromUserData(ud);
    const item = new ShoppingListItem();

    item.id.updateValue(ud.id.sv());

    const results = RxProcess(
      item,
      atoms,
      [
        shoppingListItemDescriptor100,
      ],
      shoppingListItemDescriptor100.type,
    );

    if (PrimaryAtomsHasBeenSuccessul(shoppingListItemDescriptor100.type, results)) {
      item.isDirty.updateValue(false, ChangeOriginType.backend);
      return item;
    }
  } catch (e) { }

  return null;
}

export function ShoppingListItemTx(item: ShoppingListItem): UserDataModel {
  const atoms: object[] = [];
  atoms.push({
    version: shoppingListItemDescriptor100.version,
    type: shoppingListItemDescriptor100.type,
    ingredient: ObjectFromIngredientModel(item.ingredient.sv()),
    recipeId: item.recipeId.sv(),
  });

  atoms.push(GetBackendWorkaroundAtom());

  const ud = new UserDataModel();
  ud.id.updateValue(item.id.sv());
  ud.value.updateValue({ atoms });

  return ud;
}
