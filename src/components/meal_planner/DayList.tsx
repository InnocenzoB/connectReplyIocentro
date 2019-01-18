import React, { Component } from "react";
import {
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollViewStyle,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import XDate from "xdate";

import { sameDate, TimePeriod, xdateToString } from "../../calendar_utils";
import { VerticalSpacer } from "../../components/dashboard/Common";
import { ColoredNumberCircle } from "../../components/steps_screen/NumberCircle";
import { HorizontalSpacer } from "../../components/steps_screen/Overview";
import { IS_TABLET } from "../../Platform";
import { TextScaledOnPhone } from "../ScaledText";
import { TouchableScale } from "../TouchableScale";

export interface DayListProps {
  highlightedDate?: XDate;
  period: TimePeriod;
  initialDate?: XDate;
  dayToItemsAmountMap?: Map<string, number>;
  onDayPress: (date: XDate) => void;
  onDayLongPress?: (date: XDate) => void;
  horizontal?: boolean;
  style?: StyleProp<ScrollViewStyle>;
  separatorSize?: number;
  contentContainerStyle?: StyleProp<ViewStyle>;
  thin?: boolean;
  onOverScrolledFromEdge?: (edge: "starting" | "ending") => void;
}

interface DayListState {
  dates: XDate[];
}

interface ScrollEventProps {
  offset: number;
  layoutSize: number;
  contentSize: number;
  distanceFromEnd: number;
  direction?: "begin" | "end";
}
export class DayList extends Component<DayListProps, DayListState> {
  public static defaultProps = {
    separatorSize: 10,
  };

  private _scrollEdge: "starting" | "ending" | undefined = "starting";
  private _flatList: FlatList<XDate>;

  private updateScrollPosition = (edge) => {
    const { onOverScrolledFromEdge } = this.props;
    if (edge && this._scrollEdge == edge) {
      onOverScrolledFromEdge && onOverScrolledFromEdge(edge);
    }
    this._scrollEdge = edge;
  }

  public scrollToDate(date: XDate): boolean {
    const { period } = this.props;
    if (period.contains(date)) {
      const daysDiff = Math.round(period.begin.diffDays(date));
      // this._flatList.scrollToOffset({ offset: this.getItemLayout(undefined, daysDiff).offset });
      this._flatList.scrollToIndex({ index: daysDiff });
      return true;
    }
    return false;
  }

  constructor(props) {
    super(props);

    this.state = {
      dates: [],
    };
  }

  public componentWillMount() {
    this.updateDates();
  }

  public componentWillReceiveProps(nextProps: DayListProps) {
    const period = this.props.period;
    const nextPeriod = nextProps.period;

    if (!(sameDate(period.end, nextPeriod.end) && sameDate(period.begin, nextPeriod.end))) {
      this.updateDates(nextPeriod);
    }
  }

  private getItemSize = () => {
    const { horizontal, thin } = this.props;
    if (horizontal) {
      return { width: 72, height: 86 };
    } else {
      if (thin) {
        return { minWidth: 70, height: 30 };
      } else {
        return { minWidth: 70, height: 45 };
      }
    }
  }

  private getItemLayout = (_data: any, index: number) => {
    const { horizontal, separatorSize } = this.props;
    const itemSize = this.getItemSize()[horizontal ? "width" : "height"]!;
    return {
      length: itemSize,
      offset: (itemSize + (separatorSize || 0)) * index - 1,
      index,
    };
  }

  public render() {
    const {
      highlightedDate,
      onDayPress,
      onDayLongPress,
      dayToItemsAmountMap,
      horizontal,
      style,
      separatorSize,
      contentContainerStyle,
      initialDate,
      thin,
    } = this.props;

    return (
      <FlatList
        ref={(instance) => { this._flatList = instance as any; }}
        onLayout={() => {
          initialDate && this.scrollToDate(initialDate);
        }}
        getItemLayout={this.getItemLayout}
        // @ts-ignore (db): types does not have onScrollToIndexFailed, but it exist
        onScrollToIndexFailed={(info) => {
          this._flatList.scrollToOffset({ offset: info.averageItemLength * info.index });
        }}
        ItemSeparatorComponent={() => horizontal ?
          <HorizontalSpacer width={separatorSize} />
          :
          <VerticalSpacer height={separatorSize} />}
        style={style}
        contentContainerStyle={contentContainerStyle}
        keyExtractor={(date) => xdateToString(date)}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        alwaysBounceHorizontal={false}
        alwaysBounceVertical={false}
        horizontal={horizontal}
        onMomentumScrollEnd={(e) => {
          const { onOverScrolledFromEdge } = this.props;
          if (!onOverScrolledFromEdge) { return; }

          const scrollProps = this.scrollPropsFromEvent(e);
          if (!scrollProps) { return; }

          if (scrollProps.offset == 0) {
            this.updateScrollPosition("starting");
          } else {
            if (scrollProps.distanceFromEnd < 5) {
              this.updateScrollPosition("ending");
            } else {
              this.updateScrollPosition(undefined);
            }
          }
        }}
        data={this.state.dates}
        renderItem={({ item: itemDate }) => {
          const amountInTheDay = (dayToItemsAmountMap && dayToItemsAmountMap.get(xdateToString(itemDate))) || 0;
          const isEmpty = (amountInTheDay == 0);
          const isSelected = sameDate(highlightedDate, itemDate);
          const numberColor = (isEmpty ? "rgba(0,0,0,0.1)" : "rgba(0,0,0,0.45)");

          return (
            <TouchableScale
              style={[{
                backgroundColor: (isSelected ? "#cb0000" : "#ffffff"),
              }, horizontal ? {
                flexDirection: "column-reverse",
                paddingVertical: 12,
                paddingHorizontal: 10,
              } : {
                  flexDirection: "row",
                  paddingVertical: 2,
                  paddingHorizontal: 12,
                }, styles.dayBox,
              this.getItemSize(),
              thin && {
                paddingVertical: 5,
                paddingHorizontal: 12,
                minHeight: undefined,
              }]}
              onPress={() => onDayPress(itemDate)}
              onLongPress={() => onDayLongPress ? onDayLongPress(itemDate) : onDayPress(itemDate)}
            >
              <ColoredNumberCircle
                size={IS_TABLET ? 26 : 22}
                number={amountInTheDay}
                color={isSelected ? "white" : numberColor}
                numberColor={isSelected ? "#cb0000" : undefined}
              />
              {horizontal ? <VerticalSpacer height={10} /> : <HorizontalSpacer width={10} />}
              <View
                style={{
                  justifyContent: "space-between",
                  alignItems: (horizontal || thin) ? "center" : undefined,
                  flexDirection: thin ? "row" : "column",
                }}
              >
                <TextScaledOnPhone
                  style={[{
                    color: (isSelected ? "white" : "#000000"),
                  }, styles.dayNameText]}
                >
                  {this.formatDayName(itemDate) + (this.props.thin ? " " : "")}
                </TextScaledOnPhone>
                <TextScaledOnPhone style={[{
                  color: (isSelected ? "white" : "#000000"),
                }, styles.dayDateText]}>{this.formatDayDate(itemDate)}</TextScaledOnPhone>
              </View>
            </TouchableScale>
          );
        }}
      />
    );
  }

  private formatDayName(date: XDate) {
    const dayName = date.toString("dddd").toUpperCase();
    if (this.props.horizontal) {
      return dayName.substring(0, 3);
    }
    return dayName;
  }

  private formatDayDate(date: XDate) {
    if (this.props.horizontal) {
      return date.toString("MMM d");
    }
    return date.toString("MMMM d");
  }

  private updateDates = (period = this.props.period) => {
    this.setState({ dates: period.getDates() });
  }

  private scrollPropsFromEvent(e?: NativeSyntheticEvent<NativeScrollEvent>): ScrollEventProps | undefined {
    const { horizontal } = this.props;

    if (!e) { return; }
    const ne = e.nativeEvent;

    const measurement = {
      coordinate: horizontal ? "x" : "y",
      dimension: horizontal ? "width" : "height",
    };

    const offset = ne.contentOffset[measurement.coordinate];
    const layoutSize = ne.layoutMeasurement[measurement.dimension];
    const contentSize = ne.contentSize[measurement.dimension];
    const direction = ne.velocity && (ne.velocity[measurement.coordinate] > 0 ? "end" : "begin");
    const scrollEndPosition = offset + layoutSize;
    const distanceFromEnd = Math.abs(contentSize - scrollEndPosition);

    return {
      offset,
      layoutSize,
      contentSize,
      direction,
      distanceFromEnd,
    };
  }
}

const styles = StyleSheet.create({
  dayBox: {
    alignItems: "center",

    shadowColor: "rgba(0, 0, 0, 0.2)",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowRadius: 4,
    shadowOpacity: 1,
  },
  dayNameText: {
    fontFamily: "Muli",
    fontSize: IS_TABLET ? 18 : 16,
    fontWeight: "bold",
    fontStyle: "normal",
    letterSpacing: 1.5,
  },
  dayDateText: {
    fontFamily: "Merriweather",
    fontSize: IS_TABLET ? 14 : 12,
    fontWeight: "300",
    fontStyle: "italic",
    letterSpacing: 1.71,
  },
});
