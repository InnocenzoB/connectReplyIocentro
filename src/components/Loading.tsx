import React, { Component } from "react";
import { ActivityIndicator, StyleProp, StyleSheet, View, ViewStyle } from "react-native";

interface LoadingProps {
  visible: boolean;
  style?: StyleProp<ViewStyle>;
  zIndex?: number;
}

export class Loading extends Component<LoadingProps> {
  public static defaultProps: LoadingProps = {
    visible: false,
    zIndex: 1,
  };

  public render() {
    if (!this.props.visible) { return null; }
    return (
      <View
        style={[
          StyleSheet.absoluteFillObject,
          {
            backgroundColor: "rgba(0, 0, 0, 0.25)",
            justifyContent: "center",
            alignItems: "center",
            zIndex: this.props.zIndex,
          },
          this.props.style,
        ]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }
}
