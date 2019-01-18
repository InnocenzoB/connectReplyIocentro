import { BaseDeviceModel, DeviceStore, I18n } from "iocentro-apps-common-bits";
import { WhpOobConnectivity } from "iocentro-whp-oob-connectivity";
import React, { Component } from "react";
import {
  Dimensions,
  EmitterSubscription,
  Keyboard,
  LayoutAnimation,
  NativeEventEmitter,
  Platform,
  StyleSheet,
  TextInput,
  View,
  ViewStyle,
} from "react-native";
import SInfo from "react-native-sensitive-info";
import { NavigationScreenProps } from "react-navigation";

import { CookProcessorModel } from "../../model/CookProcessorModel";
import { P2P } from "../../model/P2P";
import { IS_TABLET, PlatformSelect } from "../../Platform";
import { AcceptCancelAlert } from "../AcceptCancelAlert";
import { KATextInput } from "../KATextInput";
import { CheckBox } from "../login_screen/CheckBox";
import { TextFieldWrapper } from "../my_account/MyAccount";
import { ApplianceWizardPage, Hr, WizardButton } from "./ApplianceWizardPage";

interface ConnectPhoneState {
  ssid: string;
  password: string;
  isRememberMeChecked: boolean;
  alertVisible: boolean;
  alertMessage: string;
  alertFailedVisible: boolean;
  areInputsVerified: boolean;
  keyboardVisible: boolean;
  spacerHeight: number;
}

interface ConnectPhoneParams {
  SSID: string;
  SAID: string;
  MAC: string;
}

type ConnectPhoneScreenProps = NavigationScreenProps<ConnectPhoneParams>;

export class ConnectPhone extends Component<ConnectPhoneScreenProps, ConnectPhoneState> {
  private oobConnectionEmitter = new NativeEventEmitter(WhpOobConnectivity);
  private subscription: EmitterSubscription;
  private navFocusListener;
  private navBlurListener;
  private isSubscribed: boolean = false;
  private navParams = this.props.navigation.state.params;
  private timeout;

  private spacer;
  private spacerHeight;
  private _keyboardWillShow;
  private _keyboardWillHide;

  private _passwordInput: TextInput | null;

  constructor(props) {
    super(props);

    this.setSubscription();

    this.state = {
      ssid: this.navParams.SSID,
      password: "",
      isRememberMeChecked: false,
      alertVisible: false,
      alertFailedVisible: false,
      alertMessage: "",
      areInputsVerified: false,
      keyboardVisible: false,
      spacerHeight: 0,
    };

    SInfo.getItem(this.navParams.SSID, {}).then((value) => {
      let rememberMe;
      let pwd;
      if (value) {
        pwd = value;
        rememberMe = true;
      } else {
        pwd = "";
        rememberMe = false;
      }
      this.setState({
        password: pwd,
        isRememberMeChecked: rememberMe,
      });
      this.veryfyInputs();
    });
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
    // @types does not yet support lates version and addListener causes err
    const navigation = this.props.navigation as any;
    this.navFocusListener = navigation.addListener(
      "willFocus",
      this.setSubscription,
    );
    this.navBlurListener = navigation.addListener(
      "didBlur",
      this.removeSubscription,
    );

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
    this.removeSubscription();
    this.navFocusListener.remove();
    this.navBlurListener.remove();
    this._keyboardWillShow.remove();
    this._keyboardWillHide.remove();
  }

