import React, { Component } from "react";
import { ImageBackground, StatusBar } from "react-native";
import { Loading } from "../components/Loading";

const backgroundImg = require("../../img/common/woodBackground.png");

export class LoadingScreen extends Component<{}> {
  public render() {
    return (
    <ImageBackground
      style={{width: "100%", height: "100%"}}
      source={backgroundImg}>
      <StatusBar barStyle={"light-content"} translucent={true} backgroundColor="#00000000" />
      <Loading visible={true} />
    </ImageBackground>
    );
  }
}
