import { UserModel } from "iocentro-apps-common-bits";
import React, { Component } from "react";
import { Image, KeyboardAvoidingView, Modal, Platform, StyleSheet, View } from "react-native";
import { BlurView } from "react-native-blur";
import { NavigationScreenProps, TabNavigator } from "react-navigation";

import { GetPrivacyPolicyData, GetTermsData } from "../App";
import { About } from "../components/my_account/About";
import { MyAccount } from "../components/my_account/MyAccount";
import { MyAccountTemplate, MyAccountTemplateType } from "../components/my_account/MyAccountTemplate";
import { HtmlModal } from "../components/paper_modals/Html";
import { QUICK_CHOICE_BAR_HEIGHT } from "../components/QuickChoiceBottomBar";
import { Authenticator } from "../model/Authenticator";
import { KitchenAidUserModel } from "../model/KitchenAidUserModel";
import { IS_TABLET } from "../Platform";

const kitchenAidLogo = require("../../img/my_account/kitchenaidLogo.png");

class MyAccountPage extends Component<NavigationScreenProps<{}>> {

  public static navigationOptions = {
    tabBarVisible: false,
  };

  public render() {
    return (
      <KeyboardAvoidingView style={styles.main} behavior="position" keyboardVerticalOffset={-300}>
        <MyAccount
          onAbout={() => this.props.navigation.navigate("About")}
          onClose={() => {
            if (this.props.screenProps && this.props.screenProps.close) {
              this.props.screenProps.close();
            }
          }}
          onChangeUnits={() => {
            (UserModel.instance() as KitchenAidUserModel).flipUnit();
          }}
          onSignOut={() => {
            if (this.props.screenProps && this.props.screenProps.signOut) {
              this.props.screenProps.signOut();
            } else {
              this.props.navigation.navigate("LogOut");
            }
          }}
          onAddAppliance={() => {
            if (this.props.screenProps && this.props.screenProps.addAppliance) {
              this.props.screenProps.addAppliance();
            } else {
              this.props.navigation.navigate("ApplianceWizard");
            }
          }} />
      </KeyboardAvoidingView>
    );
  }
}

export class AboutPage extends Component<NavigationScreenProps<{}>, {}> {
  public static navigationOptions = {
    tabBarVisible: false,
  };

  public render() {
    return (
      <View style={styles.main}>
        <About
          onBackClose={() => this.props.navigation.navigate("MyAccount")}
          onPrivacy={() => this.props.navigation.navigate("Privacy")}
          onTerms={() => this.props.navigation.navigate("Terms")}
        />
      </View>
    );
  }
}

export class PrivacyPage extends Component<NavigationScreenProps<{}>> {
  public static navigationOptions = {
    tabBarVisible: false,
  };
  public render() {
    const privacyPolicy = GetPrivacyPolicyData();
    return (
      <View style={styles.main}>
        <MyAccountTemplate
          type={MyAccountTemplateType.Back}
          onBackClose={() => this.props.navigation.navigate("About")}
          header1={privacyPolicy.title1}
          header2={privacyPolicy.title2}
          containerStyle={{
            justifyContent: "space-between",
            paddingBottom: IS_TABLET ? 5 : QUICK_CHOICE_BAR_HEIGHT + 5,
          }}
        >
          {HtmlModal.WebContent(privacyPolicy.content)}
        </MyAccountTemplate>
      </View>
    );
  }
}

export class TermsPage extends Component<NavigationScreenProps<{}>> {
  public static navigationOptions = {
    tabBarVisible: false,
  };
  public render() {
    const terms = GetTermsData();
    return (
      <View style={styles.main}>
        <MyAccountTemplate
          type={MyAccountTemplateType.Back}
          onBackClose={() => this.props.navigation.navigate("About")}
          header1={terms.title1}
          header2={terms.title2}
          containerStyle={{
            justifyContent: "space-between",
            paddingBottom: IS_TABLET ? 5 : QUICK_CHOICE_BAR_HEIGHT + 5,
          }}
        >
          {HtmlModal.WebContent(terms.content)}
        </MyAccountTemplate>
      </View>
    );
  }
}

export const MyAccountNavigator = TabNavigator({
  MyAccount: {
    screen: MyAccountPage,
  },
  About: {
    screen: AboutPage,
  },
  Privacy: {
    screen: PrivacyPage,
  },
  Terms: {
    screen: TermsPage,
  },
}, {
  initialRouteName: "MyAccount",
  animationEnabled: true,
  swipeEnabled: false,
});

export interface MyAccountScreenProps {
  onSignOut: () => void;
  onAddAppliance: () => void;
}
export interface MyAccountScreenState {
  visible: boolean;
  about: boolean;
}

export abstract class MyAccountScreenClass extends Component<MyAccountScreenProps, MyAccountScreenState> {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      about: false,
    };
  }

  public show() {
    this.setState({ visible: true });
  }
  protected hide(callback?: () => void) {
    this.setState({ visible: false }, callback);
  }
}

export class MyAccountModal extends MyAccountScreenClass {
  public render() {
    const screenProps = {
      close: () => { this.hide(); },
      signOut: () => { this.hide(() => { Authenticator.signOut(); this.props.onSignOut && this.props.onSignOut(); }); },
      addAppliance: () => { this.hide(); this.props.onAddAppliance && this.props.onAddAppliance(); },
    };

    const blur = (Platform.OS == "android") ?
      <View
        style={[{
          backgroundColor: "rgba(0,0,0,0.7)",
        }, StyleSheet.absoluteFillObject]}
      />
      :
      <BlurView
        blurType={"dark"}
        style={StyleSheet.absoluteFill}
      />;

    return (
      <Modal transparent={true} visible={this.state.visible} animationType={"fade"}
        onRequestClose={() => { this.hide(); }}>
        {blur}
        <View style={{
          position: "absolute",
          width: "100%", height: "100%",
          alignItems: "center",
        }}>
          <Image source={kitchenAidLogo} style={{ marginTop: 50 }} />
        </View>
        <MyAccountNavigator screenProps={screenProps} />
      </Modal>
    );
  }
}

const styles = StyleSheet.create({
  main: {
    width: "100%",
    height: "100%",
    position: IS_TABLET ? "absolute" : "relative",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#00000000",
  },
});
