import React from "react";
import { Image, KeyboardAvoidingView, View } from "react-native";

import { ValueBase } from "iocentro-datamodel";

import { StepScreenData } from "../../views/StepsScreen";
import { getNavigationMode, NavigationCallbacks } from "../steps_screen/Navigation";
import { RatingData } from "../steps_screen/Rating";
import { StepsHeader } from "../steps_screen/StepsHeader";
import { RecipeBar, RecipeBarColors, RecipeBarMode } from "./RecipeBar";

const fauxcardstack = require("../../../img/recipe_summary/fauxcardstack.png");

interface StepWindowProps extends StepScreenData, RatingData, NavigationCallbacks {
  title: ValueBase;
  children?: React.ReactNode;
  onModeChangeRequest?: (mode: RecipeBarMode) => void;
  summary: boolean;
  color?: RecipeBarColors;
  userRecipe?: boolean;
  hideNotesButton?: boolean;
}

export const StepWindow = (props: StepWindowProps) => {
  const {
    rating,
    currentStep,
    allSteps,
    onNextPress,
    onPrevPress,
    onFinishPress,
    onModeChangeRequest,
    summary,
    userRecipe,
    color,
    hideNotesButton,
  } = props;

  const navMode = getNavigationMode(rating, currentStep, allSteps, userRecipe);

  return (
    <KeyboardAvoidingView
      contentContainerStyle={{
        width: "100%", height: "100%",
      }}
      behavior="position"
      keyboardVerticalOffset={-300}>
      <RecipeWindow>
        <RecipeBar
          isLoading={false}
          mode={summary ? "summary" : "stepByStep"}
          color={color}
          navigation={summary ? undefined : {
            mode: navMode,
            onNextPress,
            onPrevPress,
            onFinishPress,
          }}
          hideNotesButton={hideNotesButton}
          onModeChangeRequest={onModeChangeRequest}
          headerVisible={!userRecipe}
        >
          {!summary &&
            <StepsHeader
              {...props}
              title={props.title}
            />
          }
          {props.children}
        </RecipeBar>
      </RecipeWindow>
    </KeyboardAvoidingView>
  );
};

export const RecipeWindow = (props) => (
  <View
    style={{
      flex: 1,
      marginTop: 9,
      alignItems: "center",
      backgroundColor: "transparent",
    }}>
    {props.children}
    <Image
      style={{
        marginTop: -75,
        zIndex: -1,
      }}
      source={fauxcardstack}
    />
  </View>
);
