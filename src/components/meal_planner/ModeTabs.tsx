import { I18n } from "iocentro-apps-common-bits";
import React from "react";
import { LayoutAnimation, StyleProp, StyleSheet, TextStyle, View, ViewStyle } from "react-native";

import { RectangleInsets } from "../../components/SearchBar";
import { HorizontalSpacer } from "../../components/steps_screen/Overview";
import { TextButton } from "../Buttons";

export enum Mode { TODAY, WEEK }

export function StrFromMode(mode: Mode): string {
  if (mode == Mode.TODAY) {
    return I18n.t("today").toUpperCase();
  } else {
    return I18n.t("week").toUpperCase();
  }
}

export interface ModeTabsProps {
  currentMode: Mode;
  onModeChange: (mode: Mode) => void;

  spacing?: number;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>; // common
  currentTextStyle?: StyleProp<TextStyle>;
}

// @ts-ignore
const Modes: number[] = Object.keys(Mode).filter((k) => !isNaN(k));

export const ModeTabs = (props: ModeTabsProps) => {
  const { currentMode, onModeChange, currentTextStyle } = props;
  const spacing = (props.spacing == undefined ? 30 : props.spacing);

  return (
    <View style={[{ flexDirection: "row" }, props.style]}>
      {Modes.map((mode, index) => {
        const isCurrent = (mode == currentMode);
        const textStyle: StyleProp<TextStyle> = [
          styles.tabText,
          props.textStyle,
          isCurrent && currentTextStyle,
        ];
        const touchableExpandRect = new RectangleInsets(10);
        return (
          <TextButton
            style={{ flexDirection: "row" }}
            onPress={() => {
              LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
              onModeChange(mode);
            }}
            key={index}
            disabled={isCurrent}
            hitSlop={touchableExpandRect}
            pressRetentionOffset={touchableExpandRect}
            textStyle={textStyle}
            text={StrFromMode(mode)}
          >
            {(index != (Modes.length - 1)) &&
              <HorizontalSpacer width={spacing} />
            }
          </TextButton>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  tabText: {
    fontFamily: "Muli",
    fontSize: 11,
    fontWeight: "900",
    fontStyle: "normal",
    letterSpacing: 2,
    color: "#ffffff",
  },
});
