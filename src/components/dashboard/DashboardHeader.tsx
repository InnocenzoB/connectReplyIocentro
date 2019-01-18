import React from "react";
import { Image, StyleProp, View, ViewStyle } from "react-native";
import { I18n } from "iocentro-apps-common-bits";

import { IS_TABLET } from "../../Platform";
import { ThemedTextButton } from "../Buttons";
import { TextScaledOnPhone } from "../ScaledText";
import { HorizontalSpacer } from "../steps_screen/Overview";
import { styles } from "./Common";
import { DashboardView } from "./Dashboard";

const imported = {
  remoteEnabledIcon: require("../../../img/icons/remoteEnabledIcon.png"),
};

export interface ViewSwitchingButtonsProps {
  currentView: DashboardView;
  onViewChange: (requestedView: DashboardView) => void;
  style?: StyleProp<ViewStyle>;
}

export interface DasboardHeaderProps extends ViewSwitchingButtonsProps {
  fullPage: boolean;
  applianceName: string;
  style?: StyleProp<ViewStyle>;
}

export const DashboardHeader = (props: DasboardHeaderProps) => {
  const { fullPage, applianceName, style, ...viewSwitchingButtonsProps } = props;
  const remoteEnabled =
    <Image source={imported.remoteEnabledIcon} style={{
      marginLeft: 5,
      marginBottom: 4,
    }} />;

  if (!IS_TABLET) {
    return (
      <View
        style={[{
          flexDirection: "row",
          justifyContent: "space-between",
          marginHorizontal: 20,
        }, style]}
      >
        {/* view with width == remoteEnabled to make space-between justify nicely */}
        <HorizontalSpacer width={22} />
        <ViewSwitchingButtons  {...viewSwitchingButtonsProps} />
        {remoteEnabled}
      </View>
    );
  }

  return (
    <View
      style={[{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
      }, style]}
    >
      <View style={{ flexDirection: "row", alignItems: "flex-end" }}>
        <TextScaledOnPhone numberOfLines={1}
          style={[{
            maxWidth: (fullPage ? undefined : 150),
          }, styles.applianceNameText]}
        >
          {applianceName}
        </TextScaledOnPhone>
        {remoteEnabled}
      </View>
      <ViewSwitchingButtons style={{ marginTop: 4 }}  {...viewSwitchingButtonsProps} />
    </View>
  );
};

const ViewSwitchingButtons = ({ currentView, onViewChange, style }: ViewSwitchingButtonsProps) => (
  <View
    style={[{
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    }, style]}
  >
    <ThemedTextButton
      theme="red"
      style={{
        opacity: currentView == DashboardView.Settings ? 0.5 : undefined,
      }}
      text={I18n.t("control")}
      textStyle={styles.text}
      onPress={() => onViewChange(DashboardView.Appliances)}
      disabled={currentView == DashboardView.Appliances}
    />
    <HorizontalSpacer width={15} />
    <ThemedTextButton
      theme="red"
      style={{
        opacity: currentView == DashboardView.Appliances ? 0.5 : undefined,
      }}
      text={I18n.t("settings")}
      textStyle={styles.text}
      onPress={() => onViewChange(DashboardView.Settings)}
      disabled={currentView == DashboardView.Settings}
    />
  </View>
);
