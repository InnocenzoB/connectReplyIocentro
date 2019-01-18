import { I18n } from "iocentro-apps-common-bits";
import React, { Component } from "react";
import { Image, StyleSheet, View, ViewStyle } from "react-native";
import { NavigationScreenProps } from "react-navigation";
import { Subscription } from "rxjs";

import { GradientTextButton, TextButton } from "../components/Buttons";
import { VerticalSpacer } from "../components/dashboard/Common";
import { Hr } from "../components/Hr";
import { MultiOptionsView } from "../components/OptionsView";
import { PaperView } from "../components/Paper";
import { QUICK_CHOICE_BAR_HEIGHT } from "../components/QuickChoiceBottomBar";
import { RecipePage } from "../components/RecipePage";
import { TextScaledOnPhone } from "../components/ScaledText";
import { SearchBar } from "../components/SearchBar";
import { StyledSection, StyledSectionList } from "../components/StyledSectionList";
import { DeviceNameFromDeviceTypeId } from "../model/Helpers";
import { UserCreation } from "../model/user_creations/UserCreationRxTx";
import {
  DeviceTypeIdToUserCreationsMap,
  UserCreationsCollectionStore,
} from "../model/user_creations/UserCreationsCollectionStore";
import { IS_TABLET, PlatformSelect } from "../Platform";

const imported = {
  fullSizeIcon: require("../../img/icons/fullSizeIcon.png"),
  clearSearchBarIcon: require("../../img/icons/searchbarXIcon.png"),
};

const SORTING_OPTIONS: () => string[] = () => [
  I18n.t("a-z").toLowerCase(),
  I18n.t("date").toLowerCase(),
  I18n.t("popular").toLowerCase(),
];

const SORTING_COMPARE_FUNCTIONS: Array<(lhs: UserCreation, rhs: UserCreation) => number> = [
  (lhs, rhs) => {
    const lhsTitile: string = lhs.title.sv().toLowerCase();
    const rhsTitile: string = rhs.title.sv().toLowerCase();
    return lhsTitile.localeCompare(rhsTitile);
  },
  (lhs, rhs) => {
    const lhsLastTimestamp: number = lhs.getLastTimestamp();
    const rhsLastTimestamp: number = rhs.getLastTimestamp();
    return rhsLastTimestamp - lhsLastTimestamp;
  },
  (lhs, rhs) => {
    const lhsUseCount: number = lhs.useCount.sv();
    const rhsUseCount: number = rhs.useCount.sv();
    return rhsUseCount - lhsUseCount;
  },
];

interface MyCreationsData {
  data?: DeviceTypeIdToUserCreationsMap;
}

enum ScreenState {
  // TODO more states ?
  LOADING,
  PRESENTING,
}

interface MyCreationsState extends MyCreationsData {
  screenState: ScreenState;
  searchPhrase?: string;

  sortingOptIdx?: number;
  applianceFilteringOptIdx?: number;
}

type MyCreationsProps = NavigationScreenProps<{}>;

export class MyCreations extends Component<MyCreationsProps, MyCreationsState> {
  private _modelSubscription: Subscription;
  private _deviceTypeIds: number[] = [];
  private _navFocusListener;

  constructor(props: MyCreationsProps) {
    super(props);

    this.state = {
      data: undefined,
      screenState: ScreenState.LOADING,
    };
  }

  public render() {
    return (
      <RecipePage
        loading={this.state.screenState == ScreenState.LOADING}
        scrollProps={{
          showsHorizontalScrollIndicator: false,
          alwaysBounceVertical: false,
          contentContainerStyle: { flexGrow: 1 },
        }}
      >
        <View style={{
          backgroundColor: "transparent",
          flex: 1,
          flexDirection: "column",
          alignItems: "stretch",
        }}>
          {this._renderHeader()}
          {this._renderContent()}
        </View>
      </RecipePage>
    );
  }

  public componentWillMount() {
    if (!this.state.data) {
      UserCreationsCollectionStore.instance.notifySourceReady((ucCollection) => {
        this.updateMyCreationsData();
        this._modelSubscription = ucCollection.modelChanged.subscribe(this.updateMyCreationsData);
      });
    }
    // @types does not yet support lates version and addListener causes err
    const navigation = this.props.navigation as any;
    this._navFocusListener = navigation.addListener(
      "willFocus",
      this.updateMyCreationsData,
    );
  }

  public componentWillUnmount() {
    this._modelSubscription.unsubscribe();
    this._navFocusListener.remove();
  }

