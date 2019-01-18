import React, { Component, PureComponent } from "react";
import {
  FlatList,
  Image,
  ListRenderItemInfo,
  ScrollViewStyle,
  StyleProp,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
  ViewStyle,
} from "react-native";
import { I18n } from "iocentro-apps-common-bits";

import { SearchFilter, SearchFilterGroup } from "../../model/Searcher";
import { IS_TABLET } from "../../Platform";
import { TextScaledOnPhone } from "../ScaledText";
import { HorizontalSpacer } from "../steps_screen/Overview";
import { TouchableScale } from "../TouchableScale";
import { FilterButton, FilterButtonCallbacks } from "./FilterButton";

const filterDropdownArrow = require("../../../img/saved_favorites/filterDropdownArrow.png");
const filterDropdownArrowGray = require("../../../img/saved_favorites/filterDropdownArrowGray.png");

interface FiltersGroupState {
  filterDetails?: SearchFilterGroup;
}

export type FiltersTheme = "light" | "dark";

export interface FilterThemed {
  theme?: FiltersTheme;
}

interface FiltersGroupProps extends FilterThemed {
  data: SearchFilterGroup[];
  onFilterSearch?: (filters: SearchFilter[]) => void;
  style?: StyleProp<ScrollViewStyle>;
  horizontal?: boolean;
}

export class FiltersGroup extends Component<FiltersGroupProps, FiltersGroupState> {
  public static defaultProps = {
    theme: "light",
    horizontal: true,
  };

  constructor(props) {
    super(props);

    this.state = {
      filterDetails: undefined,
    };
  }

  public render() {
    return (IS_TABLET ? this.renderTablet() : this.renderPhone());
  }

  private renderTablet = () => {
    if (this.state.filterDetails) {
      return (
        <FilterRow
          {...this.state.filterDetails}
          onTitlePress={this._hideFilterDetails.bind(this)}
          onFilterPress={this._onFilterPress.bind(this)}
          theme={this.props.theme}
        >
          {this.props.children}
        </FilterRow>
      );
    } else {
      return (
        <FlatList
          style={this.props.style}
          keyExtractor={(item: SearchFilterGroup) => item.title}
          horizontal={this.props.horizontal}
          scrollEnabled
          data={this.props.data}
          ItemSeparatorComponent={() => (<HorizontalSpacer width={30} />)}
          renderItem={({ item }: ListRenderItemInfo<SearchFilterGroup>) => {
            return (
              <FilterColumn
                {...item}
                theme={this.props.theme}
                onTitlePress={this._showFilterDetails.bind(this)}
              >
                {this.props.children}
              </FilterColumn>
            );
          }}
        />
      );
    }
  }

  private renderPhone = () => {
    return (
      <FlatList
        style={this.props.style}
        keyExtractor={(item: SearchFilterGroup) => item.title}
        horizontal={this.props.horizontal}
        scrollEnabled
        data={this.props.data}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => (<HorizontalSpacer width={30} />)}
        renderItem={({ item }: ListRenderItemInfo<SearchFilterGroup>) => {
          return (
            <FilterRowPhone
              {...item}
              theme={this.props.theme}
            >
              {this.props.children}
            </FilterRowPhone>
          );
        }
        }
      />
    );
  }

  private _onFilterPress(filter: SearchFilter) {
    if (!this.state.filterDetails) { return; }

    if (filter.value == null && !filter.selected) {
      // "ALL" filter has been selected - unselect everything
      this.state.filterDetails.data.forEach((f) => {
        f.selected = false;
      });
    }
    filter.selected = !filter.selected;
    this.forceUpdate();
  }

  private _showFilterDetails(title: string) {
    const group = this.props.data.find((i) => i.title == title);
    if (!group) { return; }
    this.setState({
      filterDetails: group,
    });
  }

  private _hideFilterDetails() {
    this.searchWithFilters();
  }

  public searchWithFilters() {
    let filters: SearchFilter[] = [];
    this.props.data.forEach((group) => {
      filters = filters.concat(group.data.filter((f) => f.selected == true));
    });
    if (IS_TABLET) {
      this.setState({
        filterDetails: undefined,
      }, () => {
        this.props.onFilterSearch && this.props.onFilterSearch(filters);
      });
    } else {
      this.props.onFilterSearch && this.props.onFilterSearch(filters);
    }
  }

}

type FilterColumnProps = SearchFilterGroup & TitleCallback & FilterButtonCallbacks & FilterThemed;

class FilterColumn extends PureComponent<FilterColumnProps> {
  public render() {
    const { title, data, onTitlePress, onFilterPress, theme } = this.props;

    return (
      <View>
        <Title
          title={title}
          flipIcon={false}
          onTitlePress={onTitlePress}
          theme={theme}
        />
        <FiltersList
          style={styles.columnButtonContainer}
          buttonStyle={styles.columnButton}
          data={data}
          onFilterPress={onFilterPress}
          theme={theme}
          dataFilter={(f) => f.selected} // display only selected elements in column view
        />
        {this.props.children}
      </View>
    );
  }
}

