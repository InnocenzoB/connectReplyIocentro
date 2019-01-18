import { DeviceStore, I18n } from "iocentro-apps-common-bits";
import { RecipeModel, RecipeStepModel } from "iocentro-collection-manager";
import { MandatoryGetValueTrait, ValueBase } from "iocentro-datamodel";
import React, { Component } from "react";
import { EmitterSubscription, Keyboard, ScrollView, StyleSheet, View, ViewStyle } from "react-native";
import { NavigationScreenProps } from "react-navigation";
import { Subscription } from "rxjs";

import { AcceptCancelAlert } from "../components/AcceptCancelAlert";
import { WizardButton } from "../components/appliance_wizard/ApplianceWizardPage";
import { GradientTextButton, ThemedTextButton } from "../components/Buttons";
import { VerticalSpacer } from "../components/dashboard/Common";
import { DashboardModal } from "../components/dashboard/Dashboard";
import { Hr } from "../components/Hr";
import { TitleNavBar } from "../components/nav_bars/TitleNavBar";
import { PaperView } from "../components/Paper";
import { QUICK_CHOICE_BAR_HEIGHT } from "../components/QuickChoiceBottomBar";
import { RoundButtonParamType, RoundButtonParamVB } from "../components/RoundButtonParam";
import { TextScaledOnPhone } from "../components/ScaledText";
import { SearchBar } from "../components/SearchBar";
import { StyledSection, StyledSectionList } from "../components/StyledSectionList";
import { UserInputEditor } from "../components/UserInputEditor";
import { CookProcessorModel, MotorSpeedAsString } from "../model/CookProcessorModel";
import { CookProcessorStepModel, StepModel } from "../model/user_creations/StepModel";
import { UserCreation } from "../model/user_creations/UserCreationRxTx";
import { UserCreationsCollectionStore } from "../model/user_creations/UserCreationsCollectionStore";
import { IS_TABLET, PlatformSelect } from "../Platform";

const imported = {
  navbarAppliancesIcon: require("../../img/home_screen/navbarAppliancesIcon.png"),
  paper: require("../../img/common/bg-paper.png"),
  clearSearchBarIcon: require("../../img/icons/searchbarXIcon.png"),
};

interface StepItem {
  type: RoundButtonParamType;
  value: ValueBase;
}

class Step implements StyledSection {
  public items: StepItem[];
  public model: CookProcessorStepModel;
  public unsavedDesription?: string;

  public subscriptions: Subscription[] = [];

  constructor(model?: CookProcessorStepModel) {
    this.model = model && model.clone() || new CookProcessorStepModel();
    this.items = [{
      type: RoundButtonParamType.Temperature,
      value: this.model.targetTemp,
    }, {
      type: RoundButtonParamType.Time,
      value: this.model.targetTime,
    }, {
      type: RoundButtonParamType.Speed,
      value: this.model.motorSpeed,
    }];
  }

  public getModel() {
    return this.model;
  }

  public unsubscribeAll = () => {
    for (const sub of this.subscriptions) {
      sub.unsubscribe();
    }
    this.subscriptions = [];
  }

  public subscribeAll = (f: () => void) => {
    this.unsubscribeAll();
    for (const item of this.items) {
      this.subscriptions.push(item.value.subscribe(() => { this.onItemChange(f); }));
    }
  }

  private onItemChange = (f: () => void) => {
    f();
  }
}

const CommandFromStep = (vm, i) => {
  const ms = MotorSpeedAsString(
    MandatoryGetValueTrait(vm.getModel().motorSpeed)!,
  );

  const paramsMatrix = [
    { k: "Mode", v: "CookProcModeRecipe" },
    { k: "Message", v: "Press » to begin cooking" },
    { k: "ProcessCompleteAction", v: "ProcessCmpltActionWaitForNextCommand" },
    { k: "ProcessTimeSet", v: vm.getModel().targetTime.sv() },
    { k: "TargetTemp", v: vm.getModel().targetTemp.sv() },
    { k: "MotorSpeed", v: ms !== "" ? ms : null },
  ];

  const paramsFormatted =
    paramsMatrix
      .filter((v) => !!v.v)
      .map((v) => {
        return {
          parameterKey: v.k,
          parameterValue: v.v,
        };
      });

  return {
    deviceCommandCode: "CycleOperationStart",
    version: "3.0",
    clientReference: `ref-step-${i + 1}`,
    deviceCommandParameterInstances: paramsFormatted,
  };
};

