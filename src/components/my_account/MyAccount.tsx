import { I18n, UserModel } from "iocentro-apps-common-bits";
import React, { Component } from "react";
import { Image, Keyboard, StyleProp, StyleSheet, TextInput, TextStyle, View, ViewStyle } from "react-native";
import { Subscription } from "rxjs";

import { KitchenAidUserModel, UnitSystem } from "../../model/KitchenAidUserModel";
import { IS_TABLET, PlatformSelect } from "../../Platform";
import { noNull } from "../../Utils";
import { AcceptCancelAlert } from "../AcceptCancelAlert";
import { ThemedTextButton } from "../Buttons";
import { Hr } from "../Hr";
import { KATextInput } from "../KATextInput";
import { RoundButton, RoundButtonType } from "../RoundButton";
import { TextScaledOnPhone } from "../ScaledText";
import { TouchableScale } from "../TouchableScale";
import { MyAccountTemplate, MyAccountTemplateType } from "./MyAccountTemplate";

const filterDropdownArrowGray = require("../../../img/saved_favorites/filterDropdownArrowGray.png");

export interface TextFieldWrapperProps {
  header: string;
  wrapperStyle?: StyleProp<ViewStyle>;
  textContainer?: StyleProp<ViewStyle>;
  headerStyle?: StyleProp<TextStyle>;
}

export class TextFieldWrapper extends Component<TextFieldWrapperProps, {}> {
  public render() {
    return (
      <View style={[{ marginTop: IS_TABLET ? 0 : 12 }, this.props.wrapperStyle]}>
        <TextScaledOnPhone style={[styles.header, this.props.headerStyle]}>
          {this.props.header.toUpperCase()}
        </TextScaledOnPhone>
        <View style={[styles.textContainer, this.props.textContainer]}>
          {this.props.children}
        </View>
      </View>
    );
  }
}

interface RoundButtonWithHeaderProps {
  type: RoundButtonType;
  header: string;
  subheader?: string;
  onPress?: () => void;
}

class RoundButtonWithHeader extends Component<RoundButtonWithHeaderProps, {}> {
  public render() {
    const sh = this.props.subheader ? this.props.subheader.toUpperCase() : "";
    return (
      <TouchableScale
        disabled={IS_TABLET}
        onPress={this.props.onPress}>
        <View style={{
          justifyContent: IS_TABLET ? "space-between" : "flex-end",
          alignItems: "center",
          height: IS_TABLET ? 168 : 62,
          flexDirection: IS_TABLET ? "column" : "row-reverse",
        }}
        >
          {!IS_TABLET && <Image
            style={styles.imageStyle}
            source={filterDropdownArrowGray}
          />}
          <View style={{
            justifyContent: IS_TABLET ? "center" : "flex-start",
            flex: 1,
          }}>
            <TextScaledOnPhone style={styles.rbheader}>{this.props.header.toUpperCase()}</TextScaledOnPhone>
            <TextScaledOnPhone style={styles.rbheader2}>{sh}</TextScaledOnPhone>
          </View>
          <View style={IS_TABLET ? {} : {
            marginLeft: 19,
            marginRight: 31,
          }}>
            <RoundButton
              disabled={!IS_TABLET}
              type={this.props.type}
              style={IS_TABLET ? {} : styles.circle}
              onPress={this.props.onPress}
            />
          </View>
        </View>
      </TouchableScale>
    );
  }
}

const Vr = () => <View style={{ width: 2, height: 168, opacity: 0.1, backgroundColor: "#000000" }} />;

// ================================================================================================

interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface AlertData {
  title?: string;
  text?: string;
  acceptText?: string;
  cancelText?: string;
}

export interface MyAccountState extends UserData {
  savedValues: UserData;
  dirty: boolean;
  resetPassword: boolean;
  alertVisible: boolean;
  alertData: AlertData;
  onCloseAlert: (result: boolean) => void;
}

export interface MyAccountProps {
  onAddAppliance?: () => void;
  onChangeUnits?: () => void;
  onAbout?: () => void;
  onSignOut?: () => void;
  onClose?: () => void;
}

