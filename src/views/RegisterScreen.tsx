import { I18n } from "iocentro-apps-common-bits";
import React, { Component } from "react";
import { LayoutAnimation, StyleSheet, View } from "react-native";
import { NavigationScreenProps } from "react-navigation";

import { AcceptCancelAlert } from "../components/AcceptCancelAlert";
import { Register } from "../components/login_screen/Register";
import { RegisterPage } from "../components/login_screen/RegisterPage";
import { validateEmail, verifyPassword } from "../Utils";

interface RegisterScreenSate {
  alertVisible: boolean;
  alertTitle: string;
  alertMessage: string;
  loading: boolean;

  firstName: string;
  surname: string;
  email: string;
  password1: string;
  password2: string;
  showHint: boolean;
}

export class RegisterScreen extends Component<NavigationScreenProps<{}>, RegisterScreenSate> {
  constructor(props: NavigationScreenProps<{}>) {
    super(props);

    this.state = {
      alertVisible: false,
      alertTitle: "",
      alertMessage: "",
      loading: false,
      firstName: "",
      surname: "",
      email: "",
      password1: "",
      password2: "",
      showHint: false,
    };
  }

  public render() {
    return (
      <View>
        <RegisterPage
          style={styles.container}
          hideDish={true}
          backArrow={true}
          loading={this.state.loading}
          headerMessage={I18n.t("enter_email_to_save")}
          onBackArrowPress={() => { this.props.navigation.goBack(); }}
          onPress={() => { }}
        >
          <AcceptCancelAlert
            isVisible={this.state.alertVisible}
            onClose={() => { this._hideAlert(); }}
            title={this.state.alertTitle}
            text={this.state.alertMessage}
            acceptText={I18n.t("ok").toUpperCase()}
          />
          <Register
            firstName={this.state.firstName}
            surname={this.state.surname}
            email={this.state.email}
            password1={this.state.password1}
            password2={this.state.password2}
            showHint={this.state.showHint}
            updateValue={this.updateValue}
            onNextPress={this.onNextPress}
          />
        </RegisterPage>
      </View>
    );
  }

  private updateValue = (key: string, value: string) => {
    this.setState({ [key]: value } as any);
  }

  private onNextPress = () => {

    if (this.state.firstName.length == 0) {
      this.onVerificationError(I18n.t("name_surname_empty"));
      return;
    }

    if (this.state.surname.length == 0) {
      this.onVerificationError(I18n.t("name_surname_empty"));
      return;
    }

    if (this.state.email.length == 0) {
      this.onVerificationError(I18n.t("email_empty"));
      return;
    } else if (!validateEmail(this.state.email)) {
      this.onVerificationError(I18n.t("email_invalid"));
      return;
    }

    if (this.state.password1.length == 0) {
      this.onVerificationError(I18n.t("password_empty"));
      return;
    } else if (this.state.password1 != this.state.password2) {
      this.onVerificationError(I18n.t("passwords_different"));
      return;
    } else if (!verifyPassword(this.state.password1)) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      this.setState({ showHint: true });
      return;
    }

    this.props.navigation.navigate("RegisterSecond", {
      firstName: this.state.firstName,
      surname: this.state.surname,
      email: this.state.email,
      password1: this.state.password1,
      password2: this.state.password2,
      showHint: this.state.showHint,
    });
  }

  private readonly onVerificationError = (reason: string) => {
    this._showAlert(`${I18n.t("devreg_registration")} ${I18n.t("devreg_failed")}`, reason);
  }

  private _showAlert(title: string, message: string) {
    this.setState({
      alertVisible: true,
      alertTitle: title,
      alertMessage: message,
    });
  }

  private _hideAlert() {
    this.setState({
      alertVisible: false,
      alertTitle: "",
      alertMessage: "",
    });
  }

}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
  },
});