  private updateMyCreationsData = () => {
    let data: DeviceTypeIdToUserCreationsMap;
    if (this.state.searchPhrase) {
      data = UserCreationsCollectionStore.instance.getFilteredItemsGroupedByDevice(this.state.searchPhrase);
    } else {
      data = UserCreationsCollectionStore.instance.getAllItemsGroupedByDevice();
    }
    this._deviceTypeIds = Array.from(data.keys());

    this.setState({ data, screenState: ScreenState.PRESENTING });
  }

  private _renderHeader() {
    return (
      <View
        style={styles.headerContainer}>
        <MultiOptionsView
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginLeft: 13,
          }}
          options={[{
            optionsName: I18n.t("appliance"),
            allOptions: this._deviceTypeIds.map((deviceTypeId) => DeviceNameFromDeviceTypeId(deviceTypeId)),
            currentChoice: this.state.applianceFilteringOptIdx,
            onCurrentChoiceChange: (_, applianceFilteringOptIdx) => this.setState({ applianceFilteringOptIdx }),
            style: {
              marginRight: IS_TABLET ? 40 : 20,
            },
          }, {
            optionsName: I18n.t("sort").toUpperCase(),
            allOptions: SORTING_OPTIONS(),
            currentChoice: this.state.sortingOptIdx,
            onCurrentChoiceChange: (_, sortingOptIdx) => this.setState({ sortingOptIdx }),
          }]}
        />
        <VerticalSpacer height={13} />
        <SearchBar
          barStyle={[{ flex: 0.85 }, styles.searchBar]}
          touchableExpandSize={10}
          placeholder={I18n.t("search_by_keyword_or_date")}
          style={styles.searchBarText}
          clearIcon={imported.clearSearchBarIcon}
          clearOnSubmit={false}
          onSubmitEditing={(event) => this.setState({
            searchPhrase: event.nativeEvent.text,
            screenState: ScreenState.LOADING,
          }, this.updateMyCreationsData)}
          onClear={() => this.setState({
            searchPhrase: undefined,
            screenState: ScreenState.LOADING,
          }, this.updateMyCreationsData)}
        />
      </View>
    );
  }

  private _renderContent() {
    if (!this.state.data) { return null; }
    const sections: StyledSection[] = [];
    const filteredAndSortedData = this.getFilteredAndSortedData(this.state.data);
    for (const [deviceTypeId, userCreations] of filteredAndSortedData) {
      sections.push({
        title: DeviceNameFromDeviceTypeId(deviceTypeId),
        items: userCreations,
      });
    }

    const buttonText = IS_TABLET ? I18n.t("add_creation") : I18n.t("add");

    return (
      <View style={{ flex: 1 }}>
        <PaperView
          outerStyle={styles.paperViewOuter}
          innerStyle={styles.paperViewInner}
        >
          {sections.length == 0 ?
            <TextScaledOnPhone style={styles.emptyMessageText}>
              {I18n.t("creations_empty", { buttonText })}
            </TextScaledOnPhone>
            :
            <StyledSectionList
              style={{ width: "100%" }}
              sectionStyle={styles.applianceView}
              itemSpacing={10}
              sectionSpacing={30}
              renderSectionHeader={({ title }) => (
                <View>
                  <TextScaledOnPhone style={styles.applianceText}>{title}</TextScaledOnPhone>
                  <Hr style={PlatformSelect<ViewStyle>({
                    anyPhone: { marginTop: 12, marginBottom: 19 },
                    anyTablet: { marginTop: 13, marginBottom: 30 },
                  })} />
                </View>
              )}
              renderItem={(item: UserCreation, _index, section) =>
                <TextButton
                  style={[styles.creationView, {
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    height: 50,
                  }, PlatformSelect<ViewStyle>({
                    anyTablet: {
                      paddingLeft: 30,
                      paddingRight: 27,
                    },
                    anyPhone: {
                      paddingLeft: 20,
                      paddingRight: 17,
                    },
                  })]}
                  scaleFactor={0.98}
                  onPress={() => {
                    this.props.navigation.navigate("Creation", {
                      applicanceName: section.title,
                      creation: item,
                    });
                  }}
                  textStyle={styles.creationText}
                  text={item.title.sv()}
                >
                  <Image source={imported.fullSizeIcon} />
                </TextButton>
              }
              sections={sections}
            />
          }
        </PaperView>

        <View style={styles.addCreationContainer}>
          <GradientTextButton
            theme="red"
            onPress={() => {
              this.props.navigation.navigate("Creation", {
                applicanceName: I18n.t("cook_processor_name"),
                creation: null, // new creation
              });
            }}
            text={buttonText}
            style={PlatformSelect<ViewStyle>({
              anyTablet: {
                width: 145, height: 44,
              },
              anyPhone: {
                width: 84, height: 44,
              },
            })}
          />
        </View>
      </View>
    );
  }

  private getFilteredAndSortedData = (data: DeviceTypeIdToUserCreationsMap) => {
    let ret = data;
    const deviceTypeIdIdx = this.state.applianceFilteringOptIdx;
    if (deviceTypeIdIdx != undefined) {
      ret = new Map(Array.from(ret.entries()).filter(([deviceTypeId]) => (
        deviceTypeId == this._deviceTypeIds[deviceTypeIdIdx]
      )));
    }
    if (this.state.sortingOptIdx != undefined) {
      const compareFunc = SORTING_COMPARE_FUNCTIONS[this.state.sortingOptIdx];
      for (const [deviceTypeId, userCreations] of ret) {
        const sortedUserCreations = userCreations.sort(compareFunc);
        ret.set(deviceTypeId, sortedUserCreations);
      }
    }
    return ret;
  }
}

