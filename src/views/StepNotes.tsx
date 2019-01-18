import { I18n } from "iocentro-apps-common-bits";
import { NoteModel, RecipeModel } from "iocentro-collection-manager";
import React, { Component } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import { NAV_BAR_PHONE_HEIGHT } from "../components/nav_bars/NavBarBase";
import { PaperView } from "../components/Paper";
import { StepData, StepDescription } from "../components/steps_screen/Footer";
import { UserInputEditor } from "../components/UserInputEditor";
import { NoteBox } from "./GlobalNotes";

interface NotesData {
  notes: NoteModel[];
}

interface StepNotesProps extends NotesData, StepData {
  stepIndex: number;
  onAddNote: (text: string) => void;
}

export class StepNotes extends Component<StepNotesProps> {
  private _renderNotes() {
    const renderedNotes = this.props.notes.reverse().map((note, index) => {
      return (
        <NoteBox
          recipe={this.props.recipe}
          key={index}
          displayTitle={false}
          note={note}
          style={{ marginVertical: 5 }}
        />
      );
    });

    return <View>{renderedNotes}</View>;
  }

  public render() {
    return (
      <View style={{ backgroundColor: "transparent", paddingBottom: 22 }}>
        <PaperView
          outerStyle={{ borderRadius: 0, flex: undefined }}
          innerStyle={{
            width: "100%",
            paddingTop: NAV_BAR_PHONE_HEIGHT,
            paddingBottom: 30,
            overflow: "hidden",
            flex: undefined
          }}
        >
          <ScrollView
            keyboardShouldPersistTaps="always"
            style={{ overflow: "visible", marginHorizontal: 11 }}
          >
            <StepDescription
              step={this.props.currentStepModel}
              style={{
                marginLeft: 22,
                marginRight: 12,
                marginBottom: 12,
                marginTop: 20
              }}
            />
            <UserInputEditor
              tapToEdit
              style={styles.noteEditor}
              notEditingInputProps={{
                placeholder: I18n.t("tap_to_add_notes"),
                style: [styles.noteEditorPlaceholderFont, styles.noteEditorText]
              }}
              userInputProps={{
                autoCapitalize: "sentences",
                multiline: true,
                placeholder: I18n.t("add_note_to_your_recipe"),
                style: [styles.noteEditorInputFont, styles.noteEditorText]
              }}
              clearOnSave
              onSave={({ text }) => this.props.onAddNote(text)}
              cancelSaveButtonsOffset={40}
            />
            {this._renderNotes()}
          </ScrollView>
        </PaperView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  noteEditor: {
    padding: 12,
    marginVertical: 5,

    borderRadius: 2,
    backgroundColor: "#ffffff",
    shadowColor: "rgba(0, 0, 0, 0.1)",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowRadius: 10,
    shadowOpacity: 1,
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#d8d8d8"
  },
  noteEditorText: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    maxHeight: 120,

    borderRadius: 4,
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#d8d8d8"
  },
  noteEditorPlaceholderFont: {
    fontFamily: "Muli",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 2,
    color: "#d8d8d8"
  },
  noteEditorInputFont: {
    fontFamily: "Muli",
    fontSize: 13,
    fontStyle: "italic",
    lineHeight: 17,
    color: "#000000"
  }
});
