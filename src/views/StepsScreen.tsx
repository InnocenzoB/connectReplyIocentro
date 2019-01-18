import { DeviceStore, I18n } from "iocentro-apps-common-bits";
import {
  RecipeModel,
  RecipeStepCommand,
  RecipeStepCommandParameter,
  RecipeStepModel,
} from "iocentro-collection-manager";
import { ChangeOriginType, MandatoryGetOrigin, ValueBase } from "iocentro-datamodel";
import React, { Component } from "react";
import { BackHandler, ImageBackground, StyleProp, StyleSheet, View, ViewStyle, ScrollView } from "react-native";
import { NavigationActions, NavigationScreenProps } from "react-navigation";
import { Subscription } from "rxjs";

import { AcceptCancelAlert } from "../components/AcceptCancelAlert";
import { ThemedTextButton } from "../components/Buttons";
import { DashboardModal } from "../components/dashboard/Dashboard";
import { Loading } from "../components/Loading";
import { NAV_BAR_PHONE_HEIGHT, NavBarBase, NavBarElement } from "../components/nav_bars/NavBarBase";
import { Rect, SideIcon } from "../components/nav_bars/SideIconsNavBar";
import { Titles } from "../components/nav_bars/TitleNavBar";
import { PhoneOverlay } from "../components/PhoneOverlay";
import { QUICK_CHOICE_BAR_HEIGHT } from "../components/QuickChoiceBottomBar";
import { CenterBars, NotesButton, RecipeBarColors, RecipeBarMode } from "../components/recipe_summary/RecipeBar";
import { StepWindow } from "../components/recipe_summary/RecipeWindow";
import { CookingStepData } from "../components/steps_screen/CookingStep";
import { FooterData } from "../components/steps_screen/Footer";
import { getNavigationMode, Navigation } from "../components/steps_screen/Navigation";
import { NotesData } from "../components/steps_screen/NotesFooter";
import { PhoneOverview, StepListProps } from "../components/steps_screen/Overview";
import { RateFooterData } from "../components/steps_screen/RateFooter";
import { RatingData, RatingStep } from "../components/steps_screen/Rating";
import { StepRenderer } from "../components/steps_screen/StepRenderer";
import { PhoneStepHeader, StepsHeader } from "../components/steps_screen/StepsHeader";
import { VideoSrc } from "../components/steps_screen/VideoFooter";
import { VideoTipData } from "../components/steps_screen/VideoTip";
import { WeightStepData } from "../components/steps_screen/WeightStep";
import { UserInputEditor } from "../components/UserInputEditor";
import { CookMotorSpeed, CookOperation, CookProcessorModel, MotorSpeedAsEnum } from "../model/CookProcessorModel";
import { Recipe } from "../model/RecipeManager";
import { resetTo } from "../navigation/CommonNavigation";
import { IS_TABLET } from "../Platform";
import { KAStorage } from "../tools/KAStorage";
import { getCountryISOCodeForLocale, noNull } from "../Utils";
import { RecipeScreenParams, RecipeSummaryContent } from "./RecipeSummaryScreen";
import { StepNotes } from "./StepNotes";
import { VideoTipBar } from "./VideoTipBar";

const backgroundImg = require("../../img/common/woodBackground.png");
const navbarCloseIcon = require("../../img/common/navbarCloseIcon.png");
const navbarAppliancesIcon = require("../../img/home_screen/navbarAppliancesIcon.png");

export enum StepMode {
  manual = "CookProcModeManual",
  weight = "CookProcModeWeigh",
  recipe = "CookProcModeRecipe",
}

const strToMode = (mode: RecipeStepCommandParameter | undefined): StepMode | undefined => {
  if (!mode) { return undefined; }
  switch (mode.parameterValue) {
    case StepMode.manual: return StepMode.manual;
    case StepMode.weight: return StepMode.weight;
    case StepMode.recipe: return StepMode.recipe;
    default: return undefined;
  }
};

