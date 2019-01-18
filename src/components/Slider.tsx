import React, { Component, PureComponent } from "react";
import {
  GestureResponderEvent,
  PanResponder,
  PanResponderGestureState,
  PanResponderInstance,
  StyleSheet,
  View,
} from "react-native";
import Svg, { Circle, Line } from "react-native-svg";

import { IS_TABLET } from "../Platform";
import { RoundButtonParamType } from "./RoundButtonParam";
import { TextScaledOnPhone } from "./ScaledText";

const MARGIN = 10;
const MOVE_MARGIN = 20;

// ================================================================================================

class ScaleSvg extends PureComponent<{
  buttonType: RoundButtonParamType,
  width: number;
  granularity: number;
  labelrepeatability: number;
  initial_value: number;
  step: number;
  count: number;
  format: (value: number) => string
  formatLight: (value: number) => string
  mapValueToSlider: (value: number) => number;
}> {
  public render() {
    const width = this.props.width - 2 - 2 * MARGIN;
    const lines: JSX.Element[] = [];
    let value = this.props.initial_value;

    const generateLabel = (num) => this.props.format(this.props.mapValueToSlider(num));

    let x = MARGIN + 1;
    const drawLongLinesInside = this.props.buttonType == RoundButtonParamType.Speed ? 5 : 0;
    lines.push(<Line x1={x} y1={0} x2={x} y2={20} stroke={"rgb(255,255,255)"} strokeWidth={2} key={0} />);
    for (let i = 1; i <= this.props.granularity; i++) {
      x = MARGIN + i * width / (this.props.granularity) + 1;
      const y = (i % this.props.labelrepeatability != 0) ? 5 : drawLongLinesInside;
      lines.push(<Line x1={x} y1={y} x2={x} y2={20 - y} stroke={"rgb(255,255,255)"} strokeWidth={2} key={i} />);
    }
    lines.push(<Line x1={x} y1={0} x2={x} y2={20} stroke={"rgb(255,255,255)"} strokeWidth={2} key={-1} />);

    const labels: JSX.Element[] = [
      <TextScaledOnPhone style={styles.labelFirst} key={0} >
        {generateLabel(value)}
      </TextScaledOnPhone>,
    ];
    value += this.props.step;

    for (let j = 1; j < Math.floor(this.props.count); j++ , value += this.props.step) {
      labels.push(<TextScaledOnPhone style={styles.labelCenter} key={j}>
        {generateLabel(value)}
      </TextScaledOnPhone>);
    }

    labels.push(
      <TextScaledOnPhone
        style={this.props.buttonType == RoundButtonParamType.Temperature ?
          styles.labelLastForManyLabels : styles.labelLast}
        key={this.props.count}>{generateLabel(value)}
      </TextScaledOnPhone>,
    );

    return (
      <View>
        <Svg width={this.props.width} height={20}>
          {lines}
        </Svg>
        <View style={{
          flexDirection: "row",
          marginTop: 7,
          marginLeft: MARGIN,
          marginRight: MARGIN,
          width: this.props.width - 2 * MARGIN,
        }}>
          {labels}
        </View>
      </View>
    );
  }
}

// ================================================================================================

class SliderSvg extends PureComponent<{
  width: number;
  granularity: number;
  position: number;
}> {

  public render() {
    const width = this.props.width - 2 - 2 * MARGIN;
    const position = 1 + MARGIN + Math.max(this.props.position, 0) * width / (this.props.granularity);

    return (
      <Svg
        width={this.props.width} height={20} style={{ position: "absolute" }}>
        <Line x1={position} y1={10} x2={this.props.width - MARGIN} y2={10}
          stroke={"rgba(255,255,255,0.3)"} strokeWidth={2} />
        {this.props.position >= 0 ? <Line x1={MARGIN} y1={10} x2={position} y2={10}
          stroke={"rgb(255,255,255)"} strokeWidth={2} /> : null}
        {this.props.position >= 0 ? <Circle cx={position} cy={10} r={9}
          stroke={"rgb(255,255,255)"} strokeWidth={2} fill={"rgb(203,0,0)"} /> : null}

      </Svg>
    );
  }
}

// ================================================================================================

export interface SliderProps {
  buttonType: RoundButtonParamType;
  width: number;
  minValue: number;
  maxValue: number;
  value: number;
  step: number;
  microStep: number;
  sliderStep: (number) => number;
  labelFormat: (value: number) => string;
  labelFormatLight: (value: number) => string;
  onChange: (value: number) => void;
  onPageUp: () => void;
  onPageDown: () => void;
  mapValueToSlider: (value: number) => number;
}

enum SliderMode {
  PageDown, Move, PageUp, Set,
}
export class Slider extends Component<SliderProps> {

  constructor(props: SliderProps) {
    super(props);
    this._initialValue = 0;
    this._lastValue = 0;
    this._sliderMode = SliderMode.Move;
    this.updateStepMeasurements();
  }

  private _panResponder?: PanResponderInstance;