  public render() {
    return (
      <ApplianceWizardPage
        title1={I18n.t("devreg_connect")} title2={I18n.t("devreg_phone")}
        header={I18n.t("devreg_connect_phone")}
        message={I18n.t("devreg_enter_wifi_passowrd_help")}
        scrollable={true}
        enableBounces={false}
        extraScrollHeight={200}
        {...this.props}>
        <Hr />
        {this.renderInputFields()}
        {this.renderConnectingAlert()}
        {this.renderConnectingFailed()}

        <View style={{ height: this.state.spacerHeight }}
          ref={(view) => { this.spacer = view; }} />
        <View style={{ height: 128, alignItems: "center" }}>
          <WizardButton
            text={I18n.t("next").toUpperCase()}
            active={this.state.areInputsVerified}
            onPress={this.onNextButtonPressed}
          />
        </View>
      </ApplianceWizardPage>
    );
  }
  private veryfyInputs = () => {
    if (this.state.ssid.length > 0 && this.state.password.length > 0) {
      this.setState({ areInputsVerified: true });
    } else {
      this.setState({ areInputsVerified: false });
    }
  }

  private renderInputFields = () => {
    const textInputsCommon = {
      style: styles.input,
      multiline: false,
      selectionColor: "black",
    };
    const TextFieldWrappersCommon = {
      textContainer: { width: IS_TABLET ? 340 : "100%", paddingHorizontal: Platform.OS == "ios" ? 20 : undefined },
      wrapperStyle: { marginHorizontal: 20 },
      headerStyle: { color: "rgba(0,0,0,0.8)" },
    };

    return (
      <View style={styles.container}>
        <View style={{ flexDirection: IS_TABLET ? "row" : undefined, width: "100%", justifyContent: "space-between" }}>
          <TextFieldWrapper header={I18n.t("devreg_network_label")}  {...TextFieldWrappersCommon}>
            <KATextInput {...textInputsCommon}
              returnKeyType={"next"}
              onChangeText={(text) => { this.setState({ ssid: text }, this.veryfyInputs); }}
              onSubmitEditing={() => { this._passwordInput && this._passwordInput.focus(); }}
              value={this.state.ssid}
            />
          </TextFieldWrapper>
          <TextFieldWrapper header={I18n.t("password")} {...TextFieldWrappersCommon}>
            <KATextInput {...textInputsCommon}
              textInputRef={(input) => { this._passwordInput = input as TextInput | null; }}
              returnKeyType={"next"}
              secureTextEntry={true}
              onChangeText={(text) => { this.setState({ password: text }, this.veryfyInputs); }}
              value={this.state.password}
            />
          </TextFieldWrapper>
        </View>
        <View style={styles.checkBoxFlex}>
          <CheckBox
            style={{ marginHorizontal: 20 }}
            text={I18n.t("remember_me")}
            checked={this.state.isRememberMeChecked}
            onPress={() => { this.setState({ isRememberMeChecked: !this.state.isRememberMeChecked }); }}
            textStyle={{ color: "rgba(0,0,0,0.8)" }}
          />
        </View>
      </View>
    );
  }

  private renderConnectingAlert = () => {
    return (
      <AcceptCancelAlert
        isVisible={this.state.alertVisible}
        onClose={(_result) => {
          // todo
          this.setState({ alertVisible: false });
        }}
        title={I18n.t("devreg_connecting_alert")}
        text={this.state.alertMessage}
        asInfoAlert={true}
        showAnimation={true}
      />
    );
  }

  private renderConnectingFailed = () => {
    return (
      <AcceptCancelAlert
        isVisible={this.state.alertFailedVisible}
        onClose={(_result) => {
          this.setState({ alertFailedVisible: false });
          if (this.state.isRememberMeChecked) {
            SInfo.setItem(this.state.ssid, this.state.password, {});
          } else {
            SInfo.deleteItem(this.state.ssid, {});
          }
          this.props.navigation.navigate("ConnectToWifiWpsCompatibile", {
            SAID: this.navParams.SAID,
            MAC: this.navParams.MAC,
          });
        }}
        title={I18n.t("devreg_wifi_connection_error_title")}
        text={I18n.t("devreg_wifi_connection_error_message")}
        acceptText={I18n.t("dismiss").toUpperCase()}
      />
    );
  }

