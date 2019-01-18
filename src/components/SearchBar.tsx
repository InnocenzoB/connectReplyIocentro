import { I18n } from "iocentro-apps-common-bits";
import React, { Component } from "react";
import {
  ImageRequireSource,
  ImageStyle,
  ImageURISource,
  Insets,
  StyleProp,
  TextInput,
  TextInputProperties,
  View,
  ViewStyle,
} from "react-native";

import { IS_TABLET } from "../Platform";
import { IconButton, IconButtonProps } from "./Buttons";
import { KATextInput } from "./KATextInput";

export class RectangleInsets implements Insets {
  public top?: number;
  public left?: number;
  public bottom?: number;
  public right?: number;

  constructor(x: number, y: number | undefined = x) {
    this.left = this.right = x;
    this.top = this.bottom = y;
  }
}

export interface SearchBarProps extends TextInputProperties {
  /**
   * Style of the view containing TextInput and icons.
   */
  barStyle?: StyleProp<ViewStyle>;

  /**
   * If not specified icon is not added.
   */
  clearIcon?: ImageURISource | ImageRequireSource;

  /**
   * Called when clearIcon is pressed as there is no onChangeText in such case.
   */
  onClear?: () => void;

  /**
   * Whether the text should be cleared on text submit (no onClear is called then).
   */
  clearOnSubmit?: boolean;

  /**
   * Expands the TextInput and icons touchable region.
   */
  touchableExpandSize?: number;

  leftIcon?: ImageURISource | ImageRequireSource;
  leftIconStyle?: StyleProp<ImageStyle>;
  onLeftButtonClick?: () => void;

  rightIcon?: ImageURISource | ImageRequireSource;
  onRightButtonClick?: () => void;

  textInputRef?: (instance: TextInput | null) => any;
}

export class SearchBar extends Component<SearchBarProps> {
  private _textInput: TextInput | null;

  public render() {
    const {
      barStyle,
      style: textInputStyle,
      rightIcon,
      onRightButtonClick,
      leftIcon,
      leftIconStyle,
      onLeftButtonClick,
      touchableExpandSize,
      clearIcon,
      onClear,
      clearOnSubmit,
      onSubmitEditing,
      textInputRef,
      ...attributes,
    } = this.props;

    let touchableExpandRect;
    if (touchableExpandSize != undefined) {
      touchableExpandRect = new RectangleInsets(touchableExpandSize);
    }

    const clearButton = clearIcon && (
      <CenteredIconButton
        onPress={() => {
          this._textInput && this._textInput.clear();
          this._textInput && this._textInput.focus();
          onClear && onClear();
        }}
        icon={clearIcon}
        touchableExpand={touchableExpandRect}
        style={{ marginRight: (this.props.rightIcon) ? this.props.touchableExpandSize : 0 }}
      />
    );

    const _renderClearButton = (): JSX.Element | undefined | 0 => {
      if (IS_TABLET) {
        return clearButton;
      } else if (this.props.value != "") {
        return clearButton;
      }
      return undefined;
    };

    const rightButton = rightIcon && (
      <CenteredIconButton
        onPress={onRightButtonClick}
        icon={rightIcon}
        touchableExpand={touchableExpandRect}
      />
    );

    const leftButton = leftIcon && (
      <CenteredIconButton
        onPress={onLeftButtonClick}
        icon={leftIcon}
        touchableExpand={touchableExpandRect}
        style={{ marginRight: touchableExpandSize}}
        iconStyle={leftIconStyle}
      />
    );

    return (
      <View style={barStyle}>
        <View style={{ flexDirection: "row", alignItems: "center", width: "100%" }}>
          {leftButton}
          <KATextInput
            hitSlop={touchableExpandRect}
            textInputRef={(component) => {
              this._textInput = component as TextInput | null;
              textInputRef && textInputRef(this._textInput);
            }}
            style={[{
              flex: 1,
            }, textInputStyle]}
            autoFocus={false}
            placeholder={I18n.t("input_search_phrase")}
            returnKeyType={"done"}
            onSubmitEditing={(event) => {
              clearOnSubmit && this._textInput && this._textInput.clear();
              onSubmitEditing && onSubmitEditing(event);
            }}
            {...attributes}
          />
          {_renderClearButton()}
          {rightButton}
        </View>
      </View>
    );
  }
}

const CenteredIconButton = (props: IconButtonProps) => (
  <IconButton
    centered
    {...props}
  />
);
