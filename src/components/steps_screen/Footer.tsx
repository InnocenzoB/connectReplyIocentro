import { RecipeStepModel } from "iocentro-collection-manager";
import React from "react";
import { ScrollView, StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import LinearGradient from "react-native-linear-gradient";

import { IS_TABLET, PlatformSelect } from "../../Platform";
import { noNull } from "../../Utils";
import { TextScaledOnPhone } from "../ScaledText";
import { FooterSeparator } from "./FooterSeparator";
import { NotesButton, NotesButtonProps } from "./NotesButton";
import { NotesData, NotesFooter } from "./NotesFooter";
import { VideoFooter, VideoSrc } from "./VideoFooter";

interface StepFooterProps extends StepData, NotesData, FooterData {
  textInputComponent?: JSX.Element;
  showNotes: boolean;
  video?: VideoSrc;

  onHideNotesPress: () => void;
  onNotesPress?: () => void; // if not passed, notes are not rendered
}

export const StepFooter = (props: StepFooterProps) => {
  const {
    currentStepModel,
    notes,
    showNotes,
    video,
    stepDone,
    onHideNotesPress,
    onNotesPress,
    recipe
  } = props;

  if (onNotesPress && showNotes) {
    return (
      <NotesFooter
        recipe={recipe}
        notes={notes}
        textInputComponent={props.textInputComponent}
        currentStepModel={currentStepModel}
        onHideNotesPress={onHideNotesPress}
      />
    );
  }

  if (video) {
    return (
      <VideoFooter
        currentStepModel={currentStepModel}
        notes={notes}
        videoSource={video}
        onNotesPress={onNotesPress}
      />
    );
  }

  return (
    <Footer
      currentStepModel={currentStepModel}
      stepDone={stepDone}
      notes={notes}
      onNotesPress={onNotesPress}
    />
  );
};

export interface StepData {
  currentStepModel: RecipeStepModel;
}

export interface FooterData {
  stepDone?: boolean;
}

interface FooterProps extends StepData,
  FooterData,
  NotesButtonProps {
}

const Footer = (props: FooterProps) => {
  return (
    <View style={styles.container}>
      <View style={{ flex: 1, flexDirection: "row" }}>
        <View style={{ flex: 1 }} />
        <View style={{ flex: IS_TABLET ? 3.93 : 6.75, alignItems: "center" }}>
          <FooterSeparator done={props.stepDone} />
          <StepDescription
            step={props.currentStepModel}
            scroll={true}
            style={[
              { alignItems: "center", backgroundColor: "transparent", minWidth: IS_TABLET ? 500 : 200 },
              !props.stepDone && { marginTop: 20 },
            ]}
            stepDone={props.stepDone}
          />
        </View>
        <View style={{ flex: 1 }} />
      </View>
      {IS_TABLET && props.onNotesPress &&
        <NotesButton {...props} />
      }
    </View>
  );
};

interface StepDescriptionProps {
  step: RecipeStepModel;
  scroll?: boolean;
  style?: StyleProp<ViewStyle>;
  stepDone?: boolean;
}

export const StepDescription = (props: StepDescriptionProps) => {
  const {
    step,
    scroll,
    style,
    stepDone,
  } = props;

  const title = noNull(step.title.sv(), "?");
  const description = noNull(step.description.sv(), "");

  const content = (
    <View style={style}>
      {!!title &&
        <TextScaledOnPhone style={styles.font1}>
          {title}
        </TextScaledOnPhone>
      }
      <TextScaledOnPhone
        style={[
          !!title && { marginTop: IS_TABLET ? 12 : 3 },
          styles.font2,
        ]}
      >
        {description}
      </TextScaledOnPhone>
    </View>
  );

  if (scroll) {
    return (
      <View>
        <ScrollView
          horizontal={false}
          style={{ marginBottom: IS_TABLET ? 36 : 26, marginTop: stepDone ? 20 : 2 }}
          alwaysBounceVertical={false} bounces={false} showsVerticalScrollIndicator = {false}
        >
          {content}
          <View style={{ height: 30 }} />
        </ScrollView>
        <LinearGradient
          style={styles.gradient}
          colors={gradient}
        >
        </LinearGradient>
      </View>
    );
  } else {
    return content;
  }
};

const gradientHeight = 25;
const gradient = [
  "rgba(255, 255, 255, 0.25)",
  "rgba(255, 255, 255, 0.5)",
  "rgba(255, 255, 255, 0.75)",
  "rgba(255, 255, 255, 1)",
];

const styles = StyleSheet.create({
  container: {
    width: "100%",
    flex: IS_TABLET ? 0.47 : 0.54,
  },
  font1: {
    fontFamily: "Muli",
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 2.36,
    color: "#000000",
    textAlign: "center",
  },
  font2: {
    ...PlatformSelect({
      anyPhone: {
        fontSize: 12,
      },
    }),
    fontFamily: "Muli",
    lineHeight: 22,
    color: "#000000",
    textAlign: "center",
  },
  gradient: {
    width: "100%",
    height: gradientHeight,
    position: "absolute",
    bottom: IS_TABLET ? 36 : 26,
    backgroundColor: "transparent",
  },
});
