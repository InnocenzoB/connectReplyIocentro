import { I18n } from "iocentro-apps-common-bits";
import React from "react";
import { StyleSheet, View } from "react-native";

import { IS_TABLET } from "../../Platform";
import { IconButton } from "../Buttons";
import { Hr } from "../Hr";
import { TextScaledOnPhone } from "../ScaledText";
import { FlexRow } from "./FlexRow";
import { NotesData, NotesList } from "./NotesFooter";
import { RateFooter, RateFooterData } from "./RateFooter";

const rateRecipeStarUnchecked = IS_TABLET ?
  require("../../../img/steps/rateRecipeStarUnchecked.png") :
  require("../../../img/steps/rateRecipeStarUncheckedPhone.png");
const rateRecipeStarChecked = IS_TABLET ?
  require("../../../img/steps/rateRecipeStarChecked.png") :
  require("../../../img/steps/rateRecipeStarCheckedPhone.png");

interface RatingStepProps extends RatingData, RateFooterData, NotesData {
  textInputComponent: JSX.Element;
  navi?: any;
  onRatingPress: (rating: number) => void;
}

export const RatingStep = (props: RatingStepProps) => {
  return (
    <View
      style={{
        flex: 1,
      }}>
      {IS_TABLET ? (
        <Rating
          {...props}
        />
      ) : (
          <PhoneRating
            {...props}
          />
        )}

      <RateFooter
        {...props}
      />
    </View>
  );
};

export interface RatingData {
  rating?: number; // recipe rating (0 - 5), where 0 | undefined means that no rating is set
}

interface RatingProps extends RatingData, StarsRateTouchableProps, NotesData {
  textInputComponent?: JSX.Element;
}

const Rating = (props: RatingProps) => {
  return (
    <FlexRow>
      <View style={{ flex: 2.02 }}>
        <View style={{ marginTop: 15 }}>
          <TextScaledOnPhone style={styles.header}>
            {I18n.t("rate_this_recipe")}
          </TextScaledOnPhone>
          <Hr />
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 15,
            }}>
            <StarsRateTouchable {...props} />
          </View>
        </View>
        <NotesList
          recipe={props.recipe}
          notes={props.notes}
          textInputComponent={props.textInputComponent}
          displayTitle
          style={{ marginHorizontal: 2, flex: 1 }}
          noteContainerStyle={{ marginHorizontal: 4 }}
        />
      </View>
    </FlexRow>
  );
};

const PhoneRating = (props: RatingProps) => {
  return (
    <FlexRow>
      <View style={{ flex: 5.95 }}>
        <View style={{ marginTop: 15 }}>
          <TextScaledOnPhone style={styles.header}>
            {I18n.t("rate_this_recipe")}
          </TextScaledOnPhone>
          <Hr />
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 15,
            }}>
            <StarsRateTouchable {...props} />
          </View>
        </View>
        <NotesList
          recipe={props.recipe}
          notes={props.notes}
          textInputComponent={props.textInputComponent}
          displayTitle
          style={{ marginHorizontal: 2, flex: 1 }}
        />
      </View>
    </FlexRow>
  );
};

interface StarsRateTouchableProps extends RatingData {
  onRatingPress?: (rating: number) => void;
}

export const StarsRateTouchable = (props: StarsRateTouchableProps) => {
  const { onRatingPress, rating = 0 } = props;
  const stars: JSX.Element[] = [];
  for (let i = 0; i < 5; i++) {
    stars.push((
      <IconButton
        key={i.toString()}
        icon={rating > i ? rateRecipeStarChecked : rateRecipeStarUnchecked}
        onPress={onRatingPress ? () => { onRatingPress(i + 1); } : undefined}
      />
    ));
  }

  return (
    <View style={{ flexDirection: "row" }}>
      {stars}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    fontFamily: "Merriweather",
    fontSize: 18,
    fontWeight: "300",
    fontStyle: "italic",
    color: "#000000",
    marginBottom: 9,
  },
  font: {
    fontFamily: "Muli",
    fontSize: 11,
    fontWeight: "900",
    lineHeight: 32,
    letterSpacing: 2,
    color: "#000000",
  },
});
