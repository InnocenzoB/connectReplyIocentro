import { I18n } from "iocentro-apps-common-bits";
import React, { Component } from "react";
import { ScrollView, StyleProp, StyleSheet, View, ViewStyle } from "react-native";

import { IS_TABLET } from "../../Platform";
import { IconButton, ThemedTextButton } from "../Buttons";
import { VerticalSpacer } from "../dashboard/Common";
import { Titles } from "../nav_bars/TitleNavBar";
import { PaperView } from "../Paper";
import { QUICK_CHOICE_BAR_HEIGHT } from "../QuickChoiceBottomBar";

const modalBackArrow = require("../../../img/common/modalBackArrow.png");
const modalCloseIcon = require("../../../img/common/modalCloseIcon.png");

export enum MyAccountTemplateType {
  Close = "close",
  SaveCancel = "savecancel",
  Back = "back",
  None = "none",
}

export interface MyAccountTemplateProps {
  type: MyAccountTemplateType;
  header1?: string;
  header2?: string;
  onBackClose?: () => void;
  onSave?: () => void;
  onCancel?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
  scroll?: boolean;
}

export class MyAccountTemplate extends Component<MyAccountTemplateProps, {}> {

  private _renderHederLeft() {
    switch (this.props.type) {
      case MyAccountTemplateType.Close:
        return (
          <IconButton
            onPress={this.props.onBackClose}
            style={styles.icon}
            icon={modalCloseIcon}
          />
        );
      case MyAccountTemplateType.SaveCancel:
        return (
          <ThemedTextButton
            theme="red"
            textStyle={{ fontWeight: undefined }}
            onPress={this.props.onCancel}
            style={{ padding: 10 }}
            text={I18n.t("cancel").toUpperCase()}
          />
        );
      case MyAccountTemplateType.Back:
        return (
          <IconButton
            onPress={this.props.onBackClose}
            style={styles.icon}
            icon={modalBackArrow}
          />
        );
      case MyAccountTemplateType.None: return null;
    }
    return {};
  }

  private _renderHeaderRight() {
    if (this.props.type == MyAccountTemplateType.SaveCancel) {
      return (
        <ThemedTextButton
          theme="red"
          onPress={this.props.onSave} style={{ padding: 10 }}
          text={I18n.t("save").toUpperCase()}
        />
      );
    } else if (this.props.type == MyAccountTemplateType.Back) {
      return (
        <View style={styles.icon} />
      );
    } else {
      return null;
    }
  }

  private _renderTitle(t1?: string, t2: string = "") {
    return (
      <Titles
        title1={t1}
        title2={t2}
        textColor="#000000"
      />
    );
  }
  private renderIf = (condition, contentA, contentB) => {
    if (condition) {
      return contentA;
    } else {
      return contentB;
    }
  }
  private _renderHeader = () => {
    return (
      <View style={styles.header}>
        <View style={{ width: IS_TABLET ? 150 : undefined, alignItems: "flex-start" }}>
          {this._renderHederLeft()}
        </View>
        {this._renderTitle(this.props.header1, this.props.header2)}
        <View style={{ width: IS_TABLET ? 150 : undefined, alignItems: "flex-end" }}>
          {this._renderHeaderRight()}
        </View>
      </View>
    );
  }
  public render() {
    return (
      <View style={styles.main}>
        <PaperView>
          {this._renderHeader()}
          {this.renderIf(
            this.props.scroll,
            <ScrollView
              showsVerticalScrollIndicator={false}
              style={[
                styles.container,
                this.props.containerStyle,
              ]}>
              {this.props.children}
              {!IS_TABLET && <VerticalSpacer height={QUICK_CHOICE_BAR_HEIGHT} />}
            </ScrollView>,
            <View style={[styles.container, this.props.containerStyle]}>
              {this.props.children}
            </View>)
          }
        </PaperView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  main: {
    width: 720,
    maxWidth: "100%",
    height: IS_TABLET ? 495 : "100%",
    borderRadius: 6,
    backgroundColor: "transparent",
    shadowColor: "rgba(0, 0, 0, 0.18)",
    overflow: "hidden",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowRadius: 14,
    shadowOpacity: 1,
  },
  header: {
    height: 64,
    backgroundColor: "#F6F6F6",
    shadowColor: "rgba(0, 0, 0, 0.1)",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowRadius: 10,
    shadowOpacity: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  icon: {
    height: "100%",
    width: 50,
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
  },
  container: {
    marginLeft: 19,
    marginRight: 19,
    marginBottom: IS_TABLET ? 28 : 0,
    marginTop: 28,
    flex: 1,
  },
});