export class MyAccount extends Component<MyAccountProps, MyAccountState> {
  private unitSub: Subscription;

  constructor(props: MyAccountProps) {
    super(props);

    const savedValues: UserData = {
      firstName: noNull<string>(UserModel.instance().name.sv(), ""),
      lastName: noNull<string>(UserModel.instance().surname.sv(), ""),
      email: noNull<string>(UserModel.instance().email.sv(), ""),
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    };

    this.state = {
      savedValues,
      firstName: savedValues.firstName,
      lastName: savedValues.lastName,
      email: savedValues.email,
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
      dirty: false,
      resetPassword: false,
      alertVisible: false,
      alertData: {},
      onCloseAlert: () => { },
    };
  }

  public componentWillMount() {
    this.unitSub = (UserModel.instance() as KitchenAidUserModel).unit.subscribe(() => {
      this.forceUpdate();
    });
  }

  public componentWillUnmount() {
    if (this.unitSub) { this.unitSub.unsubscribe(); }
  }

  public render() {

    const {
      onAddAppliance,
      onChangeUnits,
      onAbout,
      onSignOut,
      onClose,
    } = this.props;

    const {
      firstName,
      lastName,
      email,
      currentPassword,
      newPassword,
      confirmPassword,
      dirty,
      resetPassword,
      alertVisible,
      alertData,
      onCloseAlert,
    } = this.state;

    const textInputsCommon = {
      style: styles.input,
      selectionColor: "black",
      multiline: false,
    };

    const dirtyInputStyle = !(dirty || IS_TABLET) ? styles.cleanInput : {};

    const passwordInputs = (
      <View style={styles.group}>
        <TextFieldWrapper header={I18n.t("current_password")}>
          <KATextInput {...textInputsCommon}
            textInputRef={(ref) => this.currentPasswordInput = ref as TextInput | null}
            returnKeyType={"next"}
            secureTextEntry={true}
            value={currentPassword}
            onChangeText={(text) => { this.setState({ dirty: true, currentPassword: text }); }}
            onSubmitEditing={() => { this.newPasswordInput && this.newPasswordInput.focus(); }}
          />
        </TextFieldWrapper>
        <TextFieldWrapper header={I18n.t("new_password")}>
          <KATextInput {...textInputsCommon}
            textInputRef={(ref) => this.newPasswordInput = ref as TextInput | null}
            returnKeyType={"next"}
            secureTextEntry={true}
            value={newPassword}
            onChangeText={(text) => { this.setState({ dirty: true, newPassword: text }); }}
            onSubmitEditing={() => { this.confirmPasswordInput && this.confirmPasswordInput.focus(); }}
          />
        </TextFieldWrapper>
        <TextFieldWrapper header={I18n.t("confirm_new_password")}>
          <KATextInput {...textInputsCommon}
            textInputRef={(ref) => this.confirmPasswordInput = ref as TextInput | null}
            returnKeyType={"done"}
            secureTextEntry={true}
            value={confirmPassword}
            onChangeText={(text) => { this.setState({ dirty: true, confirmPassword: text }); }}
            onSubmitEditing={() => { this.showAlert(this.saveDataAlert, this.saveData); }}
          />
        </TextFieldWrapper>
      </View>
    );

    let type: MyAccountTemplateType;
    if (IS_TABLET) {
      type = dirty ? MyAccountTemplateType.SaveCancel : MyAccountTemplateType.Close;
    } else {
      type = dirty ? MyAccountTemplateType.SaveCancel : MyAccountTemplateType.None;
    }

    return (
      <MyAccountTemplate
        type={type}
        header1={I18n.t("my")}
        header2={I18n.t("account")}
        onCancel={() => this.cancel()}
        onSave={() => this.showAlert(this.saveDataAlert, this.saveData)}
        onBackClose={onClose}
        containerStyle={IS_TABLET ? {} : styles.containerPhoneStyle}
        scroll={!IS_TABLET}
      >
        <AcceptCancelAlert
          isVisible={alertVisible}
          {...alertData}
          onClose={onCloseAlert}
        />
        <View style={styles.group}>
          <TextFieldWrapper
            header={I18n.t("first_name")}
            textContainer={dirtyInputStyle}>
            <KATextInput {...textInputsCommon}
              textInputRef={(ref) => this.firstNameInput = ref as TextInput | null}
              value={firstName}
              returnKeyType={"next"}
              onChangeText={(text) => { this.setState({ dirty: true, firstName: text }); }}
              onSubmitEditing={() => { this.lastNameInput && this.lastNameInput.focus(); }}
            />
          </TextFieldWrapper>
          <TextFieldWrapper
            header={I18n.t("last_name")}
            textContainer={dirtyInputStyle}>
            <KATextInput {...textInputsCommon}
              textInputRef={(ref) => this.lastNameInput = ref as TextInput | null}
              returnKeyType={"next"}
              value={lastName}
              onChangeText={(text) => { this.setState({ dirty: true, lastName: text }); }}
              onSubmitEditing={() => { this.emailInput && this.emailInput.focus(); }}
            />
          </TextFieldWrapper>
          <TextFieldWrapper
            header={I18n.t("email_address").toUpperCase()}
            textContainer={styles.cleanInput}
          >
            <KATextInput {...textInputsCommon}
              textInputRef={(ref) => this.emailInput = ref as TextInput | null}
              returnKeyType={"next"}
              keyboardType="email-address"
              editable={false} // BIOT-9918
              value={email}
              onChangeText={(text) => { this.setState({ dirty: true, email: text }); }}
              onSubmitEditing={() => { this.currentPasswordInput && this.currentPasswordInput.focus(); }}
            />
          </TextFieldWrapper>
        </View>
        {IS_TABLET ? passwordInputs : (
          resetPassword ? passwordInputs : (
            <ThemedTextButton
              theme="red"
              centered
              onPress={() => this.setState({ dirty: true, resetPassword: true })}
              text={I18n.t("reset_password")}
            />
          )
        )}
        <View style={[styles.group, { marginTop: 9, marginBottom: 28 }]}>
          <Line />
          <RoundButtonWithHeader
            type={RoundButtonType.Appliance}
            header={I18n.t("appliance")}
            subheader={I18n.t("add_new")}
            onPress={onAddAppliance}
          />
          <Line />
          <RoundButtonWithHeader
            type={RoundButtonType.Units} header={I18n.t("units")}
            subheader={this.unitDescription()}
            onPress={onChangeUnits}
          />
          <Line />
          <RoundButtonWithHeader
            type={RoundButtonType.About} header={I18n.t("about")}
            onPress={onAbout}
          />
          <Line />
          <RoundButtonWithHeader
            type={RoundButtonType.SignOut} header={I18n.t("sign_out")}
            onPress={onSignOut}
          />
          <Line />
        </View>
      </MyAccountTemplate>
    );
  }

