import { I18n } from "iocentro-apps-common-bits";
import React, { Component } from "react";
import { Dimensions, Keyboard, LayoutAnimation, StyleSheet, TextInput, TextInputProperties, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import { Dims, IS_TABLET } from "../../Platform";
import { GradientTextButton } from "../Buttons";
import { Hr } from "../Hr";
import { KATextInput } from "../KATextInput";
import { TextScaledOnPhone } from "../ScaledText";
import { DescribedField } from "./Description";
import { LoginHr } from "./LoginHr";

interface RegisterProps {
  onNextPress?: () => void;

  firstName: string;
  surname: string;
  email: string;
  password1: string;
  password2: string;
  showHint: boolean;

  updateValue;
}

interface RegisterState {
  keyboardVisible: boolean;
  spacerHeight: number;
}

export class Register extends Component<RegisterProps, RegisterState> {
  private spacer;
  private spacerHeight;
  private _keyboardWillShow;
  private _keyboardWillHide;

  constructor(props: RegisterProps) {
    super(props);

    this.state = {
      keyboardVisible: false,
      spacerHeight: 0,
    };
  }

  public componentDidMount() {
    setTimeout(() => {
      this.spacer && this.spacer.measure((_fx, _fy, _width, _height, _px, py) => {
        this.spacerHeight = Math.max(Dimensions.get("window").height - py - 128, 0);
        this.setState({
          spacerHeight: this.spacerHeight,
        });
      });
    }, 0);
  }

  public componentWillMount() {
    this._keyboardWillShow = Keyboard.addListener("keyboardDidShow", () => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      this.setState({ spacerHeight: 50, keyboardVisible: true });
    });

    this._keyboardWillHide = Keyboard.addListener("keyboardDidHide", () => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      this.setState({ spacerHeight: this.spacerHeight, keyboardVisible: false });
    });
  }

  public componentWillUnmount() {
    this._keyboardWillShow.remove();
    this._keyboardWillHide.remove();
  }

  public render() {

    return (
      <View style={styles.container}>
        {IS_TABLET ?
          this._renderTablet(this.inputs()) :
          this._renderPhone(this.inputs())
        }
      </View>
    );
  }

  private _renderTablet(inputs: [JSX.Element, JSX.Element, JSX.Element, JSX.Element, JSX.Element]) {
    const [firstNameInput, surnameInput, emailInput, passwordInput1, passwordInput2] = inputs;
    return (
      <View style={{ height: "100%", alignItems: "center" }}>
        <KeyboardAwareScrollView
          showsVerticalScrollIndicator={false}
          extraScrollHeight={-200}
          contentContainerStyle={styles.inputsContainer}
          style={{ width: "100%" }}
        >

          <View style={styles.passwordRow}>
            <DescribedField description={I18n.t("first_name").toUpperCase()}>
              {firstNameInput}
            </DescribedField>

            <View style={{ width: Dims.scaleH(20) }} />

            <DescribedField description={I18n.t("last_name").toUpperCase()}>
              {surnameInput}
            </DescribedField>
          </View>

          <DescribedField
            style={{ flex: 0, marginTop: 15 }}
            description={I18n.t("email_address").toUpperCase()}>
            {emailInput}
          </DescribedField>

          <LoginHr style={{ marginTop: 20, width: "100%" }} />
          {this.props.showHint && <PasswordInstructions />}

          <View style={styles.passwordRow}>
            <DescribedField description={I18n.t("password").toUpperCase()}>
              {passwordInput1}
            </DescribedField>

            <View style={{ width: Dims.scaleH(20) }} />

            <DescribedField description={I18n.t("confirm_password").toUpperCase()}>
              {passwordInput2}
            </DescribedField>
          </View>
          <View style={{ height: this.state.spacerHeight }}
            ref={(view) => { this.spacer = view; }} />
          <View style={{ height: this.state.keyboardVisible ? 300 : 128, alignItems: "center" }}>
            <GradientTextButton
              theme="red"
              style={{ width: Dims.scaleH(180), height: Dims.scaleV(48) }}
              text={I18n.t("next").toUpperCase()}
              onPress={this.props.onNextPress}
            />
          </View>
        </KeyboardAwareScrollView>

      </View>
    );
  }

  private _renderPhone(inputs: [JSX.Element, JSX.Element, JSX.Element, JSX.Element, JSX.Element]) {
    const [firstNameInput, surnameInput, emailInput, passwordInput1, passwordInput2] = inputs;

    return (
      <View style={{ height: "100%", width: "100%" }}>
        <KeyboardAwareScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            justifyContent: "center",
            alignContent: "center",
            alignItems: "center",
            paddingHorizontal: 15,
          }}
          style={{ width: "100%" }}
        >
          <DescribedField
            style={{ width: "100%" }}
            description={I18n.t("first_name").toUpperCase()}>
            {firstNameInput}
          </DescribedField>

          <DescribedField
            style={{ width: "100%", marginTop: 15 }}
            description={I18n.t("last_name").toUpperCase()}>
            {surnameInput}
          </DescribedField>

          <DescribedField
            style={{ width: "100%", marginTop: 15 }}
            description={I18n.t("email_address").toUpperCase()}>
            {emailInput}
          </DescribedField>

          <Hr style={{
            alignSelf: "center",
            width: "100%",
            opacity: 0.2,
            backgroundColor: "#ffffff",
            marginVertical: 30,
          }} />
          {this.props.showHint && <PasswordInstructions />}

          <DescribedField
            style={{ width: "100%" }}
            description={I18n.t("password").toUpperCase()}>
            {passwordInput1}
          </DescribedField>

          <DescribedField
            style={{ width: "100%", marginTop: 15 }}
            description={I18n.t("confirm_password").toUpperCase()}>
            {passwordInput2}
          </DescribedField>

          <View style={{ marginVertical: 50, alignItems: "center" }}>
            <GradientTextButton
              theme="red"
              style={{ width: Dims.scaleH(180), height: Dims.scaleV(48) }}
              text={I18n.t("next").toUpperCase()}
              onPress={this.props.onNextPress}
            />
          </View>

        </KeyboardAwareScrollView>

      </View>
    );
  }

  private _onNextSubmit(input: TextInput | null) {
    if (input) {
      input.focus();
    }
  }

  private textInputsCommon: TextInputProperties = {
    style: styles.input,
    selectionColor: "white",
    multiline: false,
    autoCorrect: false,
    autoCapitalize: "none",
  };

  private inputs = (): [JSX.Element, JSX.Element, JSX.Element, JSX.Element, JSX.Element] => {
    return [
      <KATextInput
        {...this.textInputsCommon}
        onSubmitEditing={() => { this._onNextSubmit(this._surnameInput); }}
        returnKeyType={"next"}
        onChangeText={(text) => { this.props.updateValue("firstName", text); }}
        value={this.props.firstName}
      />,
      <KATextInput
        {...this.textInputsCommon}
        textInputRef={(input) => { this._surnameInput = input as TextInput | null; }}
        onSubmitEditing={() => { this._onNextSubmit(this._emailInput); }}
        returnKeyType={"next"}
        onChangeText={(text) => { this.props.updateValue("surname", text); }}
        value={this.props.surname}
      />,
      <KATextInput
        {...this.textInputsCommon}
        textInputRef={(input) => { this._emailInput = input as TextInput | null; }}
        keyboardType="email-address"
        onSubmitEditing={() => { this._onNextSubmit(this._passwordInput1); }}
        returnKeyType={"next"}
        onChangeText={(text) => { this.props.updateValue("email", text); }}
        value={this.props.email}
      />,
      <KATextInput
        {...this.textInputsCommon}
        textInputRef={(input) => { this._passwordInput1 = input as TextInput | null; }}
        secureTextEntry={true}
        returnKeyType={"next"}
        onSubmitEditing={() => { this._onNextSubmit(this._passwordInput2); }}
        onChangeText={(text) => { this.props.updateValue("password1", text); }}
        value={this.props.password1}
      />,
      <KATextInput
        {...this.textInputsCommon}
        textInputRef={(input) => { this._passwordInput2 = input as TextInput | null; }}
        secureTextEntry={true}
        returnKeyType={"done"}
        onSubmitEditing={() => { this.props.onNextPress!(); }}
        onChangeText={(text) => { this.props.updateValue("password2", text); }}
        value={this.props.password2}
      />,
    ];
  }

  private _surnameInput: TextInput | null;
  private _emailInput: TextInput | null;
  private _passwordInput1: TextInput | null;
  private _passwordInput2: TextInput | null;
}

const PasswordInstructions = () => {
  return (
    <View style={{ justifyContent: "center", marginBottom: IS_TABLET ? 0 : 30 }}>
      <TextScaledOnPhone style={styles.validPassword1}>
        {I18n.t("password_validation_title1").toUpperCase()}
      </TextScaledOnPhone>
      <TextScaledOnPhone style={styles.validPassword2}>
        {
          I18n.t("password_validation_info1")
        }
      </TextScaledOnPhone>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 74,
    width: "100%",
    paddingTop: 15,
    paddingHorizontal: 15,
  },
  passwordRow: {
    flexDirection: "row",
    width: "100%",
    marginTop: 15,
  },
  inputsContainer: {
    width: Dims.scaleH(628),
    alignSelf: "center",
  },
  validPassword1: {
    fontFamily: "Muli",
    fontSize: 11,
    fontWeight: "900",
    lineHeight: 28,
    letterSpacing: 2,
    color: "#ffffff",
  },
  validPassword2: {
    fontFamily: "Muli",
    fontSize: 14,
    fontStyle: "italic",
    lineHeight: 26,
    textAlign: "left",
    color: "#ffffff",
  },
  input: {
    flex: 1,
    fontFamily: "Muli",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 2,
    color: "#ffffff",
  },
});
