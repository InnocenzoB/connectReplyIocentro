import { I18n } from "iocentro-apps-common-bits";
import {
  ioCentroDispatch,
  ioCentroEndpoint,
  ioCentroEndpointParam,
  ioCentroEndpointType,
  ioCentroEndUserRegistrationPayload,
  ioCentroFailedResult,
  ioCentroRequest,
  ioCentroSuccessResult
} from "iocentro-connectivity";
import React, { Component } from "react";
import { StyleSheet, View } from "react-native";
import DeviceInfo from "react-native-device-info";
import { NavigationScreenProps } from "react-navigation";

import { AcceptCancelAlert } from "../components/AcceptCancelAlert";
import { RegisterAdditionalInfo } from "../components/login_screen/RegisterAdditionalInfo";
import { RegisterPage } from "../components/login_screen/RegisterPage";
import { AgreementsCodesInfo } from "../components/paper_modals/Agreements";
import { Authenticator } from "../model/Authenticator";
import { Configuration } from "../model/Configuration";
import { resetTo } from "../navigation/CommonNavigation";

const HTTP_STATUS_CODE_CONFLICT = 409;

interface RegisterScreenSecondSate {
  alertVisible: boolean;
  alertTitle: string;
  alertMessage: string;
  loading: boolean;

  address: string;
  addressOpt: string;
  city: string;
  state: string;
  province: string;
  country: string;
  phone: string;

  termsAgree: boolean;
  termsCodes?: AgreementsCodesInfo;
}

export class RegisterScreenSecond extends Component<
  NavigationScreenProps<{
    firstName: string;
    surname: string;
    email: string;
    password1: string;
  }>,
  RegisterScreenSecondSate
> {
  constructor(props) {
    super(props);

    this.state = {
      alertVisible: false,
      alertTitle: "",
      alertMessage: "",
      loading: false,

      address: "",
      addressOpt: "",
      city: "",
      state: "",
      province: "",
      country: "COUNTRYEMPTY",
      phone: "",

      termsAgree: false,
      termsCodes: undefined
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
          onBackArrowPress={() => {
            this.props.navigation.goBack();
          }}
          onPress={() => {}}
        >
          <AcceptCancelAlert
            isVisible={this.state.alertVisible}
            onClose={() => {
              this._hideAlert();
            }}
            title={this.state.alertTitle}
            text={this.state.alertMessage}
            acceptText={I18n.t("ok").toUpperCase()}
          />
          <RegisterAdditionalInfo
            onRegister={this._onRegister}
            updateValue={this.updateValue}
            address={this.state.address}
            addressOpt={this.state.addressOpt}
            city={this.state.city}
            state={this.state.state}
            province={this.state.province}
            country={this.state.country}
            phone={this.state.phone}
            termsAgree={this.state.termsAgree}
          />
        </RegisterPage>
      </View>
    );
  }

  private updateValue = (key: string, value: string) => {
    this.setState({ [key]: value } as any);
  }

  private _showAlert(title: string, message: string) {
    this.setState({
      alertVisible: true,
      alertTitle: title,
      alertMessage: message
    });
  }

  private _hideAlert() {
    this.setState({
      alertVisible: false,
      alertTitle: "",
      alertMessage: ""
    });
  }

  private readonly onVerificationError = (reason: string) => {
    this._showAlert(
      `${I18n.t("devreg_registration")} ${I18n.t("devreg_failed")}`,
      reason
    );
  };

  private _onRegister = () => {
    if (this.state.address.length == 0) {
      this.onVerificationError(I18n.t("address_empty"));
      return;
    }
    if (this.state.city.length == 0) {
      this.onVerificationError(I18n.t("city_empty"));
      return;
    }
    if (this.state.province.length == 0) {
      this.onVerificationError(I18n.t("province_empty"));
      return;
    }
    if (this.state.state.length == 0) {
      this.onVerificationError(I18n.t("state_empty"));
      return;
    }
    if (this.state.country == "COUNTRYEMPTY") {
      this.onVerificationError(I18n.t("country_empty"));
      return;
    }
    if (!this.state.termsAgree) {
      this.onVerificationError(I18n.t("you_must_agree_to_terms_and_privacy"));
      return;
    }

    this.createUser(
      this.props.navigation.state.params.email,
      this.props.navigation.state.params.password1,
      this.props.navigation.state.params.firstName,
      this.props.navigation.state.params.surname,
      this.state.country,
      this.props.navigation.state.params.email,
      this.state.address,
      this.state.city,
      "",
      this.state.termsCodes ? this.state.termsCodes.termOfUseCode : "",
      this.state.termsCodes ? this.state.termsCodes.selectedOptionCodes : [],
      this.state.phone
    );
  };

  // TODO verify sent data

  private createUser = (
    userName: string,
    password: string,
    firstName: string,
    lastName: string,
    countryIsoCode: string,
    email: string,
    address: string,
    city: string,
    zipCode: string,
    termOfUseCode: string,
    termOfUseChoices: string[],
    mobilePhone?: string
  ) => {
    const deviceCountry = DeviceInfo.getDeviceCountry();
    const deviceLanguage = DeviceInfo.getDeviceLocale().slice(0, 2);
    const appLanguage = Configuration.instance.getLanguageLimitedByAllowed();

    ioCentroDispatch.request(
      new ioCentroRequest(
        new ioCentroEndpoint(
          new ioCentroEndpointParam(ioCentroEndpointType.endUserRegistration),
          new ioCentroEndUserRegistrationPayload(
            userName,
            password,
            firstName,
            lastName,
            deviceLanguage || appLanguage,
            countryIsoCode || deviceCountry,
            email,
            address,
            city,
            zipCode,
            termOfUseCode,
            termOfUseChoices,
            mobilePhone
          )
        ),
        result => {
          if (result instanceof ioCentroSuccessResult) {
            this.onRegisterSuccess(email, password);
          } else if (result instanceof ioCentroFailedResult) {
            this.setState({ loading: false });
            if (result.code === HTTP_STATUS_CODE_CONFLICT) {
              this._showAlert(
                I18n.t("email_used_title"),
                I18n.t("email_used_message", { email })
              );
              return;
            }
            this.props.navigation.navigate("RegistrationFailed");
          }
        }
      )
    );

    this.setState({ loading: true });
  };

  private onRegisterSuccess = (email, password) => {
    Authenticator.authenticate(email, password, false)
      .then(res => {
        this.setState({ loading: false });
        if (res) {
          resetTo("Tabs", this.props.navigation);
        } else {
          this._showAlert(
            I18n.t("login_failed"),
            I18n.t("wrong_email_or_passwprd")
          );
        }
      })
      .catch(() => {
        this.setState({ loading: false });
        this._showAlert("Exception occured", "Hmm...");
      });
  };

  /*private onRegisterSuccess = () => {
    this.setState({ loading: false });
    this.props.navigation.navigate("RegisterSummary",
      {
        firstName: this.props.navigation.state.params.firstName,
        email: this.props.navigation.state.params.email,
        languageIsoCode: getISOCodeForLocale(),
      });
  }*/
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center"
  }
});
