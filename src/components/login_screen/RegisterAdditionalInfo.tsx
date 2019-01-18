import { I18n } from "iocentro-apps-common-bits";
import React, { Component } from "react";
import {
  Dimensions,
  Keyboard,
  LayoutAnimation,
  StyleSheet,
  TextInput,
  TextInputProperties,
  View,
  ViewStyle
} from "react-native";
import DeviceInfo from "react-native-device-info";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Modal from "react-native-modal";
import WheelPicker from "react-native-wheel-picker";

import { ShowAgreements, ShowPrivacyPolicy, ShowTerms } from "../../App";
import { Dims, IS_TABLET, PlatformSelect } from "../../Platform";
import { REGISTRATION_COUNTRIES } from "../../Utils";
import { GradientTextButton, ThemedTextButton } from "../Buttons";
import { KATextInput } from "../KATextInput";
import { AgreementsModalCallback } from "../paper_modals/Agreements";
import { TextScaledOnPhone } from "../ScaledText";
import { TouchableScale } from "../TouchableScale";
import { CheckBox } from "./CheckBox";
import { DescribedField } from "./Description";

const PickerItem = WheelPicker.Item;

interface RegisterAdditionalInfoProps {
  address: string;
  addressOpt: string;
  city: string;
  state: string;
  province: string;
  country: string;
  phone: string;

  termsAgree: boolean;
  onRegister;
  updateValue;
}

interface RegisterAdditionalInfoState {
  showModal: boolean;
  modalIndex: number;
  keyboardVisible: boolean;
  spacerHeight: number;
}

export class RegisterAdditionalInfo extends Component<
  RegisterAdditionalInfoProps,
  RegisterAdditionalInfoState
