import { I18n } from "iocentro-apps-common-bits";
import React from "react";
import { StyleSheet, View } from "react-native";

import { ThemedTextButton } from "../Buttons";
import { NotesData } from "./NotesFooter";
import { NumberCircle } from "./NumberCircle";

export interface NotesButtonProps extends NotesData {
  onNotesPress?: () => void;
}

export const NotesButton = (props: NotesButtonProps) => {
  return (
    <View
      style={{
        position: "absolute",
        bottom: 20,
        width: "100%",
        justifyContent: "flex-end",
        alignItems: "center",
      }}>
      <ThemedTextButton
        theme="red"
        style={{ flexDirection: "row-reverse", alignItems: "center" }}
        text={I18n.t("notes")}
        onPress={props.onNotesPress}>
        {(!!props.notes) && (!!props.notes.length) && // do not render if undefined or 0
          <NumberCircle
            size={20}
            number={props.notes.length}
            format={OnlyOneDigit}
            style={styles.notesCircle}
            numberStyle={{fontSize: 11}}
          />
        }
      </ThemedTextButton>
    </View>
  );
};

const OnlyOneDigit = (num) => Math.abs(Math.min(num, 9));

const styles = StyleSheet.create({
  notesCircle: {
    marginRight: 9,
  },
});
