import React, { Component, ReactNode } from "react";
import { StatusBar, StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import Modal, { ModalProps } from "react-native-modal";

import { PaperView } from "../../components/Paper";
import { VerticalSpacer } from "../dashboard/Common";
import { NAV_BAR_HEIGHT } from "../nav_bars/NavBarBase";
import { TitleNavBar } from "../nav_bars/TitleNavBar";

const imported = {
  closeIcon: require("../../../img/common/modalCloseIcon.png"),
};

export interface PaperModalCommonData {
  title1?: string;
  title2?: string;
}

export interface PaperModalStatelessProps extends Partial<ModalProps>, PaperModalCommonData {
  isVisible: boolean;
  onHideRequest: () => void;
  paperStyle?: StyleProp<ViewStyle>;
  bottomElement?: ReactNode; // element outside paper
  bottomElementOffset?: number;
}

export class PaperModalStateless extends Component<PaperModalStatelessProps> {
  public render() {
    const {
      style,
      title1,
      title2,
      children,
      paperStyle,
      onHideRequest,
      bottomElement,
      bottomElementOffset,
      ...modalProps,
    } = this.props;
    return (
      <Modal
        backdropOpacity={0.7}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        onBackdropPress={onHideRequest}
        style={{ margin: 0 }}
        {...modalProps}
      >
        <View style={[{ flex: 1 }, style]}>
          <StatusBar hidden={true} />
          <TitleNavBar
            title1={title1}
            title2={title2}
            textColor="black"
            style={styles.titleBar}
            rightIcon={{
              source: imported.closeIcon,
              onPress: onHideRequest,
            }}
            titleContainerStyle={{ margin: 10, marginRight: 60 }}
            leftIcon={null}
          />
          <PaperView
            outerStyle={{ flex: 1, borderRadius: 0, borderBottomLeftRadius: 6, borderBottomRightRadius: 6 }}
            innerStyle={paperStyle}
          >
            {children}
          </PaperView>
          <VerticalSpacer height={bottomElementOffset} />
          <View style={{ position: "absolute", bottom: 0, alignSelf: "center" }}>
            {bottomElement}
          </View>
        </View>
      </Modal>
    );
  }
}

const styles = StyleSheet.create({
  titleBar: {
    backgroundColor: "#F6F6F6",
    shadowColor: "rgba(0, 0, 0, 0.1)",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowRadius: 10,
    shadowOpacity: 1,
    zIndex: 1,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    height: undefined,
    minHeight: NAV_BAR_HEIGHT,
  },
});
