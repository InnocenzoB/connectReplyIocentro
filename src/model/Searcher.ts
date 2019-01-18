import { I18n } from "iocentro-apps-common-bits";
import { ConfigStore, RecipeModel, Source } from "iocentro-collection-manager";
import { MandatoryGetValue, OptionalDynamicEnum, Trait, ValueBase } from "iocentro-datamodel";
import { Subscription } from "rxjs";

import { getUiPresentationValue } from "../Utils";

enum Attributes {
  category = "recipeCategory",
  cuisine = "recipeCuisine",
  complexity = "complexity",
  totalTime = "totalTime",
}

// ids for translation
const attributesNames: {[key in Attributes]: string} = {
  recipeCategory: "category",
  recipeCuisine: "cuisine",
  complexity: "difficulty",
  totalTime: "total_time",
};

export interface SearchFilterGroup {
  title: string;
  data: SearchFilter[];
}

export abstract class SearchFilter {
  public readonly value: any;
  public readonly attribute: string;
  public selected: boolean;

  abstract get name(): string;
}

export class AttributeFilter implements SearchFilter {
  constructor(
    public readonly value: ValueBase,
    public readonly attribute: string,
  ) { }

  public selected: boolean = false;

  get name() {
    return getUiPresentationValue(this.value, "");
  }
}

export class TimeFilter implements SearchFilter {
  constructor(
    public readonly value: number,
    public readonly attribute: string,
  ) { }

  public selected: boolean = false;

  get name() {
    return `${I18n.t("x_min_or_less", {value: this.value})}`;
  }
}

export class Searcher {
  public static getCategoryFilters() {
    return Searcher.getSearchFilters(Attributes.category);
  }

  public static getCuisineFilters() {
    return Searcher.getSearchFilters(Attributes.cuisine);
  }

  public static getAllFilters() {
    const attributeFilters = [Attributes.category, Attributes.cuisine, Attributes.complexity].map((attr) => {
      return Searcher.getSearchFilters(attr);
    });
    const timeFilters: SearchFilterGroup = {title: attributesNames[Attributes.totalTime], data: []};
    for (let i = 0; i < 12; i++) {
      timeFilters.data.push(new TimeFilter((i + 1) * 10, Attributes.totalTime));
    }
    attributeFilters.push(timeFilters);
    return attributeFilters;
  }

  private static getSearchFilters(attributeName: Attributes): SearchFilterGroup {
    if (!Searcher.filtersSource) {
      Searcher.filtersSource = ConfigStore.getSource();
    }
    const filters = getFilters(attributeName, Searcher.filtersSource);
    const title = attributesNames[attributeName];
    const data = filters.map((c) => new AttributeFilter(c, title));
    return { title, data };
  }

  private static filtersSource: Source | null = null;

  constructor(
    public onUpdateResults: (results: RecipeModel[], source: Source) => void,
    public onIsLoadingUpdate: (isLoading: boolean, source: Source) => void,
    public pageSize?: number,
  ) {
    this.setupNewSource();
  }

  public dispose() {
    this.subscription.unsubscribe();
    this.source.isLoading.unsubscribe();
    this.source.dispose();
  }

  public search(doSearch: (source: Source) => void) {
    this.setupNewSource();
    doSearch(this.source);
  }

  public next() {
    this.source.next();
  }

  public getAttributeFilters() {
    return this.source.getAttributeFilters();
  }

  private setupNewSource() {
    this.subscription && this.subscription.unsubscribe();
    this.source && this.source.isLoading.unsubscribe();
    this.source && this.source.dispose();

    const newSource = ConfigStore.getSource();
    this.pageSize && newSource.pageSize.updateValue(this.pageSize);
    this.subscription = newSource.items.subscribe((items: Trait[]) => {
      const results = MandatoryGetValue(items) as RecipeModel[];
      if (results && results.length > 0) {
        this.onUpdateResults(
          results,
          newSource,
        );
      }
    });
    newSource.isLoading.subscribe(() => {
      this.onIsLoadingUpdate(!!newSource.isLoading.sv(), newSource);
    });
    this.source = newSource;
  }

  private subscription: Subscription;
  private source: Source;
}

const getFilters = (attributeName: string, source: Source): ValueBase[] => {
  const attribute = source.attributes().find((a) => {
    return a.name == attributeName;
  });
  if (attribute) {
    const dynamicEnum = OptionalDynamicEnum(attribute);
    if (dynamicEnum) {
      return dynamicEnum.all();
    }
  }
  return [];
};
