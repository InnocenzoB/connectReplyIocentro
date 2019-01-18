import { DeviceStore, I18n, UserModel } from "iocentro-apps-common-bits";
import React, { Component } from "react";
import { FlatList, Image, Linking, ScrollView, View } from "react-native";
import { Subscription } from "rxjs";

import { Configuration } from "../../model/Configuration";
import { CookProcessorModel } from "../../model/CookProcessorModel";
import { KitchenAidUserModel } from "../../model/KitchenAidUserModel";
import { IS_TABLET } from "../../Platform";
import { noNull } from "../../Utils";
import { GradientTextButton, TextButton, ThemedTextButton } from "../Buttons";
import { Hr } from "../Hr";
import { QUICK_CHOICE_BAR_HEIGHT } from "../QuickChoiceBottomBar";
import { TextScaledOnPhone } from "../ScaledText";
import { styles, VerticalSpacer } from "./Common";

const imported = {
  remoteEnabledIcon: require("../../../img/icons/remoteEnabledIcon.png"),
  cookProcessorImage: require("../../../img/cookProcessor.png"),
  fullSizeIcon: require("../../../img/icons/fullSizeIcon.png"),
};

export interface SettingsViewProps {
  fullPage: boolean;
  model: CookProcessorModel;
  applianceName: string;
}

export interface SettingsViewState {
  manualUrl?: string;
}

export class SettingsView extends Component<SettingsViewProps, SettingsViewState> {
  public state: SettingsViewState = {};

  public componentDidMount() {
    Configuration.instance.getManualUrl((manualUrl) => {
      this.setState({ manualUrl });
    });
  }

  public render() {
    const props = this.props;
    return (
      props.fullPage ?
        <ScrollView
          contentContainerStyle={{
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <View style={{ width: 436 }}>
            <ApplianceBox fullPage={true} model={props.model} applianceName={props.applianceName} />
            <VerticalSpacer height={50} />
          </View>
          <View style={{ width: 436 }}>
            <PreferencesBox collapsable={false} />
            <VerticalSpacer height={40} />
            <ButtonView
              manualUrl={this.state.manualUrl}
              warrantyUrl={this.state.manualUrl}
              separatorComponent={() => (<VerticalSpacer height={20} />)}
              model={props.model}
            />
          </View>
        </ScrollView>
        :
        <FlatList
          keyExtractor={(_item, index) => index.toString()}
          ItemSeparatorComponent={() => (<VerticalSpacer height={10} />)}
          data={[
            <ApplianceBox fullPage={false} model={props.model} applianceName={props.applianceName} />,
            <PreferencesBox collapsable={true} />,
            <VerticalSpacer height={15} />,
            <ButtonView
              manualUrl={this.state.manualUrl}
              warrantyUrl={this.state.manualUrl}
              separatorComponent={() => (<VerticalSpacer height={14} />)}
              paddingHorizontal={19}
              model={props.model}
            />,
          ]}
          renderItem={({ item }) => (item)}
        />
    );
  }
}

const ApplianceBox = ({ fullPage, model, applianceName }) => (
  <View style={fullPage ? styles.boxStyle : styles.boxCollapsedStyle}>
    <ApplianceInfo fullPage={fullPage} model={model} applianceName={applianceName} />
    <Hr style={{ marginVertical: (fullPage ? 30 : 14) }} />
    <ServiceInfo fullPage={fullPage} />
  </View>
);

const ApplianceProperty = ({ name, value }) => (
  <TextScaledOnPhone style={styles.appliancePropertiesText}>{name}: {value}</TextScaledOnPhone>
);

const ApplianceInfo = ({ fullPage, model, applianceName }) => {
  const creationDate: Date = model.created.sv();
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-around",
      }}
    >
      <Image
        resizeMode="contain"
        style={{ maxWidth: (fullPage ? 170 : 120), flex: 1 }}
        source={imported.cookProcessorImage}
      />
      <View>
        <TextScaledOnPhone style={styles.appliancePropertyNameText}>{applianceName}</TextScaledOnPhone>
        <ApplianceProperty name={I18n.t("model")} value={noNull(model.modelNumber.sv(), "")} />
        {/* BIOT-9877 <ApplianceProperty name={I18n.t("serial")} value={noNull(model.serialNumber.sv(), "")} /> */}
        <ApplianceProperty name="SAID" value={noNull(model.activationCode.sv(), "")} />
        <ApplianceProperty name={I18n.t("startDate")} value={creationDate ? creationDate.toLocaleDateString() : ""} />
      </View>
      <Image source={imported.remoteEnabledIcon} style={{
        position: "absolute",
        top: -8, right: -8,
      }} />
    </View>
  );
};

const ServiceInfo = ({ fullPage }) => (
  <View style={{ marginHorizontal: (fullPage ? 30 : 0) }}>
    <ApplianceProperty name={I18n.t("phone")} value={I18n.t("phone_value")} />
    <ApplianceProperty name={I18n.t("hours")} value={I18n.t("hours_value")} />
  </View>
);

interface OptionallyCollapsableProps {
  collapsable?: boolean;
}

