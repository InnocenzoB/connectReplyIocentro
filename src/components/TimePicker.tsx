import React from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import WheelPicker from "react-native-wheel-picker";
import { I18n } from "iocentro-apps-common-bits";

import { IS_TABLET } from "../Platform";
import { TextButton } from "./Buttons";
import { TextScaledOnPhone } from "./ScaledText";

const PickerItem = WheelPicker.Item;

const INIT_HOUR_INDEX = 80 * 5;
const INIT_MINUTES_INDEX = 9 * 60;
const INIT_SECONDS_INDEX = 13 * 60;
const NUMBER_OF_ELEMENTS = 900;

interface TimePickerProps {
  maxValueInSecs: number;
  minValueInSecs: number;
  valueInSecs: number;
  onChange: (value: number) => void;
}

interface TimePickerstate {
  hoursSelected: boolean;
}

export class TimePicker extends React.Component<TimePickerProps, TimePickerstate> {
  private hours: number;
  private minutes: number;
  private seconds: number;
  private maxAmountOfHours: number;
  private maxAmountOfMinutes: number;
  private maxAmountOfSeconds: number;
  private selectedHoursIndex: number;
  private selectedMinutesIndex: number;
  private selectedSecondsIndex: number;
  private hoursList: string[] = [];
  private minutesList: string[] = [];
  private secondsList: string[] = [];

  constructor(props) {
    super(props);
    this.getMaxAmountsOfHrsMinsSecs(this.props.maxValueInSecs);

    let limit = NUMBER_OF_ELEMENTS / this.maxAmountOfHours;
    for (let j = 0; j < limit; j++) {
      for (let i = 0; i < this.maxAmountOfHours; i++) {
        this.hoursList.push((i < 10 ? "0 " : "") + i.toString());
      }
    }
    limit = NUMBER_OF_ELEMENTS / this.maxAmountOfMinutes;
    for (let j = 0; j < limit; j++) {
      for (let i = 0; i < this.maxAmountOfMinutes; i++) {
        this.minutesList.push((((i - i % 10) / 10).toString() + " " + (i % 10).toString()));
      }
      for (let i = 0; i < this.maxAmountOfSeconds; i++) {
        this.secondsList.push((((i - i % 10) / 10).toString() + " " + (i % 10).toString()));
      }
    }
    this.selectedHoursIndex = INIT_HOUR_INDEX;
    this.selectedMinutesIndex = INIT_MINUTES_INDEX;
    this.selectedSecondsIndex = INIT_SECONDS_INDEX;

    this.secondsToHrsMinsSecs(this.props.valueInSecs);

    this.state = {
      hoursSelected: this.hours > 0,
    };
  }
  public render() {
    this.secondsToHrsMinsSecs(this.props.valueInSecs);
    this.selectedHoursIndex = this.selectedHoursIndex -
      this.selectedHoursIndex % this.maxAmountOfHours + this.hours;
    this.selectedMinutesIndex = this.selectedMinutesIndex -
      this.selectedMinutesIndex % this.maxAmountOfMinutes + this.minutes;
    this.selectedSecondsIndex = this.selectedSecondsIndex -
      this.selectedSecondsIndex % this.maxAmountOfSeconds + this.seconds;
    return (
      <View style={{
        flexDirection: "row", width: "100%", height: 143, overflow: "hidden",
        justifyContent: "space-between", paddingHorizontal: IS_TABLET ? 22 : 11,
      }}>
        <View style={{ flex: 1, marginTop: 18 }}>
          <TextScaledOnPhone style={styles.popupTitle}>{I18n.t("time").toUpperCase()}</TextScaledOnPhone>
        </View>

        <View style={{
          flexDirection: "row", minWidth: IS_TABLET ? 220 : 160,
          flex: 1, marginBottom: Platform.OS == "ios" ? 15 : 0, justifyContent: "center",
        }}>
          <WheelPicker
            style={{ width: IS_TABLET ? 114 : 100, height: 143, overflow: "hidden", alignSelf: "center" }}
            selectedValue={this.state.hoursSelected ? this.selectedHoursIndex : this.selectedMinutesIndex}
            itemStyle={{
              fontFamily: "Muli-Bold",
              fontSize: IS_TABLET ? 48 : 46,
              fontWeight: "800",
              textAlign: "center",
              color: "#ffffff",
              height: 160,
            }}
            onValueChange={(index: number) => this.onPickerSelect("bigger", index)}
          >
            {this.populatePicker("bigger")}
          </WheelPicker>
          <Text
            style={{
              fontFamily: "Muli",
              fontSize: IS_TABLET ? 48 : 46,
              fontWeight: "bold",
              color: "#ffffff",
              alignSelf: "center",
              marginBottom: Platform.OS == "ios" ? -8 : 14,
            }}>
            {":"}
          </Text>
          <WheelPicker
            style={{ width: IS_TABLET ? 114 : 100, height: 143, overflow: "hidden", alignSelf: "center" }}
            selectedValue={this.state.hoursSelected ? this.selectedMinutesIndex : this.selectedSecondsIndex}
            itemStyle={{
              fontFamily: "Muli-Bold",
              fontSize: IS_TABLET ? 48 : 46,
              fontWeight: "800",
              textAlign: "center",
              color: "#ffffff",
              height: 160,
            }}
            onValueChange={(index: number) => this.onPickerSelect("smaller", index)}
          >
            {this.populatePicker("smaller")}
          </WheelPicker>
        </View>
        <View style={{ flex: 1, justifyContent: "space-around", height: "90%", alignSelf: "center" }}>
          <TextButton
            style={{ flex: 1, justifyContent: "flex-end", marginVertical: 5 }}
            onPress={() => { this.selectHours(false); }}
            textStyle={[{
              opacity: !this.state.hoursSelected ? 1 : 0.6,
            }, styles.popupTitle]}
            text={I18n.t("minutes&seconds")}
          />
          <TextButton
            style={{ flex: 1, marginVertical: 5 }}
            onPress={() => { this.selectHours(true); }}
            textStyle={[{
              opacity: this.state.hoursSelected ? 1 : 0.6,
            }, styles.popupTitle]}
            text={I18n.t("hours&minutes")}
          />
        </View>
      </View >
    );
  }

