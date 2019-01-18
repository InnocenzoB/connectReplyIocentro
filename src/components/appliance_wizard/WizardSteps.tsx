import { BaseDeviceModel, DeviceStore, I18n } from "iocentro-apps-common-bits";
import React, { Component } from "react";
import { Clipboard, Image, Linking, Platform, StyleSheet, View, ViewStyle } from "react-native";
import { NavigationScreenProps } from "react-navigation";

import { ShowPrivacyPolicy } from "../../App";
import { CookProcessorModel } from "../../model/CookProcessorModel";
import { resetTo } from "../../navigation/CommonNavigation";
import { Dims, IS_TABLET, PlatformSelect } from "../../Platform";
import { noNull } from "../../Utils";
import { AcceptCancelAlert } from "../AcceptCancelAlert";
import { GradientTextButton } from "../Buttons";
import { ConnectionAnimation } from "../ConnectionAnimation";
import { KATextInput } from "../KATextInput";
import { TextFieldWrapper } from "../my_account/MyAccount";
import { RoundButtonParam, RoundButtonParamType } from "../RoundButtonParam";
import { TextScaledOnPhone } from "../ScaledText";
import {
  ApplianceWizardButton,
  ApplianceWizardPage,
  AppWizardStyles,
  Hr,
  List,
  ListItem,
  ListSubItem,
  WizardButton,
} from "./ApplianceWizardPage";

const routerWPS = require("../../../img/appliance_wizard/413IsYourRouterWpsCompatible.png");

class NoParamsScreen extends Component<NavigationScreenProps<{}>, {}> {
}

export class ConnectToWifiPage extends Component<NavigationScreenProps<{ SAID: string }>, {}> {
  public render() {
    return (
      <ApplianceWizardPage
        title1={I18n.t("devreg_connect")} title2={I18n.t("devreg_to_wifi").toUpperCase()}
        message={I18n.t("devreg_enter_said_help")}
        buttons={ApplianceWizardButton.Next}
        buttonPressed={() => {
          this.props.navigation.navigate("FinalVerificationPage", this.props.navigation.state.params);
        }}
        scrollable={true}
        {...this.props}>
        <Hr />
        <List style={{ width: 482, maxWidth: "80%" }} >
          <ListItem>{I18n.t("devreg_connect_manually_steps1")}</ListItem>
          <ListItem>{I18n.t("devreg_connect_manually_steps2")}</ListItem>
          <ListItem>{I18n.t("devreg_connect_manually_steps3")}</ListItem>
          <ListItem>{I18n.t("devreg_connect_manually_steps4")}</ListItem>
          <ListItem>{I18n.t("devreg_connect_manually_steps5")}</ListItem>
          <ListItem>{I18n.t("devreg_connect_manually_steps6")}</ListItem>
          <ListItem>{I18n.t("devreg_connect_manually_steps7")}</ListItem>
          <View style={{ width: "100%" }}>
            <ListItem>{I18n.t("devreg_connect_manually_steps8")}</ListItem>
            <ListSubItem>{I18n.t("devreg_connect_manually_steps9")}</ListSubItem>
          </View>
          <View style={{ width: "100%" }}>
            <ListItem>{I18n.t("devreg_connect_manually_steps10")}</ListItem>
            <ListSubItem>{I18n.t("devreg_connect_manually_steps11")}
              <TextScaledOnPhone
                onPress={() => Clipboard.setString(this.props.navigation.state.params.SAID)}
                style={AppWizardStyles.link}>{I18n.t("devreg_connect_manually_steps12")}
              </TextScaledOnPhone>
              {I18n.t("devreg_connect_manually_steps13")}
            </ListSubItem>
          </View>
          <View style={{ width: "100%" }}>
            <ListItem>{I18n.t("devreg_connect_manually_steps14")}</ListItem>
            <ListSubItem>{I18n.t("devreg_connect_manually_steps15")}
              {I18n.t("devreg_connect_manually_steps16")}</ListSubItem>
          </View>
          <ListItem>{I18n.t("devreg_connect_manually_steps17")}</ListItem>
        </List>
      </ApplianceWizardPage>
    );
  }
}

interface FinalVerificationPageParams {
  model: CookProcessorModel;
  SAID: string;
  MAC: string;
}
type FinalVerificationPageProps = NavigationScreenProps<FinalVerificationPageParams>;

