import { I18n } from "iocentro-apps-common-bits";
import React, { Component } from "react";
import { StyleSheet, View } from "react-native";

import { FiltersGroup } from "../components/saved_favorites/Filter";
import { SearchBar, SearchBarProps } from "../components/SearchBar";
import { SearchFilter, SearchFilterGroup } from "../model/Searcher";
import { ThemedTextButton } from "./Buttons";
import { CloseableBlurredModal } from "./CloseableBlurredModal";
import { Hr } from "./Hr";

const imported = {
  clearSearchBarIcon: require("../../img/icons/searchbarXIcon.png"),
  filterIconRed: require("../../img/icons/FilteredResultsMobile.png"),
  filterIconGray: require("../../img/icons/filterIcon.png"),
  searchIcon: require("../../img/icons/searchIconSelected.png"),
  searchbarXIcon: require("../../img/icons/searchbarXIcon.png"),
  xIcon: require("../../img/icons/searchbarXIconWhite.png"),
};

interface PhoneSearchBarProps extends SearchBarProps {
  filtersData?: SearchFilterGroup[]; // if not passed, filtering icon is not rendered
  onFilterSearch?: (filters: SearchFilter[]) => void;
  onClearFilters?: () => void;
  placeholder?: string;
}

interface PhoneSearchBarState {
  modalFilterVisible: boolean;
}

export class PhoneSearchBar extends Component<PhoneSearchBarProps, PhoneSearchBarState> {
  private _filterGroup: FiltersGroup | null;
  public state = {
    modalFilterVisible: false,
  };

  public render() {
    const { filtersData, ...searchBarProps } = this.props;
    let rightIcon;
    if (filtersData) {
      const filterActive = filtersData.some((filterGroup) => (
        filterGroup.data.some((filter) => filter.selected)
      ));
      rightIcon = filterActive ? imported.filterIconRed : imported.filterIconGray;
    }
    return (
      <View>
        <SearchBar
          barStyle={styles.searchBar}
          touchableExpandSize={10}
          style={styles.searchBarText}
          rightIcon={rightIcon}
          onRightButtonClick={this._toggleModal}
          leftIcon={imported.searchIcon}
          onLeftButtonClick={() => { }}
          {...searchBarProps}
        />
        {this._renderFilterModal()}
      </View>
    );
  }
  private _toggleModal = () => {
    const currentlyVisible = this.state.modalFilterVisible;
    if (currentlyVisible) {
      // will be hidden
      this._filterGroup && this._filterGroup.searchWithFilters();
    }
    this.setState({ modalFilterVisible: !currentlyVisible });
  }

  private _renderFilterModal() {
    if (!this.props.filtersData) {
      return null;
    }
    return (
      <CloseableBlurredModal
        visible={this.state.modalFilterVisible}
        onRequestClose={this._toggleModal}
      >
        <Hr style={{ marginTop: 75, marginBottom: 13, height: 1, backgroundColor: "rgb(255,255,255)" }} />
        <FiltersGroup
          ref={(instance) => { this._filterGroup = instance as FiltersGroup | null; }}
          data={this.props.filtersData}
          onFilterSearch={this.props.onFilterSearch}
          style={{ flexDirection: "column" }}
          horizontal={false}
        >
          <Hr style={{ marginTop: 13, marginBottom: 13, height: 1, backgroundColor: "rgb(255,255,255)" }} />
        </FiltersGroup>
        <View style={{ width: "100%", height: 80, alignItems: "center", justifyContent: "center" }}>
          <ThemedTextButton
            theme="white"
            onPress={this.props.onClearFilters}
            text={I18n.t("clear_all_filters")}
          />
        </View>
      </CloseableBlurredModal>
    );
  }
}

const styles = StyleSheet.create({
  searchBar: {
    paddingHorizontal: 6,
    paddingTop: 6,
    paddingBottom: 5,

    borderRadius: 2,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    shadowColor: "rgba(0, 0, 0, 0.1)",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowRadius: 8,
    shadowOpacity: 1,
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.5)",
    width: "90%",
    alignSelf: "center",
  },
  searchBarText: {
    opacity: 0.5,
    fontFamily: "Muli",
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 2,
    color: "#676767",
  },
});
