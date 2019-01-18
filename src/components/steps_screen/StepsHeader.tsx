import { ValueBase } from "iocentro-datamodel";
import React, { Component } from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { I18n } from "iocentro-apps-common-bits";

import { Dims, IS_TABLET } from "../../Platform";
import { noNull } from "../../Utils";
import { NAV_BAR_PHONE_HEIGHT } from "../nav_bars/NavBarBase";
import { TextButton } from "../Buttons";
import { PaperView } from "../Paper";
import { DropDownArrow } from "../recipe_summary/DropDown";
import { TextScaledOnPhone } from "../ScaledText";
import { RatingData } from "./Rating";
import { StarsRate } from "./StarsRate";

export interface StepsHeaderData {
  title: ValueBase;
  currentStep: number; // first step is 1
  finishedSteps: number;
  allSteps: number;
}

interface PhoneStepHeaderProps {
  currentStep: number;
  allSteps: number;
  // when no onPress is provided dropdown arrow is not rendered and item touching is disabled
  onPress?: () => void;
}

export const PhoneStepHeader = (props: PhoneStepHeaderProps) => {
  return (
    <PaperView
      outerStyle={{
        flex: undefined,
        width: "100%",
        height: 30 + NAV_BAR_PHONE_HEIGHT,
        shadowColor: "rgba(0, 0, 0, 0.2)",
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowRadius: 4,
        shadowOpacity: 1,
        borderRadius: 0,
      }}
      innerStyle={{
        paddingTop: NAV_BAR_PHONE_HEIGHT,
      }}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "transparent",
          justifyContent: "center",
        }}>
        <TextButton
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
          }}
          onPress={props.onPress}
          disabled={!props.onPress}
          textStyle={{
                fontFamily: "Muli",
                fontSize: 11,
                fontWeight: "900",
                letterSpacing: 2,
                color: "#000000",
                opacity: 0.7,
              }}
            text={I18n.t("step_x_of_y", { number: props.currentStep, max: props.allSteps })}
          >
          {/* TODO collapsable */}
          {props.onPress &&
            <DropDownArrow isCollapsed={true} />}
        </TextButton>
      </View>
    </PaperView>
  );
};

interface StepsHeaderProps extends StepsHeaderData, RatingData {
  phoneOverview?: boolean;
}

export class StepsHeader extends Component<StepsHeaderProps, {}> {
  public render() {
    const { title, currentStep, finishedSteps, allSteps, phoneOverview } = this.props;

    if ((currentStep < 1) ||
      (currentStep > allSteps) ||
      (finishedSteps > allSteps)) {
      return null;
    }

    const tiles: JSX.Element[] = [];
    if (allSteps < 2) {
      tiles.push(
        <Tile
          key={"0"}
          color={"red"}
          round={"all"}
        />);
    } else {
      tiles.push((
        <Tile
          key="0"
          color={"red"}
          round={"left"}
        />
      ));
      for (let i = 1; i < allSteps - 1; i++) {
        tiles.push((
          <Tile
            key={i.toString()}
            color={this._calcColor(i + 1)}
            round="none"
          />
        ));
      }
      tiles.push((
        <Tile
          key={String(allSteps - 1)}
          color={this._calcColor(tiles.length + 1)}
          round={"right"}
        />
      ));
    }

    if (phoneOverview) {
      return (
        <View style={{ flex: 1, backgroundColor: "white", padding: 29 }}>
          <TextHeader style={{ marginBottom: 17 }} {...this.props} />
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
            }}>
            {tiles}
          </View>
        </View>
      );
    }

    if (!IS_TABLET) {
      const titleVal: string = noNull(title.sv(), "?");
      return (
        <View style={{
          marginTop: Dims.scaleV(24),
          marginHorizontal: 15.5,
        }}>
          <TextScaledOnPhone style={[styles.recipeFont, { marginLeft: 6, textAlign: "center" }]}>
            {titleVal.toUpperCase()}
          </TextScaledOnPhone>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginTop: Dims.scaleV(9),
            }}>
            {tiles}
          </View>
        </View>
      );
    }

    return (
      <View
        style={{
          marginLeft: 52,
          marginRight: 48,
        }}>
        <TextHeader style={{ marginTop: 75 }} {...this.props} />
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginTop: 14,
          }}>
          {tiles}
        </View>
      </View>
    );
  }

  private _calcColor(index: number) {
    if (index > this.props.currentStep) {
      if (index > this.props.finishedSteps) {
        return "lightred";
      } else {
        return "grey";
      }
    } else {
      return "red";
    }
  }
}

