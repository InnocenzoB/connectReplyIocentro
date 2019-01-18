import React from "react";
import { StyleSheet, View } from "react-native";

import { PlatformSelect } from "../../Platform";

export const VerticalSpacer = ({ height }) => (<View style={{ height }} />);

const boxStyleCommon = {
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
};

export const styles = StyleSheet.create({
  bar: {
    ...PlatformSelect({
      anyTablet: {
        height: 84,
        paddingTop: 16,
      },
    }),

    backgroundColor: "#f6f6f6",
    shadowColor: "rgba(0, 0, 0, 0.1)",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowRadius: 10,
    shadowOpacity: 1,
  },
  applianceNameText: {
    fontFamily: "Merriweather",
    fontSize: 18,
    fontWeight: "300",
    fontStyle: "italic",
    letterSpacing: 0.75,
    color: "#000000",
  },
  appliancePropertyNameText: {
    fontFamily: "Muli",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1.71,
    color: "#000000",
  },
  appliancePropertiesText: {
    fontFamily: "Muli",
    fontSize: 16,
    letterSpacing: 0,
    color: "#676767",
  },
  boxTitleText: {
    opacity: 0.5,
    fontFamily: "Merriweather",
    fontSize: 18,
    fontWeight: "300",
    fontStyle: "italic",
    letterSpacing: 0.75,
    color: "#000000",
  },
  boxStyle: Object.assign({ padding: 30 }, boxStyleCommon),
  boxCollapsedStyle: Object.assign({ padding: 17 }, boxStyleCommon),
  ticket: {
    padding: 14,

    backgroundColor: "#f6f6f6",
    shadowColor: "rgba(0, 0, 0, 0.21)",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowRadius: 2,
    shadowOpacity: 1,
    borderStyle: "solid",
    borderWidth: 2,
    borderColor: "#f6f6f6",
  },
  ticketDateText: {
    opacity: 0.5,
    fontFamily: "Muli",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 2,
    color: "#000000",
  },
  ticketIdText: {
    fontFamily: "Merriweather",
    fontSize: 14,
    fontWeight: "300",
    fontStyle: "italic",
    color: "#000000",
  },
  ticketMessageText: {
    fontFamily: "Muli",
    fontSize: 12,
    lineHeight: 16,
    color: "#000000",
  },
  preference: {
    opacity: 0.8,
    backgroundColor: "#ffffff",
    shadowColor: "rgba(0, 0, 0, 0.21)",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowRadius: 2,
    shadowOpacity: 1,
    borderStyle: "solid",
    borderWidth: 2,
    borderColor: "#ffffff",
  },
  preferenceNameText: {
    fontFamily: "Muli",
    fontSize: 14,
    color: "#676767",
  },
  preferenceSwitchText: {
    fontSize: 12,
    letterSpacing: 1.71,
  },
  text: {
    lineHeight: 20,
    letterSpacing: 1.57,
  },
});