export interface StepScreenData extends FooterData, NotesData {
  currentStep: number; // first step is 1
  finishedSteps: number;
  allSteps: number;

  // TODO backend integration
  video?: VideoSrc;
  videoTip?: VideoTipData;

  title: ValueBase;
}

type StepsScreenProps = NavigationScreenProps<RecipeScreenParams &
  {
    userRecipe?: boolean;
    applianceName?: string,
    currentStep?: number;
    finishedSteps?: number;
  }>;

interface StepsScreenState extends RatingData, RateFooterData {
  summary: boolean;
  data?: StepScreenData;
  cookingData?: CookingStepData;
  weightData?: WeightStepData;
  showNotes: boolean;
  currentStepModel?: RecipeStepModel;
  mode?: StepMode;
  quitModalVisible: boolean;
  errorModalVisible: boolean;
  isLoading: boolean;
  showOverview: boolean;
  recipe?: RecipeModel;
  barColor: RecipeBarColors;
}

export class StepsScreen extends Component<StepsScreenProps, StepsScreenState> {
  private _wrapperKey;
  private _connectionAlertAlreadyShown;

  constructor(props: StepsScreenProps) {
    super(props);

    const wrapperKey: string | undefined = this.props.screenProps && this.props.screenProps.wrapperKey;
    if (!IS_TABLET && typeof wrapperKey != "string") {
      throw new Error("screenProps.wrapperKey is undefined");
    }
    this._wrapperKey = wrapperKey;

    this.state = {
      summary: false,
      isLoading: false,
      showNotes: false,
      quitModalVisible: false,
      errorModalVisible: false,
      showOverview: false,
      barColor: "black",
    };
    this._updateStepList(this.state.data);
    this.recipe = this.props.navigation.state.params && this.props.navigation.state.params.recipe ? this.props.navigation.state.params.recipe : undefined;

  }

  public componentDidMount() {
    const params = this.props.navigation.state.params;
    if (!params || !params.recipe) {
      throw new Error("RecipieModel is undefined");
    }
    const recipe = params.recipe;
    this.setState({ recipe });
    const device = DeviceStore.instance.getSelected() as CookProcessorModel | null;
    this._recipe = new Recipe(recipe, device, this._updateState, params.userRecipe);
    this._applianceName = params.applianceName;
    this._updateState(recipe, device, true);

    if (device) {
      if (params.currentStep !== undefined && params.finishedSteps !== undefined) {
        const currentStepOnDevice = device.currentStep.sv();
        const isRecipeRunning = currentStepOnDevice != 0;
        if (!isRecipeRunning || currentStepOnDevice != params.currentStep) {
          // tslint:disable-next-line:no-console
          console.log(["Restore not possible"],
            "isRecipeRunning", isRecipeRunning,
            "params.stepNumber", params.currentStep,
            "currentStepOnDevice", currentStepOnDevice);
          return;
        } else {
          this._recipe.restore(params.currentStep, params.finishedSteps);
        }
      }
      this._deviceOperationSubscription = device.operation
        .filter((traits) => {
          const co = MandatoryGetOrigin(traits);
          return co === ChangeOriginType.backend;
        })
        .subscribe(() => {
          const programLoaded = device.requestedProgramInProgress.sv() === false;
          const recipeCancelled = device.operation.sv() === CookOperation.CancelCustomCycle;
          if (recipeCancelled && programLoaded) {
            this._backToSummary();
          }
        });

      this._programUploadFailedSubscription = device.requestedProgramUploadFailed
        .skip(1)
        .subscribe(() => {
          if (device.requestedProgramUploadFailed.sv() === true) {
            this.showErrorModal();
          }
        });

      this._connectionError = device.connectionErrorOccured.subscribe(() => { this.forceUpdate(); });
    }

    BackHandler.addEventListener("hardwareBackPress", this.androidBackButtonHandler);
    this.overrideQcbNavigate();
  }

