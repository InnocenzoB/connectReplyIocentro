import { I18n } from "iocentro-apps-common-bits";
import React, { Component } from "react";
import { Keyboard, StyleSheet, TextInput, TextInputProperties, View, ViewStyle } from "react-native";

import { Dims, IS_TABLET, PlatformSelect } from "../../Platform";
import { GradientTextButton, ThemedTextButton } from "../Buttons";
import { KATextInput } from "../KATextInput";
import { TextScaledOnPhone } from "../ScaledText";
import { CheckBox } from "./CheckBox";
import { DescribedField, Description } from "./Description";

interface LoginProps {
  onLogin?: (email: string, password: string, remember: boolean) => void;
  onRegister?: () => void;
  onForgotPassword?: (email: string) => void;
}

interface LoginState {
  rememberUser: boolean;
  email: string;
  password: string;
}

export class Login extends Component<LoginProps, LoginState> {
  constructor(props: LoginProps) {
    super(props);

    this.state = {
      rememberUser: false,
      email: __DEV__ ? "enzo@gmail.com" : "",
      password: __DEV__ ? "Asd123asd" : ""
    };
  }

  public render() {
    const textInputsCommon: TextInputProperties = {
      style: styles.input,
      multiline: false,
      selectionColor: "white",
      autoCorrect: false,
      autoCapitalize: "none",
    };

    return (
      <View style={styles.container}>
        <DescribedField
          style={styles.emailContainer}
          description={I18n.t("email_address").toUpperCase()}>
          <KATextInput
            returnKeyType={"next"}
            keyboardType="email-address"
            value={this.state.email}
            onSubmitEditing={this._onEmailSubmit.bind(this)}
            onChangeText={(email) => this.setState({ email })}
            {...textInputsCommon}
          />
        </DescribedField>

        <DescribedField
          style={styles.passwordContainer}
          customDescription={
            <Description style={{ opacity: undefined }}>
              <View style={{ opacity: 0.5 }}>
                <TextScaledOnPhone style={styles.inputDescription}>
                  {I18n.t("password").toUpperCase()}
                </TextScaledOnPhone>
              </View>
              <ThemedTextButton
                theme="white"
                onPress={this._onForgotPassword.bind(this)}
                text={I18n.t("forgot_password").toUpperCase()}
              />
            </Description>
          }>
          <KATextInput
            textInputRef={(input) => { this._passwordInput = input as TextInput | null; }}
            secureTextEntry={true}
            returnKeyType={"done"}
            value={this.state.password}
            onChangeText={(password) => this.setState({ password })}
            {...textInputsCommon}
            onSubmitEditing={() => { Keyboard.dismiss(); }}
          />
        </DescribedField>

        <Buttons
          rememberUser={this.state.rememberUser}
          onLogin={this._onLogin.bind(this)}
          onRegister={this._onRegister.bind(this)}
          onCheckPressed={this._onCheckPress.bind(this)}
        />
      </View>
    );
  }

  private _onCheckPress() {
    this.setState((prevState: LoginState) => {
      return { rememberUser: !prevState.rememberUser };
    });
  }

  private _onEmailSubmit() {
    if (this._passwordInput) {
      this._passwordInput.focus();
    }
  }

  private _onLogin() {
    if (this.props.onLogin) {
      this.props.onLogin(
        this.state.email,
        this.state.password,
        this.state.rememberUser,
      );
    }
  }

  private _onRegister() {
    if (this.props.onRegister) {
      this.props.onRegister();
    }
  }

  private _onForgotPassword() {
    if (this.props.onForgotPassword) {
      this.props.onForgotPassword(this.state.email);
    }
  }

  private _passwordInput: TextInput | null;
}

interface ButtonsProps {
  rememberUser: boolean;
  onLogin?: () => void;
  onRegister?: () => void;
  onCheckPressed?: () => void;
}

const Buttons = (props: ButtonsProps) => {
  const buttonStyle = IS_TABLET ?
    { width: Dims.scaleH(180), height: Dims.scaleV(48) }
    :
    { width: Dims.scaleH(140), height: Dims.scaleV(48) };
  return (
    <View style={styles.buttons}>

      <View style={styles.buttonsFlex}>
        <View style={styles.buttonsContainer}>
          <GradientTextButton
            theme="red"
            disableReversing
            style={buttonStyle}
            text={I18n.t("login").toUpperCase()}
            onPress={props.onLogin}
          />
          <GradientTextButton
            theme="whiteBordered"
            disableReversing
            style={buttonStyle}
            text={I18n.t("register").toUpperCase()}
            onPress={props.onRegister}
          />
        </View>
      </View>

      <View style={[styles.checkBoxFlex, { alignSelf: "baseline" }]}>
        <CheckBox
          text={I18n.t("remember_me").toUpperCase()}
          checked={props.rememberUser}
          onPress={props.onCheckPressed}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: IS_TABLET ? 1.71 : 2,
  },
  emailContainer: {
    justifyContent: IS_TABLET ? "flex-end" : "center",
  },
  passwordContainer: {
    ...PlatformSelect<ViewStyle>({
      anyTablet: {
        justifyContent: "flex-end",
      },
      anyPhone: {
        justifyContent: "center",
      },
    }),
    flex: 1,
  },
  inputDescription: {
    fontFamily: "Muli",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 2,
    color: "#ffffff",
  },
  input: {
    fontFamily: "Muli",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 2,
    color: "#ffffff",
  },
  buttons: {
    ...PlatformSelect<ViewStyle>({
      anyTablet: {
        flexDirection: "column",
        justifyContent: "flex-end",
        flex: 1.4,
      },
      anyPhone: {
        flexDirection: "column-reverse",
        justifyContent: "flex-start",
        flex: 1,
      },
    }),
  },
  buttonsFlex: {
    ...PlatformSelect<ViewStyle>({
      anyTablet: {
        flex: 1,
        justifyContent: "center",
      },
      anyPhone: {
        justifyContent: "flex-end",
      },
    }),
  },
  buttonsContainer: {
    flexDirection: IS_TABLET ? "row" : "row-reverse",
    justifyContent: "space-between",
  },
  checkBoxFlex: {
    ...PlatformSelect<ViewStyle>({
      anyPhone: {
        flex: 1,
        justifyContent: "center",
      },
    }),
  },
});
