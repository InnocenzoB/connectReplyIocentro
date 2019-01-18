import { I18n } from "iocentro-apps-common-bits";
import React, { Component } from "react";
import { FlatList, StyleProp, StyleSheet, View, ViewStyle } from "react-native";

import { CloseableBlurredModal } from "../components/CloseableBlurredModal";
import { VerticalSpacer } from "../components/dashboard/Common";
import { IS_TABLET } from "../Platform";
import { TextButton } from "./Buttons";
import { TextScaledOnPhone } from "./ScaledText";

export interface OptionsViewProps {
  allOptions: string[];
  currentChoice?: string | number; // option | index
  onCurrentChoiceChange: (currentChoice?: string, index?: number) => void;
  optionsName: string;
  style?: StyleProp<ViewStyle>;
}

interface OptionsViewState {
  editing: boolean;
}

const ALL_OPTION = () => {
  return I18n.t("all").toLowerCase();
};

/**
 * Component for choosing some option from allOptions.
 *
 * Used e.g. for sorting and filtering options setting.
 */
export class OptionsView extends Component<OptionsViewProps, OptionsViewState> {
  public state = {
    editing: false,
  };

  public render() {
    const {
      style,
      optionsName,
      allOptions,
      currentChoice,
      onCurrentChoiceChange,
    } = this.props;
    let currentChoiceText: string;
    if (typeof currentChoice == "number") {
      currentChoiceText = allOptions[currentChoice];
    } else if (typeof currentChoice == "string") {
      currentChoiceText = currentChoice;
    } else {
      currentChoiceText = ALL_OPTION();
    }
    return (
      <View
        style={[{
          justifyContent: "space-between",
        }, style]}
      >
        <CloseableBlurredModal
          visible={this.state.editing}
          onRequestClose={this.endEditing}
          childrenContainerStyle={{
            justifyContent: "center",
            alignItems: "center",
          }}
          onBackDropPress={IS_TABLET ? this.endEditing : undefined}
        >
          <FlatList
            contentContainerStyle={{
              flex: 1,
              justifyContent: "center",
            }}
            scrollEnabled={false}
            data={[ALL_OPTION()].concat(...allOptions)}
            keyExtractor={(item, index) => item + index}
            ItemSeparatorComponent={() => (<VerticalSpacer height={25} />)}
            renderItem={({ item, index }) => {
              let isCurrent = false;
              if (typeof currentChoice == "number") {
                isCurrent = index == (currentChoice + 1 /*ALL_OPTION unshifted*/);
              } else if (typeof currentChoice == "string") {
                isCurrent = item == currentChoice;
              } else {
                isCurrent = item == ALL_OPTION();
              }
              return (
                <TextButton
                  onPress={() => {
                    if (item == ALL_OPTION()) {
                      onCurrentChoiceChange();
                    } else {
                      onCurrentChoiceChange(item, index - 1 /*ALL_OPTION unshifted*/);
                    }
                    this.endEditing();
                  }}
                  textStyle={[
                      styles.optionText,
                      isCurrent && { fontWeight: "bold" },
                      // (db): fontWeight seems not to work, so I am applying opacity to non-current
                      !isCurrent && { opacity: 0.7 },
                    ]}
                  text={item}
                />
              );
            }}
          />
        </CloseableBlurredModal>
        <TextButton
          onPress={this.beginEditing}
          textStyle={styles.currentChoiceText}
          text={currentChoiceText}
        />
        <TextScaledOnPhone style={styles.optionsNameText}>{optionsName}</TextScaledOnPhone>
      </View>
    );
  }

  private beginEditing = () => this.setState({ editing: true });

  private endEditing = () => this.setState({ editing: false });
}

export interface MultiOptionsViewProps {
  options: OptionsViewProps[];
  style?: StyleProp<ViewStyle>;
}

export const MultiOptionsView = ({ options, style }: MultiOptionsViewProps) => (
  <View style={style}>
    {options.map((optionProps, index) => (
      <OptionsView {...optionProps} key={index} />
    ))}
  </View>
);

const styles = StyleSheet.create({
  currentChoiceText: {
    fontFamily: "Merriweather",
    fontSize: 23,
    fontWeight: "300",
    color: "#ffffff",
  },
  optionsNameText: {
    opacity: 0.5,
    fontFamily: "Muli",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 2,
    color: "#ffffff",
  },
  optionText: {
    minWidth: 100,

    fontFamily: "Merriweather",
    fontSize: 20,
    fontWeight: "300",
    fontStyle: "normal",
    letterSpacing: 0,
    textAlign: "center",
    color: "#ffffff",
  },
});