> {
  private spacer;
  private spacerHeight;
  private _keyboardWillShow;
  private _keyboardWillHide;

  constructor(props: RegisterAdditionalInfoProps) {
    super(props);
    const countryIndex = REGISTRATION_COUNTRIES.findIndex(country => {
      return country.isoAlfa2 === DeviceInfo.getDeviceCountry();
    });
    this.state = {
      showModal: false,
      modalIndex: countryIndex === -1 ? 0 : countryIndex,
      keyboardVisible: false,
      spacerHeight: 0
    };
  }

  public componentDidMount() {
    setTimeout(() => {
      this.spacer &&
        this.spacer.measure((_fx, _fy, _width, _height, _px, py) => {
          this.spacerHeight = Math.max(
            Dimensions.get("window").height - py - 128,
            0
          );
          this.setState({
            spacerHeight: this.spacerHeight
          });
        });
    }, 0);
  }

  public componentWillMount() {
    this._keyboardWillShow = Keyboard.addListener("keyboardDidShow", () => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      this.setState({ spacerHeight: 50, keyboardVisible: true });
    });

    this._keyboardWillHide = Keyboard.addListener("keyboardDidHide", () => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      this.setState({
        spacerHeight: this.spacerHeight,
        keyboardVisible: false
      });
    });
  }

  public componentWillUnmount() {
    this._keyboardWillShow.remove();
    this._keyboardWillHide.remove();
  }

  public render() {
    return (
      <View style={styles.container}>
        {IS_TABLET
          ? this._renderTablet(this.inputs())
          : this._renderPhone(this.inputs())}
      </View>
    );
  }

  private _renderTablet(
    inputs: [
      JSX.Element,
      JSX.Element,
      JSX.Element,
      JSX.Element,
      JSX.Element,
      JSX.Element
    ]
  ) {
    const [
      addressInput,
      addressOptInput,
      cityInput,
      provinceInput,
      stateInput,
      phoneInput
    ] = inputs;
    return (
      <View style={{ height: "100%", alignItems: "center" }}>
        {this.renderModal()}
        <KeyboardAwareScrollView
          showsVerticalScrollIndicator={false}
          extraScrollHeight={-200}
          style={styles.inputsContainer}
        >
          <View style={styles.passwordRow}>
            <DescribedField description={I18n.t("address").toUpperCase()}>
              {addressInput}
            </DescribedField>

            <View style={{ width: Dims.scaleH(20) }} />

            <DescribedField description={I18n.t("addressOpt").toUpperCase()}>
              {addressOptInput}
            </DescribedField>
          </View>

          <View style={styles.passwordRow}>
            <DescribedField description={I18n.t("city").toUpperCase()}>
              {cityInput}
            </DescribedField>

            <View style={{ width: Dims.scaleH(20) }} />

            <DescribedField description={I18n.t("province").toUpperCase()}>
              {provinceInput}
            </DescribedField>
          </View>

          <View style={styles.passwordRow}>
            <DescribedField description={I18n.t("state").toUpperCase()}>
              {stateInput}
            </DescribedField>

            <View style={{ width: Dims.scaleH(20) }} />

            <DescribedField description={I18n.t("country").toUpperCase()}>
              <ThemedTextButton
                theme="white"
                style={{
                  minWidth: 100,
                  justifyContent: "center",
                  alignSelf: "flex-start"
                }}
                touchableExpand={10}
                onPress={() => {
                  this.setState({ showModal: true });
                }}
                text={this.props.country && I18n.t(this.props.country)}
              />
            </DescribedField>
          </View>

          <View style={styles.passwordRow}>
            <DescribedField description={I18n.t("phone").toUpperCase()}>
              {phoneInput}
            </DescribedField>

            <View style={{ width: Dims.scaleH(20) }} />
            <TermsAndPrivacy
              termsAgree={this.props.termsAgree}
              onValueUpdated={(value, codes) => {
                this.props.updateValue("termsAgree", value);
                this.props.updateValue("termsCodes", codes);
              }}
            />
          </View>
          <View
            style={{ height: this.state.spacerHeight }}
            ref={view => {
              this.spacer = view;
            }}
          />
          <View
            style={{
              height: this.state.keyboardVisible ? 300 : 128,
              alignItems: "center"
            }}
          >
            <GradientTextButton
              theme="red"
              text={I18n.t("next").toUpperCase()}
              style={{ width: Dims.scaleH(180), height: Dims.scaleV(48) }}
              onPress={this.props.onRegister}
            />
          </View>
        </KeyboardAwareScrollView>
      </View>
    );
  }

  private _renderPhone(
    inputs: [
      JSX.Element,
      JSX.Element,
      JSX.Element,
      JSX.Element,
      JSX.Element,
      JSX.Element
    ]
  ) {
    const [
      addressInput,
      addressOptInput,
      cityInput,
      provinceInput,
      stateInput,
      phoneInput
    ] = inputs;

    return (
      <View style={{ height: "100%", width: "100%", paddingHorizontal: 15 }}>
        {this.renderModal()}
        <KeyboardAwareScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            justifyContent: "center",
            alignContent: "center",
            alignItems: "center"
          }}
        >
          <DescribedField
            style={{ width: "100%" }}
            description={I18n.t("address").toUpperCase()}
          >
            {addressInput}
          </DescribedField>

          <DescribedField
            style={{ width: "100%", marginTop: 15 }}
            description={I18n.t("addressOpt").toUpperCase()}
          >
            {addressOptInput}
          </DescribedField>

          <DescribedField
            style={{ width: "100%", marginTop: 15 }}
            description={I18n.t("city").toUpperCase()}
          >
            {cityInput}
          </DescribedField>

          <DescribedField
            style={{ width: "100%", marginTop: 15 }}
            description={I18n.t("province").toUpperCase()}
          >
            {provinceInput}
          </DescribedField>

          <DescribedField
            style={{ width: "100%", marginTop: 15 }}
            description={I18n.t("state").toUpperCase()}
          >
            {stateInput}
          </DescribedField>

          <DescribedField
            style={{ width: "100%", marginTop: 15 }}
            description={I18n.t("country").toUpperCase()}
          >
            <ThemedTextButton
              theme="white"
              style={{
                minWidth: 100,
                justifyContent: "center",
                alignSelf: "flex-start"
              }}
              touchableExpand={10}
              onPress={() => {
                this.setState({ showModal: true });
              }}
              text={I18n.t(this.props.country)}
            />
          </DescribedField>

          <DescribedField
            style={{ width: "100%", marginTop: 15, marginBottom: 25 }}
            description={I18n.t("phone").toUpperCase()}
          >
            {phoneInput}
          </DescribedField>

          <TermsAndPrivacy
            termsAgree={this.props.termsAgree}
            onValueUpdated={(value, codes) => {
              this.props.updateValue("termsAgree", value);
              this.props.updateValue("termsCodes", codes);
            }}
          />

          <View style={{ marginVertical: 50, alignItems: "center" }}>
            <GradientTextButton
              theme="red"
              text={I18n.t("next").toUpperCase()}
              style={{ width: Dims.scaleH(180), height: Dims.scaleV(48) }}
              onPress={this.props.onRegister}
            />
          </View>
        </KeyboardAwareScrollView>
      </View>
    );
  }

  private renderModal = () => {
    return (
      <Modal
        isVisible={this.state.showModal}
        style={styles.bottomModal}
        backdropOpacity={0}
        onBackdropPress={() => {
          this.setState({
            showModal: false
          });
          this.props.updateValue(
            "country",
            REGISTRATION_COUNTRIES[this.state.modalIndex].isoAlfa2
          );
        }}
      >
        <View
          style={{
            backgroundColor: "rgba(0,0,0,0.75)",
            alignContent: "center"
          }}
        >
          <WheelPicker
            style={{
              height: 160,
              width: "100%",
              overflow: "hidden",
              alignSelf: "center"
            }}
            selectedValue={this.state.modalIndex}
            itemStyle={{
              fontFamily: "Muli-Bold",
              fontSize: IS_TABLET ? 20 : 18,
              fontWeight: "800",
              textAlign: "center",
              color: "#ffffff",
              height: 160
            }}
            onValueChange={(modalIndex: number) => {
              this.setState({ modalIndex });
            }}
          >
            {REGISTRATION_COUNTRIES.map((country, i) => (
              <PickerItem
                label={country.translation}
                value={i}
                key={country.isoAlfa2}
              />
            ))}
          </WheelPicker>
        </View>
      </Modal>
    );
  };

  private _onNextSubmit(input: TextInput | null) {
    if (input) {
      input.focus();
    }
  }

  private textInputsCommon: TextInputProperties = {
    style: styles.input,
    selectionColor: "white",
    multiline: false,
    autoCorrect: false,
    autoCapitalize: "none"
  };

  private inputs = (): [
    JSX.Element,
    JSX.Element,
    JSX.Element,
    JSX.Element,
    JSX.Element,
    JSX.Element
  ] => {
    return [
      <KATextInput
        {...this.textInputsCommon}
        onSubmitEditing={() => {
          this._onNextSubmit(this._addressOptInput);
        }}
        returnKeyType={"next"}
        onChangeText={text => {
          this.props.updateValue("address", text);
        }}
      />,
      <KATextInput
        {...this.textInputsCommon}
        textInputRef={input => {
          this._addressOptInput = input as TextInput | null;
        }}
        onSubmitEditing={() => {
          this._onNextSubmit(this._cityInput);
        }}
        returnKeyType={"next"}
        onChangeText={text => {
          this.props.updateValue("addressOpt", text);
        }}
      />,
      <KATextInput
        {...this.textInputsCommon}
        textInputRef={input => {
          this._cityInput = input as TextInput | null;
        }}
        onSubmitEditing={() => {
          this._onNextSubmit(this._provinceInput);
        }}
        returnKeyType={"next"}
        onChangeText={text => {
          this.props.updateValue("city", text);
        }}
      />,
      <KATextInput
        {...this.textInputsCommon}
        textInputRef={input => {
          this._provinceInput = input as TextInput | null;
        }}
        onSubmitEditing={() => {
          this._onNextSubmit(this._stateInput);
        }}
        returnKeyType={"next"}
        onChangeText={text => {
          this.props.updateValue("province", text);
        }}
      />,
      <KATextInput
        {...this.textInputsCommon}
        textInputRef={input => {
          this._stateInput = input as TextInput | null;
        }}
        returnKeyType={"next"}
        onSubmitEditing={() => {
          this._onNextSubmit(this._countryInput);
        }}
        onChangeText={text => {
          this.props.updateValue("state", text);
        }}
      />,
      <KATextInput
        {...this.textInputsCommon}
        returnKeyType={"done"}
        onSubmitEditing={() => {
          this.props.onRegister();
        }}
        onChangeText={text => {
          this.props.updateValue("phone", text);
        }}
      />
    ];
  };

  private _addressOptInput: TextInput | null;
  private _cityInput: TextInput | null;
  private _stateInput: TextInput | null;
  private _provinceInput: TextInput | null;
  private _countryInput: TextInput | null;
}

