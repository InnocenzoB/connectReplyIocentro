import { RxTxableExplicitCollectionStore, SourceUserData } from "iocentro-collection-manager";
import XDate from "xdate";
import { I18n } from "iocentro-apps-common-bits";

import { sameDate } from "../../calendar_utils";
import { noNull } from "../../Utils";
import { COOK_PROCESSOR_TYPE_ID } from "../CookProcessorModel";
import { IsNumber } from "../Helpers";
import { CookProcessorStepModel } from "./StepModel";
import { UserCreation, UserCreationRx, UserCreationTx } from "./UserCreationRxTx";

type SourceReadyListener = (instance: UserCreationsCollectionStore) => void;

export type DeviceTypeIdToUserCreationsMap = Map<number, UserCreation[]>;

export class UserCreationsCollectionStore extends RxTxableExplicitCollectionStore<UserCreation> {
  public static readonly instance = new UserCreationsCollectionStore();

  private _sourceConfListeners: SourceReadyListener[] = [];
  private _freeGeneratedTitleNumber;

  constructor() {
    super(UserCreationRx, UserCreationTx);
  }

  public getGeneratedTitle() {
    return I18n.t("my_creation") + " " + this._freeGeneratedTitleNumber;
  }

  public readonly addCookProcessorCreation = (title: string, steps: CookProcessorStepModel[]): boolean => {
    const newItem = UserCreation.Create(title, steps, COOK_PROCESSOR_TYPE_ID);
    if (newItem.isValid()) {
      this.add(newItem);
      this.updateGeneratedTitleNumber();
      return true;
    } else {
      return false;
    }
  }

  public readonly updateUserCreation = (creation: UserCreation, title: string, steps: CookProcessorStepModel[]) => {
    const oldTitle = creation.title.sv();
    const oldSteps = creation.steps.sv();
    const oldModified = creation.modified.sv();
    creation.steps.updateValue(steps);
    creation.title.updateValue(title);
    creation.modified.updateValue(XDate(true).getTime());
    if (creation.isValid()) {
      this.updateGeneratedTitleNumber();
      return true;
    } else {
      // undo changes
      creation.steps.updateValue(oldSteps);
      creation.title.updateValue(oldTitle);
      creation.modified.updateValue(oldModified);
    }
    return false;
  }

  public filterByKeyWordOrDate(keyWordOrDate: string) {
    if (!keyWordOrDate) {
      return this.getAllItems();
    }
    const date = XDate(keyWordOrDate);
    if (!IsNumber(keyWordOrDate) && date.valid()) {
      return this.filter((item) => (
        sameDate(XDate(noNull(item.lastUsed.sv(), 0)), date)
        || sameDate(XDate(noNull(item.created.sv(), 0)), date)
        || sameDate(XDate(noNull(item.modified.sv(), 0)), date)
      ));
    } else {
      const keywordLowerStr = keyWordOrDate.toLowerCase();
      return this.filter((item) => {
        const titleLowerStr = item.title.sv().toLowerCase();
        return titleLowerStr.includes(keywordLowerStr);
      });
    }
  }

  public filter(predicate: (item: UserCreation) => boolean) {
    return this.getAllItems().filter(predicate);
  }

  public readonly notifySourceReady = (callback: SourceReadyListener): void => {
    this._sourceConfListeners.push(callback);
    if (this.isSourceConfigured()) {
      this.notifyAndClearConfListeners();
    }
  }

  public readonly getAllItems = () => {
    __DEV__ && this.throwIfNotValid();
    return this.items.sv() as UserCreation[];
  }

  public readonly getAllItemsForDevice = (deviceTypeId: number) => {
    return this.getAllItems().filter((item) => (item.deviceTypeId.sv() == deviceTypeId));
  }

  public readonly getAllItemsGroupedByDevice = () => (
    this.groupItemsByDevice(this.getAllItems())
  )

  public readonly getFilteredItemsGroupedByDevice = (keyWordOrDate: string) => (
    this.groupItemsByDevice(this.filterByKeyWordOrDate(keyWordOrDate))
  )

  public addSource(source: SourceUserData): void {
    super.addSource(source);
    this.updateGeneratedTitleNumber();
    this.notifyAndClearConfListeners();
  }

  private updateGeneratedTitleNumber() {
    const generatedTitles = this.getAllItems().map(
      (creation) => noNull<string>(creation.title.sv(), ""),
    ).filter(
      (title) => title.startsWith(I18n.t("my_creation")),
    );
    const generatedNumbers = generatedTitles.map(
      (title) => Number(title.slice(I18n.t("my_creation").length, title.length)),
    ).filter(
      (value) => !Number.isNaN(value),
    ).sort((lhs, rhs) => lhs - rhs);
    let freeGeneratedTitleNumber = generatedNumbers.length + 1;
    if (generatedNumbers[generatedNumbers.length - 1] != generatedNumbers.length) {
      for (let i = 1; i <= generatedNumbers.length; i++) {
        if (i != generatedNumbers[i - 1]) {
          freeGeneratedTitleNumber = i;
          break;
        }
      }
    }
    this._freeGeneratedTitleNumber = freeGeneratedTitleNumber;
  }

  private groupItemsByDevice(items: UserCreation[]): DeviceTypeIdToUserCreationsMap {
    const groupedItems = new Map<number, UserCreation[]>();
    items.forEach((item) => {
      const deviceTypeId = item.deviceTypeId.sv();
      if (!groupedItems.has(deviceTypeId)) {
        groupedItems.set(deviceTypeId, []);
      }
      groupedItems.get(deviceTypeId)!.push(item);
    });
    return groupedItems;
  }

  private notifyAndClearConfListeners = () => {
    this._sourceConfListeners.forEach((l) => l(this));
    this._sourceConfListeners = [];
  }

  private throwIfNotValid = () => {
    if (!this.isSourceConfigured()) {
      throw new Error("UserCreationsCollectionStore used without source");
    }
  }
}
