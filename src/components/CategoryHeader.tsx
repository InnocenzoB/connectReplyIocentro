import React, { Component } from "react";
import { Image, StyleProp, StyleSheet, View, ViewStyle } from "react-native";

import { I18n } from "iocentro-apps-common-bits";
import { IS_TABLET } from "../Platform";
import { ThemedTextButton } from "./Buttons";
import { TextScaledOnPhone } from "./ScaledText";

const seeMoreImg = require("../../img/home_screen/seeMoreArrow.png");

export interface CategoryHeaderData {
  title: string;
  subtitle?: string;
  message?: string;
}

export interface CategoryHeaderProps extends CategoryHeaderData {
  simple: boolean;
  onSeeMorePress?: () => void;
}

export class CategoryHeader extends Component<CategoryHeaderProps, {}> {
  public render() {
    const { simple, ...other } = this.props;
    if (simple) {
      return (
        <SimpleHeader title={other.title} />
      );
    } else {
      return (
        <Header {...other} />
      );
    }
  }
}

export interface SeeMoreProps {
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const SeeMore = (props: SeeMoreProps) => {
  return (
    <ThemedTextButton
      theme="red"
      style={[styles.rowWithCenter, props.style]}
      onPress={props.onPress}
      disabled={!props.onPress}
      text={I18n.t("see_more").toUpperCase()}
    >
      <Image source={seeMoreImg} />
    </ThemedTextButton>
  );
};

interface HeadeProps extends CategoryHeaderData {
  onSeeMorePress?: () => void;
}

const Header = (props: HeadeProps) => {
  return (
    <View
      style={{
        backgroundColor: "transparent",
        marginBottom: 14,
      }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "transparent",
        }}>
        <View style={[styles.rowWithCenter, { opacity: 0.6 }]}>
          <TextScaledOnPhone style={styles.titleFont}>
            {props.title + " "}
          </TextScaledOnPhone>
          <TextScaledOnPhone style={styles.subtitleFont}>
            {props.subtitle && props.subtitle.toUpperCase()}
          </TextScaledOnPhone>
        </View>
        {IS_TABLET && <SeeMore onPress={props.onSeeMorePress} />}
      </View>
      {props.message &&
        <View
          style={{
            marginTop: 6,
            opacity: 0.5,
          }}>
          <TextScaledOnPhone
            style={styles.messageFont}>
            {props.message.toUpperCase()}
          </TextScaledOnPhone>
        </View>
      }
    </View>
  );
};

const styles = StyleSheet.create({
  rowWithCenter: {
    flexDirection: "row",
    alignItems: "center",
  },
  titleFont: {
    fontFamily: "Merriweather",
    fontSize: IS_TABLET ? 24 : 20,
    fontWeight: "300",
    fontStyle: "italic",
    letterSpacing: 1,
    color: "#000000",
  },
  subtitleFont: {
    fontFamily: "Muli",
    fontSize: 19,
    fontWeight: "900",
    letterSpacing: 2.71,
    color: "#000000",
  },
  messageFont: {
    fontFamily: "Muli",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 2,
    color: "#000000",
  },
});

interface SimpleHeaderProps {
  title: string;
}

const SimpleHeader = ({ title }: SimpleHeaderProps) => {
  return (
    <View style={simpleStyles.container}>
      <View style={simpleStyles.textContainer}>
        <TextScaledOnPhone
          style={simpleStyles.font}>
          {title.toUpperCase()}
        </TextScaledOnPhone>
      </View>
      <View style={simpleStyles.line} />
    </View>
  );
};

const simpleStyles = StyleSheet.create({
  container: {
    marginTop: IS_TABLET ? 20 : 0,
    marginBottom: 10,
  },
  textContainer: {
    borderRadius: 4,
    backgroundColor: "transparent",
    shadowColor: "rgba(0, 0, 0, 0.18)",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowRadius: 14,
    shadowOpacity: 1,
  },
  font: {
    fontFamily: "Muli",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 2,
    color: "#000000",
  },
  line: {
    marginTop: 5,
    opacity: 0.1,
    borderStyle: "solid",
    borderWidth: 1, // 2?
    borderColor: "#000000",
  },
});