const TextHeader = (props: StepsHeaderProps & { style?: StyleProp<ViewStyle> }) => {
  const title: string = noNull(props.title.sv(), "?");
  return (
    <View
      style={[{
        flexDirection: "row",
        justifyContent: "space-between",
      }, props.style]}>
      <View style={{ justifyContent: "flex-end", flex: 1 }}>
        <TextScaledOnPhone style={styles.recipeFont}>{title}</TextScaledOnPhone>
      </View>
      <View style={{ justifyContent: "flex-end", alignItems: "flex-end" }}>
        {(props.rating !== undefined) ? (
          <StarsRate rating={props.rating} />
        ) : (
            <TextScaledOnPhone style={styles.recipeFont}>
              {I18n.t("step_x_of_y", { number: props.currentStep, max: props.allSteps }).toUpperCase()}
            </TextScaledOnPhone>
          )}
      </View>
    </View>
  );
};

interface TileProps {
  color: "red" | "lightred" | "grey";
  round: "none" | "all" | "left" | "right";
}

class Tile extends Component<TileProps, {}> {
  public render() {
    const backgroundColor = tileColor[this.props.color];
    const roundStyle = tileRound[this.props.round];
    const gradientColors = tileGradient[this.props.color];
    let gradientComp: JSX.Element | null = null;
    if (gradientColors.length != 0) {
      gradientComp = (
        <LinearGradient
          colors={gradientColors}
          style={[
            {
              flex: 1,
              overflow: "hidden",
            },
            roundStyle,
          ]}
        />
      );
    }

    return (
      <View
        style={[
          // right margin for all tiles except last
          this.props.round != "right" ? styles.tileMargin : {},
          styles.tile,
          { backgroundColor },
          roundStyle,
        ]}>
        {gradientComp}
      </View>
    );
  }
}

interface TileColors {
  [key: string]: string;
}

interface TileRound {
  [key: string]: StyleProp<ViewStyle>;
}

interface TileGradient {
  [key: string]: string[];
}

const tileColor: TileColors = {
  red: "rgb(203, 0, 0)",
  lightred: "rgb(250, 229, 229)",
  grey: "rgb(103, 103, 103)",
};

const tileRadius = IS_TABLET ? 16 : 8;

const tileRound: TileRound = {
  none: {},
  left: {
    borderTopLeftRadius: tileRadius,
    borderBottomLeftRadius: tileRadius,
  },
  right: {
    borderTopRightRadius: tileRadius,
    borderBottomRightRadius: tileRadius,
  },
  all: {
    borderRadius: tileRadius,
  },
};

const tileGradient: TileGradient = {
  red: [
    "rgba(255, 255, 255, 0.5)",
    "rgba(196, 0, 0, 0.5)",
  ],
  lightred: [
    "transparent",
    "transparent",
  ],
  grey: [
    "rgba(255, 255, 255, 0.5)",
    "rgba(85, 84, 84, 0.5)",
  ],
};

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    height: IS_TABLET ? 12 : 5,
  },
  tileMargin: {
    marginRight: IS_TABLET ? 2.7 : 1,
  },
  recipeFont: {
    fontFamily: "Muli",
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 2,
    color: "#676767",
  },
  stepFont: {
    fontFamily: "Merriweather",
    fontSize: 23,
    fontWeight: "300",
    fontStyle: "italic",
    color: "#000000",
  },
});
