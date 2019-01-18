import { RecipeStepModel } from "iocentro-collection-manager";
import React from "react";

import { IS_TABLET } from "../../Platform";
import { StepMode } from "../../views/StepsScreen";
import { StepFlex } from "./Content";
import { CookingCompleted, CookingStepData, CookingStepFlex, CookingStopRequest } from "./CookingStep";
import { StepFooter } from "./Footer";
import { NotesData } from "./NotesFooter";
import { VideoSrc } from "./VideoFooter";
import { VideoPhoneFlex } from "./VideoPhone";
import { VideoTipData, VideoTipFlex } from "./VideoTip";
import { WeightStepData, WeightStepFlex } from "./WeightStep";

interface StepRendererProps extends NotesData, CookingCompleted, CookingStopRequest {
  notesTextInput?: JSX.Element;
  currentStepModel: RecipeStepModel;
  mode: StepMode;
  video?: VideoSrc;
  videoTip?: VideoTipData;
  showNotes: boolean;
  weightData?: WeightStepData;
  cookingData?: CookingStepData;
  navi?: any;
  onHideNotesPress: () => void;
  onNotesPress?: () => void; // if not passed, notes are not rendered
}

export const StepRenderer = (props: StepRendererProps) => {
  const {
    notesTextInput,
    currentStepModel,
    mode,
    video,
    videoTip,
    showNotes,
    weightData,
    cookingData,
  } = props;

  if ((video || videoTip) && !IS_TABLET) {
    if (video) {
      return (
        <VideoPhoneFlex
          {...props}
          video={video}
        />
      );
    }
    if (videoTip && mode != StepMode.weight) {
      return (
        <VideoPhoneFlex
          {...props}
          video={videoTip.source}
          tip={videoTip.tip}
        />
      );
    }
  }

  const tip = currentStepModel.tip;
  const image = currentStepModel.image;

  const footer = (
    <StepFooter
      {...props}
      textInputComponent={notesTextInput}
    />
  );

  const standardStep = (
    <StepFlex
      tip={showNotes ? undefined : currentStepModel.tip}
      image={currentStepModel.image}
    >
      {footer}
    </StepFlex>
  );

  if (mode == StepMode.weight) {
    if (weightData) {
      return (
        <WeightStepFlex
          {...weightData}
          mode={showNotes || video ? "small" : "normal"}
          {...{tip, image}}
        >
          {footer}
        </WeightStepFlex>
      );
    } else { return standardStep; }
  } else if (mode == StepMode.recipe) {
    if (cookingData) {
      return (
        <CookingStepFlex
          {...props}
          {...cookingData}
        >
          {footer}
        </CookingStepFlex>
      );
    } else { return standardStep; }
  } else if (mode == StepMode.manual) {
    if (videoTip) {
      return (
        <VideoTipFlex
          {...props}
          videoTip={videoTip}
          showNotes={showNotes}
          textInputComponent={notesTextInput}>
        </VideoTipFlex>
      );
    } else { return standardStep; }
  }

  return null;
};