interface FinalVerificationPageState { isLoading: boolean; }

const image = require("../../../img/cookProcessor.png");
const arrow = require("../../../img/appliance_wizard/navbarBackArrow.png");
export class FinalVerificationPage extends Component<FinalVerificationPageProps, FinalVerificationPageState> {
  public navParams = this.props.navigation.state.params;
  private navBlurListener;

  public constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
    };
  }

  public componentDidMount() {
    // @types does not yet support lates version and addListener causes err
    const navigation = this.props.navigation as any;
    this.navBlurListener = navigation.addListener(
      "didBlur",
      this.onScreenBlur,
    );
  }
  public componentWillUnmount() {
    this.navBlurListener.remove();
  }

  private onScreenBlur = () => {
    this.setState({
      isLoading: false,
    });
  }

  public render() {
    return (
      <ApplianceWizardPage
        title1={I18n.t("devreg_download")} title2={I18n.t("devreg_recipes")}
        message={I18n.t("devreg_final_details")}
        buttons={ApplianceWizardButton.GetStarted}
        buttonPressed={this.onNextButtonPressed}
        loading={this.state.isLoading}
        {...this.props}>
        <Hr />
        <Image source={image} />
        <Image source={arrow} />
        <TextScaledOnPhone style={styles.knobText}>{I18n.t("devreg_knob")}</TextScaledOnPhone>
      </ApplianceWizardPage>
    );
  }

  private onNextButtonPressed = () => {
    this.setState({
      isLoading: true,
    });
    if (this.props.navigation.state.params.model) {
      this.props.navigation.navigate("RegisterAppliancePage", {
        model: (this.props.navigation.state.params.model as CookProcessorModel),
      });
    } else {
      this.scheduleRegistrationAttempt();
    }
  }

  private scheduleRegistrationAttempt = () => {
    const WPRSaid = "WPR" + this.navParams.SAID;
    CookProcessorModel._registerDevice(WPRSaid, this.navParams.MAC)
      .then(() => {
        DeviceStore.instance.update()
          .then(() => {
            const found: BaseDeviceModel[] = DeviceStore.instance.getDevices().filter((model) => {
              return model.activationCode.sv() == WPRSaid;
            });
            if (found.length) {
              if (DeviceStore.instance.getSelected() == null) {
                DeviceStore.instance.select(found[0]);
              }
              this.clearInterval();
              this.props.navigation.navigate("RegisterAppliancePage", {
                model: (found[0] as CookProcessorModel),
              });
            } else {
              this.clearInterval();
              this.props.navigation.navigate("RegistrationFailedPage");
            }
          });
      },
        () => {
          this.clearInterval();
          this.props.navigation.navigate("RegistrationFailedPage");
        });
  }

}

export class ApplianceAlreadyClaimedPage extends NoParamsScreen {
  public render() {
    return (
      <ApplianceWizardPage
        title1={I18n.t("devreg_scan")} title2="SAID"
        header="Appliance Already Claimed"
        message={"This appliance has already been claimed to an account. To begin adding it"
          + "to your account, enter the serial number as shown below."}
        buttons={ApplianceWizardButton.Next}
        {...this.props}>

        <TextScaledOnPhone>TODO: MISSING IMAGE</TextScaledOnPhone>
      </ApplianceWizardPage>
    );
  }
}

export class ConnectToWifiWpsCompatibile extends Component<NavigationScreenProps<{}>, {}> {

  public render() {
    return (
      <ApplianceWizardPage
        title1={I18n.t("devreg_connect")}
        title2={I18n.t("devreg_with_wps")}
        header={I18n.t("devreg_connect_wps_details")}
        message={I18n.t("devreg_connect_wps_help")}
        buttons={ApplianceWizardButton.YesNo}
        buttonPressed={(button: ApplianceWizardButton) => {
          if (button == ApplianceWizardButton.No) {
            this.props.navigation.navigate("ConnectToWifiPage", this.props.navigation.state.params);
          } else {
            this.props.navigation.navigate("ConnectToWifiWpsBegin", this.props.navigation.state.params);
          }
        }}
        {...this.props}>
        <Image source={routerWPS} style={{ margin: 20 }} />
        <Hr />
      </ApplianceWizardPage>
    );
  }
}