interface TermsAndPrivacyProps {
  termsAgree: boolean;
  onValueUpdated: AgreementsModalCallback;
  onRegisterPressed?: () => void;
}

class TermsAndPrivacy extends Component<TermsAndPrivacyProps> {
  public render() {
    const props = this.props;
    return (
      <View style={styles.buttonAndCheckBox}>
        <View style={styles.checkBoxFlex}>
          <TouchableScale
            style={[styles.checkBoxContainer]}
            onPress={this.showAgreements}
          >
            <CheckBox
              style={{ opacity: 0.5 }}
              checked={props.termsAgree}
              onPress={this.showAgreements}
            />
            <View style={styles.agreeConainer}>
              <TextScaledOnPhone style={styles.agreeText}>
                {I18n.t("by_registering_you_agree1") + " "}
              </TextScaledOnPhone>
              <TextScaledOnPhone
                style={[styles.agreeText, styles.underline]}
                onPress={ShowTerms}
              >
                {I18n.t("terms_of_use") + " "}
              </TextScaledOnPhone>
              <TextScaledOnPhone style={styles.agreeText}>
                {I18n.t("and")}
              </TextScaledOnPhone>
              <TextScaledOnPhone
                style={[styles.agreeText, styles.underline]}
                onPress={ShowPrivacyPolicy}
              >
                {" " + I18n.t("privacy_policy")}
              </TextScaledOnPhone>
            </View>
          </TouchableScale>
        </View>
      </View>
    );
  }