  private readonly saveDataAlert = {
    title: I18n.t("save_changes"),
    text: I18n.t("save_changes_info"),
    acceptText: I18n.t("save"),
    cancelText: I18n.t("cancel").toUpperCase(),
  };

  private unitDescription(): string {
    const u = (UserModel.instance() as KitchenAidUserModel).unit.sv();

    if (u === UnitSystem.Imperial) {
      return I18n.t("imperial");
    } else {
      return I18n.t("metric");
    }
  }

  private readonly hideAlert = () => {
    this.setState({ alertVisible: false });
  }

  private showAlert(alertData: AlertData, onCloseAlert: (result: boolean) => void = this.hideAlert) {
    Keyboard.dismiss();

    this.setState({
      alertVisible: true,
      alertData,
      onCloseAlert,
    });
  }

  private cancel() {
    Keyboard.dismiss();

    const savedValues = this.state.savedValues;
    this.setState({
      firstName: savedValues.firstName,
      lastName: savedValues.lastName,
      email: savedValues.email,
      currentPassword: savedValues.confirmPassword,
      newPassword: savedValues.newPassword,
      confirmPassword: savedValues.confirmPassword,
      dirty: false,
      resetPassword: false,
    });
  }

  private saveData = (result) => {
    if (!result) {
      this.hideAlert();
      return;
    }

    const {
      firstName,
      lastName,
      email,
      currentPassword,
      newPassword,
      confirmPassword,
    } = this.state;

    if (newPassword != "") {
      if (newPassword == confirmPassword) {
        if (currentPassword != "") {
          UserModel.instance().changePassword(currentPassword, newPassword)
          .then(() => {
            // TODO confirm succsess ?
          })
          .catch(() => {
            this.showAlert({
              text: I18n.t("current_password_invalid"),
              acceptText: I18n.t("ok").toUpperCase(),
            });
          });
        } else {
          this.showAlert({
            text: I18n.t("current_password_invalid"),
            acceptText: I18n.t("ok").toUpperCase(),
          });
          return;
        }
      } else {
        this.showAlert({
          text: I18n.t("passwords_different"),
          acceptText: I18n.t("ok").toUpperCase(),
        });
        return;
      }
    }

    const savedValues = Object.assign({}, this.state.savedValues);

    savedValues.firstName = firstName;
    savedValues.lastName = lastName;
    savedValues.email = email;

    if (
      UserModel.instance().name.sv() !== firstName ||
      UserModel.instance().surname.sv() !== lastName ||
      UserModel.instance().email.sv() !== email
    ) {
      UserModel.instance().name.updateValue(firstName);
      UserModel.instance().surname.updateValue(lastName);
      // UserModel.instance().email.updateValue(email); BIOT-9918
      UserModel.instance().update();
    }

    savedValues.currentPassword = "";
    savedValues.newPassword = "";
    savedValues.confirmPassword = "";

    this.setState({
      savedValues,
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
      dirty: false,
      resetPassword: false,
      alertVisible: false,
    });
  }

