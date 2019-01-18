import {
  DeviceStore,
  I18n,
} from "iocentro-apps-common-bits";
import { MandatoryGetVb, ValueBase } from "iocentro-datamodel";
import React, { Component } from "react";
import { StyleSheet, View } from "react-native";
import { Subscription } from "rxjs";

import { CookMotorSpeed, CookProcessorModel, CookProcessorState, lockStartDueToHighSpeed } from "../../model/CookProcessorModel";
import { Dims, IS_TABLET, PlatformSelect } from "../../Platform";
import { noNull } from "../../Utils";
import { GradientIconButton } from "../Buttons";
import { PulsingIcon } from "../PulsingIcon";
import { RoundButtonParam, RoundButtonParamType } from "../RoundButtonParam";
import { TextScaledOnPhone } from "../ScaledText";
import { FlexRow } from "./FlexRow";
import { FooterData } from "./Footer";

const playIcon = require("../../../img/icons/playIcon.png");
const stopIcon = require("../../../img/icons/stopCooking.png");
const pauseIcon = require("../../../img/icons/pauseIcon.png");

interface CookingStepFlex extends CookingStepDataWithSteps {
  children?: React.ReactNode;
}

export const CookingStepFlex = (props: CookingStepFlex) => {
  const { children, ...rest } = props;
  return (
    <View style={{ flex: 1 }}>
      <CookingStep
        {...rest}
      />
      {children}
    </View>
  );
};

interface UnlockData {
  isLidUnlocked: ValueBase;
}

interface MotorSpeed {
  motorSpeed: ValueBase;
}

interface ButtonsData extends MotorSpeed {
  currentTemp: ValueBase;
  targetTemp: ValueBase;

  currentTimeRemaining: ValueBase;
  targetTime: ValueBase;
}

interface CookingState {
  device: (CookProcessorModel | null);
}

export interface CookingStepData extends ButtonsData, UnlockData {
}

export interface CookingCompleted {
  onCookingStepCompleted: () => void;
}

export interface CookingStopRequest {
  onCookingStop: () => void;
}

export interface CookingStepDataWithSteps extends CookingStepData, FooterData, CookingCompleted, CookingStopRequest {
}

const CookingStep = (props: CookingStepDataWithSteps) => {
  return (
    <FlexRow
      leftStyle={styles.margins}
      rightStyle={styles.margins}>
      <View
        style={{
          flex: IS_TABLET ? 2 : 1,
          justifyContent: "center",
          alignItems: "center",
        }}>
        <PulsingIcon />
        <Cooking {...props} />
      </View>
    </FlexRow>
  );
};

class Cooking extends Component<CookingStepDataWithSteps, CookingState> {
  private _subscription: Subscription;

  constructor(props) {
    super(props);

    this.state = {
      device: DeviceStore.instance.getSelected() as CookProcessorModel,
    };
  }

  public componentDidMount() {
    if (this.state.device) {
      this._subscription = this.state.device.getModelObservable().subscribe((traits) => {
        const sourceOfChange = MandatoryGetVb(traits);
        if (this.state.device) {
          if (sourceOfChange != this.state.device.currentState &&
              sourceOfChange != this.state.device.targetState) {
            return; // something uninteresting has changed
          }
          const finished = this.state.device.currentState.sv() === CookProcessorState.Complete;
          if (finished && !this.props.stepDone) {
            this.props.onCookingStepCompleted();
          }
        }
        this.forceUpdate();
      });
      this._remoteControlChange = this.state.device.remoteControl.subscribe(() => {
          this.forceUpdate();
      });
    }
  }

  public componentWillUnmount() {
    if (this._subscription) {
      this._subscription.unsubscribe();
    }
    if (this._remoteControlChange) {
    this._remoteControlChange.unsubscribe();
    }
  }

