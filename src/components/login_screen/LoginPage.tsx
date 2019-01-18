import React, { Component } from "react";
import {
  EmitterSubscription,
  Image,
  ImageBackground,
  Keyboard,
  LayoutAnimation,
  StatusBar,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";

import { Dims, IS_TABLET } from "../../Platform";
import { IconButton } from "../Buttons";
import { Loading } from "../Loading";
import { Header } from "./Header";
import { LoginHr } from "./LoginHr";

const backgroundImg = require("../../../img/common/woodBackground.png");
const dishImage = IS_TABLET ?
  require("../../../img/login_screen/loginDishImage.png") :
  require("../../../img/mobile/dishImage.png");
const backImg = require("../../../img/common/backArrow.png");

interface LoginPageProps {
  headerMessage?: string;
  loading?: boolean;
  hideDish?: boolean;
  backArrow?: boolean;
  style?: StyleProp<ViewStyle>;
  onBackArrowPress?: () => void;
}

interface LoginPageState {
  headerVisible?: boolean;
}

export class LoginPage extends Component<LoginPageProps, LoginPageState> {
  constructor(props: LoginPageProps) {
    super(props);

    this.state = {
      headerVisible: true,
    };
  }

  public componentWillMount() {
    this._keyboardWillShow = Keyboard.addListener("keyboardDidShow", () => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      this.setState({ headerVisible: false });
    });

    this._keyboardWillHide = Keyboard.addListener("keyboardDidHide", () => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      this.setState({ headerVisible: true });
    });
  }

  public componentWillUnmount() {
    this._keyboardWillShow.remove();
    this._keyboardWillHide.remove();
  }

  public render() {
    return (
      <ImageBackground
        style={styles.background}
        source={backgroundImg}>
        <StatusBar barStyle={"light-content"} translucent={true} backgroundColor="#00000000" />
        <Loading visible={!!this.props.loading} />

        {this.props.backArrow &&
          <IconButton
            style={styles.backButton}
            onPress={this.props.onBackArrowPress}
            icon={backImg}
          />
        }

        <View
          style={[
            styles.container,
            this.props.style,
          ]}>

          {this.state.headerVisible &&
            <View
              style={{
                justifyContent: "space-between",
              }}>
              <Header
                message={this.props.headerMessage}
              />
              <LoginHr />
            </View>
          }

          {this.props.children}

          {!this.state.headerVisible &&
            <View style={{ flex: 1 }} />
          }

        </View>

        {!this.props.hideDish &&
          <View style={styles.dishContainer}>
            <Image
              resizeMode="center"
              source={dishImage}
              style={{ maxHeight: (Dims.scaledDimensions.height / 3) }} />
          </View>
        }

      </ImageBackground>
    );
  }

  private _keyboardWillShow: EmitterSubscription;
  private _keyboardWillHide: EmitterSubscription;
}

const styles = StyleSheet.create({
  background: {
    width: "100%",
    height: "100%",
    backgroundColor: "transparent",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  container: {
    flex: 1,
  },
  dishContainer: {
    alignItems: "center",
  },
  backButton: {
    alignSelf: "flex-start",
    marginTop: Dims.scaleV(21),
    marginLeft: Dims.scaleH(10),
  },
});
