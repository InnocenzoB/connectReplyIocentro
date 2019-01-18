import { ValueBase } from "iocentro-datamodel";
import React, { Component } from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { Subscription } from "rxjs";
import { UserModel } from "iocentro-apps-common-bits";
import * as _ from "lodash";

import { TextScaledOnPhone } from "./ScaledText";
import { KitchenAidUserModel, UnitSystem } from "../model/KitchenAidUserModel";

const WeightSvg = (props: {
  percent: number,
}) => {
  const minHeight = 1;
  const corner = 5;
  const height = Math.max(minHeight, 8 * props.percent / 10);
  const insideCorner = Math.min(height, 2);

  return (
    <Svg width={130} height={110}>
      <Path
        stroke={"#676767"}
        strokeWidth={4}
        strokeLinecap={"round"}
        strokeLinejoin={"round"}
        fill={"transparent"}
        d={`M5 5 L15 5 L15 ${105 - corner} `
          + `A${corner} ${corner} 0 0 0 ${15 + corner} 105 `
          + `L${115 - corner} 105 `
          + `A${corner} ${corner} 0 0 0 115 ${105 - corner} L115 5 L125 5`} />
      { height > 0 &&
        (
          <Path
            stroke={"#676767"}
            strokeWidth={0}
            strokeLinecap={"square"}
            fill={"#676767"}
            d={ `M25 ${95 - insideCorner}`
              + `A${insideCorner} ${insideCorner} 0 0 0 ${25 + insideCorner} 95 `
              + `L${105 - insideCorner} 95 `
              + `A${insideCorner} ${insideCorner} 0 0 0 105 ${95 - insideCorner} `
              + `L105 ${95 - height} L25 ${95 - height} Z`
            }
          />
        )
      }
    </Svg>
  );
};

// TODO: Create generic ToolTip compoment
const ToolTip = (props: {
  text: string,
  x: number,
  y: number,
}) => {
  return (
    <View style={[styles.tooltipContainer, { left: props.x, top: props.y - 18} ]}>
      <View style={styles.triangle}>
      </View>
      <View style={styles.tooltip} >
        <TextScaledOnPhone style={styles.text}>{props.text}</TextScaledOnPhone>
      </View>
    </View>
  );
};

export const WeightWidget = (props: {
  current: number,
  max: number,
  text?: string,
}) => {
  const standardW = (): string => {
    const u = (UserModel.instance() as KitchenAidUserModel).unit.sv();

    if (u === UnitSystem.Metric) {
      return props.current + "G";
    } else {
      return _.round(props.current/28.3, 1) + " oz";
    }
  };

  const tooltippos = 95 - 80 * props.current / props.max;
  const t = props.text != null ? props.text : standardW();
  return (
    <View style={styles.coontainer} >
      <WeightSvg percent={100 * props.current / props.max} />
      <ToolTip text={t} x={107} y={tooltippos} />
    </View>
  );
};

export interface WeightVBParams {
  value: ValueBase;
  max: number;
}
export class WeightVB extends Component<WeightVBParams, {}> {
  public componentWillMount() {
    this._valueChanged = this.props.value.subscribe( () => { this.forceUpdate(); } );
  }
  public componentWillUnmount() {
    this._valueChanged.unsubscribe();
  }

  public render() {
    const value: number = this.props.value.sv() as number;
    return (
      <WeightWidget
        current={value}
        max={this.props.max}
      />
    );
  }
  private _valueChanged: Subscription;
}

const styles = StyleSheet.create({
  coontainer: {
    width: 190,
    height: 115,
  },
  tooltipContainer: {flexDirection: "row",
    shadowColor: "rgba(0, 0, 0, 0.5)",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowRadius: 10,
    shadowOpacity: 1,
    alignItems: "center",
    position: "absolute",
  },
  tooltip: {
    width: 70, height: 36, backgroundColor: "#cb0000",
    borderRadius: 2,
    alignContent: "center",
    alignItems: "center",
    justifyContent: "center",
  },
  triangle: {
    backgroundColor: "transparent", width: 0, height: 0,
    borderStyle: "solid",
    borderBottomWidth: 5,
    borderTopWidth: 5,
    borderRightWidth: 4,
    borderTopColor: "transparent",
    borderBottomColor: "transparent",
    borderRightColor: "#cb0000",
  },
  text: {
    fontFamily: "Muli",
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 2.55,
    textAlign: "center",
    color: "#ffffff",
  },
});