  private onNextButtonPressed = () => {
    WhpOobConnectivity.transmitWifiData(this.state.ssid, this.state.password, this.navParams.SAID, this.navParams.MAC);
    this.setState({
      alertVisible: true,
      alertMessage: I18n.t("devreg_connecting_alert_message_1"),
    });
    this.timeout = setTimeout(this.connectionFailed, 60000);
  }

  private removeSubscription = () => {
    if (!this.isSubscribed) {
      return;
    }
    this.isSubscribed = false;
    this.subscription.remove();
  }

  private setSubscription = () => {
    if (this.isSubscribed) {
      return;
    }
    this.subscription = this.oobConnectionEmitter.addListener(
      "PROVISION_RESULT",
      this.onConnected,
    );
    this.isSubscribed = true;
  }

  private onConnected = () => {
    this.removeSubscription();
    clearTimeout(this.timeout);
    this.setState({
      alertMessage: I18n.t("devreg_connecting_alert_message_2"),
    });
    this.scheduleRegistrationAttempt();

    if (this.state.isRememberMeChecked) {
      SInfo.setItem(this.state.ssid, this.state.password, {});
    } else {
      SInfo.deleteItem(this.state.ssid, {});
    }
  }

  private scheduleRegistrationAttempt = (attempt: number = 0) => {
    const WPRSaid = "WPR" + this.navParams.SAID;

    this.setState({
      alertMessage: I18n.t("devreg_connecting_alert_message_2"),
    });

    const fetchDevices = (t: number = 0) => {
      this.setState({
        alertMessage: I18n.t("devreg_connecting_alert_message_3"),
      });

      DeviceStore.instance.update()
        .then(() => {
          const found: BaseDeviceModel[] = DeviceStore.instance.getDevices().filter((model) => {
            return model.activationCode.sv() == WPRSaid;
          });

          if (found.length == 0) {
            this.onRegistrationFailure();
            return;
          }

          if (!found[0].isClaimed.sv()) {
            if (t < 6) {
              setTimeout(() => { fetchDevices(t + 1); }, 5000);
            } else {
              this.onRegistrationFailure();
            }
          } else {
            if (DeviceStore.instance.getSelected() == null) {
              DeviceStore.instance.select(found[0]);

              P2P.doOneTimeInit(P2P.getDevicesList());
            }
            this.dismissAlert();
            this.props.navigation.navigate("FinalVerificationPage", {
              model: (found[0] as CookProcessorModel),
            });
          }
        });
    };

    CookProcessorModel._registerDevice(WPRSaid, this.navParams.MAC)
      .then(() => { fetchDevices(); },
        () => {
          if (attempt < 6) {
            setTimeout(() => { this.scheduleRegistrationAttempt(attempt + 1); }, 5000);
          } else {
            this.onRegistrationFailure();
          }
        });
  }

  private connectionFailed = () => {
    this.setState({
      alertVisible: false,
    });
    setTimeout(() => {
      this.setState({
        alertFailedVisible: true,
      });
    }, 500);
  }

  private dismissAlert = () => {
    this.setState({
      alertVisible: false,
    });
  }

  private onRegistrationFailure = () => {
    this.dismissAlert();
    this.props.navigation.navigate("RegistrationFailedPage");
  }

}
const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingHorizontal: IS_TABLET ? 140 : 0,
  },
  emailContainer: {
    justifyContent: IS_TABLET ? "flex-end" : "center",
  },
  input: {
    fontFamily: "Muli",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 2,
    color: "rgb(125,125,125)",
    textAlign: "left",
    height: "100%",
    marginLeft: 19,
    marginRight: 19,
  },
  checkBoxFlex: {
    ...PlatformSelect<ViewStyle>({
      anyTablet: {
        justifyContent: "flex-end",
        marginTop: 30,
      },
      anyPhone: {
        flex: 1,
        justifyContent: "center",
        marginTop: 20,
        marginBottom: 70,
      },
    }),
  },
});
