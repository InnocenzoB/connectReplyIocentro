import React, { Component } from "react";
import {
  ActivityIndicator,
  Platform,
  StyleProp,
  StyleSheet,
  TextProperties,
  TextStyle,
  View,
  ViewProperties,
  ViewStyle,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { NavigationScreenProps } from "react-navigation";
import { I18n } from "iocentro-apps-common-bits";

import { resetTo } from "../../navigation/CommonNavigation";
import { Dims, IS_TABLET } from "../../Platform";
import { ButtonThemes, GradientTextButton } from "../Buttons";
import { TitleNavBar } from "../nav_bars/TitleNavBar";
import { PaperView } from "../Paper";
import { TextScaledOnPhone } from "../ScaledText";

/* tslint:disable:no-bitwise */
export enum ApplianceWizardButton {
  None = 0,
  Next = 1,
  Scan = 2,
  Yes = 4,
  No = 8,
  Exit = 16,
  Finish = 32,
  GetStarted = 64,
  YesNo = Yes | No,
}

interface WizardButtonProps {
  active?: boolean; // default: true
  text: string;
  onPress;
  theme?: ButtonThemes;
  style?: StyleProp<ViewStyle>;
}

export const WizardButton = ({ active = true, theme, text, onPress, style }: WizardButtonProps) => (
  <GradientTextButton
    theme={theme || (active ? "red" : "grey")}
    text={text}
    disabled={!active}
    style={[{ width: Dims.scaleH(180), height: Dims.scaleV(48) }, style]}
    onPress={onPress}
  />
);

export interface ApplianceWizardPageProps extends ViewProperties, NavigationScreenProps<{}> {
  title1: string;
  title2: string;
  header?: string;
  message?: string;
  buttons?: ApplianceWizardButton;
  scrollable?: boolean;
  enableBounces?: boolean;
  buttonPressed?: (button: ApplianceWizardButton) => void;
  buttonDisabled?: boolean;
  loading?: boolean;
  resetToChords?: { x: number, y: number };
  extraScrollHeight?: number;
  hasScanner?: boolean;
  reverseTitle?: boolean;
  customMessage?: () => JSX.Element;
}

export interface ApplianceWizardPageState {
  loading?: boolean;
}

export class ApplianceWizardPage<P extends ApplianceWizardPageProps = ApplianceWizardPageProps,
  S extends ApplianceWizardPageState = ApplianceWizardPageState> extends Component<P, S> {
  public render() {
    const navBar = (
      <TitleNavBar title1={this.props.title1} title2={this.props.title2}
        leftIcon={{ onPress: () => this.props.navigation.goBack(null) }}
        rightIcon={{
          onPress: () => { resetTo("Tabs", this.props.navigation); },
        }}
        reverseStyles={this.props.reverseTitle}
      />);

    if (this.props.scrollable == true) {
      return (
        <PaperView
          outerStyle={{ borderRadius: 0 }}
          innerStyle={Platform.OS == "ios" ? { backgroundColor: "transparent" } : {}}>
          {navBar}
          <KeyboardAwareScrollView resetScrollToCoords={this.props.resetToChords as { x: number, y: number }}
            bounces={this.props.enableBounces}
            extraScrollHeight={this.props.extraScrollHeight}
            showsVerticalScrollIndicator={false}>
            <View style={{ flex: 1, alignItems: "center", marginTop: IS_TABLET ? 36 : 16 }}>
              {this._renderHeader()}
              {this._renderMessage()}
              {this.props.children}
              {this._renderButtons()}
            </View>
          </KeyboardAwareScrollView>
        </PaperView>
      );
    } else {
      return (
        <PaperView
          outerStyle={{ borderRadius: 0 }}
          innerStyle={Platform.OS == "ios" ? { backgroundColor: "transparent" } : {}}>
          <View style={{ flex: this.props.hasScanner ? undefined : 1, minHeight: "50%" }}>
            {navBar}
            <View style={{
              flex: this.props.hasScanner ? undefined : 1,
              alignItems: "center", marginTop: 20,
            }}>
              {this._renderHeader()}
              {this._renderMessage()}
              {this.props.children}
            </View>
            {this._renderButtons()}
          </View>
          {this._renderScanner()}
          {this.props.loading &&
            <View style={styles.loading}>
              <ActivityIndicator size="large" />
            </View>
          }
        </PaperView>
      );
    }
  }

  private _renderHeader() {
    if (this.props.header) {
      return (
        <View style={{
          width: "100%", marginTop: 15,
          justifyContent: IS_TABLET ? "center" : "flex-start", paddingHorizontal: IS_TABLET ? 200 : 30,
        }}>
          <TextScaledOnPhone
            style={[styles.header, { textAlign: IS_TABLET ? "center" : "left" }]}>
            {this.props.header}</TextScaledOnPhone>
        </View>);
    }
    return null;
  }

  private _renderMessage() {
    if (this.props.message) {
      return (<View style={{
        width: "100%", marginTop: 15,
        justifyContent: "center", paddingHorizontal: IS_TABLET ? 200 : 30,
      }}>
        <TextScaledOnPhone style={[styles.body,
        { alignSelf: IS_TABLET ? "center" : "flex-start", textAlign: IS_TABLET ? "center" : "left" }]}>
          {this.props.customMessage ? this.props.customMessage() :
            <TextScaledOnPhone>{this.props.message}</TextScaledOnPhone>}
        </TextScaledOnPhone>
      </View>);
    }
    return null;
  }

  private _renderButtons(): JSX.Element | null {
    if (this.props.buttons) {
      switch (this.props.buttons) {
        case ApplianceWizardButton.Next:
          return (
            <View style={{ height: 128, alignItems: "center" }}>
              <WizardButton text={I18n.t("next").toUpperCase()} active={!this.props.buttonDisabled}
                onPress={() => this.props.buttonPressed && !this.props.buttonDisabled &&
                  (this.props.buttonPressed as (x) => void)(ApplianceWizardButton.Next)} />
            </View>
          );
        case ApplianceWizardButton.Scan:
          return (
            <View style={{ height: 128, alignItems: "center" }}>
              <WizardButton text={I18n.t("devreg_scan").toUpperCase()}
                onPress={() => this.props.buttonPressed &&
                  (this.props.buttonPressed as (x) => void)(ApplianceWizardButton.Scan)} />
            </View>
          );
        case ApplianceWizardButton.Finish:
          return (
            <View style={{ height: 128, alignItems: "center" }}>
              <WizardButton text={I18n.t("finish").toUpperCase()} active={!this.props.buttonDisabled}
                onPress={() => this.props.buttonPressed && !this.props.buttonDisabled &&
                  (this.props.buttonPressed as (x) => void)(ApplianceWizardButton.Finish)} />
            </View>
          );
        case ApplianceWizardButton.Exit:
          return (
            <View style={{ height: 128, alignItems: "center" }}>
              <WizardButton text={I18n.t("exit").toUpperCase()}
                onPress={() => this.props.buttonPressed &&
                  (this.props.buttonPressed as (x) => void)(ApplianceWizardButton.Exit)} />
            </View>
          );
        case ApplianceWizardButton.GetStarted:
          return (
            <View style={{ height: 128, alignItems: "center" }}>
              <WizardButton text={I18n.t("devreg_final_button").toUpperCase()}
                onPress={() => this.props.buttonPressed &&
                  (this.props.buttonPressed as (x) => void)(ApplianceWizardButton.Exit)} />
            </View>
          );
        case (ApplianceWizardButton.Yes | ApplianceWizardButton.No):
          return (
            <View style={{ height: 128, alignItems: "flex-start", flexDirection: "row", justifyContent: "center" }}>
              <WizardButton text={I18n.t("no").toUpperCase()} theme="grey"
                onPress={() => this.props.buttonPressed &&
                  (this.props.buttonPressed as (x) => void)(ApplianceWizardButton.No)} />
              <View style={{ width: IS_TABLET ? 20 : 5 }} />
              <WizardButton text={I18n.t("yes").toUpperCase()}
                onPress={() => this.props.buttonPressed &&
                  (this.props.buttonPressed as (x) => void)(ApplianceWizardButton.Yes)} />
            </View>
          );
      }
    }
    return null;
  }

  protected _renderScanner() { }
}

export interface ListProperties extends ViewProperties {
  numberStyle?: StyleProp<TextStyle>;
}

export class List extends Component<ListProperties> {
  public render() {
    const { children, numberStyle, ...props } = this.props;
    const finalFields = React.Children.map(children, (child, index) => (
      <View key={index} style={{ flexDirection: "row" }}>
        <TextScaledOnPhone style={[styles.listnbr, numberStyle]}>{(index + 1).toString() + "."}</TextScaledOnPhone>
        <View style={{ marginBottom: 30, flexShrink:1 }}>
          {child}
        </View>
      </View>
    ));
    return <View {...props}>{finalFields}</View>;
  }
}

export class ListItem extends Component<TextProperties> {
  public render() {
    const { style, children, ...props } = this.props;
    return <TextScaledOnPhone style={[styles.list, style]} {...props}>{children}</TextScaledOnPhone>;
  }
}

export class ListSubItem extends Component<TextProperties> {
  public render() {
    const { style, children, ...props } = this.props;
    return <TextScaledOnPhone style={[styles.list2, style]} {...props}>{children}</TextScaledOnPhone>;
  }
}

export const Hr = () => <View style={styles.hr} />;

const styles = StyleSheet.create({
  background: {
    width: "100%",
    height: "100%",
    backgroundColor: "transparent",
  },
  header: {
    opacity: 0.8,
    fontFamily: "Merriweather",
    fontSize: 18,
    fontWeight: "300",
    fontStyle: "italic",
    letterSpacing: 0.64,
    textAlign: "center",
    color: "#000000",
    lineHeight: 31,
  },
  body: {
    fontFamily: "Muli",
    fontSize: IS_TABLET ? 16 : 14,
    lineHeight: 18,
    color: "#000000",
    marginBottom: 20,
  },
  listnbr: {
    width: 36,
    fontFamily: "Muli",
    fontWeight: "bold",
    fontSize: 14,
    textAlign: "left",
    color: "#000000",
  },
  hr: {
    width: "87%",
    height: 2,
    backgroundColor: "#000000",
    opacity: 0.1,
    marginTop: 10,
    marginBottom: 48,
  },
  list: {
    fontFamily: "Muli",
    fontWeight: "bold",
    fontSize: 14,
    textAlign: "left",
    color: "#000000",
    maxWidth: "100%",
  },
  list2: {
    fontFamily: "Muli",
    fontSize: 14,
    textAlign: "left",
    color: "#000000",
    maxWidth: "100%",
  },
  loading: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
});

export const AppWizardStyles = StyleSheet.create({
  background: {
    width: "100%",
    height: "100%",
    backgroundColor: "transparent",
  },
  header: {
    opacity: 0.8,
    fontFamily: "Merriweather",
    fontSize: 18,
    fontWeight: "300",
    fontStyle: "italic",
    letterSpacing: 0.64,
    textAlign: "center",
    color: "#000000",
    lineHeight: 31,
  },
  body: {
    fontFamily: "Muli",
    textAlign: "center",
    color: "#000000",
    fontSize: 16,
    lineHeight: 17,
    marginBottom: 20,
    marginTop: 8,
  },
  link: {
    marginTop: 10,
    marginBottom: 8,
  },
  dark: {
    fontFamily: "Muli",
    fontSize: 11,
    fontWeight: "900",
    lineHeight: 17,
    letterSpacing: 2,
    textAlign: "center",
    color: "#646464",
  },

  vr: {
    width: 2,
    backgroundColor: "#000000",
    opacity: 0.1,
  },
  textContainer: {
    borderRadius: 2,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    shadowColor: "rgba(0, 0, 0, 0.1)",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowRadius: 8,
    shadowOpacity: 1,
    width: 215,
    height: 48,
  },
  inputHeader: {
    opacity: 0.5,
    fontFamily: "Muli",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 2,
    textAlign: "left",
    color: "#000000",
    backgroundColor: "#00000000",
    height: 22,
  },
  input: {
    fontFamily: "Muli",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 2,
    textAlign: "left",
    color: "rgba(0, 0, 0, 0.7)",
    height: "100%",
    marginLeft: 19,
    marginRight: 19,
  },
});