interface CollapsableProps {
  initialyCollapsed?: boolean; // by default - collapsed if collapsable
  onCollapsedToggle?: (collapsed: boolean) => void;
}

interface CollapsableState {
  collapsed: boolean;
}

export class CollapsableComponent<P = {}, S = {}> extends Component<P & CollapsableProps, S & CollapsableState> {
  constructor(props) {
    super(props);
    // @ts-ignore: ts does not like below line - not sure why
    this.state = {
      collapsed: (props.initialyCollapsed !== undefined ? props.initialyCollapsed : props.collapsable),
    };
  }

  protected _toggleCollapsed = () => {
    const { onCollapsedToggle } = this.props;

    const collapsed = !this.state.collapsed;
    this.setState({ collapsed });
    onCollapsedToggle && onCollapsedToggle(collapsed);
  }
}

interface BoxTitleProps extends OptionallyCollapsableProps {
  text: string;
}

class BoxTitle extends CollapsableComponent<BoxTitleProps> {
  public render() {
    const { text, collapsable } = this.props;
    const { collapsed } = this.state;

    return (
      <View>
        <TextButton
          disabled={!collapsable}
          onPress={this._toggleCollapsed}
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
          text={text}
          textStyle={styles.boxTitleText}
        >
          {collapsable && <Image source={imported.fullSizeIcon} />}
        </TextButton>
        {!collapsed && <Hr style={{ marginTop: 11, marginBottom: (collapsable ? 10 : 18) }} />}
      </View>
    );
  }
}

interface TicketProps extends TicketHeadingProps {
  message: string;
}

class Ticket extends CollapsableComponent<TicketProps> {
  constructor(props) {
    super(props);
  }

  public render() {
    const { message, ...ticketHeadingProps } = this.props;
    const { collapsed } = this.state;

    return (
      <View style={styles.ticket}>
        <TicketHeading {...ticketHeadingProps} onCollapsedToggle={this._toggleCollapsed} />
        {!collapsed &&
          <View>
            <VerticalSpacer height={14} />
            <TextScaledOnPhone style={styles.ticketMessageText}>{message}</TextScaledOnPhone>
          </View>
        }
      </View>
    );
  }
}

interface TicketHeadingProps {
  id: number;
  date: string;
}

class TicketHeading extends CollapsableComponent<TicketHeadingProps> {
  constructor(props) {
    super(props);
  }

  public render() {
    const { id, date } = this.props;
    const { collapsed } = this.state;
    return (
      <TextButton
        style={{ flexDirection: "row", justifyContent: "space-between" }}
        onPress={this._toggleCollapsed}
        textStyle={styles.ticketIdText}
        text={`# ${id}`}
      >
        <View style={{ flexDirection: "row" }}>
          {!collapsed && <TextScaledOnPhone style={styles.ticketDateText}>{date}</TextScaledOnPhone>}
          <Image style={{ marginLeft: 6 }} source={imported.fullSizeIcon} />
        </View>
      </TextButton>
    );
  }
}

// @ts-ignore (db) : leaving my work just in case clinet would require it someday
class SupportTicketsBox extends CollapsableComponent<OptionallyCollapsableProps> {
  public render() {
    const { collapsable } = this.props;
    const { collapsed } = this.state;
    return (
      <View style={collapsable ? styles.boxCollapsedStyle : styles.boxStyle}>
        <BoxTitle
          text={I18n.t("active_support_tickets")}
          collapsable={collapsable}
          onCollapsedToggle={this._toggleCollapsed} />
        {!collapsed &&
          <FlatList
            style={{ overflow: "visible" }}
            keyExtractor={(_item, index) => index.toString()}
            scrollEnabled={false}
            data={[
              // {
              //   id: 12345678, date: "1/12/17",
              //   message: "Power outage at approximately 8:32am on Thursday, January 12, 2017.",
              // },
              // {
              //   id: 87654321, date: "1/12/55",
              //   message: "Power outage at approximately 9:37pm on Thursday, January 12, 2055.",
              // },
            ]}
            ItemSeparatorComponent={() => (<VerticalSpacer height={10} />)}
            renderItem={({ item }) => (<Ticket {...item} initialyCollapsed={collapsable} />)}
          />
        }
      </View>
    );
  }
}

interface OnOffSwitchProps {
  on: boolean;
  onValueChange?: (value: boolean) => void;
}

const OnOffSwitch = (props: OnOffSwitchProps) => {
  const text = (props.on ? I18n.t("on") : I18n.t("off"));
  return (
    <ThemedTextButton
      theme={props.on ? "red" : "grey"}
      text={text}
      onPress={() => {
        if (props.onValueChange) {
          props.onValueChange(!props.on);
        }
      }}
      textStyle={styles.preferenceSwitchText}
      touchableExpand={10}
    />
  );
};

interface PreferenceProps extends OnOffSwitchProps {
  name: string;
}

const Preference = (props: PreferenceProps) => {
  const { name, ...onOffSwitchProps } = props;

  return (
    <View
      style={[{
        height: 50,
        paddingHorizontal: 30,
        paddingVertical: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
      }, styles.preference]}
    >
      <TextScaledOnPhone style={styles.preferenceNameText}>{name}</TextScaledOnPhone>
      <OnOffSwitch {...onOffSwitchProps} />
    </View>
  );
};