  public render() {
    let running = false;
    let paused = false;
    let finished = false;
    if (this.state.device) {
      const ts = this.state.device.targetState.sv();
      const cs = this.state.device.currentState.sv();

      running = ts === CookProcessorState.Running || cs === CookProcessorState.Running;
      paused = ts === CookProcessorState.Pause || cs === CookProcessorState.Pause;
      finished = cs === CookProcessorState.Complete;
    }
    const stepDone = !!this.props.stepDone;
    const runOrPauseOrFin = running || paused || finished;
    const remoteControlOn = this.state.device == null ? runOrPauseOrFin : (this.state.device.remoteControl.sv() && runOrPauseOrFin);

    return (
      <View style={{ alignItems: "center" }}>
        <Buttons
          {...this.props}
          device={this.state.device}
          stepDone={stepDone}
        />
        {remoteControlOn ? (
          <View
            style={{
              marginTop: 20,
              width: 150,
              flexDirection: "row",
              justifyContent: "space-between",
            }}>
            <GreyButton
              type="stop"
              onPress={this.props.onCookingStop}
              disabled={stepDone}
            />
            <GreyButton
              type={paused || finished ? "play" : "pause"}
              onPress={() => {
                if (this.state.device && !finished) {
                  const newState = running ? CookProcessorState.Pause : CookProcessorState.Running;
                  this.state.device.targetState.updateValue(newState);
                }
              }}
              disabled={stepDone}
            />
          </View>
        ) : (
            <StartAndMessages
              {...this.props}
              device={this.state.device}
              onStartPressed={() => {
                if (this.state.device) {
                  this.state.device.targetState.updateValue(CookProcessorState.Running);
                }
              }}
              stepDone={stepDone}
            />
          )}
      </View>
    );
  }
}

const updateValue = (newVal: number | string, base: ValueBase) => {
  base.updateValue(newVal);
};

const Buttons = (props: ButtonsData & CookingState & FooterData) => {
  let probablyRunning = false;
  let reallyRunning = false;
  let remoteControlOn = false;

  if (props.device) {
    probablyRunning = props.device.isProbablyRunning();
    reallyRunning = props.device.isReallyRunning();
    remoteControlOn = props.device.remoteControl.sv();
  }

  const targetTemp: number = noNull(props.targetTemp.sv(), 100);
  const targetTime: number = noNull(props.targetTime.sv(), 0);
  const currentTimeRemaining: number = noNull(props.currentTimeRemaining.sv(), 0);

  const motorSpeed: number = noNull(props.motorSpeed.sv(), CookMotorSpeed.MotorSpeedOff);

  const displayTemp = targetTemp;
  const displayTime = reallyRunning ? currentTimeRemaining : targetTime;
  const displaySpeed = motorSpeed;

  let buttonContainerWidth: number;
  if (IS_TABLET) {
    buttonContainerWidth = probablyRunning ? 390 : 320;
  } else {
    buttonContainerWidth = Dims.scaleV(probablyRunning ? 290 : 280);
  }

  return (
    <View
      style={[
        {
          justifyContent: "space-between",
          flexDirection: "row",
          alignItems: "center",
          width: buttonContainerWidth,
        },
      ]}>
      <RoundButtonParam
        remoteControlOn={remoteControlOn}
        type={RoundButtonParamType.Temperature}
        value={displayTemp}
        theme="white"
        readonly={props.stepDone}
        onValueChanged={(value) => { updateValue(value, props.targetTemp); }}
      />
      <RoundButtonParam
        remoteControlOn={remoteControlOn}
        type={RoundButtonParamType.Time}
        value={displayTime}
        minProgress={0}
        maxProgress={targetTime}
        size={probablyRunning ? "l" : "s"}
        progress={probablyRunning}
        theme="white"
        readonly={props.stepDone}
        onValueChanged={(value) => { updateValue(value, props.targetTime); }}
      />
      <RoundButtonParam
        remoteControlOn={remoteControlOn}
        type={RoundButtonParamType.Speed}
        value={displaySpeed}
        theme="white"
        readonly={props.stepDone}
        onValueChanged={(value) => { updateValue(value, props.motorSpeed); }}
        sliderStep={probablyRunning ? (value: number) => {
          if (value >= 3) { return 3; }
          return value;
        } : undefined}
        addStep={probablyRunning ? (value, add) => {
          const valueAfterAddition = value + add;
          switch (true) {
            case (valueAfterAddition > 3):
              return 0;
            default:
              return 1;
          }
        } : undefined}
      />
    </View>
  );
};

interface StartAndMessagesProps extends UnlockData, MotorSpeed, CookingState, FooterData {
  onStartPressed: () => void;
}

