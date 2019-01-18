import React, { Component } from "react";
import { StyleProp, StyleSheet, TextStyle, View, ViewStyle } from "react-native";

import { SearchFilter } from "../../model/Searcher";
import { ThemedTextButton } from "../Buttons";
import { FilterThemed } from "./Filter";

export interface FilterButtonData {
  filter: SearchFilter;
}

export interface FilterButtonCallbacks {
  onFilterPress?: (filter: SearchFilter) => void;
}

interface FilterButtonProps extends FilterButtonData, FilterButtonCallbacks, FilterThemed {
  style?: StyleProp<ViewStyle>;
}

export class FilterButton extends Component<FilterButtonProps, {}> {
  public render() {
    const { style, filter, onFilterPress, theme } = this.props;
    const active = filter.selected;

    let touchableStyle: StyleProp<ViewStyle> = active ? styles.whiteSolid : styles.whiteTransparent;
    let textStyle: StyleProp<TextStyle> = active ? styles.brownTxt : styles.whiteTxt;
    if (theme == "dark") {
      touchableStyle = active ? styles.greySolid : styles.greyTransparent;
      textStyle = active ? styles.whiteTxt : styles.greyTxt;
    }
    return (
      <View style={style}>
        <ThemedTextButton
          style={[styles.common, touchableStyle]}
          onPress={() => { onFilterPress && onFilterPress(filter); }}
          textStyle={textStyle}
          text={filter.name.toUpperCase()}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  common: {
    borderRadius: 2,
    shadowColor: "rgba(0, 0, 0, 0.1)",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowRadius: 8,
    shadowOpacity: 1,

    justifyContent: "center",
    alignItems: "center",
    paddingLeft: 5,
    paddingRight: 5,
    paddingTop: 1,
    paddingBottom: 2,
  },
  whiteSolid: {
    backgroundColor: "#ffffff",
  },
  whiteTransparent: {
    backgroundColor: "rgba(255, 255, 255, 0.5)",
  },
  greySolid: {
    backgroundColor: "#aeaeae",
  },
  greyTransparent: {
    backgroundColor: "rgba(174, 174, 174, 0.5)",
  },
  brownTxt: {
    color: "#836b58",
  },
  whiteTxt: {
    color: "#ffffff",
  },
  greyTxt: {
    color: "#969696",
  },
});
