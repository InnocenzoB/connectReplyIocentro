import { I18n } from "iocentro-apps-common-bits";
import React from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";

import { TextScaledOnPhone } from "../ScaledText";
import { StepFlex } from "./Content";
import { Directions } from "./Directions";
import { FooterData, StepData } from "./Footer";
import { FooterSeparator } from "./FooterSeparator";
import { NotesButton } from "./NotesButton";
import { NotesData, NotesFooter } from "./NotesFooter";
import { VideoPlayer, VideoSrc } from "./VideoFooter";

interface VideoTipFlexProps extends StepData, NotesData, FooterData {
  textInputComponent?: JSX.Element;
  showNotes: boolean;
  videoTip: VideoTipData;

  onHideNotesPress: () => void;
  onNotesPress?: () => void; // if not passed, notes are not rendered
}

export const VideoTipFlex = (props: VideoTipFlexProps) => {
  const {
    currentStepModel,
    videoTip,
    showNotes,
    notes,
    stepDone,
    onHideNotesPress,
    onNotesPress,
  } = props;

  if (onNotesPress && showNotes) {
    return (
      <StepFlex> {/* intentional display placeholder if show notes */}
        <NotesFooter
          notes={notes}
          textInputComponent={props.textInputComponent}
          onHideNotesPress={onHideNotesPress}
          currentStepModel={currentStepModel}
        />
      </StepFlex>
    );
  } else {
    return (
      <View style={{ flex: 1 }}>
        <Directions currentStepModel={currentStepModel}/>
        <VideoTip
          stepDone={stepDone}
          notes={props.notes}
          tip={videoTip.tip}
          source={videoTip.source}
          onNotesPress={onNotesPress}
        />
      </View>
    );
  }
};

export interface VideoTipData {
  tip: string;
  source: VideoSrc;
}

interface VideoTipProps extends NotesData,
                                FooterData,
                                VideoTipData {
  onNotesPress?: () => void;
}

export const VideoTip = (props: VideoTipProps) => {
  return (
    <View style={styles.container}>
      <View style={{flex: 1, flexDirection: "row"}}>
        <View style={{flex: 1}}/>
        <View style={{flex: 3.93, alignItems: "center"}}>
          <FooterSeparator done={props.stepDone}/>
          <View style={{flex: 1, flexDirection: "row", marginTop: 29}}>
            <View style={{flex: 1, alignItems: "flex-end"}}>
            <VideoPlayer
              width={270}
              height={154}
              source={props.source}
              containerStyle={styles.videoContainer}
            />
            </View>

            <View style={{flex: 1}}>
              <VideoQuickTip text={props.tip} style={{marginLeft: 25}}/>
            </View>

          </View>
        </View>
        <View style={{flex: 1}}/>
      </View>

      {props.onNotesPress &&
        <NotesButton
          onNotesPress={props.onNotesPress}
          notes={props.notes}
        />}

    </View>
  );
};

interface VideoQuickTipProps {
  text: string;
  style?: StyleProp<ViewStyle>;
}

export const VideoQuickTip = ({text, style}: VideoQuickTipProps) => {
  return (
    <View style={[{flexDirection: "row"}, style]}>
      <View>
        <View style={styles.line} />
      </View>
      <View
        style={{
          marginLeft: 8,
          marginRight: 8,
        }}>
        <TextScaledOnPhone>
          <TextScaledOnPhone style={styles.tipFont1}>{`${I18n.t("discover")} `}</TextScaledOnPhone>
          <TextScaledOnPhone style={styles.tipFont2}>{text.toUpperCase()}</TextScaledOnPhone>
        </TextScaledOnPhone>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1.12,
    width: "100%",
    alignItems: "center",
  },
  line: {
    width: 2,
    height: 34,
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#cb0000",
  },
  tipFont1: {
    fontFamily: "Merriweather",
    fontSize: 13,
    fontStyle: "italic",
    letterSpacing: 1.2,
    color: "rgb(103, 103, 103)",
  },
  tipFont2: {
    fontFamily: "Muli",
    fontSize: 11,
    letterSpacing: 2,
    color: "rgb(103, 103, 103)",
    fontWeight: "900",
  },
  videoContainer: {
    flex: 1,
    alignItems: "flex-end",
  },
});
