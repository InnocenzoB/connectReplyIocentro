import React from "react";
import { ImageBackground, StatusBar } from "react-native";
import { NavigationScreenProps } from "react-navigation";

import { Loading } from "../components/Loading";
import { resetTo } from "../navigation/CommonNavigation";

const backgroundImg = require("../../img/common/woodBackground.png");

export class LogOutScreen extends React.Component<NavigationScreenProps<{}>> {
  public componentWillMount() {
    resetTo("Login", this.props.navigation);
  }
  public render() {
    return (
      <ImageBackground
        style={{width: "100%", height: "100%"}}
        source={backgroundImg}>
        <StatusBar barStyle={"light-content"} translucent={true} backgroundColor="#00000000"/>
        <Loading visible={true}/>
      </ImageBackground>
    );
  }
}
