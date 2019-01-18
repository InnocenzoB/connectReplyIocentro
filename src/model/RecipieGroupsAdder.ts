import { RecipeModel, Source } from "iocentro-collection-manager";

import { CategoryGroupsData } from "../components/Category";
import { IS_TABLET } from "../Platform";

export abstract class RecipieGroupsAdder {
  constructor(maxGroups?: number) {
    this.maxGroups = maxGroups;
  }

  public abstract addGroups(
    results: RecipeModel[],
    resultsOffset: number,
    source: Source,
    recipiesGroups: CategoryGroupsData[],
  ): CategoryGroupsData[];

  public maxGroups?: number;
}

type addGroupFunction = (
  recipies: CategoryGroupsData[],
  results: RecipeModel[],
  forceAdd?: boolean,
) => boolean;

function getRelevantResults(results: RecipeModel[], offset: number): RecipeModel[] {
  return results.slice(offset);
}

export class SimpleAdder extends RecipieGroupsAdder {
  public addGroups(results: RecipeModel[],
                   resultsOffset: number,
                   source: Source,
                   recipiesGroups: CategoryGroupsData[]) {
    let addGroup: addGroupFunction;
    const r = getRelevantResults(results, resultsOffset);
    while (r.length > 0 && (this.maxGroups == undefined || recipiesGroups.length < this.maxGroups)) {
      // first add left group
      if (recipiesGroups.length == 0) {
        addGroup = IS_TABLET ? SimpleAdder._addLeftGroup : SimpleAdder._addSingleGroup;
      } else {
        const lastGroup = recipiesGroups[recipiesGroups.length - 1];

        if (lastGroup.capacity > lastGroup.data.length) {
          lastGroup.data = lastGroup.data.concat(
            r.splice(0, lastGroup.capacity - lastGroup.data.length),
          );
          continue;
        }

        switch (lastGroup.type) {
          case "left": addGroup = SimpleAdder._addRowGroup; break;
          case "row3": addGroup = SimpleAdder._addRightGroup; break;
          case "right": addGroup = SimpleAdder._addLeftGroup; break;
          case "row2": addGroup = SimpleAdder._addSingleGroup; break;
          case "single": addGroup = SimpleAdder._addRowTwoGroup; break;
          default: addGroup = (_rec, _res, forceAdd = false) => forceAdd; break;
        }
      }
      if (!addGroup(recipiesGroups, r, (!!source.isEndReached.sv()))) {
        break;
      }
    }
    return recipiesGroups;
  }

  private static readonly _addLeftGroup: addGroupFunction = (recipiesGroups, results, forceAdd = false) => {
    if (results.length >= 5 || forceAdd) {
      recipiesGroups.push({ type: "left", capacity: 5, data: results.splice(0, 5) });
      return true;
    }
    return false;
  }

  private static readonly _addRowGroup: addGroupFunction = (recipiesGroups, results, forceAdd = false) => {
    if (results.length >= 3 || forceAdd) {
      recipiesGroups.push({ type: "row3", capacity: 3, data: results.splice(0, 3) });
      return true;
    }
    return false;
  }

  private static readonly _addRightGroup: addGroupFunction = (recipiesGroups, results, forceAdd = false) => {
    if (results.length >= 5 || forceAdd) {
      recipiesGroups.push({ type: "right", capacity: 5, data: results.splice(0, 5) });
      return true;
    }
    return false;
  }

  private static readonly _addRowTwoGroup: addGroupFunction = (recipiesGroups, results, forceAdd = false) => {
    if (results.length >= 2 || forceAdd) {
      recipiesGroups.push({ type: "row2", capacity: 2, data: results.splice(0, 2) });
      return true;
    }
    return false;
  }

  private static readonly _addSingleGroup: addGroupFunction = (recipiesGroups, results, forceAdd = false) => {
    if (results.length >= 1 || forceAdd) {
      recipiesGroups.push({ type: "single", capacity: 1, data: results.splice(0, 1) });
      return true;
    }
    return false;
  }
}

export class CategoryAdder extends RecipieGroupsAdder {
  public addGroups(results: RecipeModel[],
                   resultsOffset: number,
                   _source: Source,
                   recipiesGroups: CategoryGroupsData[]) {
    const r = getRelevantResults(results, resultsOffset);
    while (r.length > 0 && (this.maxGroups == undefined || recipiesGroups.length < this.maxGroups)) {
      if (IS_TABLET) {
        recipiesGroups.push({ type: "row4", capacity: 4, data: r.splice(0, 4) });
      } else {
        recipiesGroups.push({ type: "row2", capacity: 4, data: r.splice(0, 2) });
      }
    }
    return recipiesGroups;
  }
}
