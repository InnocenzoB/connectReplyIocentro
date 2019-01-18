import { I18n } from "iocentro-apps-common-bits";
import { RecipeStepCommand, RecipeStepModel } from "iocentro-collection-manager";
import { ValueBase } from "iocentro-datamodel";
import React, { Component } from "react";
import {
  Dimensions,
  Image,
  ImageBackground,
  ListRenderItemInfo,
  StatusBar,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import Carousel from "react-native-snap-carousel";
import { NavigationScreenProps } from "react-navigation";

import { CookMotorSpeed, MotorSpeedAsEnum, UiFormatMotorSpeed } from "../../model/CookProcessorModel";
import { IS_TABLET, PlatformSelect } from "../../Platform";
import { noNull } from "../../Utils";
import { StepMode } from "../../views/StepsScreen";
import { IconButton } from "../Buttons";
import { VerticalSpacer } from "../dashboard/Common";
import { DashboardModal } from "../dashboard/Dashboard";
import { Size } from "../nav_bars/SideIconsNavBar";
import { PaperView } from "../Paper";
import { RoundButtonParam, RoundButtonParamType } from "../RoundButtonParam";
import { TextScaledOnPhone } from "../ScaledText";
import { TouchableScale } from "../TouchableScale";
import { BookMark } from "./Bookmark";
import { ImageFromModel } from "./ImageFromModel";
import { ColoredNumberCircle } from "./NumberCircle";
import { StepsHeader, StepsHeaderData } from "./StepsHeader";

const imported = {
  background: require("../../../img/common/woodBackground.png"),
  backArrow: require("../../../img/common/backArrow.png"),
  applianceIcon: require("../../../img/home_screen/navbarAppliancesIcon.png"),
  stepNoImagePlaceholder: require("../../../img/steps/stepNoImagePlaceholder.png"),
};

export interface StepListProps extends StepsHeaderData {
  steps: ValueBase;
}

const ITEM_SIZE = IS_TABLET ? 390 : 195;
const SPACER_WIDTH = IS_TABLET ? 10 : 5;
const sliderWidth = Dimensions.get("window").width;

export class Overview extends Component<NavigationScreenProps<StepListProps>> {
  private _dashboardModal: DashboardModal | null = null;

  public render() {
    const navigationParams = this.props.navigation.state.params;
    if (!navigationParams.steps) { return null; }
    return (
      <ImageBackground style={{ flex: 1 }} source={imported.background}>
        <StatusBar barStyle={"light-content"} hidden={true} />
        {IS_TABLET &&
          <DashboardModal
            ref={(me) => this._dashboardModal = me}
            navigation={this.props.navigation}
          />}
        <Header
          stepNumber={navigationParams ? navigationParams.currentStep : "?"}
          onBack={() => { this.props.navigation.goBack(); }}
          onAppliance={() => this._dashboardModal && this._dashboardModal.toggle()}
        />
        <View style={{ flex: 1, justifyContent: "center" }}>
          {navigationParams && <StepList {...navigationParams} />}
        </View>
      </ImageBackground>
    );
  }
}

export class StepList extends Component<StepListProps> {

  public render() {
    const steps: RecipeStepModel[] = noNull(this.props.steps.sv(), []);
    return (
      <View style={{ height: ITEM_SIZE }}>
        <Carousel
          data={steps}
          renderItem={this._renderItem}
          sliderWidth={sliderWidth}
          itemWidth={ITEM_SIZE + SPACER_WIDTH * 2}
          activeSlideAlignment={"start"}
          enableMomentum={true}
          enableSnap={false}
          inactiveSlideScale={1}
          inactiveSlideOpacity={1}
          firstItem={this.props.currentStep - 1}
        />
      </View>
    );
  }

  private readonly _isCurrentStep = (stepIndex) => {
    return (this.props.currentStep == stepIndex + 1);
  }

  private readonly _renderItem = ({ item, index }: ListRenderItemInfo<RecipeStepModel>) => {
    return (
      <View style={{ flexDirection: "row", paddingHorizontal: SPACER_WIDTH }}>
        <View style={styles.stepBox}>
          {this._isCurrentStep(index) &&
            <BookMark
              {...PlatformSelect({
                anyTablet: {
                  width: 40,
                  height: 56,
                },
                anyPhone: {
                  width: 24,
                  height: 34,
                },
              })}
              vertical={true}
              style={{ position: "absolute", top: -1, right: IS_TABLET ? 6 : 3 }}
            />}
          {this._renderStepNumber(index + 1, this.props.currentStep, this.props.finishedSteps)}
          <StepTexts
            title={noNull(item.title.sv(), "?").toUpperCase()}
            description={noNull(item.description.sv(), "")}
          />
          <StepContent model={item} />
        </View>
      </View>
    );
  }

  private _renderStepNumber(pos, currentPos, finishedPos) {
    if (pos == currentPos) {
      return <CurrentStepNumber number={pos} />;
    } else if (pos <= finishedPos) {
      return <CompletedStepNumber number={pos} />;
    } else {
      return <UnCompletedStepNumber number={pos} />;
    }
  }
}

export const PhoneOverview = (props: StepListProps & { style?: StyleProp<ViewStyle> }) => {
  const headerData: StepsHeaderData = {
    title: props.title,
    currentStep: props.currentStep,
    finishedSteps: props.finishedSteps,
    allSteps: props.allSteps,
  };

  return (
    <PaperView
      outerStyle={{ flex: undefined, borderRadius: 0 }}
      innerStyle={[{
        backgroundColor: "#ffffff",
        shadowColor: "rgba(0, 0, 0, 0.18)",
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowRadius: 4,
        shadowOpacity: 1,
      }, props.style]}
    >
      <View style={{ height: 102 }}>
        <StepsHeader
          {...headerData}
          phoneOverview={true}
        />
      </View>
      <VerticalSpacer height={26} />
      <StepList {...props} />
      <VerticalSpacer height={36.5} />
    </PaperView>
  );
};

export const HorizontalSpacer = ({ width }) => (<View style={{ width, height: 0 }} />);

const BOOKMARK_SHIFT = 20; // after scaling is peels off the edge of the screen which looked bad

const Header = ({ stepNumber, onBack, onAppliance }) => (
  <View style={{
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    marginLeft: -BOOKMARK_SHIFT,
  }}>
    <TouchableScale
      onPress={onBack}
      style={{
        alignItems: "center",
        flexDirection: "row",
        backgroundColor: "transparent",
        width: 136,
        height: 40,
        marginLeft: BOOKMARK_SHIFT,
      }}
    >
      <BookMark width={136 + BOOKMARK_SHIFT} height={40} style={{ position: "absolute", left: -BOOKMARK_SHIFT }} />
      <HorizontalSpacer width={10} />
      <Image source={imported.backArrow} />
      <HorizontalSpacer width={10} />
      <TextScaledOnPhone style={styles.stepText}>{I18n.t("step").toUpperCase() + " " + stepNumber}</TextScaledOnPhone>
    </TouchableScale>
    <IconButton centered onPress={onAppliance} icon={imported.applianceIcon} style={{ margin: 15 }} />
  </View>
);

interface StepNumberProps {
  number: number;
  color: string;
  numberColor?: string;
}

const StepNumber = (props: StepNumberProps) => (
  <ColoredNumberCircle size={IS_TABLET ? 30 : 15} {...props} />
);

const CompletedStepNumber = ({ number }) => (
  <StepNumber number={number} color="#3b7b00" />
);

const UnCompletedStepNumber = ({ number }) => (
  <StepNumber number={number} color="#cb0000" />
);

const CurrentStepNumber = ({ number }) => (
  <StepNumber number={number} color="#cb0000" numberColor="#ffffff" />
);

const StepTexts = ({ title, description }) => (
  <View
    style={{
      alignItems: "center",
      ...PlatformSelect({
        anyTablet: { minHeight: 40, marginVertical: 11 },
        anyPhone: { minHeight: 20, marginVertical: 6 },
      }),
    }}
  >
    <TextScaledOnPhone style={styles.stepTitleText}>{title}</TextScaledOnPhone>
    <TextScaledOnPhone style={styles.stepDescriptionText}>{description}</TextScaledOnPhone>
  </View>
);

interface StepContentProps {
  model: RecipeStepModel;
}

type StepContentState = Size;

class StepContent extends Component<StepContentProps, StepContentState> {
  private commands;
  private mode;
  private params;

  constructor(props) {
    super(props);
    type cmdT = RecipeStepCommand[];
    this.commands = noNull<cmdT, cmdT>(this.props.model.commands.sv(), []);

    this.params = this.commands[0].deviceCommandParameterInstances;
    this.mode = this.params.find((v) => v.parameterKey == "Mode");
  }
  public state = PlatformSelect({
    anyTablet: { height: 160, width: 270 },
    anyPhone: { height: 80, width: 140 },
  });

  public render() {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
        onLayout={(e) => {
          this.setState({
            width: e.nativeEvent.layout.width,
            height: e.nativeEvent.layout.height,
          });
        }}
      >{this.mode && (this.mode.parameterValue == StepMode.recipe) ?
        Buttons(this.params) : this.renderImage()}

      </View>
    );
  }

  private renderImage = () => {
    const image = this.props.model.image.sv();
    if (image) {
      return (<ImageFromModel height={this.state.width} width={this.state.height} image={image} />);
    } else {
      return (<Image
        style={{
          width: this.state.height, height: this.state.width,
        }}
        source={imported.stepNoImagePlaceholder}
        resizeMode="contain"
      />);
    }
  }
}

