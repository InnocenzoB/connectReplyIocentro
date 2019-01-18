import {
  DeviceStore,
  I18n,
} from "iocentro-apps-common-bits";
import React, { Component } from "react";
import { LayoutAnimation, StatusBar, View } from "react-native";
import Modal from "react-native-modal";
import { NavigationScreenProps } from "react-navigation";
import { Subscription } from "rxjs";

import { PaperView } from "../../components/Paper";
import { CookProcessorStepModel } from "../../model/user_creations/StepModel";
import { scanCurrentRoute } from "../../navigation/CommonNavigation";
import { IS_TABLET, PlatformSelect } from "../../Platform";
import { CreationNavigationParams } from "../../views/Creation";
import { IconButton } from "../Buttons";
import { Hr } from "../Hr";
import { TitleNavBar } from "../nav_bars/TitleNavBar";
import { CookProcessorModel } from "./../../model/CookProcessorModel";
import { AppliancesView } from "./Appliances";
import { styles } from "./Common";
import { DashboardHeader } from "./DashboardHeader";
import { NoAppliances } from "./NoAppliances";
import { SettingsView } from "./Settings";

const imported = {
  backArrow: require("../../../img/common/backArrow.png"),
  navbarAppliancesIcon: require("../../../img/home_screen/navbarAppliancesIcon.png"),
};

export enum DashboardView {
  Appliances,
  Settings,
  NoAppliances,
}

interface DashboardState {
  currentView: DashboardView;
}

interface DashboardContentProps extends NavigationScreenProps<{}> {
  fullPage: boolean;
  onHideRequest?: () => void;
}

class DashboardContent extends Component<DashboardContentProps, DashboardState> {
  private _selectedDeviceChanged: Subscription;

  constructor(props) {
    super(props);

    this._cookProcessor = DeviceStore.instance.getSelected() as CookProcessorModel | null;

    this.state = {
      currentView: this._cookProcessor ? DashboardView.Appliances : DashboardView.NoAppliances,
    };
  }

  public shouldComponentUpdate(nextProps, nextState) {
    return nextProps.fullPage != this.props.fullPage || nextState.currentView != this.state.currentView;
  }

  public componentWillMount() {
    this._selectedDeviceChanged = DeviceStore.instance.selected.subscribe(() => {
      this._cookProcessor = DeviceStore.instance.getSelected() as CookProcessorModel | null;

      this.setState({ currentView: this._cookProcessor ? DashboardView.Appliances : DashboardView.NoAppliances });
    });
  }

  public componentWillUnmount() {
    this._selectedDeviceChanged.unsubscribe();
  }

  public componentWillUpdate() {
    // animate transition
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }

  public render() {
    return (
      <PaperView
        outerStyle={{
          marginLeft: (IS_TABLET ? (this.props.fullPage ? 0 : 20) : 0),
          borderRadius: 0,
        }}
      >
        <AppliancesTopBar
          hidePress={this.props.onHideRequest}
          noAppliances={this.state.currentView == DashboardView.NoAppliances}
        />
        <View
          style={[{
            flex: 1,
            backgroundColor: "transparent",
          }, this.props.fullPage ? fullPagePadding : drawerPadding]}
        >
          {this._cookProcessor &&
            <View>
              <DashboardHeader
                fullPage={this.props.fullPage}
                onViewChange={this._onViewChange}
                currentView={this.state.currentView}
                applianceName={I18n.t("cook_processor_name")}
              />
              <Hr style={{ marginTop: 12, marginBottom: this.props.fullPage ? 24 : 10 }} />
            </View>
          }
          {this._renderCurrentView()}
        </View>
      </PaperView>
    );
  }