export class ConnectToWifiWpsBegin extends Component<NavigationScreenProps<{}>, {}> {
  public render() {
    return (
      <ApplianceWizardPage
        title1={I18n.t("devreg_connect")} title2={I18n.t("devreg_to_wifi").toUpperCase()}
        header={I18n.t("devreg_connect_wps_start_details")}
        message={I18n.t("devreg_connect_wps_start_help")}
        buttons={ApplianceWizardButton.YesNo}
        buttonPressed={(button: ApplianceWizardButton) => {
          if (button == ApplianceWizardButton.No) {
            this.props.navigation.navigate("ConnectToWifiPage", this.props.navigation.state.params);
          } else {
            this.props.navigation.navigate("ConnectWithWpsPage", this.props.navigation.state.params);
          }
        }}
        {...this.props}>
        <Hr />
      </ApplianceWizardPage>
    );
  }
}

interface ConnectWithWpsPageState {
  timeLeft: number;
  alertVisible: boolean;
}

export class ConnectWithWpsPage extends Component<NavigationScreenProps<{}>, ConnectWithWpsPageState> {
  public timer;

  constructor(props) {
    super(props);
    this.navParams = this.props.navigation.state.params;
    const WPRSaid = "WPR" + this.navParams.SAID;
    this.state = {
      timeLeft: 240,
      alertVisible: false,
    };
    this.pollingDevices();
    this.timer = setInterval(this.intervlFunction, 1000);
  }

  public componentWillUnmount() {
    this.clearInterval();
  }

  public render() {
    return (
      <ApplianceWizardPage
        title1={I18n.t("devreg_connect")} title2={I18n.t("devreg_phone")}
        {...this.props}>
        <View style={{ flexDirection: "row", marginBottom: 36 }}>
          <View style={{ flex: 1, alignItems: "center", marginTop: 36, marginBottom: 36 }}>
            <TextScaledOnPhone style={[AppWizardStyles.dark, { marginBottom: 20 }]}>
              {I18n.t("devreg_connect_wps_approx_time")}
            </TextScaledOnPhone>
            <RoundButtonParam
              type={RoundButtonParamType.Time}
              minValue={0}
              maxValue={120}
              value={this.state.timeLeft}
              progress={true}
              theme="white"
              size={IS_TABLET ? "xl" : "s"}
              readonly={true}
            />
          </View>
          <View style={AppWizardStyles.vr} />
          <View style={{ flex: 2, alignItems: "center", marginTop: 36, marginBottom: 36 }}>
            <List style={{ width: IS_TABLET ? 482 : "100%", maxWidth: "100%", paddingHorizontal: 5 }}>
              <ListItem>{I18n.t("devreg_connect_wps_steps1")}</ListItem>
              <ListItem>{I18n.t("devreg_connect_wps_steps2")}</ListItem>
              <ListItem>{I18n.t("devreg_connect_wps_steps3")}</ListItem>
              <ListItem>{I18n.t("devreg_connect_wps_steps4")}</ListItem>
              <ListItem>{I18n.t("devreg_connect_wps_steps5")}</ListItem>
              <ListItem>{I18n.t("devreg_connect_wps_steps6")}</ListItem>
            </List>
          </View>
        </View>
        <Hr />
        <View>
          <TextScaledOnPhone style={AppWizardStyles.dark}>
            {I18n.t("devreg_connect_wps_checking")}
          </TextScaledOnPhone>
          <ConnectionAnimation style={{ marginTop: 20 }} />
        </View>
        {this.renderConnectingAlert()}
      </ApplianceWizardPage>
    );
  }

  private renderConnectingAlert = () => {
    return (
      <AcceptCancelAlert
        isVisible={this.state.alertVisible}
        onClose={(_result) => {
          this.clearInterval();
          this.unregisterDevice();
          this.setState({ alertVisible: false });
          if (_result) {
            this.onTryAgain();
          } else {
            this.onConnectManually();
          }
        }}
        title={I18n.t("devreg_connect_wps_failed")}
        text={I18n.t("devreg_connect_wps_failed_message")}
        cancelText={I18n.t("devreg_connect_wps_failed_try_manual").toUpperCase()}
        acceptText={I18n.t("devreg_connect_wps_failed_try_again").toUpperCase()}
      />
    );
  }