type FilterRowProps = SearchFilterGroup & TitleCallback & FilterButtonCallbacks & FilterThemed;

export class FilterRow extends PureComponent<FilterRowProps> {
  public render() {
    const { title, data, onTitlePress, onFilterPress, theme } = this.props;
    return (
      <View style={{ flex: 1 }}>
        <Title
          title={title}
          flipIcon={true}
          onTitlePress={onTitlePress}
          theme={theme}
        />
        <FiltersList
          style={styles.rowButtonContainer}
          buttonStyle={styles.rowButton}
          data={data}
          onFilterPress={onFilterPress}
          theme={theme}
        />
        {this.props.children}
      </View>
    );
  }
}

type FilterRowPhoneProps = SearchFilterGroup & TitleCallback & FilterButtonCallbacks & FilterThemed;

export class FilterRowPhone extends Component<FilterRowPhoneProps, { isActive: boolean }> {

  constructor(props) {
    super(props);
    this.state = {
      isActive: false,
    };
  }
  public render() {
    const { title, data, theme } = this.props;
    return (
      <TouchableWithoutFeedback style={{ flex: 1 }} >
        <View>
          <Title
            title={title}
            flipIcon={this.state.isActive}
            onTitlePress={() => this.setState({ isActive: !this.state.isActive })}
            theme={theme}
          />
          <FiltersList
            style={styles.rowButtonContainer}
            buttonStyle={styles.rowButton}
            data={data}
            onFilterPress={this._onFilterPress.bind(this)}
            theme={theme}
            dataFilter={(f) => this.state.isActive ? true : f.selected}
          />
          {this.props.children}
        </View>
      </TouchableWithoutFeedback>
    );
  }

  private _onFilterPress(filter: SearchFilter) {
    if (filter.value == null && !filter.selected) {
      // "ALL" filter has been selected - unselect everything
      this.props.data.forEach((f) => {
        f.selected = false;
      });
    }
    filter.selected = !filter.selected;
    this.forceUpdate();
  }
}

interface TitleCallback {
  onTitlePress?: (title: string) => void;
}

interface TitleProps extends TitleCallback, FilterThemed {
  title: string;
  flipIcon: boolean;
}

const Title = ({ title, flipIcon, onTitlePress, theme }: TitleProps) => {
  return (
    <TouchableScale
      onPress={() => { onTitlePress && onTitlePress(title); }}
      style={{ alignSelf: "baseline" }}
      touchableExpand={10}
    >
      <View style={styles.filterName}>
        <TextScaledOnPhone style={[styles.filterFont, { color: (theme != "dark" ? "#ffffff" : "#676767") }]}>
          {I18n.t(title).toUpperCase()}
        </TextScaledOnPhone>
        <Image
          style={[
            styles.arrow,
            flipIcon ? styles.flip : {},
            { opacity: (theme != "dark" ? 0.5 : 1) },
          ]}
          source={theme != "dark" ? filterDropdownArrow : filterDropdownArrowGray}
        />
      </View>
    </TouchableScale>
  );
};

interface FilterListProps extends FilterButtonCallbacks, FilterThemed {
  data: SearchFilter[];
  buttonStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
  dataFilter?: (f: SearchFilter) => boolean;
}

class FiltersList extends Component<FilterListProps> {
  private addAllToFilters(filters) {
    const anythingSelected = filters.some((f) => f.selected);
    const allFilter = { name: I18n.t("all"), selected: !anythingSelected, value: null };
    const filtersCopy = filters.slice();
    filtersCopy.unshift(allFilter);
    return filtersCopy;
  }

  public render() {
    let filters = this.addAllToFilters(this.props.data);
    if (this.props.dataFilter) {
      filters = filters.filter(this.props.dataFilter);
    }
    return (
      <View style={[{ flexWrap: "wrap" }, this.props.style]}>
        {filters.map((item, index) => {
          return (
            <FilterButton
              key={index.toString()}
              style={this.props.buttonStyle}
              filter={item}
              onFilterPress={this.props.onFilterPress}
              theme={this.props.theme}
            />
          );
        })}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  filterName: {
    flexDirection: "row",
    backgroundColor: "transparent",
  },
  filterFont: {
    opacity: 0.5,
    fontFamily: "Muli",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 2,
  },
  arrow: {
    marginLeft: 8,
    marginTop: 2,
  },
  flip: {
    transform: [{
      rotateX: "180deg",
    }],
  },
  columnButtonContainer: {
    marginTop: 4,
    maxHeight: 135,
  },
  columnButton: {
    marginTop: 5,
    marginBottom: 5,
    minWidth: 80,
    marginRight: 10,
  },
  rowButtonContainer: {
    marginTop: 9,
    flexDirection: "row",
  },
  rowButton: {
    marginRight: 20,
    minWidth: 80,
    marginBottom: 10,
  },
});
