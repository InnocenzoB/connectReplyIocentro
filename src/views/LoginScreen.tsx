import {
  FailTypes, ioCentroDispatch, ioCentroEndpoint, ioCentroEndpointParam,
  ioCentroEndpointType, ioCentroForgottenPasswordPayload, ioCentroRequest, ioCentroResult, ioCentroUtility,
} from "iocentro-connectivity";
import React, { Component } from "react";
import { Alert, Platform, StyleSheet } from "react-native";
import prompt from "react-native-prompt-android";
import { I18n } from "iocentro-apps-common-bits";

import { NavigationScreenProps } from "react-navigation";
import { AcceptCancelAlert } from "../components/AcceptCancelAlert";
import { Login } from "../components/login_screen/Login";
import { LoginPage } from "../components/login_screen/LoginPage";
import { Authenticator } from "../model/Authenticator";
import { resetTo } from "../navigation/CommonNavigation";
import { Dims, IS_TABLET } from "../Platform";
import { ConnectionStatus } from "../tools/ConnectionStatus";

interface LoginScreenState {
  alertVisible: boolean;
  alertTitle: string;
  alertMessage: string;
  loading: boolean;
}

export class LoginScreen extends Component<NavigationScreenProps<{}>, LoginScreenState> {

  constructor(props: NavigationScreenProps<{}>) {
    super(props);

    this.state = {
      alertVisible: false,
      alertTitle: "",
      alertMessage: "",
      loading: false,
    };
  }

  public componentWillMount() {
    Authenticator.signOut();
  }

  public render() {
    return (
      <LoginPage
        style={styles.container}
        headerMessage={I18n.t("enter_email_to_access")}
        loading={this.state.loading}>
        <AcceptCancelAlert
          isVisible={this.state.alertVisible}
          onClose={(_result) => { this._hideAlert(); }}
          title={this.state.alertTitle}
          text={this.state.alertMessage}
          acceptText={I18n.t("ok").toUpperCase()}
        />
        <Login
          onLogin={this._onLogin.bind(this)}
          onRegister={() => this.props.navigation.navigate("Register")}
          onForgotPassword={(email) => {
            prompt(
              I18n.t("forgot_password"),
              I18n.t("forgot_password_alert_message"),
              [
                { text: I18n.t("cancel"), onPress: () => { }, style: "cancel" },
                {
                  text: I18n.t("ok"), onPress: (str) => {
                    const endpoint = new ioCentroEndpoint(
                      new ioCentroEndpointParam(ioCentroEndpointType.forgottenPassword),
                      new ioCentroForgottenPasswordPayload(
                        str,
                      ),
                    );

                    ioCentroDispatch.request(
                      new ioCentroRequest(
                        endpoint,
                        (result: ioCentroResult): void => {
                          const success = ioCentroUtility.successResult(result);
                          const failure = ioCentroUtility.failureResult(result);

                          if (success) {
                            Alert.alert(Platform.OS == "ios" ? "" : " ", I18n.t("forgot_password_alert_message"));
                          }
                          if (failure) {
                            switch (failure.type) {
                              case FailTypes.Unknown: {
                                Alert.alert(Platform.OS == "ios" ? "" : " ", I18n.t("forgot_password_alert_failure",
                                  { value: I18n.t("Unknown") }));
                              }
                              case FailTypes.NetworkError: {
                                Alert.alert(Platform.OS == "ios" ? "" : " ", I18n.t("forgot_password_alert_failure",
                                  { value: I18n.t("NetworkError") }));
                              }
                              case FailTypes.Timeout: {
                                Alert.alert(Platform.OS == "ios" ? "" : " ", I18n.t("forgot_password_alert_failure",
                                  { value: I18n.t("Timeout") }));
                              }
                              case FailTypes.FailedHttpCode: {
                                Alert.alert(Platform.OS == "ios" ? "" : " ", I18n.t("forgot_password_alert_failure",
                                  { value: failure.code }));
                              }
                            }
                          }
                        },
                      ),
                    );
                  },
                },
              ],
              {
                defaultValue: email,
                placeholder: I18n.t("email_address"),
              },
            );
          }}
        />
      </LoginPage>
    );
  }

  private _onLogin(email: string, password: string, remember: boolean) {
    this.setState({ loading: true });

    if (ConnectionStatus.instance.getStatus()) {
      Authenticator.authenticate(email, password, remember).then(
        (res) => {
          this.setState({ loading: false });
          if (res) {
            resetTo("Tabs", this.props.navigation);
          } else {
            this._showAlert(I18n.t("login_failed"), I18n.t("wrong_email_or_passwprd"));
          }
        },
      ).catch(
        () => {
          this.setState({ loading: false });
          this._showAlert("Exception occured", "Hmm...");
        },
      );

    } else {
      this.setState({ loading: false });
      this._showAlert(I18n.t("devreg_wifi_connection_error_title"), I18n.t("devreg_wifi_connection_error_message"));
    }

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
    width: IS_TABLET ? Dims.scaleH(450) : Dims.scaleH(315),
  },
});
