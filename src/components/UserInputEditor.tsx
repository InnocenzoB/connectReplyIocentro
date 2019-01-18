import { I18n } from "iocentro-apps-common-bits";
import React, { Component } from "react";
import { Keyboard, StyleProp, StyleSheet, TextInput, TextInputProperties, View, ViewStyle } from "react-native";

import { GradientTextButton, ThemedTextButton } from "../components/Buttons";
import { IS_TABLET } from "../Platform";
import { VerticalSpacer } from "./dashboard/Common";
import { FlexHr } from "./Hr";
import { KATextInput } from "./KATextInput";

export interface UserInputData {
  text: string;
  title?: string;
}

interface UserInputEditorProps {
  style?: StyleProp<ViewStyle>;
  initiallyFocused?: boolean;

  onCancel?: () => void;
  onSave?: (data: UserInputData) => void;
  cancelSaveButtonsOffset?: number;
  buttonsContainerStyle?: StyleProp<ViewStyle>;
  buttonsStyle?: StyleProp<ViewStyle>;
  saveButtonText?: string;
  clearOnSave?: true;

  onDelete?: () => void; // when not passed, delte button is not visible

  hasTitle?: boolean;
  initialTitle?: string;
  titleProps?: TextInputProperties;

  initialUserText?: string;
  userInputProps?: TextInputProperties;
  tapToEdit?: boolean;
  notEditingInputProps?: TextInputProperties;
}

interface UserInputEditorState extends UserInputData {
  editing?: boolean;
}

export class UserInputEditor extends Component<UserInputEditorProps, UserInputEditorState> {
  private _userTextInput: TextInput | null;
  private _titleTextInput: TextInput | null;

  constructor(props: UserInputEditorProps) {
    super(props);

    this.state = {
      text: props.initialUserText || "",
      title: props.initialTitle,
      editing: props.tapToEdit && false,
    };
  }

  public componentDidMount() {
    if (this.props.initiallyFocused) {
      this.initialFocus();
    }
  }

  // public componentWillReceiveProps(nextProps: UserInputEditorProps) {
  //   if (this.state.text != nextProps.initialUserText ||
  //     this.state.title != nextProps.initialTitle) {
  //     this.setState({
  //       text: nextProps.initialUserText || "",
  //       title: nextProps.initialTitle,
  //     });
  //   }
  // }

  public render() {
    const {
      style,
      tapToEdit,
      hasTitle,
      notEditingInputProps,
      userInputProps,
      titleProps,
      onDelete,
      onCancel,
      onSave,
      cancelSaveButtonsOffset,
      buttonsStyle,
      buttonsContainerStyle,
      saveButtonText,
      clearOnSave,
    } = this.props;

    const collapsed = tapToEdit === true && !this.state.editing;

    const textInputProps = (collapsed ? notEditingInputProps : userInputProps);
    let restTextInputProps = {};
    let onTextChangeText;
    let onTextFocus;
    let textStyle;

    if (textInputProps) {
      const {
        onChangeText,
        style: tStyle,
        onFocus,
        ...rest,
      } = textInputProps;
      restTextInputProps = rest;
      onTextChangeText = onChangeText;
      onTextFocus = onFocus;
      textStyle = tStyle;
    }

    let restTitleProps = {};
    let onTitleSubmitEditing;
    let onTitleChangeText;
    let titleStyle;
    if (titleProps) {
      const {
        onSubmitEditing,
        onChangeText,
        style: tStyle,
        ...rest,
      } = titleProps;
      restTitleProps = rest;
      onTitleSubmitEditing = onSubmitEditing;
      onTitleChangeText = onChangeText;
      titleStyle = tStyle;
    }

    return (
      <View>
        <View style={style}>
          {!collapsed && (hasTitle || onDelete) &&
            <View
              style={{
                flexDirection: "row",
                justifyContent: hasTitle ? undefined : "flex-end",
              }}>
              {hasTitle &&
                <KATextInput
                  textInputRef={(input) => this._titleTextInput = input as TextInput | null}
                  multiline={false}
                  autoCapitalize="words"
                  returnKeyType="next"
                  placeholder={I18n.t("title")}
                  placeholderTextColor="black"
                  value={this.state.title}
                  style={[styles.titleText, titleStyle]}
                  onChangeText={(text) => {
                    this.setState({ title: text });
                    onTitleChangeText && onTitleChangeText(text);
                  }}
                  onSubmitEditing={(event) => {
                    this._userTextInput && this._userTextInput.focus();
                    onTitleSubmitEditing && onTitleSubmitEditing(event);
                  }}
                  {...restTitleProps}
                />
              }
              {onDelete &&
                <DeleteButton
                  onPress={() => {
                    this.endEditing("clear");
                    onDelete && onDelete();
                  }}
                />
              }
            </View>
          }
          {!collapsed && (hasTitle || onDelete) &&
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <FlexHr style={{ marginBottom: 18 }} />
            </View>
          }
          <KATextInput
            textInputRef={(input) => this._userTextInput = input as TextInput | null}
            multiline={true}
            style={[styles.userInputText, textStyle]}
            value={this.state.text}
            onChangeText={(text) => {
              this.setState({ text });
              onTextChangeText && onTextChangeText(text);
            }}
            onFocus={() => {
              tapToEdit && this.beginEditing();
              onTextFocus && onTextFocus();
            }}
            {...(restTextInputProps)}
          />
          {!collapsed &&
            <VerticalSpacer height={cancelSaveButtonsOffset} />
          }
        </View>
        {!collapsed &&
          <CancelSaveButtons
            onCancel={() => {
              this.endEditing("reset");
              onCancel && onCancel();
            }}
            onSave={() => {
              this.endEditing(clearOnSave && "clear");
              onSave && onSave({
                text: this.state.text,
                title: this.state.title,
              });
            }}
            style={[{
              alignSelf: "center",
              position: "absolute",
              bottom: 0,
            }, buttonsContainerStyle]}
            saveButtonText={saveButtonText}
            buttonsStyle={buttonsStyle}
          />
        }
      </View>
    );
  }