const styles = StyleSheet.create({
  headerContainer: PlatformSelect<ViewStyle>({
    anyTablet: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",

      paddingRight: 50,
      paddingLeft: 49,
      paddingTop: 40,
      paddingBottom: 15,
    },
    anyPhone: {
      flexDirection: "column-reverse",
      padding: 16,
    },
  }),
  addCreationContainer: {
    position: "absolute",
    width: "100%",
    height: 100,
    alignItems: "flex-end",
    ...PlatformSelect<ViewStyle>({
      anyTablet: {
        paddingRight: 50, // (outer margin + inner padding)
      },
      anyPhone: {
        paddingRight: 14,
      },
    }),
  },
  paperViewOuter: {
    ...PlatformSelect<ViewStyle>({
      anyTablet: {
        marginTop: 22, // (half of button height)
        marginLeft: 15,
      },
      anyPhone: {
        marginLeft: 11,
        marginBottom: QUICK_CHOICE_BAR_HEIGHT + 10,
        marginTop: 33,
      },
    }),
  },
  paperViewInner: {
    ...PlatformSelect<ViewStyle>({
      anyTablet: {
        paddingTop: 50,
        paddingBottom: 30,
        paddingLeft: 34,
        paddingRight: 50,
      },
      anyPhone: {
        paddingTop: 31,
        paddingBottom: 17,
        paddingLeft: 15,
        paddingRight: 14,
      },
    }),
  },
  applianceView: {
    ...PlatformSelect<ViewStyle>({
      anyTablet: {
        paddingTop: 27,
        paddingLeft: 31,
        paddingRight: 32,
        paddingBottom: 31,
      },
      anyPhone: {
        paddingHorizontal: 15,
        paddingVertical: 18,
      },
    }),

    borderRadius: 2,
    backgroundColor: "#ffffff",
    shadowColor: "rgba(0, 0, 0, 0.1)",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowRadius: 10,
    shadowOpacity: 1,
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#d8d8d8",
  },
  applianceText: {
    opacity: 0.5,
    fontFamily: "Merriweather",
    fontSize: 18,
    fontWeight: "300",
    fontStyle: "italic",
    letterSpacing: 0.75,
    textAlign: "left",
    color: "#000000",
  },
  creationView: {
    opacity: 0.8,
    backgroundColor: "#f6f6f6",
    shadowColor: "rgba(0, 0, 0, 0.21)",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowRadius: 2,
    shadowOpacity: 1,
    borderStyle: "solid",
    borderWidth: 2,
    borderColor: "#e5e5e5",
  },
  creationText: {
    fontFamily: "Muli",
    fontSize: 14,
    textAlign: "left",
    color: "#676767",
  },
  searchBar: {
    ...PlatformSelect<ViewStyle>({
      androidTablet: {
        paddingHorizontal: 20,
        paddingTop: 8,
        paddingBottom: 7,
      },
      iosTablet: {
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 10,
      },
      androidPhone: {
        paddingHorizontal: 10,
        paddingTop: 6,
        paddingBottom: 5,
      },
      iosPhone: {
        paddingHorizontal: 10,
        paddingTop: 10,
        paddingBottom: 8,
      },
    }),

    borderRadius: 2,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    shadowColor: "rgba(0, 0, 0, 0.1)",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowRadius: 8,
    shadowOpacity: 1,
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
  searchBarText: {
    opacity: 0.5,
    fontFamily: "Muli",
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 2,
    color: "#676767",
  },
  emptyMessageText: {
    opacity: 0.8,
    fontFamily: "Merriweather",
    fontSize: 14,
    fontWeight: "normal",
    fontStyle: "italic",
    letterSpacing: 0,
    textAlign: "left",
    color: "#676767",
  },
});
