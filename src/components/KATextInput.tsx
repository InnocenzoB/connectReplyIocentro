import React, { Component, Ref } from "react";
import { StyleSheet, TextInput, TextInputProperties } from "react-native";

import { PlatformSelect } from "../Platform";

export class KATextInput extends Component<TextInputProperties & { textInputRef?: Ref<TextInput> }> {
  public render() {
    const {
      style,
      textInputRef,
      ...textInputProps,
    } = this.props;

    const stylePadding = StyleSheet.flatten(style).padding;

    return (
      <TextInput
        style={[PlatformSelect({
          android: {
            paddingVertical: stylePadding || 0,
          },
        }), style]}
        ref={textInputRef as any}
        {...textInputProps}
      />
    );
  }
}