  private selectHours = (hoursSelected: boolean) => {
    this.setState({
      hoursSelected,
    }, () => {
      this.props.onChange(this.getTimeInSeconds());
    });
  }

  private secondsToHrsMinsSecs = (value: number) => {
    let val = value;
    const hours = (val - val % 3600) / 3600;
    val = val % 3600;
    const minutes = (val - val % 60) / 60;
    const seconds = val % 60;

    this.hours = hours;
    this.minutes = minutes;
    this.seconds = seconds;
  }

  private getMaxAmountsOfHrsMinsSecs = (value: number) => {
    const hours = value / 3600;
    const minutes = Math.min(value / 60, 60);
    const seconds = Math.min(value, 60);

    this.maxAmountOfHours = hours + 1;
    this.maxAmountOfMinutes = minutes;
    this.maxAmountOfSeconds = seconds;
  }

  private onPickerSelect = (picker: "bigger" | "smaller", index: number) => {

    this.selectedHoursIndex = (picker == "bigger") && (this.state.hoursSelected) ? index : this.selectedHoursIndex;

    this.selectedMinutesIndex = ((picker == "bigger") && (!this.state.hoursSelected)) ||
      ((picker == "smaller") && (this.state.hoursSelected)) ? index : this.selectedMinutesIndex;

    this.selectedSecondsIndex = (picker == "smaller") && (!this.state.hoursSelected) ?
      index : this.selectedSecondsIndex;

    this.hours = this.numberOfFromIndex("hours");
    this.minutes = this.numberOfFromIndex("minutes");
    this.seconds = this.numberOfFromIndex("seconds");
    this.props.onChange(this.getTimeInSeconds());
  }

  private getTimeInSeconds = () => {
    if (this.state.hoursSelected) {
      return Math.max(Math.min((this.hours * 60 * 60 + this.minutes * 60),
        this.props.maxValueInSecs), this.props.minValueInSecs);
    } else {
      return Math.max(Math.min((this.minutes * 60 + this.seconds),
        this.props.maxValueInSecs), this.props.minValueInSecs);
    }
  }

  private populatePicker = (picker: "bigger" | "smaller") => {
    if (picker == "bigger") {
      if (this.state.hoursSelected) {
        return this.hoursList.map((value, i) => (
          <PickerItem label={value} value={i} key={i} />
        ));
      } else {
        return this.minutesList.map((value, i) => (
          <PickerItem label={value} value={i} key={i} />
        ));
      }
    } else if (picker == "smaller") {
      if (this.state.hoursSelected) {
        return this.minutesList.map((value, i) => (
          <PickerItem label={value} value={i} key={i} />
        ));
      } else {
        return this.secondsList.map((value, i) => (
          <PickerItem label={value} value={i} key={i} />
        ));
      }
    }
    return null;
  }

  private numberOfFromIndex = (period: "hours" | "minutes" | "seconds") => {
    switch (period) {
      case "hours": {
        return this.selectedHoursIndex % this.maxAmountOfHours;
      }
      case "minutes": {
        return this.selectedMinutesIndex % this.maxAmountOfMinutes;
      }
      case "seconds": {
        return this.selectedSecondsIndex % this.maxAmountOfSeconds;
      }
    }
  }
}

const styles = StyleSheet.create({
  popupTitle: {
    fontFamily: "Muli",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1.71,
    textAlign: "left",
    color: "#ffffff",
  },
});
