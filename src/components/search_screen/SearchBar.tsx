import React, { Component } from "react";
import { StyleSheet, View } from "react-native";

import { IconButton } from "../Buttons";

interface SearchBarProps {
  onClearPress?: () => void;
}

const searchbarXIcon = require("../../../img/search_screen/searchbarXIcon.png");

export class SearchBar extends Component<SearchBarProps, {}> {
  public render() {
    return (
      <View style={{flex: 1, justifyContent: "flex-end"}}>
      <View style={styles.container}>
        <View style={styles.marginContainer}/>
        <View style={styles.row}>
        {
          this.props.children
        }
        </View>
        <View style={styles.marginContainer}>
          <IconButton
            style={styles.closeButton}
            onPress={this.props.onClearPress}
            icon={searchbarXIcon}
            touchableExpand={10}
          />
        </View>
      </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    alignSelf: "flex-end",
    marginBottom: 7,
    width: 384,
    height: 36,
    borderRadius: 2,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
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
    justifyContent: "center",
    flexDirection: "row",
  },
  marginContainer: {
    width: 30,
  },
  row: {
    flex: 1,
  },
  closeButton: {
    marginRight: 11,
    marginTop: 10,
  },
});
