import {
  DeviceStore,
  I18n,
} from "iocentro-apps-common-bits";
import React, { Component } from "react";
import { StyleSheet, View } from "react-native";
import { Circle, Defs, LinearGradient, Stop, Svg } from "react-native-svg";
import { Subscription } from "rxjs";

import { CookMotorSpeed, CookProcessorModel } from "../model/CookProcessorModel";
import { TextScaledOnPhone } from "./ScaledText";

export class PulsingIcon extends Component<{}, { visible: boolean }> {

  constructor(props) {
    super(props);
    this.state = {
      visible: false,
    };
  }

  public componentDidMount() {
    const device = DeviceStore.instance.getSelected() as CookProcessorModel | null;
    if (device) {
      this._devicePulseSubscription = device.motorSpeed.subscribe(() => {
        this.setState({
          visible: device.motorSpeed.sv() == CookMotorSpeed.MotorSpeedPulse,
        });
      });
    }
  }

  public componentWillUnmount() {
    if (this._devicePulseSubscription) {
      this._devicePulseSubscription.unsubscribe();
    }
  }

  public render() {
    if (!this.state.visible) {
      return null;
    }
    return (
      <View style={styles.container}>
        <Svg
          height="140"
          width="140"
        >
          <Defs>
            <LinearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="rgb(255,255,255)" stopOpacity="0.5" />
              <Stop offset="100%" stopColor="rgb(0,0,0)" stopOpacity="0.5" />
            </LinearGradient>
          </Defs>
          <Circle
            cx="70"
            cy="70"
            r="67.5"
            stroke="rgb(203,0,0)"
            strokeWidth="2"
            fill="url(#grad)"
          />
          <Circle
            cx="70"
            cy="70"
            r="67.5"
            stroke="rgb(203,0,0)"
            strokeWidth="2"
            fill="rgba(203,0,0,0.7)"
          />
        </Svg>
        <TextScaledOnPhone style={styles.textStyle}> {I18n.t("pulsing").toUpperCase()}</TextScaledOnPhone>
      </View>
    );
  }

  private _devicePulseSubscription: Subscription | undefined;
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(255,255,255,0.5)",
    zIndex: 1,
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
  textStyle: {
    fontFamily: "Muli",
    fontSize: 15,
    textAlign: "center",
    letterSpacing: 2.7,
    color: "white",
    fontWeight: "800",
    position: "absolute",
    zIndex: 2,
  },

});
