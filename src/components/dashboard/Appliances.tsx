import { I18n } from "iocentro-apps-common-bits";
import { ValueBase } from "iocentro-datamodel";
import React, { Component, PureComponent } from "react";
import { FlatList, View } from "react-native";
import { Subscription } from "rxjs";

import { TextScaledOnPhone } from "../ScaledText";
import { IS_TABLET, PlatformSelect } from "../../Platform";
import { GradientIconButton, GradientTextButton } from "../Buttons";
import { Hr } from "../Hr";
import { RoundButtonParamType, RoundButtonParamVB } from "../RoundButtonParam";
import { HorizontalSpacer } from "../steps_screen/Overview";
import { WeightVB } from "../Weight";

import {
  CookProcessorMode,
  CookProcessorModel,
  CookProcessorState,
} from "./../../model/CookProcessorModel";
import { VerticalSpacer } from "./Common";

const imported = {
  startIcon: require("../../../img/icons/createPlayButton.png"),
  cancelIcon: require("../../../img/icons/cancelIcon.png"),
  pauseIcon: require("../../../img/icons/pauseIcon.png"),
  weightWhite: require("../../../img/icons/weightWhite.png"),
};

export interface AppliancesViewProps {
  fullPage: boolean;
  model: CookProcessorModel;
  onAddCreationPress?: (values: ValueBase[]) => void; // when undefined, button is not rendered
}

const SEPARATOR = <Hr style={{ marginVertical: IS_TABLET ? 30 : 20 }} />;

export class AppliancesView extends PureComponent<AppliancesViewProps> {
  private applianceOptions: ApplianceOptions | null = null;
  private _remoteControlChange: Subscription;

  public render() {
    const props = this.props;
    return (
      <View>
        <ApplianceOptions
          ref={(instance) => {
            this.applianceOptions = instance;
          }}
          {...props}
        />
        <RemoteControlOn {...props}/>
        {this.props.model.remoteControl.sv() && <SpeedCheck {...props} />}
        {SEPARATOR}
        <WeightView {...props} />
        {SEPARATOR}
        <StartCancel model={props.model} />
        {!props.fullPage && SEPARATOR /* todo dots pagination */}
        {props.fullPage && (
          <View style={{ alignSelf: "center" }}>
            <VerticalSpacer
              height={PlatformSelect({
                androidTablet: 25,
                iosTablet: 45,
              })}
            />
            {props.onAddCreationPress && (
              <GradientTextButton
                theme="red"
                text={I18n.t("add_creation")}
                disabled={!this.applianceOptions || !props.onAddCreationPress}
                style={PlatformSelect({
                  anyTablet: {
                    width: 145,
                    height: 44,
                  },
                  anyPhone: {
                    width: 84,
                    height: 44,
                  },
                })}
                onPress={() => {
                  if (this.applianceOptions && props.onAddCreationPress) {
                    const values = this.applianceOptions.getValues();
                    props.onAddCreationPress(values);
                  }
                }}
              />
            )}
          </View>
        )}
      </View>
    );
  }
  public componentWillMount() {
    this._remoteControlChange = this.props.model.remoteControl.subscribe(() =>{
      this.forceUpdate();
    })
    this._targetTimeChange = this.props.model.targetTime.subscribe(() => {
        this.forceUpdate();
    });
    this._motorSpeedChange = this.props.model.motorSpeed.subscribe(() => {
        this.forceUpdate();
    });
    this._targetTempChange = this.props.model.targetTemp.subscribe(() => {
        this.forceUpdate();
    });
  }
  public componentWillUnmount() {
    this._remoteControlChange.unsubscribe();
    this._targetTimeChange.unsubscribe();
    this._motorSpeedChange.unsubscribe();
    this._targetTempChange.unsubscribe();
  }
}

class RemoteControlOn extends Component <AppliancesViewProps>{
  constructor() {
    super();
  }
  render(){
    return (
      (!this.props.model.remoteControl.sv() && <View>
      <TextScaledOnPhone style={{
        marginTop: 24,
        fontFamily: "Muli",
        fontSize: 13,
        fontWeight: "900",
        textAlign: "center",
        color: "#cb0000",
    }}>
        {I18n.t("remote_control_off")}
      </TextScaledOnPhone>
    </View>))
  }
}

interface SpeedCheckProps {
  model: CookProcessorModel;
}

class SpeedCheck extends Component<SpeedCheckProps, {}> {
  private _speedValue: Subscription;

  public componentWillMount() {
    this._speedValue = this.props.model.motorSpeed.subscribe(() => {
      this.forceUpdate();
    });
  }
  public componentWillUnmount() {
    this._speedValue.unsubscribe();
  }
  public render() {
    return (
      <View>
        {this.props.model.motorSpeed.sv() != 11 &&
          this.props.model.motorSpeed.sv() > 2 && (
            <TextScaledOnPhone
              style={{
                marginTop: 24,
                fontFamily: "Muli",
                fontSize: 13,
                fontWeight: "900",
                textAlign: "center",
                color: "#cb0000",
              }}
            >
              {I18n.t("speed_over_2")}
            </TextScaledOnPhone>
          )}
      </View>
    );
  }
}

