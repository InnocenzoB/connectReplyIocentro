import { I18n } from "iocentro-apps-common-bits";
import React, { Component, ReactNode } from "react";
import { ImageBackground, StyleProp, StyleSheet, TextStyle, View, ViewStyle } from "react-native";
import LinearGradient from "react-native-linear-gradient";

import { IS_TABLET, PlatformSelect } from "../../Platform";
import { Loading } from "../Loading";
import { TextScaledOnPhone } from "../ScaledText";
import { Navigation, NavigationCallbacks, NavigationData } from "../steps_screen/Navigation";
import { HorizontalSpacer } from "../steps_screen/Overview";
import { TouchableScale } from "../TouchableScale";

const notesIcon = require("../../../img/recipe_summary/notesIcon.png");
const notesIconRed = require("../../../img/recipe_summary/notesIconRed.png");

export type RecipeBarColors = "black" | "white";
export type RecipeBarMode = "summary" | "stepByStep" | "notes";

interface IRecipeBarMode {
  mode: RecipeBarMode;
}

interface IRecipeBarColor {
  color?: RecipeBarColors;
}

interface CenterBarsProps extends IRecipeBarColor, IRecipeBarMode {
  onSummaryPress?: () => void;
  onStepByStepPress?: () => void;
  textStyle?: any;
}

interface NotesButtonProps extends IRecipeBarColor {
  notesNum?: number;
  onNotesPress?: () => void; // button is disabled if not passed
  style?: StyleProp<ViewStyle>;
}

interface HeaderBarProps extends CenterBarsProps {
  disableGradient?: boolean;
  children?: ReactNode;
}

export interface RecipeBarProps extends IRecipeBarColor, IRecipeBarMode, NotesButtonProps {
  isLoading: boolean;
  onModeChangeRequest?: (mode: RecipeBarMode) => void;
  navigation?: NavigationData & NavigationCallbacks;
  hideNotesButton?: boolean;
  headerVisible?: boolean;
}

export class RecipeBar extends Component<RecipeBarProps, {}> {
  public static defaultProps: RecipeBarProps = {
    mode: "stepByStep",
    color: "white",
    isLoading: false,
    headerVisible: true,
  };

  public render() {
    const { isLoading, mode, color, navigation, children, headerVisible } = this.props;
    return (
      <View>
        <View style={styles.container}>
          {isLoading ? (
            <Loading style={{ backgroundColor: "transparent" }} visible={true} />
          ) : (
              children
            )}
          {!isLoading && headerVisible &&
            <HeaderBar
              mode={mode}
              color={color}
              disableGradient={mode == "stepByStep"}>
              <HorizontalSpacer width={157} />
              <CenterBars
                mode={mode}
                color={color}
                onStepByStepPress={() => this._notifyModeChange("stepByStep")}
                onSummaryPress={() => this._notifyModeChange("summary")}
              />
              {this._renderRightBar()}
            </HeaderBar>
          }
        </View>
        {navigation &&
          <Navigation {...navigation} style={styles.navigationStyle} />
        }
      </View>
    );
  }

  private _notifyModeChange = (mode: RecipeBarMode) => {
    this.props.onModeChangeRequest && this.props.onModeChangeRequest(mode);
  }

  private _renderRightBar() {
    const { notesNum, color, mode, hideNotesButton } = this.props;

    if (mode == "summary" && !hideNotesButton) {
      return (
        <View
          style={[
            styles.rightContainer,
            { marginRight: 24, marginTop: 17 },
          ]}
        >
          <NotesButton
            color={color}
            notesNum={notesNum}
            onNotesPress={() => { this._notifyModeChange("notes"); }}
          />
        </View>
      );
    } else if (mode == "notes") {
      return (
        <View
          style={[
            styles.rightContainer,
            { marginRight: 24, marginTop: 17 },
          ]}
        >
          <NotesButton notesNum={notesNum} color="white" />
        </View>
      );
    } else {
      return <View style={styles.rightContainer} />;
    }
  }
}

