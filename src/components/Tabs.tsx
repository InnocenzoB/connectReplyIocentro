import React from "react";
import { StyleSheet, View } from "react-native";

import { getCountryISOCodeForLocale } from "../Utils";
import { GradientTextButton, ThemedTextButton } from "./Buttons";
import { FontScalingStrategy } from "./ScaledText";

interface TabData {
  text: string;
  routeNames: string[];
}

interface TabProps extends TabData {
  onPress: () => void;
  selected: boolean;
}

interface TabsProps {
  tabs?: TabData[];
  navigate: (id: string) => void;
  currentRouteName?: string;
}

const PhoneTab = (props: TabProps) => {
  return (
    <ThemedTextButton
      theme="white"
      onPress={props.onPress}
      disabled={props.selected}
      text={props.text}
      textStyle={{ fontSize: getCountryISOCodeForLocale() == "DE" ? 9 : 11 }}
      style={[
        !props.selected ? { opacity: 0.6 } : {},
        { height: "100%", justifyContent: "flex-end", paddingBottom: 13 },
      ]}
    />
  );
};

export const PhoneTabs = (props: TabsProps) => {
  if (!props.tabs) { return null; }

  return (
    <View style={styles.phoneTabsContainer}>
      {props.tabs.map((tabProps, index) => (
        <PhoneTab
          key={index.toString()}
          onPress={() => props.navigate(tabProps.routeNames[0])}
          selected={!!props.currentRouteName && tabProps.routeNames.includes(props.currentRouteName)}
          {...tabProps}
        />
      ))}
    </View>
  );
};

const TabletTab = (props: TabProps) => {
  return (
    <View style={styles.tabContainer}>
      {props.selected ? (
        <GradientTextButton
          theme="red"
          centered
          style={styles.selectedTab}
          text={props.text}
          textStyle={styles.tabText}
          disabled={true}
        />
      ) : (
          <ThemedTextButton
            theme="white"
            centered
            style={styles.unselectedTab}
            text={props.text}
            textStyle={styles.tabText}
            onPress={props.onPress}
          />
        )}
    </View>
  );
};

export const TabletTabs = (props: TabsProps) => {
  if (!props.tabs) { return null; }

  return (
    <View
      style={styles.tabletTabContainer}>
      {props.tabs.map((tabProps, index) => (
        <TabletTab
          key={index.toString()}
          onPress={() => props.navigate(tabProps.routeNames[0])}
          selected={!!props.currentRouteName && tabProps.routeNames.includes(props.currentRouteName)}
          {...tabProps}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  phoneTabsContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-around",
    flex: 1,
  },
  tabletTabContainer: {
    flexDirection: "row",
    marginTop: -1,
  },
  tabContainer: {
    width: 160,
    height: 58,
    justifyContent: "center",
    alignItems: "center",
  },
  selectedTab: {
    width: 145,
    height: 44,
  },
  unselectedTab: {
    width: 145,
    height: 44,
  },
  tabText: {
    letterSpacing: FontScalingStrategy.ScaleDownIfNeeded(2, 2),
    textAlign: "center",
  },
});