enum DeleteTarget {
  Step,
  Creation,
}

interface CreationScreenSate {
  alertVisible: boolean;
  alertTitle: string;
  alertMessage: string;
  deleteTarget?: DeleteTarget;

  steps: Step[];
  stepIndex: number;
  hasInvalidSteps: boolean;

  creationTitle?: string;

  keyboardHeight?: number;
}

export interface CreationNavigationParams {
  applicanceName: string;
  creation: UserCreation | null;
  steps?: StepModel[];
}

export class Creation extends Component<NavigationScreenProps<CreationNavigationParams>, CreationScreenSate> {
  private _scrollView: ScrollView | null;
  private _dashboardModal: DashboardModal | null = null;
  private _stepAdded: boolean;
  private _keyboardShowListener: EmitterSubscription;
  private _keyboardHideListener: EmitterSubscription;

  constructor(props) {
    super(props);

    this.state = {
      alertVisible: false,
      alertTitle: "",
      alertMessage: "",
      steps: [],
      hasInvalidSteps: true,
      stepIndex: -1,
      keyboardHeight: undefined,
    };

    this._stepAdded = false;
  }

  public componentWillMount() {
    this.updateDataFromNavigationParams();
    this._keyboardShowListener = Keyboard.addListener("keyboardDidShow", (e) => {
      const keyboardHeight = e.endCoordinates.height;
      this.setState({ keyboardHeight });
    });
    this._keyboardHideListener = Keyboard.addListener("keyboardDidHide", () => {
      this.setState({ keyboardHeight: undefined });
    });
  }

  public componentWillUnmount() {
    this._keyboardShowListener.remove();
    this._keyboardHideListener.remove();

    for (const step of this.state.steps) {
      step.unsubscribeAll();
    }
  }

  public componentWillReceiveProps(nextProps) {
    this.updateDataFromNavigationParams(nextProps);
  }

  private updateDataFromNavigationParams = (props = this.props) => {
    const navigationParams = props.navigation.state.params;
    const creation = navigationParams && navigationParams.creation;
    const creationSteps = creation && creation.steps.sv();
    const navigationSteps = navigationParams && navigationParams.steps;

    let steps;
    if (navigationSteps) {
      steps = navigationSteps.map((stepModel) => (
        new Step(stepModel as CookProcessorStepModel)
      ));
    } else if (creation && creationSteps) {
      steps = creationSteps.map((stepModel) => (
        new Step(stepModel)
      ));
    } else {
      steps = [new Step()];
    }
    let creationTitle = UserCreationsCollectionStore.instance.getGeneratedTitle();
    if (creation) {
      const title = creation.title.sv();
      if (title) {
        creationTitle = title;
      }
    }
    this.setState({
      creationTitle,
      steps,
    }, () => {
      for (const step of this.state.steps) {
        step.subscribeAll(this.checkForEmptySteps);
      }
      this.checkForEmptySteps();
    });
  }

  private _navigateBack = () => {
    this.props.navigation.goBack();
  }

  private onAlertClose = (result) => {
    const navigationParams = this.props.navigation.state.params;
    const isStep: boolean = (this.state.deleteTarget == DeleteTarget.Step);
    if (result) {
      if (isStep) {
        this.setState((previousState: CreationScreenSate) => {
          const steps = previousState.steps.slice();
          steps[previousState.stepIndex].unsubscribeAll();
          steps.splice(previousState.stepIndex, 1);
          return { steps };
        });
      } else {
        if (navigationParams && navigationParams.creation) {
          UserCreationsCollectionStore.instance.remove(navigationParams.creation);
        }
        setImmediate(this._navigateBack);
      }
    }
    this.setState({ alertVisible: false, deleteTarget: undefined }, this.checkForEmptySteps);
  }

