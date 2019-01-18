import {
  AtomConsumerDescriptor,
  ConfigStore,
  ExtractAtomsFromUserData,
  PrimaryAtomsHasBeenSuccessul,
  RecipeModel,
  RxProcess,
  RxTxableExplicitCollectionStore,
  Source,
  SourceUserData,
  UserDataModel,
} from "iocentro-collection-manager";
import { ChangeOriginType, Model, RootModel, ValueBase } from "iocentro-datamodel";
import XDate from "xdate";

import { getDay, getMonth, getWeek, parseDate, TimePeriod, xdateToString } from "../calendar_utils";
import { GetBackendWorkaroundAtom, IsNumber, UpdateValue } from "./Helpers";

export class MealPlannerItem extends RootModel {
  public timestamp: ValueBase;
  public recipeId: ValueBase;

  // Recipe that might be fetched later based on recipeId
  // NOTE: This property does not belong to model and is not serialized
  public fetchedRecipe?: RecipeModel;

  constructor() {
    super();

    this.timestamp = new ValueBase([], "timestamp");
    this.recipeId = new ValueBase([], "recipeId");

    this.isDirtyTrackingEnabled = true;

    this.doInit();
  }

  public allValues(): ValueBase[] {
    return super.allValues().concat([
      this.timestamp,
      this.recipeId,
    ]);
  }

  get recipeIdVal() {
    return this.recipeId.sv() as string;
  }
  get timestampVal() {
    return this.timestamp.sv() as number;
  }
}

export type DateToMealPlannerItemsMap = Map<string, MealPlannerItem[]>;

const mealPlannerItemDescriptor100: AtomConsumerDescriptor = {
  version: "1.0.0",
  type: "mealPlannerItem",
  handler: (o: object, ctx: Model): boolean => {
    if (!(ctx && ctx instanceof MealPlannerItem)) {
      return false;
    }
    const item = ctx as MealPlannerItem;

    if (!UpdateValue(item, o, "timestamp", { validator: IsNumber })) {
      return false;
    }

    if (!UpdateValue(item, o, "recipeId", { converter: String })) {
      return false;
    }

    return true;
  },
};

function MealPlannerItemRx(ud: UserDataModel): (MealPlannerItem | null) {
  try {
    const atoms = ExtractAtomsFromUserData(ud);
    const item = new MealPlannerItem();

    item.id.updateValue(ud.id.sv());

    const results = RxProcess(
      item,
      atoms,
      [
        mealPlannerItemDescriptor100,
      ],
      mealPlannerItemDescriptor100.type,
    );

    if (PrimaryAtomsHasBeenSuccessul(mealPlannerItemDescriptor100.type, results)) {
      item.isDirty.updateValue(false, ChangeOriginType.backend);
      return item;
    }
  } catch (e) { }

  return null;
}

function CountItemsPerDay(items: MealPlannerItem[]) {
  const countedDays = new Map<string, number>();
  items.forEach((item) => {
    const itemDateStr = xdateToString(parseDate(item.timestampVal));
    const itemsAmount = (countedDays.get(itemDateStr) || 0);
    countedDays.set(itemDateStr, itemsAmount + 1);
  });

  return countedDays;
}

function MealPlannerItemTx(item: MealPlannerItem): UserDataModel {
  const atoms: object[] = [];

  atoms.push({
    version: mealPlannerItemDescriptor100.version,
    type: mealPlannerItemDescriptor100.type,
    timestamp: item.timestamp.sv(),
    recipeId: item.recipeId.sv(),
  });

  atoms.push(GetBackendWorkaroundAtom());

  const ud = new UserDataModel();
  ud.id.updateValue(item.id.sv());
  ud.value.updateValue({
    atoms,
  });

  return ud;
}

type SourceReadyListener = (instance: MealPlannerCollectionStore) => void;

export class MealPlannerCollectionStore extends RxTxableExplicitCollectionStore<MealPlannerItem> {
  public static readonly instance = new MealPlannerCollectionStore();