  private beginEditing = () => {
    if (this.state.editing) {
      return;
    }
    this.setState({ editing: true }, this.initialFocus);
  }

  private initialFocus = () => {
    if (!(this.props.initialTitle)) {
      this._titleTextInput && this._titleTextInput.focus();
    } else {
      this._userTextInput && this._userTextInput.focus();
    }
  }

  private endEditing = (option?: "clear" | "reset") => {
    let { text, title } = this.state;
    if (option) {
      text = option == "clear" ? "" : this.props.initialUserText || "";
      title = option == "clear" ? undefined : this.props.initialUserText;
    }
    this._titleTextInput && this._titleTextInput.blur();
    this._userTextInput && this._userTextInput.blur();
    this.setState({ editing: false, text, title });
  }
}

const DeleteButton = ({ onPress }) => (
  <ThemedTextButton
    theme="red"
    onPress={onPress}
    text={I18n.t("delete").toUpperCase()}
  />
);

interface CancelSaveButtonsProps {
  onCancel?: () => void;
  onSave?: () => void;
  saveButtonText?: string;
  style?: StyleProp<ViewStyle>;
  buttonsStyle?: StyleProp<ViewStyle>;
}

const CancelSaveButtons = (props: CancelSaveButtonsProps) => (
  <View
    style={[{
      flexDirection: "row",
      justifyContent: "center",
    }, props.style]}>
    <GradientTextButton
      theme="white"
      disableReversing
      style={[{
        width: 125,
        height: 44,
      }, props.buttonsStyle]}
      text={I18n.t("cancel").toUpperCase()}
      onPress={() => {
        Keyboard.dismiss();
        props.onCancel && props.onCancel();
      }}
    />
    <GradientTextButton
      theme="red"
      disableReversing
      style={[{
        width: 125,
        height: 44,
        marginLeft: 20,
      }, props.buttonsStyle]}
      text={props.saveButtonText || I18n.t("save").toUpperCase()}
      onPress={() => {
        Keyboard.dismiss();
        props.onSave && props.onSave();
      }}
    />
  </View>
);

const styles = StyleSheet.create({
  userInputText: {
    padding: 15,
    paddingTop: 15,
    maxHeight: 170,

    borderRadius: 4,
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#d8d8d8",

    fontFamily: "Merriweather",
    fontSize: 14,
    fontStyle: "italic",
    color: "#676767",
  },
  titleText: {
    flex: 1,

    fontFamily: "Merriweather",
    fontSize: (IS_TABLET ? 24 : 20),
    fontWeight: "300",
    fontStyle: "italic",
    color: "#000000",
  },
});