  private _renderCurrentView() {
    const disableAddCreationButton = scanCurrentRoute(this.props.navigation.state, ["Creation", "Steps"]) != null;

    switch (this.state.currentView) {
      case DashboardView.Appliances:
        if (this._cookProcessor) {
          return (
            // additional padding for appliances view
            <View
              style={{
                overflow: "visible",
                ...(this.props.fullPage ? {
                  paddingLeft: 4,
                  paddingRight: 20,
                } : {
                  paddingLeft: 11,
                  paddingRight: 14,
                  paddingTop: (IS_TABLET ? 15 : 10),
                }),
              }}>
              <AppliancesView
                fullPage={this.props.fullPage}
                model={this._cookProcessor}
                onAddCreationPress={disableAddCreationButton ? undefined : (values) => {
                  this.props.onHideRequest && this.props.onHideRequest();
                  const params: CreationNavigationParams = {
                    applicanceName: this._cookProcessor && this._cookProcessor.name.sv(),
                    creation: null,
                    steps: [
                      CookProcessorStepModel.From(values),
                    ],
                  };
                  this.props.navigation.navigate("Creation", params);
                }}
              />
            </View>
          );
        } else {
          return null;
        }

      case DashboardView.Settings:
        return this._cookProcessor &&
          <SettingsView
            fullPage={this.props.fullPage}
            model={this._cookProcessor}
            applianceName={I18n.t("cook_processor_name")}
          />;
      case DashboardView.NoAppliances:
        return <NoAppliances onAddPressed={() => {
          if (this.props.onHideRequest) {
            this.props.onHideRequest();
          }
          setTimeout(() => { this.props.navigation.navigate("ApplianceWizard"); }, 100);
        }} />;
    }
  }

  private _onViewChange = (view) => {
    this.setState({ currentView: view });
  }

  private _cookProcessor: CookProcessorModel | null;
}

export class DashboardModal extends Component<NavigationScreenProps<{}>, DashboardCompState> {
  constructor(props) {
    super(props);

    this.state = {
      visible: false,
      fullPage: false,
    };
  }

  public render() {
    const button = !IS_TABLET ? null : (
      <IconButton
        onPress={this.toggleMode}
        icon={imported.backArrow}
        iconStyle={this.state.fullPage && {
          transform: [{
            rotateY: ("180deg"),
          }],
        }}
        style={{
          position: "absolute",
          top: 41, left: this.state.fullPage ? -4 : 0,
          width: 60, height: 54,
          borderRadius: 4,
          backgroundColor: "#cb0000",
          shadowColor: "rgba(0, 0, 0, 0.2)",
          shadowOffset: { width: 0, height: 2 },
          shadowRadius: 10,
          shadowOpacity: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      />
    );

    return (
      <Modal
        isVisible={this.state.visible}
        backdropOpacity={0.5}
        animationIn="slideInRight"
        animationOut="slideOutRight"
        onBackdropPress={this.toggle.bind(this)}
        style={{
          width: (this.state.fullPage ? "100%" : 395),
          alignSelf: "flex-end",
          padding: 0,
          margin: 0,
        }}
      >
        <StatusBar barStyle={"light-content"} hidden={true} translucent={true} backgroundColor="#00000000" />
        <DashboardContent
          fullPage={this.state.fullPage}
          onHideRequest={this.toggle.bind(this)}
          navigation={this.props.navigation}
        />
        {button}
      </Modal>
    );
  }

  public toggleMode = () => {
    this.setState((prevState) => {
      let { fullPage } = prevState;
      fullPage = !fullPage;
      return { fullPage };
    });
  }

  public toggle() {
    this.setState((prevState) => {
      let { visible, fullPage } = prevState;
      visible = !visible;
      if (visible == false) {
        fullPage = false;
      }
      return { visible, fullPage };
    });
  }
}
export class Dashboard extends Component<NavigationScreenProps<{}>> {
  public render() {
    return (
      <DashboardContent fullPage={false} navigation={this.props.navigation} />
    );
  }
}

interface DashboardCompState {
  visible: boolean;
  fullPage: boolean;
}

const AppliancesTopBar = ({ hidePress, noAppliances }) => (
  <TitleNavBar
    title1={noAppliances ? I18n.t("applianceListTitle") : I18n.t("my")}
    title2={noAppliances ? "" : I18n.t("dashboard")}
    theme="white"
    style={styles.bar}
    leftIcon={null}
    rightIcon={!IS_TABLET ? null : {
      source: imported.navbarAppliancesIcon,
      onPress: hidePress,
      style: {
        width: 44, height: 44,
        marginRight: 15,
        backgroundColor: "#cb0000",
        borderRadius: 500,
      },
    }}
  />
);

const fullPagePadding = {
  paddingHorizontal: 50,
  paddingBottom: 28,
  paddingTop: PlatformSelect({
    androidTablet: 27,
    iosTablet: 47,
  }),
};

const drawerPadding = {
  paddingHorizontal: 10,
  paddingTop: (IS_TABLET ? 33 : 16),
  paddingBottom: (IS_TABLET ? 18 : 0),
};