interface ApplianceOptionsParams {
  fullPage: boolean;
  model: CookProcessorModel;
}

class ApplianceOptions extends Component<ApplianceOptionsParams> {
  private OptsSeparator = () => (
    <View style={{ width: this.props.fullPage ? 48 : 20 }} />
  )

  private _valueChanged: Subscription;
  private _values: ValueBase[];

  public getValues() {
    return this._values;
  }

  public componentWillMount() {
    this._valueChanged = this.props.model.currentState.subscribe(() => {
      this.forceUpdate();
    });
  }
  public componentWillUnmount() {
    this._valueChanged.unsubscribe();
  }

  public render() {
    const probablyRunning = this.props.model.isProbablyRunning();
    const reallyRunning = this.props.model.isReallyRunning();

    const displayTime = reallyRunning
      ? this.props.model.currentTimeRemaining
      : this.props.model.targetTime;

    this._values = [
      this.props.model.targetTemp,
      displayTime,
      this.props.model.motorSpeed,
    ];

    return (
      <FlatList
        style={{ overflow: "visible", alignSelf: "center" }}
        keyExtractor={(_item, index) => index.toString()}
        scrollEnabled={false}
        ItemSeparatorComponent={this.OptsSeparator}
        data={[
          {
            type: RoundButtonParamType.Temperature,
            value: this._values[0],
          },
          {
            type: RoundButtonParamType.Time,
            value: this._values[1],
            onValueChanged: (v: number) => {
              this.props.model.targetTime.updateValue(v);
            },
          },
          {
            type: RoundButtonParamType.Speed,
            value: this._values[2],
            addStep: probablyRunning
              ? (value, add) => {
                  const valueAfterAddition = value + add;
                  switch (true) {
                    case valueAfterAddition > 3:
                      return 0;
                    default:
                      return 1;
                  }
                }
              : undefined,
            sliderStep: probablyRunning
              ? (value: number) => (value >= 3) ? 3 : value
              : undefined,
          },
        ]}
        horizontal={true}
        renderItem={({ item }) => (
          <RoundButtonParamVB
            remoteControlOn={this.props.model.remoteControl.sv()}
            type={item.type}
            value={item.value}
            readonly={item.readonly}
            sliderStep={item.sliderStep}
            addStep={item.addStep}
            onValueChanged={item.onValueChanged}
          />
        )}
      />
    );
  }
}

const WeightView = (props: { model: CookProcessorModel }) => (
  <View
    style={{
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <WeightVB value={props.model.weight} max={3000} />
    <HorizontalSpacer width={10} />
    <GradientIconButton
      theme="grey"
      icon={imported.weightWhite}
      size={76}
      round
      disabled={!props.model.remoteControl.sv()}
      onPress={() => {
        const m = props.model.mode.sv();
        if (m === undefined) {
          return;
        }
        if (m === CookProcessorMode.Manual) {
          props.model.mode.updateValue(CookProcessorMode.Weight);
        } else if (m === CookProcessorMode.Weight) {
          props.model.mode.updateValue(CookProcessorMode.Manual);
        }
      }}
    />
  </View>
);

interface StartCancelProps {
  onCancel?: () => void;
  onStart?: () => void;
  model: CookProcessorModel;
  disabled: boolean;
}

class StartCancel extends Component<StartCancelProps, {}> {
  private _valueChanged: Subscription;

  public componentWillMount() {
    this._valueChanged = this.props.model.currentState.subscribe(() => {
      this.forceUpdate();
    });
  }
  public componentWillUnmount() {
    this._valueChanged.unsubscribe();
  }

  public render() {
    const state = this.props.model.currentState.sv();
    const isProbablyRunning = this.props.model.isProbablyRunning();

    return (
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <GradientIconButton
          theme={isProbablyRunning ? "red" : "grey"}
          size={91}
          round
          icon={imported.cancelIcon}
          iconStyle={{
            opacity: isProbablyRunning ? 1 : 0.51,
          }}
          disabled={!isProbablyRunning}
          onPress={() => {
            this.props.model.targetState.updateValue(
              CookProcessorState.Complete,
            );
          }}
        />
        <HorizontalSpacer width={54} />
        <GradientIconButton
          theme={(this.props.model.motorSpeed.sv()===0 && this.props.model.targetTemp.sv()===0 && this.props.model.targetTime.sv()===0) || !this.props.model.remoteControl.sv()?'grey':'red'}
          round
          size={91}
          icon={
            state == CookProcessorState.Running
              ? imported.pauseIcon
              : imported.startIcon
          }
          disabled={(this.props.model.motorSpeed.sv()===0 && this.props.model.targetTemp.sv()===0 && this.props.model.targetTime.sv()===0) || !this.props.model.remoteControl.sv()}
          onPress={() => {
            if (state == CookProcessorState.Running) {
              this.props.model.targetState.updateValue(
                CookProcessorState.Pause,
              );
            } else {
              this.props.model.targetState.updateValue(
                CookProcessorState.Running,
              );
            }
          }}
        />
      </View>
    );
  }
}