  private androidBackButtonHandler = () => {
    if (!this.state.quitModalVisible) {
      this.showQuitModal();
      return true;
    } else if (this.state.errorModalVisible) {
      this._onErrorModalResult();
      return true;
    }

    return false;
  }

  public componentWillUnmount() {
    this._recipe.dispose();

    if (this._deviceOperationSubscription) {
      this._deviceOperationSubscription.unsubscribe();
    }
    if (this._programUploadFailedSubscription) {
      this._programUploadFailedSubscription.unsubscribe();
    }

    if (this._connectionError) {
      this._connectionError.unsubscribe();
    }

    BackHandler.removeEventListener("hardwareBackPress", this.androidBackButtonHandler);
    this.overrideQcbNavigate(true);
  }

  public render() {
    return IS_TABLET ? this._renderTablet() : this._renderPhone();
  }

  private _renderPhone() {
    const { isLoading, data } = this.state;

    const isRatingStep = !!(this._recipe && this._recipe.isRatingStep());
    const hideNotesButton = this._hasUserRecipe() || isRatingStep;

    const topNavigator = (
      <NavBarBase
        leftElement={
          <SideIcon
            iconProps={{
              visible: true,
              source: navbarCloseIcon,
              onPress: this._onQuitPress,
            }}
            sizeProp={Rect(30)}
            style={{ marginLeft: 12, marginBottom: 5 }}
          />
        }
        middleElement={this._hasUserRecipe() ?
          <Titles
            title1={this._recipe.getDeviceName() || this._applianceName || I18n.t("unknown_appliance")}
          />
          :
          <CenterBars
            mode={this.state.summary ? "summary" : "stepByStep"}
            color={"black"}
            onSummaryPress={() => this._onModeChange("summary")}
            onStepByStepPress={() => this._onModeChange("stepByStep")}
            textStyle={{ fontSize: getCountryISOCodeForLocale() == "DE" ? 9 : 11 }}
          />
        }
        rightElement={hideNotesButton ? undefined :
          <NotesButton
            style={{
              marginRight: 12, marginBottom: 8,
              justifyContent: "center", alignItems: "center",
            }}
            color={this.state.showNotes ? "white" : "black"}
            notesNum={data ? data.notes.length : undefined}
            onNotesPress={() => {
              if (this.state.showOverview) {
                this.setState({ showOverview: false });
                setTimeout(this._toggleNotes, 500);
              } else {
                this._toggleNotes();
              }
            }}
          />
        }
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          position: "absolute",
          top: 0,
          width: "100%",
          zIndex: 1,
          alignItems: "flex-end",
        }}
      />
    );

    return (
      <ImageBackground
        style={styles.background}
        source={backgroundImg}>
        <QuitAlert
          isVisible={this.state.quitModalVisible}
          onClose={this._onModalResult}
          onModalHide={this._onModalHide}
        />
        {this.renderConnectionErrorAlert()}
        <ErrorAlert
          isVisible={this.state.errorModalVisible}
          onClose={this._onErrorModalResult}
          onModalHide={() => { }}
        />

        {topNavigator}
        <Loading visible={isLoading} />
        {data && !isLoading && (
          this.state.summary ?
            this.renderSummaryContent()
            :
            this.renderStepContent(data)
        )}
        {data && this.state.currentStepModel &&
          <PhoneOverlay
            isVisible={this.state.showNotes}
            onHideRequest={this._toggleNotes}
          >
          {topNavigator}
            <ScrollView>
              <StepNotes
                recipe={this.recipe}
                notes={data.notes}
                currentStepModel={this.state.currentStepModel}
                stepIndex={data.currentStep}
                onAddNote={this._onAddNote}
              />
            </ScrollView>
          </PhoneOverlay>
        }
        {this._stepListProps &&
          <PhoneOverlay
            isVisible={this.state.showOverview}
            onHideRequest={() => this.setState({ showOverview: false })}
          >
            {topNavigator}
            <ScrollView>
              <PhoneOverview
                style={{ marginTop: NAV_BAR_PHONE_HEIGHT, flex: undefined }}
                {...this._stepListProps}
              />
            </ScrollView>
          </PhoneOverlay>
        }
      </ImageBackground>
    );
  }

  private _renderTablet() {
    const { isLoading } = this.state;

    return (
      <ImageBackground
        style={styles.background}
        source={backgroundImg}>
        <Loading visible={isLoading} />
        <QuitAlert
          isVisible={this.state.quitModalVisible}
          onClose={this._onModalResult}
          onModalHide={this._onModalHide}
        />
        {this.renderConnectionErrorAlert()}
        <ErrorAlert
          isVisible={this.state.errorModalVisible}
          onClose={this._onErrorModalResult}
          onModalHide={() => { }}
        />
        <StepNavBar
          onQuitPress={this._onQuitPress}
          onOverviewPress={this._hasUserRecipe() ? undefined : this._onOverviewPress}
          onDashboardPress={() => this._dashboardModal && this._dashboardModal.toggle()}
          style={[{ paddingTop: 0 }, !this._hasUserRecipe() && { backgroundColor: "transparent" }]}
          middleElement={!this._hasUserRecipe() ?
            undefined
            :
            <Titles
              title1={this._recipe.getDeviceName() || this._applianceName || I18n.t("unknown_appliance")}
              title2={this._recipe.getTitle()}
            />
          }
        />
        <DashboardModal ref={(me) => this._dashboardModal = me} navigation={this.props.navigation} />
        {this.state.data &&
          <StepWindow
            summary={this.state.summary}
            {...this.state.data}
            {...this._callbacks}
            color={this.state.summary ? this.state.barColor : undefined}
            rating={this.state.rating}
            onModeChangeRequest={this._onModeChange}
            userRecipe={this._hasUserRecipe()}
            hideNotesButton
          >
            {this.state.summary ?
              this.renderSummaryContent()
              :
              this.renderStepContent(this.state.data)
            }
          </StepWindow>
        }
      </ImageBackground>
    );
  }

  private renderSummaryContent() {
    return (
      this.state.recipe && <RecipeSummaryContent
        recipe={this.state.recipe}
        onScroll={this._onScroll}
        onCreatePress={() => this._onModeChange("stepByStep")}
        createButtonText={I18n.t("continue").toUpperCase()}
      />
    );
  }

  private renderConnectionErrorAlert = () => {
    const device = DeviceStore.instance.getSelected() as CookProcessorModel | null;
    return (
      <AcceptCancelAlert
        isVisible={device ? device.connectionErrorOccured.sv() && !this._connectionAlertAlreadyShown : false}
        title={I18n.t("connectionErrorAlertTitle")}
        text={I18n.t("connectionErrorAlertTitleMessage")}
        acceptText={I18n.t("ok").toUpperCase()}
        onClose={(_result) => {
          if (device) {
            device.connectionErrorOccured.updateValue(false);
          }
          this._connectionAlertAlreadyShown = true;
        }}
      />
    );
  }

  private readonly _onScroll = (offset: number) => {
    const newColor: RecipeBarColors = (offset < 330) ? "black" : "white";
    if (this.state.barColor != newColor) {
      this.setState({
        barColor: newColor,
      });
    }
  }

  private renderStepContent(data: StepScreenData) {
    const showVideoTipBar = !!data && !!data.videoTip && this.state.mode == StepMode.weight;

    const isNormalStep = !!(
      (this.state.rating === undefined) &&
      (this.state.currentStepModel) &&
      (this.state.mode)
    );

    const notesEditor = (
      <UserInputEditor
        tapToEdit
        hasTitle={!isNormalStep}
        notEditingInputProps={{
          placeholder: I18n.t("tap_to_add_notes").toUpperCase(),
          placeholderTextColor: "#d8d8d8",
        }}
        userInputProps={{
          style: styles.notesEditorText,
        }}
        style={{
          marginTop: 20,
          marginBottom: 15,
          marginHorizontal: 2,
        }}
        buttonsContainerStyle={{ bottom: 15 }}
        buttonsStyle={{ width: IS_TABLET ? 110 : 90 }}
        cancelSaveButtonsOffset={60}
        clearOnSave
        onSave={({ text, title }) => {
          this._onAddNote(text, title);
        }}
      />
    );

    return IS_TABLET ? (
      (isNormalStep) ? (
        <StepRenderer
          recipe={this.recipe}
          {...data}
          showNotes={this.state.showNotes}
          weightData={this.state.weightData}
          cookingData={this.state.cookingData}
          {...this._callbacks}
          onNotesPress={this._hasUserRecipe() ? undefined : this._callbacks.onNotesPress}
          currentStepModel={this.state.currentStepModel as RecipeStepModel}
          mode={this.state.mode as StepMode}
          notesTextInput={notesEditor}
        />
      ) : (
          <RatingStep
            recipe={this.recipe}
            textInputComponent={notesEditor}
            notes={data.notes}
            rating={this.state.rating}
            favorite={this.state.favorite}
            {...this._callbacks}
          />
        )
    ) : (
        <View style={{ flex: 1 }}>
          <PhoneStepHeader
            {...data}
            onPress={this._hasUserRecipe() ? undefined : this._toggleOverview}
          />
          <View
            style={{
              flex: 1,
              marginTop: 14,
              backgroundColor: "white",
              borderRadius: 2,
              marginHorizontal: 12.5,
              marginBottom: (showVideoTipBar ? 60 : 30) + QUICK_CHOICE_BAR_HEIGHT,
            }}>
            <StepsHeader {...data} />
            {(isNormalStep) ? (
              <StepRenderer
                recipe={this.recipe}
                {...data}
                showNotes={false}
                weightData={this.state.weightData}
                cookingData={this.state.cookingData}
                {...this._callbacks}
                currentStepModel={this.state.currentStepModel as RecipeStepModel}
                mode={this.state.mode as StepMode}
              />
            ) : (
                <RatingStep
                  recipe={this.recipe}
                  textInputComponent={notesEditor}
                  notes={data.notes}
                  rating={this.state.rating}
                  favorite={this.state.favorite}
                  {...this._callbacks}
                />
              )
            }
          </View>
          {data.videoTip && showVideoTipBar && <VideoTipBar videoTip={data.videoTip} />}
          <View
            style={{
              width: "100%",
              position: "absolute",
              bottom: (showVideoTipBar ? 30 : 0) + QUICK_CHOICE_BAR_HEIGHT + 13,
            }}
          >
            <Navigation
              mode={getNavigationMode(this.state.rating, data.currentStep, data.allSteps, this._hasUserRecipe())}
              {...this._callbacks}
            />
          </View>
        </View>
      );
  }

  private _updateRecipeData(
    data: StepScreenData | undefined,
    recipe: RecipeModel,
    device: CookProcessorModel | null,
    initialGo: boolean = false,
  ) {
    const steps = recipe.steps.sv() as RecipeStepModel[] | null;
    if (!steps || !data) { return; }

    const currentStepModel: RecipeStepModel | undefined = steps[data.currentStep - 1];
    if (!currentStepModel) { return; }

    if (!currentStepModel) { this.setState({ currentStepModel: undefined }); return; }

    type cmdT = RecipeStepCommand[];
    const commands = noNull<cmdT, cmdT>(currentStepModel.commands.sv(), []);

    if (commands.length == 0) {
      this.setState({
        // TODO get mode from device ?
        mode: undefined,
        weightData: undefined,
        cookingData: undefined,
        isLoading: device ? !!device.requestedProgramInProgress.sv() : false,
      });
      return;
    }

    const params = commands[0].deviceCommandParameterInstances;
    const mode = params.find((v) => v.parameterKey == "Mode");
    const temp = params.find((v) => v.parameterKey == "TargetTemp");
    const time = params.find((v) => v.parameterKey == "ProcessTimeSet");
    const speed = params.find((v) => v.parameterKey == "MotorSpeed");

    const wInc = params.find((v) => v.parameterKey == "IncrementalAmount");

    const modeEnum = strToMode(mode);
    let weightData: WeightStepData | undefined;
    let cookingData: CookingStepData | undefined;
    if (modeEnum) {
      if (modeEnum == StepMode.weight) {
        if (device) {
          weightData = {
            stepDone: data.stepDone,
            weight: device.weight,
            weightIncrementalAmount: device.weightIncrementalAmount,
            weightTargetOverfill: device.weightTargetOverfill,
            weightTargetReached: device.weightTargetReached,
          };
        } else {
          weightData = {
            stepDone: false,
            weight: new ValueBase([], "weight"),
            weightIncrementalAmount: new ValueBase([], "weightIncrementalAmount"),
            weightTargetOverfill: new ValueBase([], "weightTargetOverfill"),
            weightTargetReached: new ValueBase([], "weightTargetReached"),
          };
        }

        if (initialGo) {
          weightData.weight.updateValue(0, ChangeOriginType.model);
          weightData.weightIncrementalAmount.updateValue((wInc && wInc.parameterValue) || 0, ChangeOriginType.model);
          weightData.weightTargetOverfill.updateValue(false, ChangeOriginType.model);
          weightData.weightTargetReached.updateValue(false, ChangeOriginType.model);
        }
      } else if (modeEnum == StepMode.recipe) {
        if (device) {
          cookingData = {
            isLidUnlocked: device.isLidUnlocked,
            motorSpeed: device.motorSpeed,
            currentTemp: device.currentTemp,
            targetTemp: device.targetTemp,
            currentTimeRemaining: device.currentTimeRemaining,
            targetTime: device.targetTime,
          };
        } else {
          cookingData = {
            isLidUnlocked: new ValueBase([], "isLidUnlocked"),
            motorSpeed: new ValueBase([], "motorSpeed"),
            currentTemp: new ValueBase([], "currentTemp"),
            targetTemp: new ValueBase([], "targetTemp"),
            currentTimeRemaining: new ValueBase([], "currentTimeRemaining"),
            targetTime: new ValueBase([], "targetTime"),
          };

          if (initialGo) {
            cookingData.isLidUnlocked.updateValue(false, ChangeOriginType.model);
          }
        }

        if (initialGo) {
          const sp = speed && MotorSpeedAsEnum(speed.parameterValue as string);

          cookingData.motorSpeed.updateValue(sp || CookMotorSpeed.MotorSpeedOff, ChangeOriginType.model);
          cookingData.targetTemp.updateValue((temp && Number(temp.parameterValue)) || 0, ChangeOriginType.model);
          cookingData.targetTime.updateValue((time && Number(time.parameterValue)) || 0, ChangeOriginType.model);
        }
      }
    }

    this.setState({
      mode: modeEnum, // TODO get mode from device ?
      weightData,
      cookingData,
      isLoading: device ? !!device.requestedProgramInProgress.sv() : false,
      currentStepModel,
    });
  }

  // TOFIX (open overview on gesture)
  private readonly _onOverviewPress = () => {
    if (!this._stepListProps) { return; }
    this.props.navigation.navigate("Overview", this._stepListProps);
  }

  private readonly _onQuitPress = () => {
    const overlay = this.state.showOverview || this.state.showNotes;
    if (!IS_TABLET && overlay) {
      this.setState({
        showOverview: false,
        showNotes: false,
      });
    } else {
      this.showQuitModal();
    }
  }

  private readonly _onModeChange = (mode: RecipeBarMode) => {
    const overlay = this.state.showOverview || this.state.showNotes;
    if (!IS_TABLET && overlay) {
      this.setState({
        showOverview: false,
        showNotes: false,
      });
    } else if (mode != "notes") {
      this.setState((prevState) => ({ summary: !prevState.summary }));
    }
  }

  private showQuitModal = () => this.setState({ quitModalVisible: true });
  private showErrorModal = () => this.setState({ errorModalVisible: true });

  private _onModalHide = () => { };

  private readonly _goToHome = () => {
    const device = DeviceStore.instance.getSelected() as CookProcessorModel | null;
    if (device) {
      device.cancelRecipeExecution();
    }
    resetTo(IS_TABLET ? "Tabs" : "MainTabs", this.props.navigation);
  }

  private readonly _backToSummary = () => {
    this.props.navigation.goBack();
  }

  private readonly overrideQcbNavigate = (clear: boolean = false) => {
    this.props.navigation.dispatch(NavigationActions.setParams({
      params: {
        quickChoiceNavigate: clear ? undefined : (routeName, originalNavigate) => {
          this._quitModalConfirmFunc = () => originalNavigate(routeName);
          this.showQuitModal();
        },
      },
      key: this._wrapperKey,
    }));
  }

  private readonly _onModalResult = (result: boolean) => {
    if (result) {
      this._onModalHide = () => { };
    } else {
      this._onModalHide = () => {
        const device = DeviceStore.instance.getSelected() as CookProcessorModel | null;
        if (device) {
          device.cancelRecipeExecution();
        }
        // clear saved progress after quitting
        KAStorage.ClearRecipeProgress();
        if (this._quitModalConfirmFunc) {
          this._quitModalConfirmFunc();
          this._quitModalConfirmFunc = undefined;
        } else {
          this._backToSummary();
        }
      };
    }

    this.setState({ quitModalVisible: false });
  }

  private readonly _onErrorModalResult = () => {
    this.setState({ errorModalVisible: false });
  }

  private readonly _onNextPress = () => {
    const device = DeviceStore.instance.getSelected();
    if (device && device.targetState.sv() != null) {
      device.targetState.updateValue(null);
    }
    this._recipe.nextStep();
    this._hideNotes();
  }

  private readonly _onPrevPress = () => {
    this._recipe.prevStep();
    this._hideNotes();
  }

  private readonly _toggleNotes = () => {
    this.setState((prevState) => ({ showNotes: !prevState.showNotes }));
  }

  private readonly _hideNotes = () => this.setState({ showNotes: false });

  private readonly _toggleOverview = () => {
    this.setState((prevState) => ({ showOverview: !prevState.showOverview }));
  }

  private readonly _onAddNote = (text: string, title?: string) => {
    this._recipe.addNote(text, title);
  }

  private readonly _onFavoritePress = (favorite: boolean) => {
    this.setState({
      favorite,
    });
  }

  private readonly _onFinishPress = () => {
    this.state.rating && this._recipe.rate(this.state.rating);
    (this.state.favorite !== undefined) && this._recipe.setFavortie(this.state.favorite);
    this._goToHome();
  }

  private readonly _onRatingPress = (rating: number) => {
    this.setState({
      rating,
    });
  }

  private readonly _onCookingStopPress = () => {
    this.showQuitModal();
  }

  private readonly _updateState = (
    recipe: RecipeModel,
    device: CookProcessorModel | null,
    initialGo: boolean = false,
  ) => {
    const data = this._recipe.getCurrentStepData();
    if (!data) { return; } // may be expected if current step is 0

    const rating = (this.state.rating !== undefined) ? this.state.rating : this._recipe.getRating();
    const favorite = (this.state.favorite !== undefined) ? this.state.favorite : noNull(recipe.isFavorite.sv(), false);

    if (data.finishedSteps < data.allSteps) {
      KAStorage.SaveRecipeProgress(recipe, data.currentStep, data.finishedSteps);
    } else {
      // recipe finished, clear saved progress
      KAStorage.ClearRecipeProgress();
    }

    this._updateRecipeData(data, recipe, device, initialGo);

    this.setState({
      data,
      rating,
      favorite,
    });
    this._updateStepList(data);
  }

  private readonly _onCookingStepCompleted = () => {
    this._recipe.markStepDone();
  }

  private readonly _callbacks = {
    onNextPress: this._onNextPress,
    onPrevPress: this._onPrevPress,
    onNotesPress: this._toggleNotes,
    onHideNotesPress: this._toggleNotes,
    onFavoritePress: this._onFavoritePress,
    onFinishPress: this._onFinishPress,
    onRatingPress: this._onRatingPress,
    onCookingStop: this._onCookingStopPress,
    onCookingStepCompleted: this._onCookingStepCompleted,
  };

  private _updateStepList(data?: StepScreenData) {
    if (!this._recipe) { return; }
    const steps = this._recipe.getSteps();
    if (!steps || !data) {
      this._stepListProps = null;
    } else {
      this._stepListProps = {
        steps,
        title: data.title,
        currentStep: data.currentStep,
        finishedSteps: data.finishedSteps,
        allSteps: data.allSteps,
      };
    }
  }

  private readonly _hasUserRecipe = () => !!(this._recipe && this._recipe.userRecipe);

  private _recipe: Recipe;
  private _applianceName?: string;
  private _dashboardModal: DashboardModal | null;
  private _deviceOperationSubscription: Subscription | undefined;
  private _programUploadFailedSubscription: Subscription | undefined;
  private _stepListProps: StepListProps | null = null;
  private _quitModalConfirmFunc?: () => void;
  private _connectionError: Subscription | undefined;
}