  public componentWillMount() {
    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponder: this._handleStartShouldSetPanResponder,
      onPanResponderGrant: this._handlePanResponderGrant,
      onPanResponderMove: this._handlePanResponderMove,
      onPanResponderRelease: this._handlePanResponderRelease,
    });
  }

  public componentWillReceiveProps(nextProps) {
    const { step, microStep, minValue, maxValue, width } = this.props;

    let changed = false;
    changed = changed || nextProps.step != step;
    changed = changed || nextProps.microStep != microStep;
    changed = changed || nextProps.minValue != minValue;
    changed = changed || nextProps.maxValue != maxValue;
    changed = changed || nextProps.width != width;

    changed && this.updateStepMeasurements();
  }

  public render() {
    const { width, step, minValue, maxValue, labelFormat,
      labelFormatLight, value, mapValueToSlider, buttonType } = this.props;
    const { stepsCount, microStepsCount } = this._stepMeasurements;

    const currentValue = value;
    const position = (microStepsCount) * (currentValue - minValue) / (maxValue - minValue);

    return (
      <View style={{ width: this.props.width, marginTop: 10, marginBottom: 10 }}
        {...(this._panResponder && this._panResponder.panHandlers)} >
        <ScaleSvg
          buttonType={buttonType}
          width={width}
          granularity={microStepsCount}
          labelrepeatability={microStepsCount / stepsCount}
          initial_value={minValue}
          step={step}
          count={stepsCount}
          format={labelFormat}
          formatLight={labelFormatLight}
          mapValueToSlider={mapValueToSlider} />
        <SliderSvg
          width={width}
          granularity={microStepsCount}
          position={position}
        />
      </View>
    );
  }

  private updateStepMeasurements = () => {
    const { step, microStep, minValue, maxValue, width } = this.props;

    const range = maxValue - minValue;
    const stepsCount = range / step;
    const microStepsCount = range / microStep;
    const unitWidth = (width - 2 * MARGIN) / range;

    this._stepMeasurements = {
      stepsCount,
      microStepsCount,
      unitWidth,
    };
  }

  private _handleStartShouldSetPanResponder = (/*e: GestureResponderEvent*/) => {
    // const sliderPos = MARGIN + (this.props.width - 2 * MARGIN) * (this.props.value - this.props.minValue)
    //   / (this.props.maxValue - this.props.minValue);

    // const diff = sliderPos - e.nativeEvent.locationX;

    // if (Math.abs(diff) <= MOVE_MARGIN) {
    //   this._sliderMode = SliderMode.Move;
    // } else if (diff > 0) {
    //   this._sliderMode = SliderMode.PageDown;
    // } else {
    //   this._sliderMode = SliderMode.PageUp;
    // }

    this._sliderMode = SliderMode.Set;

    this._lastValue = this._initialValue = this.props.value;
    return true;
  }

  private _handlePanResponderGrant = ({ nativeEvent }: GestureResponderEvent) => {
    const { unitWidth } = this._stepMeasurements;
    let newValue = this._initialValue;

    if (this._sliderMode == SliderMode.Set) {
      newValue = this.props.minValue + Math.floor(nativeEvent.locationX / unitWidth);
    }

    this.updateValue(newValue);
  }

  private _handlePanResponderMove = ({ nativeEvent }: GestureResponderEvent, gestureStat: PanResponderGestureState) => {
    const { unitWidth } = this._stepMeasurements;
    let newValue = this._initialValue;

    if (this._sliderMode == SliderMode.Set) {
      newValue = this.props.minValue + Math.floor(nativeEvent.locationX / unitWidth);
    } else if (this._sliderMode == SliderMode.Move) {
      const change = Math.floor((gestureStat.dx + unitWidth / 2) / unitWidth);
      newValue = (this._initialValue as number) + change;
    }

    this.updateValue(newValue);
  }

  private _handlePanResponderRelease = (_e, gestureStat: PanResponderGestureState) => {
    if (this._sliderMode == SliderMode.Move) {
      return;
    }
    if (this._sliderMode == SliderMode.Set) {
      return;
    }
    if (Math.abs(gestureStat.dx) <= MOVE_MARGIN && Math.abs(gestureStat.dy) <= MOVE_MARGIN) {
      if (this._sliderMode == SliderMode.PageUp) {
        this.props.onPageUp();
      } else {
        this.props.onPageDown();
      }
    }
  }

  private updateValue = (newValue: number) => {
    newValue = Math.min(newValue, this.props.maxValue);
    newValue = Math.max(newValue, this.props.minValue);
    if (this._lastValue != newValue) {
      this._lastValue = newValue;
      this.props.onChange(this.props.sliderStep(newValue));
    }
  }

  private _initialValue: number;
  private _sliderMode: SliderMode;
  private _lastValue: number;
  private _stepMeasurements: {
    stepsCount: number;
    microStepsCount: number;
    unitWidth: number;
  };
}

// ================================================================================================

const styles = StyleSheet.create({
  labelFirst: {
    flex: 1.3,
    textAlign: "left",
    fontFamily: "Muli",
    fontSize: IS_TABLET ? 10 : 9,
    fontWeight: "900",
    color: "#ffffff",
  },
  labelCenter: {
    flex: 2,
    textAlign: "center",
    fontFamily: "Muli",
    fontSize: IS_TABLET ? 10 : 9,
    fontWeight: "900",
    color: "#ffffff",
  },
  labelLast: {
    flex: 1.2,
    textAlign: "right",
    fontFamily: "Muli",
    fontSize: IS_TABLET ? 10 : 9,
    fontWeight: "900",
    color: "#ffffff",
  },
  labelLastCenter: {
    flex: 2,
    textAlign: "center",
    fontFamily: "Muli",
    fontSize: IS_TABLET ? 10 : 9,
    fontWeight: "900",
    color: "#ffffff",
  },
  labelLastForManyLabels: {
    flex: 1.5,
    textAlign: "center",
    fontFamily: "Muli",
    fontSize: IS_TABLET ? 10 : 9,
    fontWeight: "900",
    color: "#ffffff",
  },
});
