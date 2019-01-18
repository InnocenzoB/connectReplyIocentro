import React, { Component } from "react";
import {
  Modal,
  ModalProperties,
  Platform,
  StyleProp,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
  ViewStyle,
} from "react-native";
import { BlurView } from "react-native-blur";

import { IconButton } from "./Buttons";

const imported = {
  xIcon: require("../../img/icons/searchbarXIconWhite.png"),
};

export interface CloseableBlurredModalProps extends ModalProperties {
  childrenContainerStyle?: StyleProp<ViewStyle>;
  onBackDropPress?: () => void;
}

export class CloseableBlurredModal extends Component<CloseableBlurredModalProps> {
  public render() {
    const {
      children,
      childrenContainerStyle,
      onBackDropPress,
      ...modalProps,
    } = this.props;

    const blur = (Platform.OS == "android") ?
      <View
        style={[{
          backgroundColor: "rgba(0,0,0,0.8)",
        }, StyleSheet.absoluteFillObject]}
      />
      :
      <BlurView
        blurType={"dark"}
        blurAmount={8}
        style={StyleSheet.absoluteFill}
      />;

    return (
      <Modal
        transparent={true}
        animationType={"fade"}
        {...modalProps}
      >
        {blur}
        <TouchableWithoutFeedback onPress={onBackDropPress} style={StyleSheet.absoluteFill}>
          <View style={[{ flex: 1, padding: 20 }, childrenContainerStyle]}>
            <IconButton
              style={{
                position: "absolute",
                top: 20, right: 20,
              }}
              onPress={modalProps.onRequestClose}
              iconStyle={{ width: 25, height: 25 }}
              icon={imported.xIcon}
            />
            {children}
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    );
  }
}