  private _sourceConfListeners: SourceReadyListener[] = [];
  private _recipesFetchSource: Source;

  constructor() {
    super(MealPlannerItemRx, MealPlannerItemTx);
  }

  public addNewItem(date: XDate, recipeToBeAdded: RecipeModel) {
    const newItem = new MealPlannerItem();
    newItem.recipeId.updateValue(recipeToBeAdded.id.sv());
    // clone().setHours(12).
    newItem.timestamp.updateValue(date.getTime());
    this.add(newItem);
  }

  public notifySourceReady(callback: SourceReadyListener): void {
    this._sourceConfListeners.push(callback);
    if (this.isSourceConfigured()) {
      this.notifyAndClearConfListeners();
    }
  }

  public getMonthlyPlannedItems(dayInMonth: XDate) {
    __DEV__ && this.throwIfNotValid();
    const month = getMonth(dayInMonth);
    return this.getPlannedItems(month);
  }

  public getPlannedItems(period: TimePeriod) {
    __DEV__ && this.throwIfNotValid();
    const ts = period.toTimestamp();
    const ret = this.filter((item) => {
      const timestamp = item.timestamp.sv() as number;
      if (timestamp >= ts.begin && timestamp <= ts.end) {
        return true;
      } else {
        return false;
      }
    });
    return ret;
  }

  public getWeeklyPlannedItems(dayInWeek: XDate) {
    __DEV__ && this.throwIfNotValid();
    const week = getWeek(dayInWeek);
    return this.getPlannedItems(week);
  }

  public getDailyPlannedItems(dayDate: XDate) {
    __DEV__ && this.throwIfNotValid();
    const day = getDay(dayDate);
    return this.getPlannedItems(day);
  }

  public getPlannedItemsAmount(period: TimePeriod) {
    __DEV__ && this.throwIfNotValid();
    return CountItemsPerDay(this.getPlannedItems(period));
  }

  public getMonthlyPlannedItemsAmount(dayInMonth: XDate) {
    __DEV__ && this.throwIfNotValid();
    const month = getMonth(dayInMonth);
    return this.getPlannedItemsAmount(month);
  }

  public fetchItemsForDay(day: XDate, callback: (items: MealPlannerItem[], requestedDate: XDate) => void) {
    __DEV__ && this.throwIfNotValid();

    const dailyItems = this.getDailyPlannedItems(day);
    const itemsWithoutFetchedRecipe = dailyItems.filter((item) => !item.fetchedRecipe);

    if (itemsWithoutFetchedRecipe.length > 0) {
      const recipeIds = itemsWithoutFetchedRecipe.map((item) => {
        return item.recipeId.sv() as string;
      });
      const uniqueRecipeIds = Array.from(new Set(recipeIds));
      this._recipesFetchSource.fetchDetailedByIds(uniqueRecipeIds).then((fetchedRecipeModels) => {
        itemsWithoutFetchedRecipe.forEach((item) => {
          const fetchedRecipe = fetchedRecipeModels.find((recipe) => recipe.id.sv() == item.recipeIdVal);
          if (fetchedRecipe) {
            item.fetchedRecipe = fetchedRecipe;
          }
        });
        callback(dailyItems, day);
      });
    } else {
      setImmediate(() => callback(dailyItems, day));
    }
  }

  public getAllItems() {
    __DEV__ && this.throwIfNotValid();
    return this.items.sv() as MealPlannerItem[];
  }

  public filter(predicate: (item: MealPlannerItem) => boolean) {
    __DEV__ && this.throwIfNotValid();
    return this.getAllItems().filter(predicate);
  }

  public addSource(source: SourceUserData): void {
    super.addSource(source);
    this._recipesFetchSource = ConfigStore.getSource();
    this.notifyAndClearConfListeners();
  }

  private notifyAndClearConfListeners = () => {
    this._sourceConfListeners.forEach((l) => l(this));
    this._sourceConfListeners = [];
  }

  private throwIfNotValid() {
    if (!this.isSourceConfigured()) {
      throw new Error("MealPlannerCollectionStore used without source");
    }
  }
}