export const CenterBars = (props: CenterBarsProps) => {
  const summaryParams = {
    active: props.mode == "summary",
    inactiveRed: props.mode != "summary" && props.color == "white",
    onPress: props.onSummaryPress,
  };
  const stepByStepParams = {
    active: props.mode == "stepByStep",
    inactiveRed: props.mode != "stepByStep" && props.color == "white",
    onPress: props.onStepByStepPress,
  };

  if (!IS_TABLET) {
    // no inactiveRed on phones
    summaryParams.inactiveRed = stepByStepParams.inactiveRed = false;
  }

  return (
    <View style={styles.barsContainer}>
      <Bar {...summaryParams}>
        <TextScaledOnPhone
          style={[
            styles.commonBarFont,
            { color: summaryParams.inactiveRed ? "#cb0000" : "white" },
            props.textStyle,
          ]}>
          {I18n.t("summary").toUpperCase()}
        </TextScaledOnPhone>
      </Bar>
      {!IS_TABLET && <HorizontalSpacer width={25} />}
      <Bar {...stepByStepParams}>
        <TextScaledOnPhone
          style={[
            styles.commonBarFont,
            { color: stepByStepParams.inactiveRed ? "#cb0000" : "white" },
            props.textStyle,
          ]}>
          {I18n.t("step").toUpperCase()}
          <TextScaledOnPhone style={styles.barFont2}>
            {` ${I18n.t("by").toLowerCase()} `}
          </TextScaledOnPhone>
          {I18n.t("step").toUpperCase()}
        </TextScaledOnPhone>
      </Bar>
    </View>
  );
};

interface BarProps {
  active: boolean;
  inactiveRed: boolean;
  children?: ReactNode;
  onPress?: () => void;
  style?: StyleProp<TextStyle>;
}

const Bar = (props: BarProps) => {
  let textOpacity = 1;
  if (!IS_TABLET) {
    textOpacity = props.active ? 1 : 0.4;
  }
  return (
    <TouchableScale
      disabled={props.active}
      style={[
        PlatformSelect<ViewStyle>({
          anyTablet: {
            paddingTop: 2,
            alignItems: "center",
            justifyContent: "center",
            width: 175,
            height: 57,
            marginBottom: 11
          },
          anyPhone: {
            height: "100%",
            justifyContent: "flex-end",
            paddingBottom: 13,
          },
        }),
        (props.active && !props.inactiveRed) ? styles.activeBar : styles.transparentBar,
        props.style,
      ]}
      onPress={props.onPress}
    >
      <View style={{ opacity: textOpacity, flexDirection: "row", alignItems: "center" }}>
        {props.children}
      </View>
    </TouchableScale>
  );
};

export const NotesButton = (props: NotesButtonProps) => {
  return (
    <TouchableScale onPress={props.onNotesPress} style={props.style} disabled={!props.onNotesPress}>
      <ImageBackground
        source={(props.color == "white") ? notesIconRed : notesIcon}
        style={styles.notes}>
        <TextScaledOnPhone style={styles.notesFont}>{props.notesNum || "+"}</TextScaledOnPhone>
      </ImageBackground>
    </TouchableScale>
  );
};

const HeaderBar = (props: HeaderBarProps) => {
  const barParams = (props.color == "white") ? {
    colors: [
      "rgba(255, 255, 255, 1)",
      "rgba(255, 255, 255, 0.88)",
      "rgba(255, 255, 255, 0)",
    ],
    height: 171,
  } : {
      colors: [
        "rgba(0, 0, 0, 0.8)",
        "rgba(0, 0, 0, 0)",
      ],
      height: 117.5,
    };
  return (
    <View style={styles.HeaderBarContainer}>
      {props.disableGradient ? (
        <View style={{ flexDirection: "row", marginTop: -3 }}>
          {props.children}
        </View>
      ) : (
          <LinearGradient
            colors={barParams.colors}
            style={{ width: "100%", height: barParams.height }}>
            <View style={{ flexDirection: "row", marginTop: -3 }}>
              {props.children}
            </View>
          </LinearGradient>
        )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...PlatformSelect({
      anyTablet: {
        width: 896,
        height: 596,
      },
    }),
    backgroundColor: "white",
  },
  navigationStyle: {
    width: 896,
    marginTop: 585,
    position: "absolute",
  },
  barsContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  activeBar: {
    ...PlatformSelect<ViewStyle>({
      anyTablet: {
        borderRadius: 2,
        backgroundColor: "#cb0000",
        shadowColor: "rgba(0, 0, 0, 0.1)",
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowRadius: 8,
        shadowOpacity: 1,
      },
      anyPhone: {
        backgroundColor: "transparent",
      },
    }),
  },
  transparentBar: {
    backgroundColor: "transparent",
  },
  commonBarFont: {
    fontFamily: "Muli",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 2,
  },
  barFont2: {
    fontFamily: "Merriweather",
    fontSize: 11,
    fontWeight: "300",
    fontStyle: "italic",
    letterSpacing: 0.5,
    textAlign: "center",
  },
  rightContainer: {
    flexDirection: "row",
    width: 157,
    justifyContent: "flex-end",
  },
  notes: {
    width: 30,
    height: 30,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
  },
  notesFont: {
    fontFamily: "Muli",
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 2.55,
    textAlign: "center",
    color: "#ffffff",
  },
  HeaderBarContainer: {
    position: "absolute",
    width: "100%",
  },
});