  private showAgreements = () => {
    ShowAgreements(this.props.onValueUpdated);
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 74,
    width: "100%",
    paddingTop: 15,
    paddingHorizontal: 15
  },
  passwordRow: {
    flexDirection: "row",
    width: "100%",
    marginTop: 15
  },
  inputsContainer: {
    width: Dims.scaleH(628)
  },
  input: {
    flex: 1,
    fontFamily: "Muli",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 2,
    color: "#ffffff"
  },
  buttonAndCheckBox: {
    ...PlatformSelect<ViewStyle>({
      anyTablet: {
        flexDirection: "row",
        flex: 1,
        alignItems: "flex-end",
        paddingVertical: 7
      },
      anyPhone: {
        flex: 1,
        flexDirection: "row"
      }
    })
  },
  checkBoxFlex: {
    ...PlatformSelect<ViewStyle>({
      anyTablet: {
        flex: 3.26
      },
      anyPhone: {
        flex: 1,
        alignItems: "center"
      }
    })
  },
  checkBoxContainer: {
    flexDirection: "row",
    alignItems: "center"
  },
  agreeConainer: {
    ...PlatformSelect<ViewStyle>({
      anyTablet: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginHorizontal: Dims.scaleH(12)
      },
      anyPhone: {
        flex: 1,
        flexDirection: "row",
        flexWrap: "wrap",
        marginHorizontal: Dims.scaleH(15)
      }
    }),
    opacity: 0.8
  },
  agreeText: {
    ...PlatformSelect({
      anyTablet: {
        fontSize: 13,
        letterSpacing: 0.5
      },
      anyPhone: {
        fontSize: 11,
        letterSpacing: 0.39
      }
    }),
    fontFamily: "Merriweather",
    fontWeight: "300",
    fontStyle: "italic",
    color: "#ffffff"
  },
  underline: {
    textDecorationLine: "underline"
  },
  bottomModal: {
    justifyContent: "flex-end",
    margin: 0
  }
});
