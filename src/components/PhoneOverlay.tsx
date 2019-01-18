import React, { ReactNode } from "react";
import Modal from "react-native-modal";

interface PhoneOverlayProps {
  isVisible: boolean;
  onHideRequest?: () => void;
  children?: ReactNode;
}

export const PhoneOverlay = (props: PhoneOverlayProps) => (
  <Modal
    isVisible={props.isVisible}
    backdropOpacity={0.5}
    animationIn="slideInDown"
    animationOut="slideOutUp"
    onBackdropPress={() => props.onHideRequest && props.onHideRequest()}
    style={{
      width: "100%",
      padding: 0,
      margin: 0,
      justifyContent: "flex-start",
    }}
  >
    {props.children}
  </Modal>
);
