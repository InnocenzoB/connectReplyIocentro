import { I18n } from "iocentro-apps-common-bits";
import { WhpOobConnectivity } from "iocentro-whp-oob-connectivity";
import React, { Component, ReactNode } from "react";
import { Image, View } from "react-native";
import Camera from "react-native-camera";
import { NavigationScreenProps } from "react-navigation";

import { IS_TABLET } from "../../Platform";
import { AcceptCancelAlert } from "../AcceptCancelAlert";
import { ThemedTextButton } from "../Buttons";
import { KATextInput } from "../KATextInput";
import { TextScaledOnPhone } from "../ScaledText";
import {
  ApplianceWizardButton,
  ApplianceWizardPage,
  ApplianceWizardPageProps,
  ApplianceWizardPageState,
  AppWizardStyles,
  Hr,
  List,
  ListItem,
} from "./ApplianceWizardPage";

const saidLabel = require("../../../img/appliance_wizard/saidLabel.png");

interface ApplianceWizardPageWithScannerProps extends ApplianceWizardPageProps {
  onQRCodeScanned: (x: any) => void;
}

interface ApplianceWizardPageWithScannerState extends ApplianceWizardPageState {
  frameColor: string;
  isScreenActive: boolean;
}

export class ApplianceWizardPageWithScanner extends
  ApplianceWizardPage<ApplianceWizardPageWithScannerProps, ApplianceWizardPageWithScannerState> {
  public navFocusListener;
  public navBlurListener;
  public isQRScanningActive = true;

  constructor(props) {
    super(props);
    this.state = {
      frameColor: "white",
      isScreenActive: true,
    };
  }

  public componentDidMount() {
    // @types does not yet support lates version and addListener causes err
    const navigation = this.props.navigation as any;
    this.navFocusListener = navigation.addListener(
      "willFocus",
      this.onScreenFocused,
    );
    this.navBlurListener = navigation.addListener(
      "didBlur",
      this.onScreenBlur,
    );
  }

  public componentWillUnmount() {
    this.navFocusListener.remove();
    this.navBlurListener.remove();
  }

  private onScreenFocused = () => {
    this.setState({
      frameColor: "white",
      isScreenActive: true,
    });
    this.isQRScanningActive = true;
  }

  private onScreenBlur = () => {
    this.setState({
      frameColor: "white",
      isScreenActive: false,
    });
    this.isQRScanningActive = false;
  }

  protected _renderScanner() {
    if (!this.state.isScreenActive) {
      return null;
    }
    return (
      <Camera
        style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        aspect={Camera.constants.Aspect.fill}
        barCodeTypes={[Camera.constants.BarCodeType.qr]}
        onBarCodeRead={(e) => {
          if (this.isQRScanningActive) {
            this.isQRScanningActive = false;
            this.setState({
              frameColor: "rgb(3,192,60)",
            });
            this.props.onQRCodeScanned(e);
          }
        }}
      >
        {this.renderFrame(this.state.frameColor)}
      </Camera>
    );
  }

  private renderFrame = (color: string) => {
    const renderCorner = (rotation) => {
      return (
        <View style={[{ width: 50, height: 50, transform: [{ rotate: rotation }] }]}>
          <View style={{ position: "absolute", width: 50, height: 12, backgroundColor: color }} />
          <View style={{ position: "absolute", width: 12, height: 50, backgroundColor: color }} />
        </View>
      );
    };

    return (
      <View style={{ width: "90%", maxWidth: 300, height: "60%", maxHeight: 200, justifyContent: "space-between" }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", width: "100%", height: 50 }}>
          {renderCorner("0deg")}
          {renderCorner("90deg")}
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-between", width: "100%", height: 50 }}>
          {renderCorner("-90deg")}
          {renderCorner("180deg")}
        </View>
      </View>
    );
  }
}
/*
type AlertType =
  "worngCodeScanned" | "worngCodeEntered" |
  "wrongMode" | "accountLocked" | "incompatibleRouterSettings" |
  "connectionError" | "invalidEntry" | "errorCheck1" | "errorCheck2" |
  "checkYourRouter" | "checkYourFirewall";
*/
interface AlertData {
  title: string;
  text?: string;
  cancelText: string;
  acceptText?: string; // default: "TRY AGAIN"
  children?: ReactNode;
}

interface ScanSaidPageState {
  alertData: AlertData;
  alertVisible: boolean;
  ssid: string;
}

export class ScanSaidPage extends Component<NavigationScreenProps<{}>, ScanSaidPageState> {

  constructor(props) {
    super(props);
    this.state = {
      alertVisible: false,
      ssid: "",
      alertData: {
        title: "",
        text: "",
        cancelText: "",
        children: null,
      },
    };
    WhpOobConnectivity.getNetworkSSID((_, res) => {
      this.setState({ ssid: res.SSID });
    });
    // this._nextAlert = this._getNextAlertType();
  }

  /*
    // TODO remove
    private _nextAlert: IterableIterator<AlertType>;

    // TODO remove
    private *_getNextAlertType(): IterableIterator<AlertType> {
      yield "checkYourFirewall";
      yield "checkYourRouter";
      yield "errorCheck1";
      yield "errorCheck2";
      yield "invalidEntry";
      yield "connectionError";
      yield "incompatibleRouterSettings";
      yield "accountLocked";
      yield "worngCodeScanned";
      yield "worngCodeEntered";
      yield "wrongMode";
    }
  */

  private onQRScanned = (e: any) => {
    const message = (e.data as string);
    const SAID = message.substring(message.indexOf("SAID=") + 5, message.indexOf(";"));
    const MAC = message.substring(message.indexOf("MAC=") + 4,
      message.indexOf(";", message.indexOf(";") + 1));
    this.props.navigation.navigate("ConnectPhone", {
      SAID,
      MAC,
      SSID: this.state.ssid,
    });
  }

  public render() {
    return (
      <ApplianceWizardPageWithScanner
        title1={I18n.t("devreg_scan")} title2="SAID"
        header={I18n.t("devreg_scan_said_details")}
        message={I18n.t("devreg_scan_said_help")}
        onQRCodeScanned={this.onQRScanned}
        hasScanner={true}
        {...this.props}
      >
        <AcceptCancelAlert
          isVisible={this.state.alertVisible}
          onClose={(_result) => {
            // todo
            this.setState({ alertVisible: false });
          }}
          title={this.state.alertData.title}
          text={this.state.alertData.text}
          acceptText={this.state.alertData.acceptText || I18n.t("try_again").toUpperCase()}
          cancelText={this.state.alertData.cancelText}
        >
          {this.state.alertData.children}
        </AcceptCancelAlert>
        <Image source={saidLabel} style={{ width: IS_TABLET ? 350 : 300, height: IS_TABLET ? 82.1 : 70 }} />
        <View style={{
          flexDirection: "row",
          justifyContent: "space-around",
          width: "100%", paddingHorizontal: IS_TABLET ? 240 : 20,
          marginTop: 20,
        }}>
          <ThemedTextButton
            theme="red"
            style={{ marginRight: 20, maxWidth: "48%" }}
            onPress={() => { this.props.navigation.navigate("CantFindCodePage"); }}
            textStyle={[AppWizardStyles.link, { textAlign: "center" }]}
            text={I18n.t("devreg_scan_cant_find_code").toUpperCase()}
          />
          <ThemedTextButton
            theme="red"
            style={{ maxWidth: "48%" }}
            onPress={() => { this.props.navigation.navigate("ManuallyEnterCode"); }}
            text={I18n.t("devreg_scan_enter_manually").toUpperCase()}
            textStyle={[AppWizardStyles.link, { textAlign: "center" }]}
          />
        </View>
      </ApplianceWizardPageWithScanner >
    );
  }

  /*
  private _showAlert(type: AlertType) {
    this.setState({ alertVisible: true, alertData: ALERT_DATA[type] });
  }
  */
}

export class CantFindCodePage extends
  Component<NavigationScreenProps<{}>, {}> {
  public render() {
    return (
      <ApplianceWizardPage
        title1={I18n.t("devreg_said_label")} title2={I18n.t("devreg_said_location")}
        message={I18n.t("devreg_enter_said_help")}
        buttons={ApplianceWizardButton.Scan}
        buttonPressed={() => this.props.navigation.goBack()}
        {...this.props}>
        <Hr />
        <List style={{ width: 482, maxWidth: "86%" }}>
          <ListItem>{I18n.t("devreg_said_find_steps_1")}</ListItem>
          <ListItem>{I18n.t("devreg_said_find_steps_2")}</ListItem>
          <ListItem>{I18n.t("devreg_said_find_steps_3")}</ListItem>
          <ListItem>{I18n.t("devreg_said_find_steps_4")}</ListItem>
          <ListItem>{I18n.t("devreg_said_find_steps_5")}</ListItem>
        </List>
      </ApplianceWizardPage>
    );
  }
}

export class ManuallyEnterCode extends Component<NavigationScreenProps<{}>,
  { ssid: string, said: string, isSAIDVerified: boolean }> {
  constructor(props) {
    super(props);
    WhpOobConnectivity.getNetworkSSID((_, res) => {
      this.setState({
        ssid: res.SSID || "",
      });
    });
    this.state = {
      ssid: "",
      said: "",
      isSAIDVerified: false,
    };
  }

  public render() {
    return (
      <ApplianceWizardPage
        ref="ApplianceWizardPage"
        title1={I18n.t("devreg_enter")} title2="SAID"
        message={I18n.t("devreg_enter_said_help")}
        buttons={ApplianceWizardButton.Next}
        buttonDisabled={!this.state.isSAIDVerified}
        scrollable={true}
        resetToChords={IS_TABLET ? undefined : { x: 0, y: 150 }}
        extraScrollHeight={185}
        buttonPressed={this.onButtonPress}
        {...this.props}>
        <Hr />
        <List style={{ width: 482, maxWidth: "86%" }}>
          <ListItem>{I18n.t("devreg_said_find_steps_1")}</ListItem>
          <ListItem>{I18n.t("devreg_said_find_steps_2")}</ListItem>
          <ListItem>{I18n.t("devreg_said_find_steps_3")}</ListItem>
          <ListItem>{I18n.t("devreg_said_find_steps_4")}</ListItem>
          <ListItem>{I18n.t("devreg_said_find_to_enter_steps_5")}</ListItem>
        </List>
        <Hr />
        <View style={{ marginBottom: 100 }}>
          <TextScaledOnPhone style={AppWizardStyles.inputHeader}>SAID</TextScaledOnPhone>
          <View style={[AppWizardStyles.textContainer, { width: 500, maxWidth: "84%" }]}>
            <KATextInput style={AppWizardStyles.input}
              returnKeyType={"done"}
              selectionColor={"black"}
              onChangeText={(_text) => {
                if (_text.length == 10) {
                  this.setState({ said: _text, isSAIDVerified: true });
                } else {
                  this.setState({ said: _text, isSAIDVerified: false });
                }
              }}
              onSubmitEditing={() => { if (this.state.isSAIDVerified) { this.onButtonPress(); } }}
            />
          </View>
        </View>
      </ApplianceWizardPage >
    );
  }

  private onButtonPress = () => {
    this.props.navigation.navigate("ConnectPhone", {
      SAID: this.state.said.toUpperCase(),
      MAC: "",
      SSID: this.state.ssid,
    });
  }
}
/*
const styles = StyleSheet.create({
  alertListNumber: {
    fontFamily: "Muli",
    fontSize: 14,
    fontStyle: "italic",
    lineHeight: 24,
    color: "#000000",
  },
  alertListText: {
    fontFamily: "Muli",
    fontSize: 14,
    fontStyle: "italic",
    lineHeight: 24,
    color: "#000000",
    maxWidth: "100%",
  },
});

const ALERT_DATA: {[propName in AlertType]: AlertData} = {
  wrongMode: {
    title: I18n.t("devreg_appliance_wrong_mode_title"),
    text: I18n.t("devreg_appliance_wrong_mode_message"),
    cancelText: I18n.t("devreg_appliance_wrong_mode_cant_find_bttn"),
  },
  worngCodeEntered: {
    title: I18n.t("devreg_enter_said_error_title"),
    text: I18n.t("devreg_enter_said_error_message"),
    cancelText: `${I18n.t("devreg_scan_cant_find_code")} ?`,
  },
  worngCodeScanned: {
    title: I18n.t("devreg_scan_said_error_title"),
    text: I18n.t("devreg_scan_said_error_message"),
    cancelText: I18n.t("devreg_scan_cant_find_code"),
    children: <Image source={saidLabel} style={{
      width: IS_TABLET ? 328 : "100%",
      height: IS_TABLET ? 77 : 62,
      marginVertical: 15,
    }} />,
  },
  accountLocked: {
    title: I18n.t("devreg_account_locked_title"),
    text: I18n.t("devreg_account_locked_message"),
    cancelText: I18n.t("call").toUpperCase(),
    acceptText: I18n.t("dismiss").toUpperCase(),
  },
  incompatibleRouterSettings: {
    title: I18n.t("devreg_incompatible_router_tilte"),
    text: I18n.t("devreg_incompatible_router_message"),
    cancelText: "",
    acceptText: I18n.t("dismiss").toUpperCase(),
  },
  connectionError: {
    title: I18n.t("devreg_wifi_connection_error_title"),
    text: I18n.t("devreg_wifi_connection_error_message"),
    cancelText: "",
    acceptText: I18n.t("dismiss").toUpperCase(),
  },
  invalidEntry: {
    title: I18n.t("devreg_serial_nr_invalid_entry_title"),
    text: I18n.t("devreg_serial_nr_invalid_entry_message"),
    cancelText: "",
    acceptText: I18n.t("dismiss").toUpperCase(),
  },
  errorCheck1: {
    title: I18n.t("devreg_error_check"),
    cancelText: I18n.t("devreg_try_manually").toUpperCase(),
    children: (
      <List style={{ width: 300, maxWidth: "90%" }} numberStyle={styles.alertListNumber} >
        <ListItem style={styles.alertListText}>
          {I18n.t("devreg_makesure_router_button_pressed_and_held")}
        </ListItem>
        <ListItem style={styles.alertListText}>
          {I18n.t("devreg_makesure_router_WPS_activated_settings")}
        </ListItem>
      </List>
    ),
  },
  errorCheck2: {
    title: I18n.t("devreg_error_check"),
    cancelText: I18n.t("devreg_try_manually").toUpperCase(),
    children: (
      <List style={{ width: 300, maxWidth: "90%" }} numberStyle={styles.alertListNumber} >
        <ListItem style={styles.alertListText}>{I18n.t("devreg_may_not_have_WPS2")}</ListItem>
        <ListItem style={styles.alertListText}>{I18n.t("devreg_2_minutes_between_pressing_timed_out")}</ListItem>
      </List>
    ),
  },
  checkYourRouter: {
    title: I18n.t("devreg_router_problem_title"),
    text: I18n.t("devreg_router_problem_message"),
    cancelText: "",
    acceptText: I18n.t("dismiss").toUpperCase(),
  },
  checkYourFirewall: {
    title: I18n.t("devreg_internet_reachability_error_title"),
    text: I18n.t("devreg_internet_reachability_error_message"),
    cancelText: "",
    acceptText: I18n.t("dismiss").toUpperCase(),
  },
};
*/