  private firstNameInput: TextInput | null;
  private lastNameInput: TextInput | null;
  private emailInput: TextInput | null;
  private currentPasswordInput: TextInput | null;
  private newPasswordInput: TextInput | null;
  private confirmPasswordInput: TextInput | null;
}

const Line = () => IS_TABLET ? <Vr /> : <Hr style={{ marginVertical: 13 }} />;

const styles = StyleSheet.create({
  header: {
    opacity: 0.5,
    fontFamily: "Muli",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 2,
    textAlign: "left",
    color: "#000000",
    height: 22,
  },
  group: {
    flexDirection: IS_TABLET ? "row" : undefined,
    justifyContent: "space-between",
    marginBottom: 30,
  },

  rbheader: {
    opacity: 0.8,
    fontFamily: "Muli",
    fontSize: 14,
    fontWeight: "900",
    lineHeight: 20,
    letterSpacing: 2,
    textAlign: IS_TABLET ? "center" : undefined,
    color: "#000000",
    backgroundColor: "transparent",
  },
  rbheader2: {
    fontFamily: "Muli",
    fontSize: 11,
    fontWeight: "900",
    lineHeight: 18,
    letterSpacing: 2,
    textAlign: IS_TABLET ? "center" : undefined,
    color: "#d33131",
    backgroundColor: "transparent",
  },
  textContainer: {
    ...PlatformSelect<ViewStyle>({
      anyTablet: {
        width: 215,
      },
      anyPhone: {
        shadowColor: "rgba(0, 0, 0, 0.1)",
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowRadius: 8,
        shadowOpacity: 1,
      },
    }),
    height: 48,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.3)",
    borderStyle: "solid",
    borderRadius: 2,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  cleanInput: {
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    borderWidth: 0,
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
    backgroundColor: "transparent",
  },
  containerPhoneStyle: {
    marginLeft: 30,
    marginRight: 30,
  },
  circle: {
    width: 62,
    height: 62,
    borderRadius: 31,
  },
  imageStyle: {
    width: 23,
    height: 23,
    transform: [{ rotate: "-90deg" }],
    marginRight: 19,
  },
});