const StartAndMessages = (props: StartAndMessagesProps) => {
  const isLidUnlocked: boolean = noNull(props.isLidUnlocked.sv(), true);
  const motorSpeed: number = noNull(props.motorSpeed.sv(), 1); // Should be dynamicValue

  const lockStart = lockStartDueToHighSpeed(motorSpeed);
  const noAppliace = props.device == null;
  const remoteControlOn = props.device == null ? noAppliace : !props.device.remoteControl.sv()

  const msg = () => {
    if (noAppliace) {
      return (<NoApplianceMessage />);
    } else if (remoteControlOn) {
      return (<RemoteControl/>);
    } else if (props.stepDone) {
      return (<StepDoneMessage />);
    } else {
      return (<ManualStart />);
    }
  };

  return (
    <View>
      {remoteControlOn || lockStart || noAppliace || props.stepDone ? msg() : (
        <View>
          <GradientIconButton
            disabled={isLidUnlocked}
            theme="red"
            style={{ width: Dims.scaleH(320), height: 44, marginTop: 16, flexDirection: "row" }}
            onPress={props.onStartPressed}
            iconStyle={{
              marginRight: 8,
              marginTop: 2,
              opacity: isLidUnlocked ? 0.25 : undefined,
            }}
            icon={playIcon}
          >
            <TextScaledOnPhone
              style={[
                styles.startButtonFont,
                isLidUnlocked ? { opacity: 0.5 } : {},
              ]}>
              {I18n.t("start")}
            </TextScaledOnPhone>
          </GradientIconButton>
          {isLidUnlocked && <LidOpenMessage />}
        </View>
      )}
    </View>
  );
};
const RemoteControl = () => (<TextScaledOnPhone style={{
    marginTop: 24,
    fontFamily: "Muli",
    fontSize: 13,
    fontWeight: "900",
    textAlign: "center",
    color: "#cb0000",
}}>
    {I18n.t("remote_control_off")}
  </TextScaledOnPhone>);
const LidOpenMessage = () => (
  <TextScaledOnPhone
    style={{
      marginTop: 13,
      fontFamily: "Muli",
      fontSize: 13,
      fontWeight: "900",
      lineHeight: 16,
      color: "#cb0000",
      textAlign: "center",
    }}>
    {I18n.t("lid_is_unlocked")}
  </TextScaledOnPhone>
);

const ManualStart = () => (
  <TextScaledOnPhone
    style={{
      marginTop: 24,
      fontFamily: "Muli",
      fontSize: 13,
      fontWeight: "900",
      textAlign: "center",
      color: "#cb0000",
    }}>
    {I18n.t("speed_over_2")}
  </TextScaledOnPhone>
);

const NoApplianceMessage = () => (
  <TextScaledOnPhone
    style={{
      marginTop: 24,
      fontFamily: "Muli",
      fontSize: 13,
      fontWeight: "900",
      textAlign: "center",
      color: "#cb0000",
    }}>
    {I18n.t("no_appliances_details")}
  </TextScaledOnPhone>
);

const StepDoneMessage = () => (
  <TextScaledOnPhone
    style={{
      marginTop: 24,
      fontFamily: "Muli",
      fontSize: 13,
      fontWeight: "900",
      textAlign: "center",
      color: "#cb0000",
    }}>
    {I18n.t("step_has_been_done")}
  </TextScaledOnPhone>
);

type GreyButtonType = "stop" | "pause" | "play";

interface GreyButtonProps {
  type: GreyButtonType;
  onPress: () => void;
  disabled?: boolean;
}

const GreyButton = (props: GreyButtonProps) => {
  let icon;
  if (props.type == "stop") {
    icon = stopIcon;
  } else if (props.type == "pause") {
    icon = pauseIcon;
  } else {
    icon = playIcon;
  }

  return (
    <GradientIconButton
      size={44}
      round
      theme="grey"
      icon={icon}
      onPress={props.onPress}
      disabled={props.disabled !== undefined ? props.disabled : false}
    />
  );
};

const styles = StyleSheet.create({
  startButtonFont: {
    fontFamily: "Muli",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 2,
    color: "#ffffff",
    backgroundColor: "transparent",
  },
  margins: PlatformSelect({
    anyPhone: {
      flex: 0,
    },
  }),
});
