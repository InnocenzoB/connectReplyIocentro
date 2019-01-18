import { RecipeModel } from "iocentro-collection-manager";
import React, { Component } from "react";
import { FlatList, StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { Calendar } from "react-native-calendars";
import XDate from "xdate";

import { getWeek, parseDate, sameDate, TimePeriod, weekDayNames, XDateData, xdateToString } from "../../calendar_utils";
import { Hr } from "../../components/Hr";
import { RecipeTextCardList } from "../../components/meal_planner/RecipeTextCardList";
import { VerticalSpacer } from "../dashboard/Common";
import { IconButton, TextButton } from "../Buttons";
import { TextScaledOnPhone } from "../ScaledText";
import { HorizontalSpacer } from "../steps_screen/Overview";
import { DayList } from "./DayList";
import { Mode } from "./ModeTabs";

const imported = {
  leftArrow: require("../../../img/icons/leftArrow.png"),
};

interface MealPlannerLeftBarProps {
  style?: StyleProp<ViewStyle>;
  mode: Mode;

  // Calendar
  selectedDate: XDate;
  onCalendarDayPress: (day: XDateData) => void;
  onCalendarArrowPress: (direction: "next" | "prev") => void;

  // mode == Week
  dayToItemsAmountMap?: Map<string, number>;
  highlightedDay?: XDate;
  onDaylistDayPress?: (day: XDateData) => void; // if not specified onCalendarDayPress is taken
  dayListThin?: boolean;

  // mode == Today
  recipeList?: Array<RecipeModel | undefined>;
  isRecipeHighlighted?: (recipe: RecipeModel, index: number) => boolean;
  onRecipeXIconPressed?: (recipe: RecipeModel, index: number) => void;
  onRecipePress?: (recipe: RecipeModel, index: number) => void;
}

export class MealPlannerLeftBar extends Component<MealPlannerLeftBarProps> {
  public render() {
    const {
      selectedDate,
      mode,
      onCalendarDayPress,
      onCalendarArrowPress,
      recipeList,
      style,
      onDaylistDayPress,
      dayToItemsAmountMap,
      highlightedDay,
      dayListThin,
      onRecipeXIconPressed,
      onRecipePress,
      isRecipeHighlighted,
    } = this.props;

    const selectedWeek = getWeek(selectedDate);
    const today = XDate(true);

    return (
      <View style={style}>
        <CalendarHeader
          style={{ marginLeft: 23, marginRight: 13 }}
          str1={mode == Mode.WEEK ?
            selectedDate.toString("MMMM") :
            selectedDate.toString("dddd")}
          str2={mode == Mode.WEEK ?
            // display year only if not same as current
            today.getFullYear() != selectedDate.getFullYear() ? selectedDate.toString("yyyy") : ""
            :
            undefined}
          arrowsProps={{
            onLeftPress: () => {
              onCalendarArrowPress("prev");
            },
            onRightPress: () => {
              onCalendarArrowPress("next");
            },
            spaceBetween: 10,
          }}
        />
        {mode == Mode.WEEK ?
          <Calendar
            theme={CALENDAR_THEME}
            onDayPress={(xdateData: XDateData) => onCalendarDayPress(parseDate(xdateData))}
            style={mode == Mode.WEEK ?
              { marginHorizontal: 20, maxHeight: 203 } :
              { display: "none" }} // hide
            hideArrows
            current={selectedDate}
            markedDates={this.getMarkedDatesDescriptorObj()}
          />
          :
          <CalendarWeek
            onDayPress={onCalendarDayPress}
            selectedDate={selectedDate}
            week={selectedWeek}
          />
        }
        <Hr style={{ backgroundColor: "#E5E5E5", height: 1, opacity: 1 }} />
        <View style={styles.belowCalendarView}>
          {mode == Mode.WEEK ?
            <DayList
              style={{ overflow: "visible" }}
              period={selectedWeek}
              dayToItemsAmountMap={dayToItemsAmountMap}
              highlightedDate={highlightedDay}
              onDayPress={onDaylistDayPress || onCalendarDayPress}
              thin={dayListThin}
            />
            :
            <RecipeTextCardList
              style={{ overflow: "visible", marginBottom: 15 }}
              cardStyle={{
                style: styles.recipeTextCard,
                removeIconContainerStyle: styles.recipeTextCardRemoveIcon,
              }}
              highlightedCardStyle={{
                text: { color: "white" },
                style: { backgroundColor: "#cc0c05" },
                removeIconContainerStyle: { display: "none" },
              }}
              cardSpacing={10}
              data={recipeList}
              onRecipeRemove={onRecipeXIconPressed}
              isCardHighlighted={isRecipeHighlighted}
              onRecipePress={onRecipePress}
            />
          }
        </View>
      </View>
    );
  }

  private getMarkedDatesDescriptorObj() {
    const { selectedDate, dayToItemsAmountMap } = this.props;
    const markedDatesObj = {};

    if (dayToItemsAmountMap) {
      for (const dateStr of dayToItemsAmountMap.keys()) {
        markedDatesObj[dateStr] = { marked: true };
      }
    }

    const selectedDateStr = xdateToString(selectedDate);
    if (!markedDatesObj[selectedDateStr]) {
      markedDatesObj[selectedDateStr] = {};
    }
    Object.assign(markedDatesObj[selectedDateStr], { selected: true });

    return markedDatesObj;
  }
}

interface CalendarHeaderProps {
  style?: StyleProp<ViewStyle>;
  str1: string;
  str2: string;
  arrowsProps?: LeftRightArrowsProps;
}

const CalendarHeader = ({ style, str1, str2, arrowsProps }: CalendarHeaderProps) => (
  <View style={[{ flexDirection: "row", justifyContent: "space-between" }, style]}>
    <View style={{ flexDirection: "row" }}>
      <TextScaledOnPhone style={styles.calendarHeaderText1}>{str1.toUpperCase()} </TextScaledOnPhone>
      <TextScaledOnPhone style={styles.calendarHeaderText2}>{str2}</TextScaledOnPhone>
    </View>
    {arrowsProps && <LeftRightArrows {...arrowsProps} />}
  </View >
);

export interface LeftRightArrowsProps {
  style?: StyleProp<ViewStyle>;
  spaceBetween?: number;
  onLeftPress?: () => void;
  onRightPress?: () => void;
}

export const LeftRightArrows = ({ style, spaceBetween, onLeftPress, onRightPress }: LeftRightArrowsProps) => (
  <View style={[{ flexDirection: "row" }, style]}>
    <IconButton icon={imported.leftArrow} onPress={onLeftPress} touchableExpand={5} />
    {spaceBetween && <HorizontalSpacer width={spaceBetween} />}
    <IconButton
      icon={imported.leftArrow}
      iconStyle={{
        transform: [{
          rotateY: ("180deg"),
        }],
      }}
      onPress={onRightPress}
      touchableExpand={5}
    />
  </View>
);

interface CalendarWeekProps {
  week: TimePeriod;
  selectedDate: XDate;
  onDayPress: (day: XDate) => void;
}

const CalendarWeek = ({ week, selectedDate, onDayPress }: CalendarWeekProps) => (
  <FlatList
    keyExtractor={(_item, index) => index.toString()}
    horizontal
    style={{ marginTop: 7, maxHeight: 60, alignSelf: "center" }}
    scrollEnabled={false}
    showsHorizontalScrollIndicator={false}
    showsVerticalScrollIndicator={false}
    ItemSeparatorComponent={() => (<HorizontalSpacer width={11} />)}
    data={weekDayNames()}
    renderItem={({ item, index }) => {
      const day = week.begin.clone().addDays(index);
      const isSelected = sameDate(day, selectedDate);
      return (
        <View>
          <TextScaledOnPhone style={styles.weekDayNamesText}>{item}</TextScaledOnPhone>
          <VerticalSpacer height={7} />
          <TextButton
            style={[
              isSelected ? {
                backgroundColor: "#cb0000",
                borderRadius: 15,
              } : {},
              {
                width: 30, height: 30,
                alignItems: "center",
                justifyContent: "center",
              },
            ]}
            onPress={() => onDayPress(day)}
            textStyle={[{
              color: isSelected ? "white" : "#9b9b9b",
            }, styles.dayText]}
            text={day.getDate()}
          />
        </View>
      );
    }}
  />
);

const CALENDAR_THEME = {
  // tslint:disable:object-literal-key-quotes
  selectedDayBackgroundColor: "#cb0000",
  todayTextColor: "#cb0000",
  dotColor: "#cb0000",
  selectedDotColor: "white",
  selectedDayTextColor: "white",
  textDisabledColor: "#9B9B9B",
  // selectedDotColor: "white",
  "stylesheet.day.basic": {
    text: {
      fontFamily: "Muli",
      fontSize: 9.1,
      fontWeight: "bold",
      fontStyle: "normal",
      letterSpacing: 1.15,
      textAlign: "center",
      color: "#000000",
      backgroundColor: "transparent",
      marginTop: -2,
    },
    base: {
      width: 30,
      height: 30,
      alignItems: "center",
      justifyContent: "center",
    },
    dot: {
      width: 4,
      height: 4,
      position: "absolute",
      bottom: 4,
      borderRadius: 2,
      opacity: 0,
    },
  },
  "stylesheet.calendar.main": {
    week: {
      marginTop: 0,
      marginBottom: 0,
      flexDirection: "row",
      justifyContent: "space-around",
    },
  },
  "stylesheet.calendar.header": {
    header: {
      maxHeight: 0, // hide header with month name
    },
    dayHeader: {
      width: 30,
      fontFamily: "Muli",
      fontSize: 9.1,
      fontWeight: "bold",
      fontStyle: "normal",
      letterSpacing: 1.15,
      textAlign: "center",
      color: "#000000",

      paddingLeft: 1,
    },
  },
};

const styles = StyleSheet.create({
  belowCalendarView: {
    backgroundColor: "rgba(155, 155, 155, 0.05)",
    paddingTop: 11.5,
    paddingHorizontal: 15,
    overflow: "hidden",
    flex: 1,
  },
  recipeTextCard: {
    paddingVertical: 10,
    paddingLeft: 13,
    paddingRight: 23,
  },
  recipeTextCardRemoveIcon: {
    position: "absolute",
    top: 6, right: 6,
  },
  calendarHeaderText1: {
    fontFamily: "Muli",
    fontSize: 18,
    fontWeight: "bold",
    fontStyle: "normal",
    letterSpacing: 1.69,
    color: "#000000",
  },
  calendarHeaderText2: {
    fontFamily: "Merriweather",
    fontSize: 18,
    fontWeight: "300",
    fontStyle: "italic",
    letterSpacing: 1.69,
    color: "#000000",
  },
  weekDayNamesText: {
    fontFamily: "Muli",
    fontSize: 9.1,
    fontWeight: "bold",
    fontStyle: "normal",
    letterSpacing: 1.15,
    textAlign: "center",
    color: "#000000",
  },
  dayText: {
    fontFamily: "Muli",
    fontSize: 14.3,
    fontWeight: "900",
    fontStyle: "normal",
    letterSpacing: 0.5,
    textAlign: "center",
  },
});
