import React, { Component } from "react";
import { FlatList, ListRenderItemInfo, StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { I18n } from "iocentro-apps-common-bits";

import { IS_TABLET, PlatformSelect } from "../../Platform";
import { TextScaledOnPhone } from "../ScaledText";
import { TouchableScale } from "../TouchableScale";
import { DropDownAnimated, DropDownArrow } from "./DropDown";
import { Line } from "./Line";
import { TitleGrey } from "./Titles";

interface StepData {
  text: string;
  tip: string | null;
  mode: string;
}

interface DirectionsProps {
  style?: StyleProp<ViewStyle>;
  data: StepData[];
}

interface DirectionsState {
  isCollapsed: boolean;
}

export class Directions extends Component<DirectionsProps, DirectionsState> {
  constructor(props) {
    super(props);

    this.state = {
      isCollapsed: IS_TABLET ? false : true,
    };
  }
  public render() {
    const emptyLine = <TextScaledOnPhone style={styles.stepFont}>{""}</TextScaledOnPhone>;
    const data = this._paragraphData(this.props.data);
    return (
      <View style={this.props.style}>
        <TouchableScale
          disabled={IS_TABLET}
          onPress={this._toggleCollapsed}
          style={{
            flexDirection: "row",
            alignItems: "center",
          }}>
          <TitleGrey text={I18n.t("directions")} />
          {!IS_TABLET && <DropDownArrow isCollapsed={this.state.isCollapsed} />}
        </TouchableScale>
        <Line />
        <DropDownAnimated isCollapsed={this.state.isCollapsed}>
          <FlatList
            data={data}
            renderItem={({ item }: ListRenderItemInfo<StepData>) => (
              <View>
                {item.tip &&
                  <View>
                    <Tip text={item.tip} />
                    {emptyLine}
                  </View>
                }
                <TextScaledOnPhone style={styles.stepFont}>{item.text}</TextScaledOnPhone>
              </View>
            )}
            keyExtractor={(_item, index) => index.toString()}
            ItemSeparatorComponent={() => emptyLine}
          />
        </DropDownAnimated>
      </View>
    );
  }

  private _paragraphData = (data: StepData[]): Array<{ text: string, tip: string | null }> => {
    const paragraphs = new Array<{ text: string, tip: string | null }>();
    for (let i = 0; i < data.length; i++) {
      const paragraph: { text: string, tip: string | null } = { text: data[i].text, tip: data[i].tip };
      while (data[i + 1] && paragraph.tip == null && data[i + 1].mode != "CookProcModeRecipe") {
        i++;
        paragraph.text += " " + data[i].text;
        paragraph.tip = data[i].tip;
      }
      paragraphs.push(paragraph);
    }
    paragraphs.push({ text: "", tip: null });
    return paragraphs;
  }

  private readonly _toggleCollapsed = () => {
    this.setState((prevState) => {
      return {
        isCollapsed: !prevState.isCollapsed,
      };
    });
  }
}

const Tip = (props: { text: string }) => {
  return (
    <View style={styles.tipContainer}>
      <TextScaledOnPhone style={styles.tipFont1}>{I18n.t("tip").toUpperCase()}</TextScaledOnPhone>
      <TextScaledOnPhone style={styles.tipFont2}>{props.text}</TextScaledOnPhone>
    </View>
  );
};

const styles = StyleSheet.create({
  stepFont: {
    ...PlatformSelect({
      anyTablet: {
        fontSize: 18,
        lineHeight: 24,
      },
      anyPhone: {
        fontSize: 12,
        lineHeight: 16,
      },
    }),
    fontFamily: "Muli",
    color: "#000000",
    fontWeight: "normal",
    fontStyle: "normal",
  },
  tipContainer: {
    opacity: 0.4,
  },
  tipFont1: {
    fontFamily: "Muli",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 2,
    color: "#000000",
    marginBottom: 7,
  },
  tipFont2: {
    ...PlatformSelect({
      anyTablet: {
        fontSize: 18,
        lineHeight: 24,
      },
      anyPhone: {
        fontSize: 12,
        lineHeight: 16,
      },
    }),
    fontFamily: "Muli",
    color: "#000000",
  },
});