interface StepNavBarProps {
  onQuitPress: () => void;
  onOverviewPress?: () => void; // if not passed overview button is not rendered
  onDashboardPress: () => void;
  middleElement?: NavBarElement;
  style?: StyleProp<ViewStyle>;
}

const StepNavBar = (props: StepNavBarProps) => {
  return (
    <NavBarBase
      style={props.style}
      leftElement={
        <SideIcon
          iconProps={{
            visible: true,
            source: navbarCloseIcon,
            onPress: props.onQuitPress,
          }}
        />}
      middleElement={props.middleElement}
      rightElement={
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          {props.onOverviewPress &&
            <ThemedTextButton
              theme="white"
              text={I18n.t("overview").toUpperCase()}
              style={{
                marginRight: 15,
                width: 100,
              }}
              onPress={props.onOverviewPress}
            />}
          <SideIcon
            iconProps={{
              visible: true,
              source: navbarAppliancesIcon,
              onPress: props.onDashboardPress,
            }} />
        </View>
      }
    />
  );
};

interface AlertProps {
  isVisible: boolean;
  onClose: (result: boolean) => void;
  onModalHide: () => void;
}

const QuitAlert = (props: AlertProps) => {
  return (
    <AcceptCancelAlert
      isVisible={props.isVisible}
      onClose={props.onClose}
      title={I18n.t("quit_recipe")}
      text={I18n.t("confirm_quit_recipe")}
      acceptText={I18n.t("resume").toUpperCase()}
      cancelText={I18n.t("quit").toUpperCase()}
      onModalHide={props.onModalHide}
    />
  );
};

const ErrorAlert = (props: AlertProps) => {
  return (
    <AcceptCancelAlert
      isVisible={props.isVisible}
      onClose={props.onClose}
      title={I18n.t("error")}
      text={I18n.t("error_starting_recipe_cooking")}
      acceptText={I18n.t("ok").toUpperCase()}
      onModalHide={props.onModalHide}
    />
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: "black",
  },
  notesEditorText: {
    fontFamily: "Muli",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 2,
    color: "#000000",
  },
});
