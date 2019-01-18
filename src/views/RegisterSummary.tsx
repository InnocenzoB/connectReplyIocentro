import { I18n } from "iocentro-apps-common-bits";
import {
  ioCentroDispatch,
  ioCentroEndpoint,
  ioCentroEndpointParam,
  ioCentroEndpointType,
  ioCentroRequest,
  ioCentroResendRegistrationEmailPayload,
  ioCentroUtility,
} from "iocentro-connectivity";
import React, { Component } from "react";
import { StyleSheet, TextStyle, View } from "react-native";
import { NavigationScreenProps } from "react-navigation";

import { AcceptCancelAlert } from "../components/AcceptCancelAlert";
import { GradientTextButton } from "../components/Buttons";
import { LoginHr } from "../components/login_screen/LoginHr";
import { RegisterPage } from "../components/login_screen/RegisterPage";
import { TextScaledOnPhone } from "../components/ScaledText";
import { resetTo } from "../navigation/CommonNavigation";
import { Dims, IS_TABLET, PlatformSelect } from "../Platform";

interface RegisterSummarySate {
  alertVisible: boolean;
  alertTitle: string;
  alertMessage: string;
  loading: boolean;
}

interface RegisterSummaryNavigationParams {
  languageIsoCode: string;
  firstName: string;
  email: string;
}

export class RegisterSummary extends
  Component<NavigationScreenProps<RegisterSummaryNavigationParams>, RegisterSummarySate> {

  constructor(props) {
    super(props);

    this.state = {
      alertVisible: false,
      alertTitle: "",
      alertMessage: "",
      loading: false,

    };
  }

  public render() {
    return (
        <RegisterPage
          style={styles.container}
          hideDish={true}
          backArrow={true}
          headerMessage={""}
          loading={this.state.loading}
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
          <View style={{
            width: IS_TABLET ? Dims.scaleH(628) : "100%",
            padding: IS_TABLET ? 0 : 15, flex: 1, alignItems: "center",
          }}>
            <TextScaledOnPhone style={[styles.headerMessage]}>{I18n.t("registerSummaryMessage",
              {
                firstName: this.props.navigation.state.params.firstName,
                email: this.props.navigation.state.params.email,
              })}</TextScaledOnPhone>

            <TextScaledOnPhone style={[styles.boldMessage]}>{I18n.t("registerEmailNotReceived")}</TextScaledOnPhone>
            <GradientTextButton
              theme="lightGrey"
              style={{ width: 125, height: 44, marginBottom: 62 }}
              text={I18n.t("registerResendEmail")}
              onPress={() => {
                this._resendEmail(
                  this.props.navigation.state.params.languageIsoCode, this.props.navigation.state.params.email);
              }}
            />
            <LoginHr style={{ width: "100%", marginBottom: 27 }} />
            <TextScaledOnPhone style={[styles.headerMessage]}>{I18n.t("registerConfirmLater")}</TextScaledOnPhone>

          </View>
          <View style={{ height: IS_TABLET ? 128 : 100, alignItems: "center" }}>
            <GradientTextButton
              theme="red"
              style={{ width: Dims.scaleH(180), height: 44, marginBottom: 62 }}
              text={I18n.t("sign_out").toUpperCase()}
              onPress={() => { resetTo("Login", this.props.navigation); }}
            />
          </View>
        </RegisterPage>
    );
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

  private _resendEmail = (language: string, emailAddress: string) => {
    const endpoint = new ioCentroEndpoint(
      new ioCentroEndpointParam(ioCentroEndpointType.resendRegistrationEmail),
      new ioCentroResendRegistrationEmailPayload(
        language,
        emailAddress,
      ),
    );

    const request = new ioCentroRequest(
      endpoint,
      (result, _) => {
        const success = ioCentroUtility.successResult(result);
        if (success !== undefined) {
          this._showAlert(I18n.t("resendEmailSuccessTitle"), I18n.t("resendEmailSuccessMessage"));
        } else {
          this._showAlert(I18n.t("resendEmailErrorTitle"), I18n.t("resendEmailErrorMessage"));
        }
      },
    );

    ioCentroDispatch.request(request);
  }
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
  },

  headerMessage: {
    marginTop: 35,
    ...PlatformSelect<TextStyle>({
      anyTablet: {
        width: Dims.scaleH(555),
        fontSize: 16,
        lineHeight: 24,
        letterSpacing: 0.75,
      },
      anyPhone: {
        fontSize: 14,
        lineHeight: 20,
        letterSpacing: 0.5,
      },
    }),
    fontFamily: "Muli",
    color: "#ffffff",
    textAlign: "center",
  },

  boldMessage: {
    marginVertical: 27,
    fontFamily: "Muli",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 2,
    color: "#ffffff",
  },
});
