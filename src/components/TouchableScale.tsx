import React, { Component } from "react";
import {
  GestureResponderEvent,
  Insets,
  TouchableWithoutFeedback,
  TouchableWithoutFeedbackProperties,
  View,
} from "react-native";

import { RectangleInsets } from "./SearchBar";

export interface TouchableScaleProps extends TouchableWithoutFeedbackProperties {
  scaleFactor?: number; // default: 0.9
  touchableExpand?: number | Insets;
}

interface TouchableScaleState {
  inPress: boolean;
  disabled: boolean;
}

export class TouchableScale extends Component<TouchableScaleProps, TouchableScaleState> {
  public state = {
    inPress: false,
  };

  public render() {
    const {
      touchableExpand,
      scaleFactor,
      onPressIn, onPressOut,
      style,
      ...restTouchableProps,
    } = this.props;
    const { inPress } = this.state;

    let touchableExpandRect: RectangleInsets | undefined;
    if (touchableExpand != undefined) {
      if (typeof touchableExpand == "number") {
        touchableExpandRect = new RectangleInsets(touchableExpand);
      } else {
        touchableExpandRect = touchableExpand;
      }
    }

    return (
      <TouchableWithoutFeedback
        disabled={this.props.disabled}
        hitSlop={touchableExpandRect}
        pressRetentionOffset={touchableExpandRect}
        {...restTouchableProps}
        onPressIn={this.onPressIn}
        onPressOut={this.onPressOut}
      >
        <View
          children={this.props.children}
          style={[inPress && {
            transform: [{
              scale: scaleFactor === undefined ? 0.9 : scaleFactor,
            }],
          }, style]}
        />
      </TouchableWithoutFeedback>
    );
  }

  private onPressIn = (event: GestureResponderEvent) => {
    this.setState({ inPress: true });
    this.props.onPressIn && this.props.onPressIn(event);
  }
  private onPressOut = (event: GestureResponderEvent) => {
    this.setState({ inPress: false });
    this.props.onPressOut && this.props.onPressOut(event);
  }
}
