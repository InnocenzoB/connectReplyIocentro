import React, { ReactNode } from "react";
import { StyleProp, ViewStyle } from "react-native";
import Svg, { Polygon } from "react-native-svg";

interface BookMarkProps {
  width: number;
  height: number;
  color?: string;
  indentation?: number;
  round?: boolean;
  vertical?: boolean;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
}

const ROUND_LEVEL = 2;

export const BookMark = (props: BookMarkProps) => {
  const {
    width,
    height,
    indentation = 5,
    round = true,
    color = "#cb0000",
    vertical = false,
    style,
    children,
  } = props;

  let width2 = props.width;
  let height2 = props.height;
  let offset = 0;
  let strokeProps = {};

  if (round) {
    width2 -= ROUND_LEVEL;
    height2 -= ROUND_LEVEL;
    offset = ROUND_LEVEL;
    strokeProps = {
      stroke: color,
      strokeWidth: ROUND_LEVEL * 2,
      strokeLinejoin: "round",
    };
  }

  const generatePoints = () => {
    return vertical ? (`
      ${width2},${-offset}
      ${width2},${height2}
      ${width / 2},${height2 - indentation}
      ${offset},${height2}
      ${offset},${-offset}
    `) : (`
      ${-offset},${offset}
      ${width2},${offset}
      ${width2 - indentation},${height / 2}
      ${width2},${height2}
      ${-offset},${height2}
    `);
  };

  return (
    <Svg
      width={width}
      height={height}
      style={[{
        alignItems: "center",
        flexDirection: (vertical ? "column" : "row"),
      }, style]}
    >
      <Polygon
        points={generatePoints()}
        fill={color}
        {...strokeProps}
      />
      {children}
    </Svg>
  );
};