  private intervlFunction = () => {
    if (this.state.timeLeft > 0) {
      this.setState({
        timeLeft: this.state.timeLeft - 1,
      });
    } else {
      this.clearInterval();
      this.setState({
        alertVisible: true,
      });
    }
  }

  private intervalPolling = async () => {
    try {
      await DeviceStore.instance.update();
      const found = DeviceStore.instance.getDevices().filter((model) => {
          return model.activationCode.sv() == WPRSaid;
      });
      if (found.length) {
          if (found[0].isClaimed.sv()) {
            if (DeviceStore.instance.getSelected() == null) {
                DeviceStore.instance.select(found[0]);
            }
              this.clearInterval();
              this.props.navigation.navigate("RegisterAppliancePage", {
                  model: found[0],
              });
          }
      }
    } catch (e) {
      console.log('[intervalPolling]Catch');
    }
  };

  private pollingDevices = async () => {
    this.navParams = this.props.navigation.state.params;
    try {
      await this.unregisterDevice();
      await CookProcessorModel._registerDevice(WPRSaid, this.navParams.MAC);
      this.intervalPolling();
      this.timerPolling = setInterval(this.intervalPolling, 7000);
    } catch (e) {
      this.clearInterval();
      this.props.navigation.navigate("RegistrationFailedPage");
    }
  };

  private unregisterDevice = async () => {
    try {
      await DeviceStore.instance.remove(DeviceStore.instance.getDevices()[0]);
      const devices = DeviceStore.instance.getDevices();

      if (devices.length > 0) {
          DeviceStore.instance.select(devices[0]);
      }
    } catch (e) {
      console.log('[unregisterDevice]Catch');
    }
  }

  private onTryAgain = () => {
    this.setState({
      timeLeft: 240,
    });
    this.pollingDevices();
    this.timer = setInterval(this.intervlFunction, 1000);
  }

  private onConnectManually = () => {
    this.clearInterval();
    this.props.navigation.navigate("ConnectToWifiPage", this.props.navigation.state.params);
  }

  private clearInterval = () => {
    if (this.timerPolling) {
      clearInterval(this.timerPolling);
    }
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

}

export class RegistrationFailedPage extends Component<NavigationScreenProps<{}>, {}> {
  public render() {
    return (
      <ApplianceWizardPage
        title1={I18n.t("devreg_registration") + " "}
        title2={I18n.t("devreg_failed")}
        header={I18n.t("devreg_registration_failed")}
        message={" "}
        reverseTitle={true}
        customMessage={this.customMessage}
        {...this.props}>
        <Hr />
        <View style={{
          flex: 1, justifyContent: "flex-end", alignItems: "center",
          paddingHorizontal: IS_TABLET ? 200 : 30, paddingBottom: 60,
        }}>
          <GradientTextButton
            theme="red"
            style={{ marginBottom: 40, width: Dims.scaleH(180), height: Dims.scaleV(48) }}
            text={I18n.t("exit").toUpperCase()}
            onPress={() => { resetTo("Tabs", this.props.navigation); }}
          />
          <TextScaledOnPhone style={styles.footerText}>
            <TextScaledOnPhone>{I18n.t("devreg_failed_help_footer")}</TextScaledOnPhone>
            <TextScaledOnPhone style={{ textDecorationLine: "underline" }} onPress={() => {
              Linking.openURL("https://www.kitchenaid.eu/register").catch(() => { });
            }}>
              {I18n.t("visit_here")}</TextScaledOnPhone>
            <TextScaledOnPhone>{I18n.t("dot")}</TextScaledOnPhone>
          </TextScaledOnPhone>
        </View>
      </ApplianceWizardPage>
    );
  }

