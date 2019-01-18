import React, { Component } from "react";
import { View, ViewProperties } from "react-native";

export class Hr extends Component<ViewProperties> {
  public render() {
    const { style, ...attributes } = this.props;

    return (
      <View
        style={[{
          width: "100%",
          height: 2,
          backgroundColor: "#000000",
          opacity: 0.1,
        }, style]}
        {...attributes}
      />
    );
  }
}

export class FlexHr extends Component<ViewProperties> {
  public render() {
    const { style, ...attributes } = this.props;

    return (
      <View
        style={[{
          flex: 1,
          height: 2,
          backgroundColor: "#000000",
          opacity: 0.1,
        }, style]}
        {...attributes}
      />
    );
  }
}
