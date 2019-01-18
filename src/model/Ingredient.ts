import { IngredientModel } from "iocentro-collection-manager";

import { SerializeToObject, UpdateValue } from "./Helpers";

export const IngredientModelObjectValidator = (o: object): boolean => {
  if (!o.hasOwnProperty("ingredient")) {
    return false;
  }
  // unit and quantity are optional
  return true;
};

export const IngredientModelFromObject = (o: object): IngredientModel => {
  const ingredient = new IngredientModel();

  if (!UpdateValue(ingredient, o, "ingredient", { converter: String })) {
    throw new Error("Ingredient does not have 'ingredient' value!");
  }
  UpdateValue(ingredient, o, "quantity", { converter: String });
  UpdateValue(ingredient, o, "unit", { converter: String });
  UpdateValue(ingredient, o, "howToPrepare", { converter: String });
  return ingredient;
};

export const ObjectFromIngredientModel = (i: IngredientModel): object => {
  return SerializeToObject(i);
};

const INGREDIENT_REGEX = /([^,]+), ?([^ ]*) ?(.*)/;

export const IngredientModelFromUserText = (userText: string): IngredientModel => {
  if (!userText) {
    throw new Error("No userText provided in IngredientModelFromUserText!");
  }
  const model = new IngredientModel();
  const ingredientData = INGREDIENT_REGEX.exec(userText);
  if (ingredientData && ingredientData.length) {
    model.ingredient.updateValue(ingredientData[1]);
    if (ingredientData[2]) {
      model.quantity.updateValue(ingredientData[2]);
    }
    if (ingredientData[3]) {
      model.unit.updateValue(ingredientData[3]);
    }
  } else {
    // failed to match input as ingredient name + unit + quantity - just save it as text
    model.ingredient.updateValue(userText);
  }
  return model;
};

export const IngredientConversionOpts = {
  validator: IngredientModelObjectValidator,
  converter: IngredientModelFromObject,
};