  private customMessage = () =>
    <TextScaledOnPhone>
      < TextScaledOnPhone >{I18n.t("devreg_failed_help_1")}</TextScaledOnPhone >
      <TextScaledOnPhone style={{ color: "rgb(203,0,0)", fontWeight: "800", letterSpacing: 2 }}>
        {I18n.t("devreg_failed_help_Support_Number")}</TextScaledOnPhone>
      <TextScaledOnPhone>{I18n.t("devreg_failed_help_2")}</TextScaledOnPhone>
    </TextScaledOnPhone>
}

type RegisterAppliancePageProps = NavigationScreenProps<{ model: CookProcessorModel }>;

export class RegisterAppliancePage extends Component<RegisterAppliancePageProps,
  { input: string, isInputVerified: boolean }> {
  public navParams = this.props.navigation.state.params;

  constructor(props) {
    super(props);
    let input = "";
    if (this.navParams.model) {
      input = noNull(this.navParams.model.name.sv(), "");
    }

    const isInputVerified = input.length > 0;

    this.state = {
      input,
      isInputVerified,
    };
  }
  public render() {
    return (
      <ApplianceWizardPage
        title1={I18n.t("register")}
        title2={I18n.t("appliance")}
        header={I18n.t("devreg_congratulations_details")}
        message={" "}
        buttons={IS_TABLET ? undefined : ApplianceWizardButton.Finish}
        buttonDisabled={!this.state.isInputVerified}
        buttonPressed={this.onButtonPressed}
        customMessage={this.renderCustomMessage}
        {...this.props}>
        <Hr />
        <View style={{
          flexDirection: IS_TABLET ? "row" : "column",
          alignItems: "flex-end",
          width: "100%",
          paddingHorizontal: IS_TABLET ? 240 : 0,
        }}>
          <TextFieldWrapper
            header={I18n.t("appliance_name")}
            textContainer={{ width: "100%", paddingHorizontal: Platform.OS == "ios" ? 20 : undefined, marginRight: 30 }}
            wrapperStyle={PlatformSelect<ViewStyle>({
              anyTablet: { flex: 1, marginRight: 20 },
              anyPhone: { width: "100%", paddingHorizontal: 20 },
            })}
            headerStyle={{ color: "rgba(0,0,0,0.8)" }}>
            <KATextInput
              style={styles.input}
              multiline={false}
              selectionColor="black"
              returnKeyType={"done"}
              onChangeText={(text) => { this.setState({ input: text }, this.verifyInput); }}
              onSubmitEditing={() => { if (this.state.isInputVerified) { this.onButtonPressed(); } }}
              value={this.state.input}
            />
          </TextFieldWrapper>
          {IS_TABLET &&
            <WizardButton
              active={this.state.isInputVerified}
              text={I18n.t("finish").toUpperCase()}
              onPress={this.onButtonPressed}
            />}
        </View>
      </ApplianceWizardPage>
    );
  }

  private renderCustomMessage = () => {
    return (
      <TextScaledOnPhone>
        <TextScaledOnPhone >{I18n.t("devreg_congratulations_message_1")}</TextScaledOnPhone >
        <TextScaledOnPhone style={{ textDecorationLine: "underline" }} onPress={ShowPrivacyPolicy}>
          {I18n.t("devreg_congratulations_message_T&C")}</TextScaledOnPhone>
        <TextScaledOnPhone >{I18n.t("devreg_congratulations_message_2")}</TextScaledOnPhone >
        <TextScaledOnPhone style={{ color: "rgb(203,0,0)", fontWeight: "800", letterSpacing: 2, fontSize: 11 }}
          onPress={() => { Linking.openURL("https://www.kitchenaid.eu/register").catch(() => { }); }}>
          {I18n.t("visit_here").toUpperCase()}</TextScaledOnPhone>
        <TextScaledOnPhone>{I18n.t("dot")}</TextScaledOnPhone>
      </TextScaledOnPhone>
    );
  }

  private verifyInput = () => {
    if (this.state.input && this.state.input.length > 0) {
      this.setState({
        isInputVerified: true,
      });
    } else {
      this.setState({
        isInputVerified: false,
      });
    }
  }
  private onButtonPressed = () => {
    if (!this.state.isInputVerified) {
      return;
    }
    this.navParams.model.name.updateValue(this.state.input);
    resetTo("Tabs", this.props.navigation);
  }
}

const styles = StyleSheet.create({
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
  knobText: {
    color: "rgb(100,100,100)",
    fontSize: 11,
    fontFamily: "Muli",
    letterSpacing: 2,
    lineHeight: 17,
    width: 150,
    textAlign: "center",
    fontWeight: "800",
  },
  footerText: {
    fontFamily: "Muli",
    fontStyle: "italic",
    fontSize: 11,
    lineHeight: 17,
    textAlign: "center",
    color: "rgb(145,145,149)",
  },
});
