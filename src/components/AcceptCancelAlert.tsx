import React, { Component } from "react";
import { StyleSheet, View } from "react-native";
import Modal from "react-native-modal";

import { IS_TABLET, PlatformSelect } from "../Platform";
import { ThemedTextButton } from "./Buttons";
import { ConnectionAnimation } from "./ConnectionAnimation";
import { TextScaledOnPhone } from "./ScaledText";

interface AcceptCancelState {
  visible: boolean;
}

interface AcceptCancelProps {
  isVisible: boolean;
  title?: string;
  text?: string;
  cancelText?: string;
  acceptText?: string;
  width?: number;
  onClose: (result: boolean) => void;
  onModalHide?: () => void;
  asInfoAlert?: boolean;
  showAnimation?: boolean;
}

export class AcceptCancelAlert extends Component<AcceptCancelProps, AcceptCancelState> {
  public static defaultProps: AcceptCancelProps = {
    isVisible: false,
    title: "KitchenAid",
    text: "",
    cancelText: "",
    acceptText: "",
    width: PlatformSelect({ anyTablet: 390, anyPhone: 317 }),
    onClose: () => { },
    onModalHide: () => { },
    asInfoAlert: false,
  };

  constructor(props: AcceptCancelProps) {
    super(props);

    this.state = {
      visible: false,
    };
  }

  public componentWillReceiveProps(nextProps: AcceptCancelProps) {
    this.setState({
      visible: nextProps.isVisible,
    });
  }

  private _renderButtons() {
    return (
      <View style={styles.buttonsContainer}>
        <ThemedTextButton
          theme="red"
          onPress={() => { this.props.onClose(false); }}
          textStyle={styles.cancelText}
          text={this.props.cancelText}
          style={{ paddingTop: 28 }}
          touchableExpand={10}
        />
        <ThemedTextButton
          theme="red"
          onPress={() => { this.props.onClose(true); }}
          textStyle={styles.acceptText}
          text={this.props.acceptText}
          style={{ paddingTop: 28 }}
          touchableExpand={10}
        />
      </View>
    );
  }

  private _renderTitle() {
    return (<TextScaledOnPhone style={styles.title}>{this.props.title}</TextScaledOnPhone>);
  }

  private _renderAnimation() {
    return (<ConnectionAnimation style={{ marginLeft: IS_TABLET ? 30 : 0, marginTop: IS_TABLET ? 0 : 20 }} />);
  }

  private _renderChildrenAndText() {
    return (
      <View style={styles.textConainer}>
        {this.props.children}
        {this.props.text ? <TextScaledOnPhone style={styles.text}>{this.props.text}</TextScaledOnPhone> : null}
      </View>
    );
  }

  private _renderModalContent() {
    return (
      <View style={styles.modalContent}>
        <View
          style={{
            width: this.props.showAnimation ? undefined : this.props.width,
            backgroundColor: "#ffffff",
            padding: 28,
          }}>
          <View style={{
            flexDirection: IS_TABLET ? "row" : "column",
            alignItems: IS_TABLET ? "center" : "flex-start",
          }}>
            {this._renderTitle()}
            {this.props.showAnimation && this._renderAnimation()}
          </View>
          {this._renderChildrenAndText()}
          {this.props.asInfoAlert ? null : this._renderButtons()}
        </View>
      </View>
    );
  }

  public render() {
    return (
      <Modal
        isVisible={this.state.visible}
        backdropOpacity={backdropOpacity}
        onModalHide={this.props.onModalHide}>
        {this._renderModalContent()}
      </Modal>
    );
  }
}

const backdropOpacity = 0.5;

const styles = StyleSheet.create({
  title: {
    fontFamily: "Merriweather",
    fontSize: 23,
    fontWeight: "300",
    fontStyle: "italic",
    textAlign: "left",
    color: "#cb0000",
  },
  textConainer: {
    marginTop: 15,
  },
  text: {
    fontFamily: "Muli",
    fontSize: 14,
    fontStyle: "italic",
    lineHeight: 24,
    color: "#000000",
  },
  buttonsContainer: {
    flexDirection: "row",
    marginTop: 9,
    justifyContent: "space-between",
  },
  modalContent: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 2,
    backgroundColor: "transparent",
    shadowColor: "rgba(0, 0, 0, 0.5)",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowRadius: 14,
    shadowOpacity: 1,
  },
  cancelText: {
    lineHeight: 20,
    letterSpacing: 1.57,
  },
  acceptText: {
    lineHeight: 20,
    letterSpacing: 1.23,
    textAlign: "right",
  },
});