class PreferencesBox extends CollapsableComponent<OptionallyCollapsableProps> {
  private subs: Subscription[] = [];

  public componentWillMount() {
    const um = UserModel.instance() as KitchenAidUserModel;

    this.subs = [um.notificationOnRecipeComplete, um.notificationOnTimerComplete, um.notificationOnError].map((v) => {
      return v.skip(1).subscribe(() => {
        this.forceUpdate();
      });
    });
  }

  public componentWillUnmount() {
    this.subs.forEach((v) => {
      v.unsubscribe();
    });
  }

  public render() {
    const { collapsable } = this.props;
    const { collapsed } = this.state;

    const um = UserModel.instance() as KitchenAidUserModel;

    const prefs = [
      {
        label: "notifTimerComplete",
        vb: um.notificationOnTimerComplete,
        handler: (value: boolean) => {
          um.notificationOnTimerComplete.updateValue(value);
        },
      },
      {
        label: "notifRecipeComplete",
        vb: um.notificationOnRecipeComplete,
        handler: (value: boolean) => {
          um.notificationOnRecipeComplete.updateValue(value);
        },
      },
      {
        label: "notifError",
        vb: um.notificationOnError,
        handler: (value: boolean) => {
          um.notificationOnError.updateValue(value);
        },
      },
    ];

    return (
      <View style={collapsable ? styles.boxCollapsedStyle : styles.boxStyle}>
        <BoxTitle text={I18n.t("preferences")} collapsable={collapsable} onCollapsedToggle={this._toggleCollapsed} />
        {
          !collapsed &&
          <FlatList
            style={{ overflow: "visible", marginTop: (collapsable ? 0 : 22) }}
            keyExtractor={(_item, index) => index.toString()}
            scrollEnabled={false}
            data={
              prefs.map((v) => {
                return {
                  name: I18n.t(v.label),
                  on: !!v.vb.sv(),
                  onValueChange: v.handler,
                };
              })
            }
            ItemSeparatorComponent={() => (<VerticalSpacer height={10} />)}
            renderItem={({ item }) => (<Preference {...item} />)}
          />
        }
      </View>
    );
  }
}

interface ButtonViewProps {
  separatorComponent?: React.ComponentType<any> | (() => React.ReactElement<any>) | null;
  paddingHorizontal?: number | string;
  model: CookProcessorModel;
  manualUrl?: string;
  warrantyUrl?: string;
}

interface ButtonViewState {
  isBeingDeleted: boolean;
}

class ButtonView extends Component<ButtonViewProps, ButtonViewState> {
  constructor(props) {
    super(props);

    this.state = {
      isBeingDeleted: false,
    };
  }

  public render() {
    const ph = this.props.paddingHorizontal ? this.props.paddingHorizontal : 0;

    return (
      <FlatList
        style={{
          overflow: "visible", paddingHorizontal: ph,
          paddingBottom: (IS_TABLET ? 0 : QUICK_CHOICE_BAR_HEIGHT + 18),
        }}
        contentContainerStyle={{ alignItems: "stretch" }}
        keyExtractor={(_item, index) => index.toString()}
        scrollEnabled={false}
        data={[
          {
            text: I18n.t("extended_warranty"),
            transparent: false,
            disabled: !this.props.warrantyUrl,
            onPress: () => {
              if (this.props.warrantyUrl) {
                Linking.openURL(this.props.warrantyUrl);
              }
            },
          },
          {
            text: I18n.t("product_manuals"),
            transparent: false,
            disabled: !this.props.manualUrl,
            onPress: () => {
              if (this.props.manualUrl) {
                Linking.openURL(this.props.manualUrl);
              }
            },
          },
          {
            text: this.state.isBeingDeleted ? I18n.t("delete_appliance_progress") : I18n.t("delete_appliance"),
            transparent: true,
            onPress: () => {
              if (this.state.isBeingDeleted) {
                return;
              }

              this.setState({ isBeingDeleted: true });

              DeviceStore.instance.remove(this.props.model)
                .then(() => {
                  const devices = DeviceStore.instance.getDevices();
                  if (devices.length > 0) {
                    DeviceStore.instance.select(devices[0]);
                    this.setState({ isBeingDeleted: false });
                  }
                })
                .catch(() => {
                  this.setState({ isBeingDeleted: false });
                });
            },
          },
        ]}
        ItemSeparatorComponent={this.props.separatorComponent}
        renderItem={({ item }) => {
          if (item.transparent) {
            return (
              <ThemedTextButton
                theme={(item.disabled ? "grey" : "red")}
                disabled={item.disabled}
                centered
                style={{ height: 44 }}
                text={item.text.toUpperCase()}
                onPress={item.onPress}
              />
            );
          } else {
            return (
              <GradientTextButton
                theme={(item.disabled ? "grey" : "red")}
                disabled={item.disabled}
                style={{ height: 44 }}
                text={item.text.toUpperCase()}
                onPress={item.onPress}
              />
            );
          }
        }}
      />
    );
  }
}
