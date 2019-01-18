import { RecipeModel } from "iocentro-collection-manager";
import { AsyncStorage } from "react-native";

/**
 * Keys for AsyncStorage should be uniqe per application.
 */
export enum StorageKeys {
  "RecipeProgress",
}

interface StoredRecipeData {
  recipeId: string;
  currentStep: number;
  finishedSteps: number;
  timestamp: number;
}

export class KAStorage {
  public static SaveRecipeProgress(recipe: RecipeModel, currentStep: number, finishedSteps: number) {
    const recipeId = recipe.id.sv();
    if (recipeId == null) {
      // todo user recipe handling
      return;
    }

    AsyncStorage.setItem(StorageKeys[StorageKeys.RecipeProgress], JSON.stringify({
      recipeId,
      currentStep,
      finishedSteps,
      timestamp: Date.now(),
    }), (error) => {
      if (error !== null) {
        // in case when saving recipe state fails remove any
        // previously saved state to avoid step missmatch
        this.ClearRecipeProgress();
      }
    });
  }

  public static GetRecipeProgress(callback: (result: StoredRecipeData) => void) {
    AsyncStorage.getItem(StorageKeys[StorageKeys.RecipeProgress],
      (error, result) => {
        if (error != null || !result) {
          return;
        }
        callback(JSON.parse(result));
      });
  }

  public static ClearRecipeProgress() {
    AsyncStorage.removeItem(StorageKeys[StorageKeys.RecipeProgress]);
  }
}
