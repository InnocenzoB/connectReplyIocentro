import { ValueBase } from "iocentro-datamodel";
import React, { Component, ReactNode } from "react";
import ReactNative, {
  Dimensions,
  Image,
  Modal,
  StyleSheet,
  TouchableWithoutFeedback,
  UIManager,
  View,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { Circle, Path, Svg } from "react-native-svg";
import { Subscription } from "rxjs";
import {
  UserModel,
  I18n,
} from "iocentro-apps-common-bits";

import { CookMotorSpeed, UiFormatMotorSpeed } from "../model/CookProcessorModel";
import { Dims, IS_TABLET, PlatformSelect } from "../Platform";
import { noNull } from "../Utils";
import { IconButton } from "./Buttons";
import { TextScaledOnPhone } from "./ScaledText";
import { Slider } from "./Slider";
import { TimePicker } from "./TimePicker";
import { TouchableScale } from "./TouchableScale";
import { KitchenAidUserModel, UnitSystem } from "../model/KitchenAidUserModel";

const TEMP_ICON = require("../../img/icons/tempIcon.png");
const SPEED_ICON = require("../../img/icons/speedIcon.png");
const TIME_ICON = require("../../img/icons/timeIcon.png");
const WHITE_TEMP_ICON = require("../../img/icons/white_tempIcon.png");
const WHITE_SPEED_ICON = require("../../img/icons/white_speedIcon.png");
const WHITE_TIME_ICON = require("../../img/icons/white_timeIcon.png");
const SLIDER_UP_ICON = require("../../img/icons/plusIcon.png");
const SLIDER_DOWN_ICON = require("../../img/icons/minusIcon.png");

const POPUP_WIDTH = Math.min(455.5, Dimensions.get("window").width - 20);

// ----------------- Formatting labels -----------------

function fancyTimeFormat(time) {
  const hrs = Math.floor(time / 3600);
  const mins = Math.floor((time % 3600) / 60);
  const secs = time % 60;
  let ret = "";
  if (hrs > 0) {
    ret += `${hrs}:${mins < 10 ? "0" : ""}${mins}`;
    return ret;
  }
  ret += `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  return ret;
}

function fancyTempFormat(temp) {
  if (temp === 0) {
    return "---";
  }

  const u = (UserModel.instance() as KitchenAidUserModel).unit.sv();

  if (u === UnitSystem.Metric) {
    return ` ${temp}\u00B0`;
  } else {
    return ` ${Math.round((temp*1.8) + 32)}\u00B0`;
  }
}

function fancySpeedFormat(speed: number, shorten: boolean) {
  if (mapSpeedValueToSlider(speed) === 1) {
    return shorten ? I18n.t("intermittent_short") : I18n.t("intermittent");
  }
  return UiFormatMotorSpeed(speed);
}

function fancyWeightFormat(w) {
  const u = (UserModel.instance() as KitchenAidUserModel).unit.sv();

  if (u === UnitSystem.Metric) {
    return `${w}`;
  } else {
    return `${Math.round(w/28.3)}`;
  }
}

// ----------------- Value mapping -----------------

function mapSpeedSliderToValue(value: number) {
  switch (true) {
    case value == 0:
      return 0;
    case value == 1:
      return 11;
    case value >= 2:
      return value - 1;
  }
  return value;
}

function mapSpeedValueToSlider(value: number) {
  switch (true) {
    case value == 11:
      return 1;
    case value >= 1:
      return value + 1;
  }
  return value;
}

function mapTemperatureSliderToValue(value: number) {
  if (value == 30) { return 0; }
  return value;
}

function mapTemperatureValueToSlider(value: number) {
  if (value == 0) { return 30; }
  return value;
}

// ----------------- Adjusting slider steps -----------------

function sliderStepForTimer(value): number {
  switch (true) {
    case (value >= 0 && value < 10):
      return value - value % 5;
    case (value >= 10 && value < 2 * 60):
      return value - value % 10;
    case (value >= 2 * 60 && value < 5 * 60):
      return value - value % 15;
    case (value >= 5 * 60 && value < 10 * 60):
      return value - value % 30;
    case (value >= 10 * 60 && value < 60 * 60):
      return value - value % 60;
    case (value >= 60 * 60):
      return value - value % (5 * 60);
    default:
      return value - value % (5 * 60);
  }
}

function sliderStepForTemperature(value): number {
  switch (true) {
    case (value >= 30 && value < 40):
      return value - value % 10;

    default:
      return value - value % 5;
  }
}

// ----------------- Counting values for Add button -----------------

function addForTimer(value, add): number {
  const valueAfterAddition = value + add;
  switch (true) {
    case (valueAfterAddition <= 10):
      return 5;
    case (valueAfterAddition > 10 && valueAfterAddition <= 2 * 60):
      return 10;
    case (valueAfterAddition > 2 * 60 && valueAfterAddition <= 5 * 60):
      return 15;
    case (valueAfterAddition > 5 * 60 && valueAfterAddition <= 10 * 60):
      return 30;
    case (valueAfterAddition > 10 * 60 && valueAfterAddition <= 60 * 60):
      return 60;
    case (valueAfterAddition > 60 * 60):
      return (5 * 60);
    default:
      return (5 * 60);
  }
}

function addForTemperature(value, add): number {
  const valueAfterAddition = value + add;
  switch (true) {
    case (valueAfterAddition < 40):
      return 10;

    default:
      return 5;
  }
}

// ----------------------------------

export enum RoundButtonParamType {
  Temperature = "temp",
  Time = "time",
  Speed = "speed",
  Weight = "weight",
}

const buttonType = {
  temp: {
    type: RoundButtonParamType.Temperature,
    icon: { red: TEMP_ICON, white: WHITE_TEMP_ICON },
    format: fancyTempFormat,
    formatLight: fancyTempFormat,
    popupText: () => { return I18n.t("temperature"); },
    maxValue: 140,
    minValue: 40,
    maxProgress: 140,
    minProgress: 40,
    microStep: 5,
    step: 10,
    sliderStep: sliderStepForTemperature,
    addStep: addForTemperature,
    mapSliderToValue: mapTemperatureSliderToValue,
    mapValueToSlider: mapTemperatureValueToSlider,
  },
  speed: {
    type: RoundButtonParamType.Speed,
    icon: { red: SPEED_ICON, white: WHITE_SPEED_ICON },
    format: (value) => fancySpeedFormat(value, true),
    formatLight: (value) => fancySpeedFormat(value, false),
    popupText: () => { return I18n.t("speed"); },
    maxValue: CookMotorSpeed.MotorSpeedIntermittent,
    minValue: CookMotorSpeed.MotorSpeedOff,
    maxProgress: CookMotorSpeed.MotorSpeedIntermittent,
    minProgress: CookMotorSpeed.MotorSpeedOff,
    microStep: 1,
    step: 1,
    sliderStep: (value) => value,
    addStep: () => 1,
    mapSliderToValue: mapSpeedSliderToValue,
    mapValueToSlider: mapSpeedValueToSlider,
  },
  time: {
    type: RoundButtonParamType.Time,
    icon: { red: TIME_ICON, white: WHITE_TIME_ICON },
    format: (value) => fancyTimeFormat(value),
    formatLight: (value) => fancyTimeFormat(value),
    popupText: () => { return I18n.t("time"); },
    maxValue: 120 * 60,
    minValue: 0,
    maxProgress: 120 * 60,
    minProgress: 0,
    microStep: 5 * 60,
    step: 30 * 60,
    sliderStep: sliderStepForTimer,
    addStep: addForTimer,
    mapSliderToValue: (val) => val,
    mapValueToSlider: (val) => val,
  },
  weight: {
    type: RoundButtonParamType.Weight,
    icon: {},
    format: fancyWeightFormat,
    formatLight: fancyWeightFormat,
    popupText: () => { return I18n.t("weight"); },
    maxValue: 3000,
    minValue: 0,
    maxProgress: 3000,
    minProgress: 0,
    microStep: 50,
    step: 100,
    sliderStep: (value) => value - value % 50,
    addStep: () => 50,
    mapSliderToValue: (val) => val,
    mapValueToSlider: (val) => val,
  },
};

const CircuralProgress = (props: { size: number, angle: number, color: string }) => {
  const r = 0.44 * props.size;

  if (props.angle <= 0) {
    return null;
  } else if (props.angle >= 360) {
    return (
      <Svg width={props.size} height={props.size}>
        <Circle stroke={props.color}
          strokeWidth={"5"}
          fill={"transparent"}
          cx={props.size / 2} cy={props.size / 2} r={r} />
      </Svg>
    );
  } else {
    const a = (props.angle) * Math.PI / 180;
    const startx = props.size / 2;
    const starty = props.size / 2 - r;
    const endx = props.size / 2 + r * Math.sin(a);
    const endy = props.size / 2 - r * Math.cos(a);

    return (
      <Svg width={props.size} height={props.size}>
        <Path
          stroke={props.color}
          strokeWidth={"5"}
          strokeLinecap={"round"}
          fill={"transparent"}
          d={`M${startx} ${starty} A ${r} ${r} 0 ${props.angle > 180 ? 1 : 0} 1 ${endx} ${endy}`} />
      </Svg>
    );
  }
};

const Background = (props: {
  white: boolean;
  disabled: boolean;
  readonly: boolean;
  children: ReactNode;
  pressed: () => void;
  me: (me: TouchableScale | null) => void;
  sizeStyle: any;
  progress: ReactNode
}) => {
  const content = props.readonly ?
    props.children : (
      <TouchableScale disabled={props.disabled} ref={(component) => { props.me(component as TouchableScale | null); }}
        style={[{ alignItems: "center", justifyContent: "center" }, props.sizeStyle.size]}
        onPress={props.pressed}>
        {props.children}
      </TouchableScale>);

  if (props.white) {
    return (
      <LinearGradient style={[styles.button, props.sizeStyle.size]} colors={["#ffffffff", "#f4e8e8ff"]}>
        <View style={[{
          alignItems: "center",
          justifyContent: "center",
          borderColor: "rgb(203,0,0)",
          borderWidth: 2,
        },
        props.sizeStyle.size]} >
          {props.progress}
          {content}
        </View>
      </LinearGradient>
    );
  } else if (props.disabled) {
      return (<LinearGradient style={[styles.button, props.sizeStyle.size]} colors={["#ffffff", "#ffffff"]}>
      <View style={[{
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 0,
              backgroundColor: "rgb(103,103,103)"
          },
          props.sizeStyle.size]}>
        {props.progress}
        {content}
      </View>
    </LinearGradient>);
    } else {
    return (
      <LinearGradient style={[styles.button, props.sizeStyle.size]} colors={["#d4000dff", "#c00000ff"]}>
        {props.progress}
        {content}
      </LinearGradient>);
  }
};

export interface RoundButtonParamProps {
  type: RoundButtonParamType;
  value: number | string;
  minValue?: number;
  maxValue?: number;
  minProgress?: number;
  maxProgress?: number;
  step?: number;
  smallStep?: number;
  readonly?: boolean;
  theme?: "red" | "white";
  size?: "s" | "l" | "xl";
  progress?: boolean;
  sliderStep?: (v: number) => number;
  addStep?: (value: number, add: number) => number;
  onValueChanged?: (value: number) => void;
}
export interface RoundButtonParamState {
  modalVisible: boolean;
  modalPosX: number;  // center position (below button)
  modalPosY: number;
  offset: number;
  displayValue?: number;
  modalValue?: number;
}

export class RoundButtonParam extends Component<RoundButtonParamProps, RoundButtonParamState> {
  public static defaultProps = {
    type: RoundButtonParamType.Temperature,
    value: 0,
    readonly: false,
    theme: "red",
    size: "s",
    slider: false,
  };

  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false,
      modalPosX: 0,
      modalPosY: 0,
      offset: 0,
    };
  }

  private _mycomponent: TouchableScale | null;

  private _renderModal(config: any): JSX.Element {
    // I know.. any :D
    return (
      <Modal visible={this.state.modalVisible} transparent={true} animationType={"none"}
        onRequestClose={this._modalCancel}>
        <View style={{ width: "100%", height: "100%" }}>
          <TouchableWithoutFeedback style={{ width: "100%", height: "100%" }} onPress={this._modalCancel}>
            <View style={{ width: "100%", height: "100%", backgroundColor: "#00000000" }} />
          </TouchableWithoutFeedback>
          <View style={[styles.popup, {
            left: this.state.modalPosX - POPUP_WIDTH / 2 - this.state.offset,
            top: this.state.modalPosY,
          }]}>
            <View style={[styles.triangle, {
              marginLeft: Math.max(this.state.offset * 2, 0),
              marginRight: Math.max(-this.state.offset * 2, 0),
            }]} />
            <View style={{ flex: 1, backgroundColor: "#cb0000", width: "100%", borderRadius: 2 }}>
              {config.type == RoundButtonParamType.Time ?
                <TimePicker
                  maxValueInSecs={config.maxValue}
                  minValueInSecs={config.minValue}
                  valueInSecs={config.mapValueToSlider(this._modalValue(config))}
                  onChange={(value) => this._onSliderChanged(config.mapSliderToValue(value))}
                />
                :
                <View style={{
                  flex: 1, marginHorizontal: IS_TABLET ? 20 : 8,
                  marginTop: 17, marginBottom: 0, alignItems: "center",
                }} >
                  <View style={{ flexDirection: "row", justifyContent: "space-between", width: "100%" }}>
                    <TextScaledOnPhone style={styles.popupTitle}>{config.popupText().toUpperCase()}</TextScaledOnPhone>
                    <TextScaledOnPhone style={styles.popupValue}>
                      {config.formatLight(this._modalValue(config))}
                    </TextScaledOnPhone>
                  </View>

                  <Slider
                    buttonType={config.type}
                    maxValue={config.maxValue}
                    minValue={config.minValue}
                    step={config.step}
                    microStep={config.microStep}
                    labelFormat={config.format}
                    labelFormatLight={config.formatLight}
                    sliderStep={config.sliderStep}
                    value={config.mapValueToSlider(this._modalValue(config))}
                    width={POPUP_WIDTH - (IS_TABLET ? 44 : 8)}
                    onChange={(value) => this._onSliderChanged(config.mapSliderToValue(value))}
                    onPageDown={() => this._add(-1, config, true)}
                    onPageUp={() => this._add(1, config, true)}
                    mapValueToSlider={config.mapSliderToValue}
                  />

                  <View style={{ width: POPUP_WIDTH - 44, height: 1, backgroundColor: "rgba(255, 255, 255, 0.3)" }} />
                  <View style={{ flexDirection: "row", marginVertical: 4, alignContent: "center" }}>
                    <IconButton
                      style={styles.upDownButton}
                      onPress={() => this._add(-1, config)}
                      icon={SLIDER_DOWN_ICON}
                      scaleFactor={0.8}
                    />
                    <View style={{ width: 1, height: 30, backgroundColor: "rgba(255, 255, 255, 0.3)" }} />
                    <IconButton
                      style={styles.upDownButton}
                      onPress={() => this._add(1, config)}
                      icon={SLIDER_UP_ICON}
                      scaleFactor={0.8}
                    />
                  </View>
                </View>
              }
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  public render() {
    const config = this._config();
    const modal = this.props.readonly ? null : this._renderModal(config);
    const styleSize = sizeStyle[this.props.size || "s"];
    const theme = this.props.theme || "red";
    const styleTheme = themeStyle[theme];
    const progress = this.props.progress ? (
      <View style={{ position: "absolute" }}>
        <CircuralProgress size={StyleSheet.flatten(styleSize.size).width}
          angle={this._angle()} color={theme == "white" ? "#cb0000" : "#ffffff"} />
      </View>)
      : null;

    return (
      <Background disabled={this.props.remoteControlOn == null ? false : !this.props.remoteControlOn} readonly={this.props.readonly == true} white={this.props.theme == "white"} pressed={this._pressed}
        me={(me) => { this._mycomponent = me; }} sizeStyle={styleSize} progress={progress}>
        <Image source={config.icon[theme]} />
        <TextScaledOnPhone style={[styleTheme.buttonText, styleSize.font]}>{this._valueStr(config)}</TextScaledOnPhone>
        {modal}
      </Background>
    );
  }

  private _modalCancel = () => {
    if ((this.state.modalValue != this.props.value) && this.props.onValueChanged &&
      (this.state.modalValue != null)) {
      this.props.onValueChanged(this.state.modalValue);
    }
    this.setState({ modalVisible: false, modalPosX: 0, modalPosY: 0, displayValue: undefined, modalValue: undefined });
  }

  private _pressed = () => {
    const { width } = Dimensions.get("window");

    const handle = ReactNative.findNodeHandle(this._mycomponent);
    if (handle) {
      UIManager.measure(handle,
        (_x, _y, mwidth, mheight, px, py) => {
          const cx = px + mwidth / 2;
          const margin = 10;
          let off = 0;

          if (cx + margin + POPUP_WIDTH / 2 > width) {
            off = (cx + margin + POPUP_WIDTH / 2) - width;
          } else if (cx - margin - POPUP_WIDTH / 2 < 0) {
            off = (cx - margin - POPUP_WIDTH / 2);
          }
          this.setState({
            modalVisible: true,
            modalPosX: cx,
            modalPosY: py + mheight + 21,
            offset: off,
            modalValue: this._value(this._config),
          });
        });
    }
  }

  private _config() {
    const config = Object.assign({}, buttonType[this.props.type]);
    if (this.props.minValue) { config.minValue = this.props.minValue; }
    if (this.props.maxValue) { config.maxValue = this.props.maxValue; }
    if (this.props.minProgress) { config.minProgress = this.props.minProgress; }
    if (this.props.maxProgress) { config.maxProgress = this.props.maxProgress; }
    if (this.props.step) { config.step = this.props.step; }
    if (this.props.smallStep) { config.microStep = this.props.smallStep; }
    if (this.props.sliderStep) { config.sliderStep = this.props.sliderStep; }
    if (this.props.addStep) { config.addStep = this.props.addStep; }
    return config;
  }

  private _value(config): number {
    if (this.state.displayValue != null) {
      return this.state.displayValue;
    } else {
      if (typeof this.props.value != "number") {
        return config.minValue;
      }
      return this.props.value;
    }
  }

  private _modalValue(config): number {
    if (this.state.modalValue != null) {
      return this.state.modalValue;
    } else {
      if (typeof this.props.value != "number") {
        return config.minValue;
      }
      return this.props.value;
    }
  }

  private _valueStr(config): string {
    if (this.state.displayValue != null) {
      return config.format(this.state.displayValue);
    } else {
      if (typeof this.props.value != "number") {
        return this.props.value;
      }
      return config.format(this.props.value);
    }
  }

  private _angle(): number {
    const config = this._config();
    return 360 * (this._value(config) - config.minProgress) / (config.maxProgress - config.minProgress);
  }

  private _add(x: number, config, page: boolean = false) {

    let newValue =
      config.mapValueToSlider(this._modalValue(config)) +
      x * (page ? config.step : config.addStep(config.mapValueToSlider(this._modalValue(config)), x));

    newValue = Math.min(newValue, config.maxValue);
    newValue = Math.max(newValue, config.minValue);

    this.setState({
      modalValue: config.mapSliderToValue(newValue),
    });
  }

  private _onSliderChanged = (val: number) => {
    this.setState({
      modalValue: val,
    });
  }
}
export interface RoundButtonParamVBProps {
  value: ValueBase;
  defaultValue?: string;
  type: RoundButtonParamType;
  readonly?: boolean;
  theme?: "red" | "white";
  size?: "s" | "l" | "xl";
  progress?: boolean;
  minValue?: number;
  maxValue?: number;
  sliderStep?: (v: number) => number;
  addStep?: (value: number, add: number) => number;
  onValueChanged?: (value: number) => void;
  remoteControlOn?: boolean;
}
export class RoundButtonParamVB extends Component<RoundButtonParamVBProps, {}> {
  public static defaultProps = {
    defaultValue: null,
  };

  public componentWillMount() {
    this._valueChanged = this.props.value.subscribe(() => {
      this.forceUpdate();
    });
  }
  public componentWillUnmount() {
    this._valueChanged.unsubscribe();
  }

  public componentWillReceiveProps(nextProps) {
    if (this._valueChanged) {
      this._valueChanged.unsubscribe();
    }
    this._valueChanged = nextProps.value.subscribe(() => {
      this.forceUpdate();
    });
  }
  public render() {
    const value = noNull(this.props.value.sv(), this.props.defaultValue);

    return (
      <RoundButtonParam
        remoteControlOn={this.props.remoteControlOn}
        value={value}
        type={this.props.type}
        readonly={this.props.readonly}
        theme={this.props.theme}
        size={this.props.size}
        progress={this.props.progress}
        sliderStep={this.props.sliderStep}
        addStep={this.props.addStep}
        onValueChanged={this.props.onValueChanged || ((v: number) => {
          this.props.value.updateValue(v);
        })
        }
      />
    );
  }
  private _valueChanged: Subscription;
}

// ================================================================================================
// SIZE:
const sizeStyle = {
  s: StyleSheet.create({
    size: {
      ...PlatformSelect({
        anyTablet: {
          width: 96,
          height: 96,
        },
        anyPhone: {
          width: Dims.scaleV(77.8),
          height: Dims.scaleV(77.8),
        },
      }),
      borderRadius: Dims.scaleV(77.8),
    },
    font: {
      fontSize: IS_TABLET ? 17 : 13,
    },
  }),
  l: StyleSheet.create({
    size: {
      ...PlatformSelect({
        anyTablet: {
          width: 150,
          height: 150,
        },
        anyPhone: {
          width: Dims.scaleV(121.5),
          height: Dims.scaleV(121.5),
        },
      }),
      borderRadius: Dims.scaleV(121.5),
    },
    font: {
      fontSize: IS_TABLET ? 20 : 17,
    },
  }),
  xl: StyleSheet.create({
    size: {
      width: 195,
      height: 195,
      borderRadius: 195,
    },
    font: {
      fontSize: 37,
    },
  }),
};

// ================================================================================================
// THEME:
const themeStyle = {
  red: StyleSheet.create({
    buttonText: {
      fontFamily: "Muli",
      fontWeight: "900",
      textAlign: "center",

      color: "#ffffff",
      backgroundColor: "transparent",
    },
  }),
  white: StyleSheet.create({
    buttonText: {
      fontFamily: "Muli",
      fontWeight: "900",
      textAlign: "center",

      color: "#cb0000",
      backgroundColor: "transparent",
    },
  }),
};

// ================================================================================================

const styles = StyleSheet.create({
  button: {
    shadowColor: "rgba(0,0,0,0.2)",
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 10,
    shadowOpacity: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  popup: {
    width: POPUP_WIDTH, position: "absolute", flexDirection: "column",
    alignItems: "center",
    shadowRadius: 15, shadowOpacity: 1, shadowOffset: { width: 0, height: 2 }, shadowColor: "rgba(0,0,0,0.5)",
  },
  triangle: {
    backgroundColor: "transparent", width: 0, height: 0,
    borderStyle: "solid",
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 4,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "#cb0000",
  },
  popupTitle: {
    marginLeft: 10,
    fontFamily: "Muli",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1.71,
    textAlign: "left",
    color: "#ffffff",
  },
  popupValue: {
    marginRight: 10,
    fontFamily: "Muli",
    fontSize: 17,
    letterSpacing: 3.54,
    textAlign: "center",
    color: "#ffffff",
  },
  upDownButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
