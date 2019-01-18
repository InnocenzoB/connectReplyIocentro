import React from "react";
import { StyleSheet, View } from "react-native";

import { SearchFilter } from "../../model/Searcher";
import { IS_TABLET } from "../../Platform";
import { ThemedTextButton } from "../Buttons";
import { TextScaledOnPhone } from "../ScaledText";

interface HintCallback {
  onPress?: (filter: SearchFilter) => void;
}

interface HintProps extends HintCallback {
  filter: SearchFilter;
}

export class Hint extends React.Component<HintProps, {}> {
  public render() {
    return (
      <ThemedTextButton
        theme="white"
        style={styles.filter}
        onPress={() => { this.props.onPress && this.props.onPress(this.props.filter); }}
        textStyle={styles.filterFont}
        text={this.props.filter.name.toUpperCase()}
      />
    );
  }
}

export interface SearchHintsData {
  title: string;
  filters: SearchFilter[];
}

class HintCategory extends React.Component<SearchHintsData & HintCallback, {}> {
  private _renderHintsList() {
    return this.props.filters.map((filter, index) => {
      return (
        <Hint
          key={index.toString()}
          filter={filter}
          onPress={this.props.onPress}
        />
      );
    });
  }

  public render() {
    return (
      <View style={styles.hintContainer}>
        <TextScaledOnPhone style={styles.title}>
          {this.props.title}
        </TextScaledOnPhone>
        <View style={styles.listContainer}>
          {
            this._renderHintsList()
          }
        </View>
      </View>
    );
  }
}

interface SearchHintsProps {
  data: SearchHintsData[];
  onPress?: (filter: SearchFilter) => void;
}

class HintsList extends React.Component<SearchHintsProps, {}> {
  public render() {
    return this.props.data.map((item, index) => {
      return (
        <HintCategory
          key={index.toString()}
          title={item.title}
          filters={item.filters}
          onPress={this.props.onPress}
        />
      );
    });
  }
}

export class SearchHints extends React.Component<SearchHintsProps, {}> {
  public render() {
    return (
      <View style={styles.container}>
        <HintsList
          data={this.props.data}
          onPress={this.props.onPress}/>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
  },
  hintContainer: {
    justifyContent: "center",
    alignItems: "center",
    width: "95%",
    marginTop: 8,
  },
  title: {
    opacity: 0.8,
    fontFamily: "Merriweather",
    fontSize: 14,
    fontWeight: "300",
    fontStyle: "italic",
    letterSpacing: 0.5,
    color: "#ffffff",
  },
  listContainer: {
    marginTop: 16,
    backgroundColor: "transparent",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  filter: {
    marginHorizontal: 15,
    marginBottom: IS_TABLET ? 20 : 7,
  },
  filterFont: {
    fontSize: IS_TABLET ? 16 : 14,
    lineHeight: 24,
  },
});
