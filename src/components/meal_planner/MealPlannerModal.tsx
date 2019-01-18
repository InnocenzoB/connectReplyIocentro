import { RecipeModel } from "iocentro-collection-manager";
import React, { Component } from "react";
import { StyleProp, View, ViewStyle } from "react-native";
import Modal from "react-native-modal";
import { Subscription } from "rxjs";
import XDate from "xdate";

import { sameDate, sameMonth } from "../../calendar_utils";
import { MealPlannerCollectionStore, MealPlannerItem } from "../../model/MealPlannerRxTx";
import { IS_TABLET } from "../../Platform";
import { IconButton } from "../Buttons";
import { Hr } from "../Hr";
import { Loading } from "../Loading";
import { MealPlannerLeftBar } from "./MealPlannerLeftBar";
import { Mode, ModeTabs } from "./ModeTabs";

const imported = {
  closeIcon: require("../../../img/icons/closeIcon.png"),
  checkIcon: require("../../../img/icons/checkIcon.png"),
};

interface MealPlannerModalProps {
  recipeToBeAdded: RecipeModel;
  isVisible: boolean;
  onClose: () => void;
}

interface MealPlannerModalState {
  currentMode: Mode;
  selectedDate: XDate;

  monthlyPlannedItemsAmount?: Map<string, number>;
  dailyPlannedItems?: MealPlannerItem[];
  selectedDateInWeek?: XDate;
}

export class MealPlannerModal extends Component<MealPlannerModalProps, MealPlannerModalState>  {
  private _modelSubscription: Subscription;
  constructor(props) {
    super(props);

    this.state = {
      currentMode: Mode.WEEK,
      selectedDate: XDate(true),
      selectedDateInWeek: undefined,
      monthlyPlannedItemsAmount: undefined,
      dailyPlannedItems: undefined,
    };
  }

  public componentDidMount() {
    MealPlannerCollectionStore.instance.notifySourceReady((mpCollection) => {
      this.updateMonthlyPlannedDates();
      this.fetchItemsForSelectedDate();
      this._modelSubscription = mpCollection.modelChanged.subscribe(() => {
        this.updateMonthlyPlannedDates();
        this.fetchItemsForSelectedDate();
      });
    });
  }

  public componentWillUnmount() {
    if (this._modelSubscription) {
      this._modelSubscription.unsubscribe();
    }
  }

  public render() {
    const { monthlyPlannedItemsAmount, dailyPlannedItems } = this.state;
    const { recipeToBeAdded } = this.props;

    const itemsForSelectedDay = (dailyPlannedItems || []).slice();
    const recipeList = dailyPlannedItems && itemsForSelectedDay.map((item) => item.fetchedRecipe);
    recipeList && recipeList.push(recipeToBeAdded);

    return (
      <Modal
        isVisible={this.props.isVisible}
        backdropOpacity={0.5}
        animationIn="slideInLeft"
        animationOut="slideOutLeft"
        onBackdropPress={this.props.onClose}
        style={{
          width: 317,
          height: "100%",
          alignSelf: "flex-start",
          backgroundColor: "white",
          padding: 0,
          margin: 0,
        }}
      >
        <Loading visible={!this.state.monthlyPlannedItemsAmount} />
        <View style={{ flex: 1 }}>
          <ModeTabs
            style={{ marginTop: 22, marginLeft: 30 }}
            currentMode={this.state.currentMode}
            textStyle={{ color: "#000000", opacity: 0.7 }}
            currentTextStyle={{ color: "#cb0000", opacity: 1 }}
            onModeChange={(currentMode) => this.setState({ currentMode })}
          />
          <Hr style={{ height: 1, marginTop: 9, marginBottom: 20 }} />
          <MealPlannerLeftBar
            dayToItemsAmountMap={monthlyPlannedItemsAmount}
            mode={this.state.currentMode}
            onCalendarDayPress={this.onCalendarDayPress}
            onCalendarArrowPress={this.onCalendarArrowPress}
            recipeList={recipeList}
            selectedDate={this.state.selectedDate}
            highlightedDay={this.state.selectedDateInWeek}
            onDaylistDayPress={this.onDayListDayPress}
            isRecipeHighlighted={(recipe) => recipe.id.sv() == recipeToBeAdded.id.sv()}
            style={{ width: 317, flex: 1 }}
            dayListThin={!IS_TABLET}
          />
          <Hr style={{ height: 1 }} />
          <CancelConfirmButtons
            confirmInactive={!this.isAddingPossible()}
            style={{ paddingHorizontal: 70, paddingVertical: 15 }}
            onCancel={this.props.onClose}
            onConfirm={this.addRecipeToPlan}
          />
        </View>
      </Modal>
    );
  }