  public render() {
    const navigationParams = this.props.navigation.state.params;
    return (
      <PaperView outerStyle={{ borderRadius: 0 }}>
        <AcceptCancelAlert
          isVisible={this.state.alertVisible}
          onClose={this.onAlertClose}
          title={this.state.alertTitle + "?"}
          text={this.state.alertMessage}
          acceptText={this.state.alertTitle.toUpperCase()}
          cancelText={I18n.t("cancel").toUpperCase()}
        />
        {IS_TABLET &&
          <DashboardModal
            ref={(me) => this._dashboardModal = me}
            navigation={this.props.navigation}
          />}
        <TitleNavBar
          title1={(navigationParams && navigationParams.applicanceName) || I18n.t("unknown_appliance")}
          title2={I18n.t("creation")}
          leftIcon={{ onPress: () => this._navigateBack() }}
          rightIcon={IS_TABLET ? {
            onPress: () => this._dashboardModal && this._dashboardModal.toggle(),
            source: imported.navbarAppliancesIcon,
          } : null}
          style={{ paddingTop: 0 }}
        />
        <View style={{
          flex: 1,
          ...PlatformSelect<ViewStyle>({
            anyTablet: {
              paddingTop: 41,
              paddingBottom: 37,
              paddingLeft: 49,
              paddingRight: 50,
            },
            anyPhone: {
              paddingTop: 24,
              paddingBottom: 0,
              paddingHorizontal: 10,
            },
          }),
        }}>
          {this._renderHeader()}
          {this._renderContent()}
          {!this._footerInContent() && this._renderFooter()}
        </View>
      </PaperView>
    );
  }

  private _renderHeader() {
    return (
      <View style={{
        flexDirection: "row",
        alignItems: "center",
        overflow: "visible",
        justifyContent: "space-between",
        marginBottom: PlatformSelect({ anyTablet: 36, anyPhone: 27 }),
      }}>
        <SearchBar
          barStyle={styles.searchBar}
          placeholder={I18n.t("unknown_creation")}
          clearIcon={imported.clearSearchBarIcon}
          touchableExpandSize={10}
          value={this.state.creationTitle}
          onChangeText={(text) => this.setState({ creationTitle: text })}
          onClear={() => this.setState({ creationTitle: undefined })}
          style={styles.searchText}
        />
        <WizardButton
          style={{ height: 43, width: IS_TABLET ? 125 : 84 }}
          text={I18n.t("send").toUpperCase()}
          onPress={this.onSendCreation}
          active={!(this.state.steps.length == 0 ||
            this.state.hasInvalidSteps ||
            DeviceStore.instance.getSelected() == null)}
        />
      </View>
    );
  }

  private checkForEmptySteps = () => {
    const invalidSteps = this.state.steps.filter((step) => !step.model.isValid());
    this.setState({
      hasInvalidSteps: invalidSteps.length > 0,
    });
  }

