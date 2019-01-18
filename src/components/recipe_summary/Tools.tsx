import { I18n } from "iocentro-apps-common-bits";
import React, { Component } from "react";
import { Image, StyleProp, StyleSheet, View, ViewStyle } from "react-native";

import { TextScaledOnPhone } from "../ScaledText";
import { TouchableScale } from "../TouchableScale";
import { ApplianceData, ApplianceDataWithName, ApplianceModal } from "./ApplianceModal";
import { Line } from "./Line";
import { TitleGrey } from "./Titles";

interface ToolData {
  name: string;
  applianceData?: ApplianceData;
  id: string;
  // TODO image
}

interface ToolsProps {
  style?: StyleProp<ViewStyle>;
  data: ToolData[];
}

export class Tools extends Component<ToolsProps, {}> {
  public render() {
    return (
      <View style={this.props.style}>
        <TitleGrey text={I18n.t("suggested_tools")} />
        <Line />
        <ToolsList data={this.props.data} />
      </View>
    );
  }
}

interface ToolsListProps {
  data: ToolData[];
}

interface ToolsListState {
  applianceModalVisible: boolean;
  applianceModalData: ApplianceDataWithName;
}

class ToolsList extends Component<ToolsListProps, ToolsListState> {
  constructor(props) {
    super(props);

    this.state = {
      applianceModalVisible: false,
      applianceModalData: {
        name: "",
        description: "",
      },
    };
  }

  public render() {
    const props = this.props;

    return (
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
        }}>
        <ApplianceModal
          isVisible={this.state.applianceModalVisible}
          applianceData={this.state.applianceModalData}
          onClose={() => this.setState({ applianceModalVisible: false })}
        />
        {props.data.map((item, index) => {
          return (
            <TouchableScale
              key={index.toString()}
              onPress={() => {
                if (item.applianceData) {
                  this.setState({
                    applianceModalVisible: true,
                    applianceModalData: {
                      name: item.name,
                      ...item.applianceData,
                    },
                  });
                }
              }}
              style={{
                width: 93,
                height: 93,
                alignItems: "center",
                justifyContent: "flex-start",
              }}>
                <View style={{
                  width: 50,
                  height: 50,
                }}>
                  <Image
                    source={this._getImage(item.id)}
                    resizeMode={"center"}
                    style={{
                      width: 50,
                      height: 50,
                    }} />

                    <TextScaledOnPhone style={styles.font}>{item.name}</TextScaledOnPhone>
                </View>
            </TouchableScale>
            );
        })
        }
      </View>
    );
  }

  private _getImage = (id: string): any => {
    // staging
    switch (id) {
      case "d26d035789369f6c15be": return require("../../../img/tools/70RecipeOverviewAllSuggestedTools.png");
      case "231c5d1e297d6c586357": return require("../../../img/tools/group.png");
      case "e9ef209c1c3dd020af8e": return require("../../../img/tools/group3.png");
      case "4c61ea8dc61a085d0de1": return require("../../../img/tools/group19.png");
      case "7cd9c0e396a3f12c145d": return require("../../../img/tools/group20.png");
      case "bd602b3d669e03d97bb8": return require("../../../img/tools/group21.png");
      case "69c3ea7be8daa8376720": return require("../../../img/tools/group22.png");
      case "1a54705800d23f195bdc": return require("../../../img/tools/group23.png");
      case "fb229513a841971706b8": return require("../../../img/tools/group25.png");
      case "e3fa359dae2fa0a11ce5": return require("../../../img/tools/group26.png");
      case "8d9c3f2c4d73cfe4b357": return require("../../../img/tools/group28.png");
      case "6e315fd04e435f612d36": return require("../../../img/tools/group29.png");
      case "d68430b71796ea06120c": return require("../../../img/tools/group12.png");

      case "Upper Steamer Basket": return require("../../../img/tools/group31.png");
      // production
      case "70bd421b418c9906dcb4": return require("../../../img/tools/group3.png");
      case "7055d197c5a943cc45a9": return require("../../../img/tools/group.png");
      case "d23e1279311ff57373c7": return require("../../../img/tools/group23.png");
      case "3af9b2d2172a15654f77": return require("../../../img/tools/group20.png");
      case "700c20c84fa5142bc1f8": return require("../../../img/tools/group19.png");
      case "d8cf4c0f466ab40a57b3": return require("../../../img/tools/70RecipeOverviewAllSuggestedTools.png");
      case "f2ac7eb4075973a30f71": return require("../../../img/tools/group21.png");
      case "80415a37e0921ee14f67": return require("../../../img/tools/group22.png");
      case "753e93b314ab41db2ad5": return require("../../../img/tools/group25.png");
      case "a877aeaff53740ad8cdc": return require("../../../img/tools/group26.png");
      case "f1dc4d1a499d056f115c": return require("../../../img/tools/group28.png");
      case "561debc58f48c7ac4d64": return require("../../../img/tools/group29.png");
      case "3ad7b27c7e74ac37db9e": return require("../../../img/tools/group12.png");

      case "Upper Steamer Basket": return require("../../../img/tools/group31.png");
      default: return null;
    }
  }
}

const styles = StyleSheet.create({
  font: {
    fontFamily: "Muli",
    fontSize: 12,
    lineHeight: 13,
    textAlign: "center",
    color: "#000000",
    opacity: 0.5,
    top: 5,
    left: -14,
    width: 79,
  },
});