  private isAddingPossible = (): boolean => {
    return this.state.currentMode == Mode.TODAY || this.state.selectedDateInWeek != undefined;
  }

  private addRecipeToPlan = () => {
    const { selectedDateInWeek, selectedDate } = this.state;
    const { recipeToBeAdded, onClose } = this.props;

    MealPlannerCollectionStore.instance.addNewItem(selectedDateInWeek || selectedDate, recipeToBeAdded);
    onClose && onClose();
  }

  private onCalendarDayPress = (day: XDate) => {
    this.updateSelectedDate(day);
  }

  private onDayListDayPress = (day: XDate) => {
    if (sameDate(day, this.state.selectedDateInWeek)) {
      this.setState({ selectedDateInWeek: undefined });
    } else {
      this.updateSelectedDate(day);
    }
  }

  private updateSelectedDate = (day: XDate) => {
    this.setState((prevState) => {
      const stateToSet: Partial<MealPlannerModalState> = { selectedDate: day, selectedDateInWeek: day };
      if (!sameDate(prevState.selectedDate, day)) {
        stateToSet.dailyPlannedItems = undefined;
        setTimeout(() => this.fetchItemsForSelectedDate(day));
      }
      if (!sameMonth(prevState.selectedDate, day)) {
        setTimeout(() => this.updateMonthlyPlannedDates(day));
      }
      return stateToSet as any;
    });
  }

  private onCalendarArrowPress = (direction: "next" | "prev") => {
    const newDate = this.state.selectedDate.clone();
    if (this.state.currentMode == Mode.TODAY) {
      newDate.addWeeks(direction == "next" ? +1 : -1);
    } else {
      newDate.addMonths(direction == "next" ? +1 : -1);
    }
    this.updateSelectedDate(newDate);
  }

  private fetchItemsForSelectedDate = (date?: XDate) => {
    MealPlannerCollectionStore.instance.fetchItemsForDay(
      date || this.state.selectedDate,
      (dailyPlannedItems, requestedDate) => {
        if (sameDate(requestedDate, this.state.selectedDate)) {
          this.setState({ dailyPlannedItems });
        }
      });
  }

  private updateMonthlyPlannedDates = (date?: XDate) => {
    const mpCollection = MealPlannerCollectionStore.instance;

    const monthlyPlannedItemsAmount = mpCollection.getMonthlyPlannedItemsAmount(date || this.state.selectedDate);
    this.setState({ monthlyPlannedItemsAmount });
  }
}

interface CancelConfirmButtonsProps {
  confirmInactive?: boolean;
  onCancel?: () => void;
  onConfirm?: () => void;
  style?: StyleProp<ViewStyle>;
}

const CancelConfirmButtons = ({ confirmInactive, onCancel, onConfirm, style }: CancelConfirmButtonsProps) => (
  <View style={[{ flexDirection: "row", justifyContent: "space-between" }, style]}>
    <IconButton
      onPress={onCancel}
      icon={imported.closeIcon}
    />
    <IconButton
      onPress={onConfirm}
      disabled={confirmInactive}
      icon={imported.checkIcon}
      style={{ opacity: (confirmInactive ? 0.2 : 1) }}
    />
  </View>
);