  private _renderContent() {
    return (
      // TODO: shadow is hidden outside the scrollview
      <ScrollView
        ref={(instance) => { this._scrollView = instance as ScrollView | null; }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <StyledSectionList
          onLayout={() => {
            if (this._scrollView && this._stepAdded) {
              this._scrollView.scrollToEnd();
            }
            this._stepAdded = false;
          }}
          renderSectionHeader={(_, index) => (
            <View>
              <View style={{
                justifyContent: "space-between",
                flexDirection: "row",
                alignItems: "center",
              }}>
                <TextScaledOnPhone style={styles.stepTitleText}>
                  {`${I18n.t("step")} ` + (index + 1)}
                </TextScaledOnPhone>
                <ThemedTextButton
                  theme="red"
                  text={`${I18n.t("delete").toUpperCase()} ${I18n.t("step").toUpperCase()}`}
                  onPress={() => { this._confirmDeleteStep(index); }}
                />
              </View>
              <Hr style={{ marginTop: 10, marginBottom: 18 }} />
            </View>
          )}
          renderSectionFooter={(section) => {
            const step = section as Step;
            const stepModel = step.model;
            return (
              <UserInputEditor
                tapToEdit
                cancelSaveButtonsOffset={22}
                style={{
                  paddingTop: 30,
                }}
                notEditingInputProps={{
                  placeholder: I18n.t("tap_to_add_instructions").toUpperCase(),
                  placeholderTextColor: "#d8d8d8",
                  style: styles.tapToAddText,
                }}
                userInputProps={{
                  style: { minHeight: 71, paddingBottom: 32 },
                  onChangeText: (description) => {
                    step.unsavedDesription = description;
                  },
                }}
                onDelete={() => {
                  stepModel.clearTitleAndDescription();
                }}
                initialUserText={step.unsavedDesription || stepModel.description.sv() || undefined}
                onSave={({ text: description }) => {
                  stepModel.description.updateValue(description);
                  step.unsavedDesription = undefined;
                }}
                onCancel={() => {
                  step.unsavedDesription = undefined;
                  this.forceUpdate(); // (db) unsavedDesription not in state workaround
                }}
                saveButtonText={I18n.t("apply").toUpperCase()}
              />
            );
          }}
          itemsFlexDirection="row"
          renderItem={(item: StepItem) => {
            return (
              <RoundButtonParamVB
                type={item.type}
                value={item.value}
                defaultValue="---"
              />
            );
          }}
          sectionStyle={styles.stepSectionStyle}
          itemSpacing={PlatformSelect({ anyTablet: 48, anyPhone: 14 })}
          sectionSpacing={PlatformSelect({ anyTablet: 30, anyPhone: 9 })}
          sections={this.state.steps}
        />
        {this._footerInContent() && this._renderFooter()}
        {this.state.keyboardHeight &&
          <VerticalSpacer
            /* reducing height of keyboard with it's distance from the bottom to the content of the scroll
              (calcualted manually, but it could use onLayout) */
            height={this.state.keyboardHeight - (this._footerInContent() ? 87 : IS_TABLET ? 117 : 310)}
          />
        }
      </ScrollView>
    );
  }

  private _footerInContent(): boolean {
    /* footer in content on phones when there is more than one step */
    return !IS_TABLET && this.state.steps.length > 1;
  }

  private _renderFooter() {
    return (
      <View style={{
        marginTop: 36,
        ...PlatformSelect<ViewStyle>({
          anyTablet: {
            flexDirection: "row",
            justifyContent: "space-between",
          },
          anyPhone: {
            flexDirection: "column-reverse",
            paddingBottom: QUICK_CHOICE_BAR_HEIGHT + 37,
          },
        }),
        alignItems: "center",
      }}>
        <ThemedTextButton
          theme="red"
          text={I18n.t("delete_creation").toUpperCase()}
          onPress={() => { this._confirmDeleteCreation(); }}
        />
        {!IS_TABLET && <VerticalSpacer height={39} />}
        <View style={{
          flexDirection: "row",
          alignItems: "center",
        }}>
          <GradientTextButton
            theme="lightGrey"
            text={I18n.t("add_step").toUpperCase()}
            onPress={() => {
              this.setState((previousState: CreationScreenSate) => {
                const steps = previousState.steps.slice();
                steps.push(new Step());
                return { steps };
              }, () => {
                for (const step of this.state.steps) {
                  step.subscribeAll(this.checkForEmptySteps);
                }
                this.checkForEmptySteps();
              });
              this._stepAdded = true;
            }}
            style={{ width: 125, height: 44 }}
          />
          <GradientTextButton
            theme={(this.state.steps.length == 0 || this.state.hasInvalidSteps) ? "grey" : "red"}
            text={I18n.t("save").toUpperCase()}
            onPress={this.onSavePress}
            style={{ width: 125, height: 43, marginLeft: 30 }}
            disabled = {(this.state.steps.length == 0 || this.state.hasInvalidSteps) }
          />
        </View>
      </View>
    );
  }

  private onSavePress = () => {
    let success = false;
    const creation = this.props.navigation.state.params.creation;
    if (creation) {
      // edit
      success = UserCreationsCollectionStore.instance.updateUserCreation(creation,
        this.state.creationTitle || "",
        this.state.steps.map((step) => step.getModel()),
      );
    } else {
      // new
      success = UserCreationsCollectionStore.instance.addCookProcessorCreation(
        this.state.creationTitle || "",
        this.state.steps.map((step) => step.getModel()),
      );
    }

    if (!success) {
      alert(I18n.t("unable_to_save_invalid_input"));
    } else {
      this._navigateBack();
    }
  }

  private onSendCreation = () => {
    this.onSavePress();
    const recipe = new RecipeModel();
    if (this.state.creationTitle) {
      recipe.title.updateValue(this.state.creationTitle);
    }
    recipe.steps.updateValue(this.state.steps.map((v, i) => {
      const rs = new RecipeStepModel();
      rs.title.updateValue(v.model.title.sv() || "");
      rs.description.updateValue(v.model.description.sv() || "");
      rs.commands.updateValue([CommandFromStep(v, i)]);

      return rs;
    }));
    const cp = DeviceStore.instance.getSelected() as CookProcessorModel;
    if (cp) {
      cp.uploadMyCreation(recipe);
    }

    const creation = this.props.navigation.state.params.creation;
    if (creation) {
      creation.registerUsage();
    }

    const navigationParams = this.props.navigation.state.params;
    this.props.navigation.navigate("Steps", {
      recipe, userRecipe: true,
      // TODO should not be needed once the device is selected
      applianceName: (navigationParams && navigationParams.applicanceName),
    });
  }

  private _confirmDeleteStep(index: number) {
    this.setState({
      deleteTarget: DeleteTarget.Step,
      alertVisible: true,
      alertTitle: I18n.t("delete_step"),
      alertMessage:
        `${I18n.t("are_you_sure_delete")} ${I18n.t("step").toLowerCase()} ${(index + 1)} ?`,
      stepIndex: index,
    });
  }

  private _confirmDeleteCreation() {
    this.setState({
      deleteTarget: DeleteTarget.Creation,
      alertVisible: true,
      alertTitle: I18n.t("delete_creation"),
      alertMessage: I18n.t("are_you_sure_delete_creation"),
    });
  }
}

const styles = StyleSheet.create({
  stepTitleText: {
    opacity: 0.5,
    fontFamily: "Merriweather",
    fontSize: 18,
    fontWeight: "300",
    fontStyle: "italic",
    letterSpacing: 0.75,
    color: "#000000",
  },
  stepSectionStyle: {
    ...PlatformSelect<ViewStyle>({
      anyTablet: {
        paddingTop: 27,
        paddingLeft: 30,
        paddingRight: 33,
        paddingBottom: 31,
      }, anyPhone: {
        paddingTop: 18,
        paddingHorizontal: 20,
        paddingBottom: 29,
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
  searchBar: {
    paddingVertical: 9,

    ...PlatformSelect({
      anyTablet: {
        paddingHorizontal: 29,
        flex: 0.93,
      }, anyPhone: {
        paddingHorizontal: 18,
        flex: 0.90,
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
  searchText: {
    fontFamily: "Muli",
    fontSize: 14,
    color: "#676767",
  },
  tapToAddText: {
    // for some reason paddingVertical does not work
    paddingTop: 18,
    paddingBottom: 18,
    paddingHorizontal: 32,

    fontFamily: "Muli",
    fontSize: 11,
    fontWeight: "900",
    fontStyle: "normal",
    letterSpacing: 2,
    textAlign: "left",
    color: "#d8d8d8",
  },
});
