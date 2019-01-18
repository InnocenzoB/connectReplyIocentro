import {ENABLE_ENV_SWITCHING } from "./Platform";
if(ENABLE_ENV_SWITCHING){
  var TestFairy = require('react-native-testfairy');
  var _testfairyConsoleLog = console.log;
  console.log = function(message) {
      _testfairyConsoleLog(message);
      TestFairy.log(message);
  }
}

import { I18n } from "iocentro-apps-common-bits";
import React, { Component } from "react";
import { AppState, Platform, Text, TextInput, View } from "react-native";
import Orientation from "react-native-orientation";
import { NavigationRouteConfigMap, StackNavigator } from "react-navigation";
import PushNotification from 'iocentro-patched-react-native-push-notification-ce';

import { AgreementsModal, AgreementsModalCallback } from "./components/paper_modals/Agreements";
import { HtmlModal, HtmlModalData } from "./components/paper_modals/Html";
import { Authenticator } from "./model/Authenticator";
import { Configuration } from "./model/Configuration";
import { P2P } from "./model/P2P";
import { commonSignedInNavRoutes, RegisterTopNavigator } from "./navigation/CommonNavigation";
import { HomeTabsWrapper } from "./navigation/HomeTabsWrapper";
import { PhoneNavigator } from "./navigation/PhoneNavigatorWrapper";
import { IS_TABLET } from "./Platform";
import { ApplianceWizardScreens } from "./views/ApplianceWizard";
import { LoadingScreen } from "./views/LoadingScreen";
import { LoginScreen } from "./views/LoginScreen";
import { LogOutScreen } from "./views/LogOutScreen";
import { RegisterScreen } from "./views/RegisterScreen";
import { RegisterScreenSecond } from "./views/RegisterScreenSecond";
import { RegisterSummary } from "./views/RegisterSummary";
import { RegistrationFailed } from "./views/RegistrationFailed";

const signedOutRoutes: NavigationRouteConfigMap = {
  Login: { screen: LoginScreen },
  Register: { screen: RegisterScreen },
  RegisterSecond: { screen: RegisterScreenSecond },
  RegisterSummary: { screen: RegisterSummary },
  RegistrationFailed: { screen: RegistrationFailed },
};

let _AgreementsModal: AgreementsModal | null = null;
let _HtmlModal: HtmlModal | null = null;

export function ShowAgreements(callback: AgreementsModalCallback) {
  if (_AgreementsModal) {
    _AgreementsModal.show(callback);
  }
}

export function DisplayHtml(htmlModalData: HtmlModalData) {
  if (!_HtmlModal) {
    return;
  }
  _HtmlModal.show(htmlModalData);
}

export function GetTermsData(): HtmlModalData {
  return {
    title1: I18n.t("terms_title1"),
    title2: I18n.t("terms_title2"),
    content: I18n.t("terms_content"),
  };
}

export function GetPrivacyPolicyData(): HtmlModalData {
  return {
    title1: I18n.t("privacy_title1"),
    title2: I18n.t("privacy_title2"),
    content: I18n.t("privacy_content"),
  };
}

export function ShowTerms() {
  DisplayHtml(GetTermsData());
}

export function ShowPrivacyPolicy() {
  DisplayHtml(GetPrivacyPolicyData());
}

interface AppInternalState {
  initiallySignedIn: boolean;
  checkedSignedIn: boolean;
}

export default class App extends Component<{}, AppInternalState> {
  constructor(props: any) {
    super(props);
    this.state = {
      initiallySignedIn: false,
      checkedSignedIn: false,
    };

    if (!Text.defaultProps) {
      Text.defaultProps = {};
    }
    Text.defaultProps.allowFontScaling = false; // Disallow dynamic type on iOS
    if (!TextInput.defaultProps) {
      TextInput.defaultProps = {};
    }
    // @ts-ignore @types does not have allowFontScaling
    TextInput.defaultProps.allowFontScaling = false; // Disallow dynamic type on iOS
    TextInput.defaultProps.underlineColorAndroid = "transparent";

    // Disable animation as it was producing crashes BIOT-9893
    // UIManager.setLayoutAnimationEnabledExperimental &&
    //   UIManager.setLayoutAnimationEnabledExperimental(true);

    Configuration.instance.init();
  }

  public componentWillMount() {
    Authenticator.isAuthenticated().then(
      (authenticated) => {
        this.setState({
          initiallySignedIn: authenticated,
          checkedSignedIn: true,
        });
      });
    if(ENABLE_ENV_SWITCHING){
    TestFairy.begin('e11b46176d608e08f4950e2f67ef00e75aa977b1');
    }
  }

  public componentDidMount() {
    AppState.addEventListener("change", this._handleAppStateChange);
    PushNotification.appStart();

    if (Platform.OS == "android") {
      if (IS_TABLET) {
        Orientation.lockToLandscape();
      } else {
        Orientation.lockToPortrait();
      }
    }
  }

  public componentWillUnmount() {
    AppState.removeEventListener("change", this._handleAppStateChange);
  }

  public render() {
    if (!this.state.checkedSignedIn) {
      return <LoadingScreen />;
    }

    const Root = StackNavigator({
      Tabs: { screen: IS_TABLET ? HomeTabsWrapper : PhoneNavigator },
      LogOut: { screen: LogOutScreen },
      ...signedOutRoutes,
      ...(IS_TABLET ? commonSignedInNavRoutes : {}),
      ...ApplianceWizardScreens,
    }, {
      initialRouteName: this.state.initiallySignedIn ? "Tabs" : "Login",
      headerMode: "none",
      navigationOptions: {
        gesturesEnabled: false,
      },
    });

    return (
      <View style={{ flex: 1 }}>
        <Root
          ref={(navigatorRef) => {
            RegisterTopNavigator(navigatorRef);
          }}
        />
        <AgreementsModal ref={(instance) => { _AgreementsModal = instance; }} />
        <HtmlModal ref={(instance) => { _HtmlModal = instance; }} />
      </View>
    );
  }

  private _handleAppStateChange = (nextAppState) => {
    if (nextAppState === "background" || nextAppState === "inactive") {
      P2P.stopP2P();
    } else if (nextAppState === "active") {
      P2P.restartP2P();
    }
  }
}
