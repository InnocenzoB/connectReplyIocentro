import React, { Component } from "react";
import {
  EmitterSubscription,
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
const backImg = require("../../../img/common/backArrow.png");

interface RegisterPageProps {
  headerMessage?: string;
  loading?: boolean;
  hideDish?: boolean;
  backArrow?: boolean;
  style?: StyleProp<ViewStyle>;
  onBackArrowPress?: () => void;
  onPress?: () => void;
}

interface RegisterPageState {
  headerVisible?: boolean;
}

export class RegisterPage extends Component<RegisterPageProps, RegisterPageState> {
  constructor(props: RegisterPageProps) {
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

        <View
          style={[
            styles.container,
            this.props.style,
          ]}>

          {IS_TABLET ? this.renderTablet() : this.renderPhone()}
          {this.state.headerVisible &&
            <LoginHr />
          }
          {this.props.children}

        </View>
      </ImageBackground>
    );
  }

  private renderTablet = () => {
    return (
      <View style={{ flexDirection: "row", justifyContent: "space-between", width: "100%" }}>
        {this.props.backArrow &&
          <IconButton
            style={styles.backButton}
            onPress={this.props.onBackArrowPress}
            icon={backImg}
          />
        }
        {this.state.headerVisible &&
          <Header
            message={this.props.headerMessage}
          />
        }
        {this.props.backArrow &&
          <View style={styles.backButton} />
        }
      </View>
    );
  }

  private renderPhone = () => {
    return (
      <View style={{
        flexDirection: "column", justifyContent: "space-between", width: "100%",
      }}>
        {this.props.backArrow &&
          <IconButton
            style={styles.backButton}
            onPress={this.props.onBackArrowPress}
            icon={backImg}
          />
        }
        {this.state.headerVisible &&
          <Header
            message={this.props.headerMessage}
            style={{ marginTop: 0, paddingHorizontal: 30 }}
          />
        }
      </View>
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
    height: 30,
    width: 50,
  },
});
