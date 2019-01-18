import { I18n } from "iocentro-apps-common-bits";
import { NoteModel,RecipeModel } from "iocentro-collection-manager";
import React from "react";
import { FlatList, ListRenderItemInfo, StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import LinearGradient from "react-native-linear-gradient";

import { noNull } from "../../Utils";
import { StrTitleFromNote } from "../../views/GlobalNotes";
import { ThemedTextButton } from "../Buttons";
import { VerticalSpacer } from "../dashboard/Common";
import { Hr } from "../Hr";
import { TextScaledOnPhone } from "../ScaledText";
import { StepData } from "./Footer";
import { HorizontalSpacer } from "./Overview";

export interface NotesData {
  notes: NoteModel[];
}

interface NotesProps extends StepData,
  NotesData {
  textInputComponent?: JSX.Element;
  onHideNotesPress?: () => void;
}

export const NotesFooter = (props: NotesProps) => {
  const title = noNull(props.currentStepModel.title.sv(), "?");
  const description = noNull(props.currentStepModel.description.sv(), "?");

  return (
    <View style={styles.container}>
      <View style={{ flex: 1, flexDirection: "row" }}>
        <View style={{ flex: 1 }} />
        <View style={{ flex: 3.93, alignItems: "center" }}>
          <Hr />
          <View style={styles.row}>
            <NotesList
              style={styles.columnLeft}
              {...props}
            />
            <View style={styles.columRight}>
              <View style={{ paddingTop: 26, paddingLeft: 26 }}>
                <TextScaledOnPhone style={styles.font1}>
                  {title}
                </TextScaledOnPhone>
                <TextScaledOnPhone style={styles.font2}>{description}</TextScaledOnPhone>
              </View>
            </View>
          </View>
        </View>
        <View style={{ flex: 1 }} />
      </View>
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
          text={I18n.t("hide_notes").toUpperCase()}
          onPress={props.onHideNotesPress}
        />
      </View>

    </View>
  );
};

export interface NotesListProps extends NotesData {
  textInputComponent?: JSX.Element;
  style?: StyleProp<ViewStyle>;
  noteContainerStyle?: StyleProp<ViewStyle>;
  displayTitle?: boolean;
  recipe?: RecipeModel;
}

export const NotesList = (props: NotesListProps) => {

  const DeleteButton = ({ onPress }) => (
   <ThemedTextButton
    theme="red"
    onPress={onPress}
    text={I18n.t("delete").toUpperCase()}
    style={{
     flex: 1,
     alignSelf: "flex-end",
     justifyContent: "flex-end",
     flexDirection: "row"
    }}
   />
  );

  this._deleteNotePressed = item => {
   const recipe = props.recipe;
   const note = item;
   if (note && recipe) {
    recipe.removeNote(note);
   }
  };

  return (
    <View style={props.style}>
      <FlatList
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={props.textInputComponent}
        ItemSeparatorComponent={() => <VerticalSpacer height={19} />}
        contentContainerStyle={{ paddingBottom: 19 }}
        data={props.notes}
        renderItem={({ item }: ListRenderItemInfo<NoteModel>) => {
          const date = noNull(item.date.sv(), new Date());
          const text = item.text.sv() as string | null;
          const title = props.displayTitle && StrTitleFromNote(item);
          if (!date && !text && (props.displayTitle && !title)) { return null; }

          return (
            <View style={props.noteContainerStyle}>
              <View style={styles.noteHeader}>
                {props.displayTitle &&
                  <TextScaledOnPhone
                    style={[styles.listFont1, { opacity: 1, flex: 1 }]}
                    numberOfLines={1}
                  >
                    {title}
                  </TextScaledOnPhone>
                }
                <HorizontalSpacer width={20} />
                <TextScaledOnPhone style={styles.listFont1}>
                  {date.toLocaleDateString()}
                </TextScaledOnPhone>
              </View>
              <Hr style={{ marginVertical: 3, height: 1 }} />
              <DeleteButton
                onPress={() => {
                  this._deleteNotePressed(item);
                }}
              />
              <TextScaledOnPhone style={styles.listFont2}>{text}</TextScaledOnPhone>
            </View>
          );
        }}
        keyExtractor={(_item: NotesData, index: number) => index.toString()}
      />
      <LinearGradient
        style={styles.gradient}
        colors={gradient}
      />
      <LinearGradient
        style={[styles.gradient, { top: 0 }]}
        colors={gradient.slice().reverse()}
      />
    </View>
  );
};

const gradientHeight = 32;
const gradient = [
  "rgba(255, 255, 255, 0)",
  "rgba(255, 255, 255, 0.5)",
  "rgba(255, 255, 255, 0.98)",
];

const styles = StyleSheet.create({
  container: {
    flex: 1.12,
    width: "100%",
    alignItems: "center",
  },
  row: {
    flex: 1,
    flexDirection: "row",
  },
  columnLeft: {
    flex: 1,
    marginHorizontal: 9,
    marginBottom: 15,
  },
  columRight: {
    flex: 1,
  },
  listFont1: {
    opacity: 0.5,
    fontFamily: "Muli",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 2,
    color: "#000000",
  },
  listFont2: {
    fontFamily: "Muli",
    fontSize: 12,
    lineHeight: 16,
    color: "#000000",
  },
  gradient: {
    width: "100%",
    height: gradientHeight,
    position: "absolute",
    bottom: 0,
    backgroundColor: "transparent",
  },
  noteHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  font1: {
    fontFamily: "Muli",
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 2.36,
    color: "#000000",
  },
  font2: {
    marginTop: 12,
    fontFamily: "Muli",
    fontSize: 16,
    lineHeight: 22,
    color: "#000000",
  },
});