const Buttons = (params: any) => {
  const temp = params.find((v) => v.parameterKey == "TargetTemp");
  const time = params.find((v) => v.parameterKey == "ProcessTimeSet");
  const speed = params.find((v) => v.parameterKey == "MotorSpeed");

  const renderSpeedLabel = () => {
    if (!speed) { return UiFormatMotorSpeed(CookMotorSpeed.MotorSpeedOff); }
    if (MotorSpeedAsEnum(speed.parameterValue as string) === CookMotorSpeed.MotorSpeedIntermittent) {
      return I18n.t("intermittent_short");
    }
    return UiFormatMotorSpeed(MotorSpeedAsEnum(speed.parameterValue as string));
  };

  return (
    <View
      style={[
        {
          justifyContent: "space-between",
          flexDirection: "row",
          alignItems: "center",
          alignSelf: "center",
          transform: [
            { scale: IS_TABLET ? 0.8 : 0.5 },
          ],
        },
      ]}>
      <View style={{ marginHorizontal: 8 }}>
        <RoundButtonParam
          type={RoundButtonParamType.Temperature}
          value={temp ? Number(temp.parameterValue) : 0}
          theme="white"
          readonly={true}
        />
      </View>
      <View style={{ marginHorizontal: 8 }}>
        <RoundButtonParam
          type={RoundButtonParamType.Time}
          value={time ? Number(time.parameterValue) : 0}
          theme="white"
          readonly={true}
        />
      </View>
      <View style={{ marginHorizontal: 8 }}>
        <RoundButtonParam
          type={RoundButtonParamType.Speed}
          value={renderSpeedLabel()}
          theme="white"
          readonly={true}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  stepText: {
    fontFamily: "Muli",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 2,
    color: "#ffffff",
  },
  stepBox: {
    alignItems: "center",
    width: ITEM_SIZE,
    height: ITEM_SIZE,

    ...PlatformSelect<ViewStyle>({
      anyTablet: {
        paddingTop: 78,
        paddingHorizontal: 23,
        paddingBottom: 25,
      },
      anyPhone: {
        paddingTop: 39,
        paddingHorizontal: 12,
        paddingBottom: 13,
        shadowColor: "rgba(0, 0, 0, 0.5)",
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowRadius: 4,
        shadowOpacity: 1,
      },
    }),

    backgroundColor: "#ffffff",
  },
  stepTitleText: {
    fontFamily: "Muli",
    fontWeight: "900",
    color: "#000000",
    textAlign: "center",

    ...PlatformSelect({
      anyTablet: {
        fontSize: 16,
        letterSpacing: 2.91,
      },
      anyPhone: {
        fontSize: 8,
        letterSpacing: 1.45,
      },
    }),
  },
  stepDescriptionText: {
    fontFamily: "Muli",
    fontSize: IS_TABLET ? 16 : 8,
    color: "#000000",
    textAlign: "center",
  },
});
