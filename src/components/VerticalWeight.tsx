import React from "react";
import { Image, StyleSheet, View } from "react-native";
import Svg, { Circle, Line } from "react-native-svg";

import { PlatformSelect } from "../Platform";
import { TextScaledOnPhone } from "./ScaledText";

const WEIGHT_IMAGE = require("../../img/icons/weight.png");

const Bar = (props: {
  size: number;
  orientation: "horizontal"|"vertical";
  value: number;
  maxValue: number;
  lineValue: number;
}) => {

  const horizontal = props.orientation == "horizontal";

  const thickness = horizontal ? 8 : 12;
  const lineLength = horizontal ? 17 : 21;

  const length = (props.size) * props.value / props.maxValue;
  const linePos = props.size - 1 - (props.size - 2) * props.lineValue / props.maxValue;
  let bar;
  if (length < thickness) {
    if (props.orientation == "horizontal") {
      bar = (
        <Circle cx={length / 2}
          cy={lineLength / 2}
          r={thickness / 2 * length / thickness / 2}
          strokeWidth={0}
          fill="#cb0000"
        />
      );
    } else {
      bar = (
        <Circle cx={lineLength / 2 }
          cy={props.size - length / 2}
          r={length / 2}
          strokeWidth={0}
          fill="#cb0000"
        />
      );
    }

  } else {
    if (props.orientation == "horizontal") {
      bar = (
        <Line
          x1={lineLength / 2} y1={lineLength / 2}
          x2={length - thickness / 2} y2={lineLength / 2}
          stroke="#cb0000"
          strokeWidth={thickness}
          strokeLinecap={"round"}
        />
      );
    } else {
      bar = (
        <Line
          x1={lineLength / 2} y1={props.size - thickness / 2 - (length - thickness)}
          x2={lineLength / 2} y2={props.size - thickness / 2}
          stroke="#cb0000"
          strokeWidth={thickness}
          strokeLinecap={"round"}
        />
      );
    }
  }

  if (props.orientation == "horizontal") {
    const linePosV = props.size * props.lineValue / props.maxValue;
    return (
      <Svg width={props.size} height={lineLength}>

        <Line
          x1={lineLength / 2} y1={lineLength / 2}
          x2={props.size - thickness / 2} y2={lineLength / 2}
          stroke="#f9e5e5"
          strokeWidth={thickness}
          strokeLinecap={"round"}
        />
        {bar}
        <Line
          x1={linePosV} y1={0}
          x2={linePosV} y2={lineLength}
          stroke="#cb0000"
          strokeWidth={2}
          strokeLinecap={"round"}
        />

      </Svg>
    );
  } else {
    return (
      <Svg width={lineLength} height={props.size}>
        <Line
          x1={lineLength / 2} y1={thickness / 2}
          x2={lineLength / 2} y2={props.size - thickness / 2}
          stroke="#f9e5e5"
          strokeWidth={thickness}
          strokeLinecap={"round"} />
        {bar}
        <Line
          x1={0} y1={linePos}
          x2={lineLength} y2={linePos}
          stroke="#cb0000"
          strokeWidth={2}
          strokeLinecap={"round"} />
      </Svg>
    );
  }
};

interface ToolTipProps {
  text: string;
  x: number;
  y: number;
  orientation?: "horizontal" | "vertical";
}

// TODO: Create generic ToolTip compoment
const ToolTip = (props: ToolTipProps) => {
  const {
    text,
    x,
    y,
    orientation = "vertical",
  } = props;

  const vertical = orientation == "vertical";

  return (
    <View
      style={[
        styles.tooltipContainer,
        { left: x - 74, top: y - 18},
        { flexDirection: vertical ? "row" : "column"  },
      ]}>
      <View style={styles.tooltip} >
        <TextScaledOnPhone style={styles.text}>{text}</TextScaledOnPhone>
      </View>
      <View style={vertical ? styles.triangleRight : styles.triangleBottom} />
    </View>
  );
};

interface WeightProps {
  size: number;
  value: number;
  max: number;
  line: number;
  tooltipVisible?: boolean;
  text?: string;
}

export const VerticalWeight = (props: WeightProps) => {
  const {
    size,
    value,
    max,
    line,
    tooltipVisible,
    text,
  } = props;
  const progressSize = size - 60;
  let tooltip: JSX.Element | null = null;
  if (tooltipVisible) {
    const t = text != null ? text : value.toString();
    tooltip = <ToolTip text={t} x={80} y={21 + (progressSize - 2) * (max - value) / max } />;
  }
  return (
    <View style={[tooltipVisible ? styles.container : styles.containerNoTooltip, {height: size}]}>
      {tooltip}
      <Bar size={progressSize} lineValue={line} value={value}
          maxValue={max} orientation="vertical" />
      <Image style={styles.image} source={WEIGHT_IMAGE} />
    </View>
  );
};

export const HorizontalWeight = (props: WeightProps) => {
  const {
    size,
    value,
    max,
    line,
    tooltipVisible,
    text,
  } = props;
  const progressSize = size - 80;
  let tooltip: JSX.Element | null = null;
  if (tooltipVisible) {
    const t = text != null ? text : value.toString();
    tooltip = <ToolTip orientation="horizontal" text={t} x={81 + (progressSize - 2) * value / max} y={25} />;
  }

  return (
    <View style={[tooltipVisible ? styles.verticalContainer : styles.noToolTipVertical, { width: size }]}>
      {tooltip}
      <Image
        style={{
          width: 29,
          height: 29,
          marginRight: 6,
        }}
        source={WEIGHT_IMAGE}
      />
      <Bar
        size={progressSize}
        lineValue={line}
        value={value}
        maxValue={max}
        orientation="horizontal"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  verticalContainer: {
    height: 80,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "transparent",
    paddingTop: 20,
  },
  noToolTipVertical: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  container: {
    width: 102,
    paddingLeft: 72,
    paddingTop: 20,
    flexDirection: "column",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  image: {
    width: 29,
    height: 29,
    marginLeft: 1,
    marginTop: 3,
  },
  containerNoTooltip: {
    width: 30,
    paddingTop: 20,
    flexDirection: "column",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  tooltipContainer: {
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
    ...PlatformSelect({
      anyTablet: {
        width: 70,
        height: 36,
      },
      anyPhone: {
        width: 60,
        height: 30,
      },
    }),
     backgroundColor: "#cb0000",
    borderRadius: 2,
    alignContent: "center",
    alignItems: "center",
    justifyContent: "center",
  },
  triangleRight: {
    backgroundColor: "transparent", width: 0, height: 0,
    borderStyle: "solid",
    ...PlatformSelect({
      anyTablet: {
        borderBottomWidth: 5,
        borderTopWidth: 5,
        borderLeftWidth: 4,
      },
      anyPhone: {
        borderBottomWidth: 4,
        borderTopWidth: 3,
        borderLeftWidth: 3,
      },
    }),
    borderTopColor: "transparent",
    borderBottomColor: "transparent",
    borderLeftColor: "#cb0000",
  },
  triangleBottom: {
    backgroundColor: "transparent", width: 0, height: 0,
    borderStyle: "solid",
    borderLeftWidth: 4,
    borderRightWidth: 4,
    borderTopWidth: 5,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "#cb0000",
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
