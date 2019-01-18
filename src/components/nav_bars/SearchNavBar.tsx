import React from "react";

import { SideIconsNavBar } from "./SideIconsNavBar";

const backArrow = require("../../../img/common/backArrow.png");
const navbarAppliancesIcon = require("../../../img/home_screen/navbarAppliancesIcon.png");

interface SearchNavBarProps {
  middleElement?: JSX.Element | null;
  onBackPress: () => void;
  onApplianncePress: () => void;
}

export const SearchNavBar = (props: SearchNavBarProps) => {
  return (
    <SideIconsNavBar
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        position: "absolute",
        top: 0,
        width: "100%",
      }}
      statusBarHidden={false}
      leftIcon={{
        visible: true,
        source: backArrow,
        onPress: props.onBackPress,
      }}
      middleElement={props.middleElement}
      rightIcon={{
        visible: true,
        source: navbarAppliancesIcon,
        onPress: props.onApplianncePress,
      }}
    />
  );
};
