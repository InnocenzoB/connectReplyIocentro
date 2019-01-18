import {
  DeviceStore,
  I18n,
} from "iocentro-apps-common-bits";
import { NoteModel, RecipeModel } from "iocentro-collection-manager";
import { ChangeOriginType } from "iocentro-datamodel";
import React, { Component } from "react";
import {
  ImageBackground,
  ImageURISource,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleProp,
  StyleSheet,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import { NavigationScreenProps } from "react-navigation";
import { Subscription } from "rxjs";

import { GradientTextButton } from "../components/Buttons";
import { VerticalSpacer } from "../components/dashboard/Common";
import { DashboardModal } from "../components/dashboard/Dashboard";
import { Hr } from "../components/Hr";
import { MealPlannerModal } from "../components/meal_planner/MealPlannerModal";
import { NavBarBase } from "../components/nav_bars/NavBarBase";
import { SideIconsNavBar } from "../components/nav_bars/SideIconsNavBar";
import { PaperView } from "../components/Paper";
import { QUICK_CHOICE_BAR_HEIGHT } from "../components/QuickChoiceBottomBar";
import { BackgroundImages, PhoneBackgroundImages } from "../components/recipe_summary/BackgroundImages";
import { FavoriteButton } from "../components/recipe_summary/FavoriteButton";
import { MealPlannerButton } from "../components/recipe_summary/MealPlannerButton";
import {
  CenterBars,
  NotesButton,
  RecipeBar,
  RecipeBarColors,
  RecipeBarMode,
} from "../components/recipe_summary/RecipeBar";
import { RecipeInfo } from "../components/recipe_summary/RecipeInfo";
import { RecipeWindow } from "../components/recipe_summary/RecipeWindow";
import { Stars } from "../components/recipe_summary/Stars";
import { FontScalingStrategy, ScaledText, TextScaledOnPhone } from "../components/ScaledText";
import { SearchBar } from "../components/SearchBar";
import { TouchableScale } from "../components/TouchableScale";
import { UserInputData, UserInputEditor } from "../components/UserInputEditor";
import { CookProcessorModel } from "../model/CookProcessorModel";
import { IS_TABLET, PlatformSelect } from "../Platform";
import { noNull } from "../Utils";
import { RecipeWindowPhone } from "./RecipeSummaryScreen";
import { ThemedTextButton } from "../components/Buttons";

const imported = {
  clearSearchBarIcon: require("../../img/icons/searchbarXIcon.png"),
  backgroundImg: require("../../img/common/woodBackground.png"),
  backArrow: require("../../img/common/backArrow.png"),
  navbarAppliancesIcon: require("../../img/home_screen/navbarAppliancesIcon.png"),
};

const SPACE_AROUND_NOTE = 12;

interface GlobalNotesState {
  filter?: string | Date;
  notes: NoteModel[];
  barColor: RecipeBarColors;
  mode: RecipeBarMode;
  noteEdit: boolean;
  noteEditIndex?: number;
  plannerModalVisible: boolean;
  favorite: boolean;
}

export interface GlobalNotesParams {
  recipe: RecipeModel;
  image1?: ImageURISource;
  image2?: ImageURISource;
  rating: number;
  favorite: boolean;
}

type GlobalNotesProps = NavigationScreenProps<GlobalNotesParams>;

export class GlobalNotes extends Component<GlobalNotesProps, GlobalNotesState> {
  private _scrollView: ScrollView | null = null;
  private DashboardModal: DashboardModal | null = null;
  private _recipeSubscribe: Subscription;
  private _params: GlobalNotesParams;

  constructor(props: GlobalNotesProps) {
    super(props);

    let notes: NoteModel[];
    const params = this.props.navigation.state.params;
    if (!params) {
      throw new Error("Undefined params in GlobalNotes");
    }
    this._params = params;
    notes = noNull(this._params.recipe.notes.items.sv(), []);

    this.state = {
      barColor: "black",
      notes,
      mode: "notes",
      noteEdit: false,
      noteEditIndex: undefined,
      plannerModalVisible: false,
      favorite: this._params.favorite,
    };
  }

  private readonly _updateNotes = () => {
    const notes = noNull<NoteModel[]>(this._params.recipe.notes.items.sv(), []);
    this.setState({
      notes,
    }, () => {
      this.forceUpdate();
    });
  }

  private readonly _onScroll = (offset: number) => {
    const newColor: RecipeBarColors = (offset < 154) ? "black" : "white";
    if (this.state.barColor != newColor) {
      this.setState({
        barColor: newColor,
      });
    }
  }

  private readonly _onSearch = (text: string) => {
    // check if text can be converted to number
    // if can conversion to date will be invalid
    const n = Number(text);
    if (isNaN(n)) {
      // try convert to date
      const date = new Date(text);
      if (!isNaN(date.getTime())) {
        // search by time
        this.setState({ filter: date });
        return;
      }
    }
    if (text === "") {
      this.setState({ filter: undefined });
    } else {
      // search by keyword
      this.setState({ filter: text });
    }
  }

  private _renderNotesView() {
    const searchBar = (
      <SearchBar
        autoCapitalize="none"
        autoCorrect={false}
        placeholder={I18n.t("search_by_keyword_or_date")}
        placeholderTextColor="rgba(103, 103, 103, 0.5)"
        touchableExpandSize={10}
        barStyle={styles.notesSearchBar}
        clearIcon={imported.clearSearchBarIcon}
        style={styles.notesSearchBarText}
        onSubmitEditing={(event) => this._onSearch(event.nativeEvent.text)}
        onClear={() => {
          Keyboard.dismiss();
          this.setState({ filter: undefined });
        }}
        onFocus={() => {
          if (IS_TABLET && Platform.OS == "ios") {
            this._scrollToStart();
          }
        }}
      />
    );

    const addNoteButton = (
      <GradientTextButton
        theme="red"
        {...PlatformSelect({
          anyTablet: {
            text: I18n.t("add_note").toUpperCase(),
            style: {
              width: 125, height: 44,
            },
          },
          anyPhone: {
            text: I18n.t("add").toUpperCase(),
            style: {
              width: 84, height: 44,
            },
          },
        })}
        onPress={this._addNotePressed}
      />
    );

    return (
      <PaperView outerStyle={{ borderTopLeftRadius: 0, borderTopRightRadius: 0 }}>
        <View style={styles.notesView}>
          {!IS_TABLET && searchBar}
          <View style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}>
            <RecipeInfo name={I18n.t("sort")} value={I18n.t("by_date")} />
            {IS_TABLET ? searchBar : addNoteButton}
          </View>
        </View>
        <View style={styles.notesContainer}>
          {IS_TABLET &&
            <View
              style={{
                width: 125, height: 44,
                backgroundColor: "transparent",
                position: "absolute",
                right: 44,
                top: -23,
              }}>
              {addNoteButton}
            </View>
          }
          {this._renderNotes()}
        </View>
      </PaperView>
    );
  }

  private readonly _onMealPlannerPress = () => {
    this.setState({ plannerModalVisible: true });
  }

  private readonly _onFavoritePress = () => {
    if (this.state.favorite) {
      this.setState({ favorite: false }, () => {
        this._params.recipe.removeFromFavorites();
      });
    } else {
      this.setState({ favorite: true }, () => {
        this._params.recipe.markAsFavorite();
      });
    }
  }

  private readonly _onStepByStepPress = () => {
    const device = DeviceStore.instance.getSelected() as CookProcessorModel | null;
    const recipe = this._params.recipe;
    if (device) {
      device.requestedProgram.updateValue(recipe.id.sv());
    }

    this.props.navigation.navigate("Steps", { recipe });
  }

  private readonly _notePressed = (index: number) => {
    this._exitNoteEditMode(() => {
      Keyboard.dismiss();
      this.setState({ noteEdit: true, noteEditIndex: index });
    });
  }

  private readonly _addNotePressed = () => {
    this._exitNoteEditMode(() => {
      this.setState({ noteEdit: true });
    });
  }

  private readonly _deleteNotePressed = () => {
    const recipe = this._params.recipe;
    const note = this._getNoteToBeEdited();
    if (note) {
      recipe.removeNote(note);
    }
    this._exitNoteEditMode(this._updateNotes);
  }

  private readonly _saveNotePressed = ({ title, text }: UserInputData) => {
    const recipe = this._params.recipe;
    const note = this._getNoteToBeEdited();

    if (note === undefined) {
      // add global note
      recipe.addNote(title || "", text);
    } else {
      // update existing note
      note.title.updateValue(title || "", ChangeOriginType.model);
      note.text.updateValue(text);
    }

    this._exitNoteEditMode(this._updateNotes);
  }

  private _getFilteredNotes(): NoteModel[] {
    let notes = this.state.notes;
    const filter = this.state.filter;
    if (filter !== undefined) {
      if (filter instanceof Date) {
        notes = notes.filter((note) => {
          const d = note.date.sv();
          if (d instanceof Date) {
            return filter.toLocaleDateString() == d.toLocaleDateString();
          }
          return false;
        });
      } else {
        notes = notes.filter((note) => {
          const title = StrTitleFromNote(note).toLowerCase();
          const f = filter.toLowerCase();
          if (title.includes(f)) { return true; }
          const text = noNull<string>(note.text.sv(), "").toLowerCase();
          return text.includes(f);
        });
      }
    }
    return notes;
  }

  private _scrollToStart(timeout: number = 500) {
    setTimeout(() => {
      this._scrollView && this._scrollView.scrollTo(0);
    }, timeout);
  }

  private _scrollToEnd(timeout: number = 500) {
    setTimeout(() => {
      this._scrollView && this._scrollView.scrollToEnd();
    }, timeout);
  }

  public componentDidUpdate(_prevProps, prevState: GlobalNotesState) {
    if (!prevState.noteEdit && this.state.noteEdit) {
      this._scrollToEnd();
    }
  }

  private _renderNotes() {
    const notes = this._getFilteredNotes();
    const renderedNotes = notes.map((note, index) => {
      return (
        <NoteBox
          key={index}
          style={{ margin: SPACE_AROUND_NOTE }}
          note={note}
          onPress={() => this._notePressed(index)}
        />
      );
    });

    const notesEmpty: boolean = renderedNotes.length == 0;
    const noteToBeEdited = this._getNoteToBeEdited();

    return (
      <View style={{ width: "100%" }}>
        <View
          style={{
            ...PlatformSelect<ViewStyle>({
              anyTablet: {
                flexWrap: "wrap",
                flexDirection: "row",
                alignItems: "baseline", // no stretch to row
              },
            }),
            margin: (notesEmpty ? undefined : -SPACE_AROUND_NOTE),
          }}
        >
          {notesEmpty ?
            <TextScaledOnPhone style={styles.noNotesText}>
              {I18n.t("notes_empty_view")}
            </TextScaledOnPhone>
            :
            renderedNotes}
        </View>
        {this.state.noteEdit &&
          <UserInputEditor
            hasTitle
            style={[{
              padding: (IS_TABLET ? 50 : 20),
              paddingBottom: 25,
              flex: 1,
              marginTop: SPACE_AROUND_NOTE * 2,
              marginBottom: 22,
            }, styles.noteBox]}
            cancelSaveButtonsOffset={22}
            initiallyFocused
            onDelete={noteToBeEdited && this._deleteNotePressed}
            userInputProps={{
              onFocus: () => { this._scrollToEnd(0); },
              style: {
                paddingHorizontal: 15,
                paddingTop: 12,
                paddingBottom: 15,
                minHeight: 71,
                maxHeight: 170,
              },
              placeholder: I18n.t("add_note_to_your_recipe"),
            }}
            titleProps={{
              editable: !IsStepNote(noteToBeEdited),
            }}
            initialTitle={noteToBeEdited && StrTitleFromNote(noteToBeEdited)}
            initialUserText={noteToBeEdited && noteToBeEdited.text.sv()}
            onCancel={this._exitNoteEditMode}
            onSave={this._saveNotePressed}
          />
        }
      </View>
    );
  }

  private _getNoteToBeEdited() {
    if (this.state.noteEditIndex == undefined) { return; }

    return this.state.notes[this.state.noteEditIndex];
  }

  private readonly _exitNoteEditMode = (callback?: () => void) => {
    this.setState({ noteEdit: false, noteEditIndex: undefined }, callback);
  }

  private _renderHeader(data: GlobalNotesParams) {
    return (
      <View>
        <BackgroundImages
          image1={data && data.image1}
          image2={data && data.image2}>
        </BackgroundImages>
        <ScrollView
          keyboardShouldPersistTaps="always"
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={8}
          overScrollMode={"never"}
          alwaysBounceVertical={false}
          bounces={false}
          ref={(instance) => { this._scrollView = instance as ScrollView | null; }}
          onScroll={(event) => { event && this._onScroll(event.nativeEvent.contentOffset.y); }}>
          <View style={styles.ratingContainer}>
            <TextScaledOnPhone style={styles.recipeFont}>
              {noNull(data.recipe.title.sv(), "?")}
            </TextScaledOnPhone>
            <View style={styles.starsContainer}>
              <Stars rating={data && data.rating} />
            </View>
          </View>
          <View style={styles.childrenContainer}>
            {this._renderNotesView()}
          </View>
        </ScrollView>
      </View>
    );
  }

  public componentWillMount() {
    this._recipeSubscribe = this._params.recipe.notes.modelChanged.subscribe(this._updateNotes);
  }

  public componentWillUnmount() {
    this._recipeSubscribe.unsubscribe();
  }

  public render() {
    return (
      IS_TABLET ?
        this._renderTabletContent() :
        this._renderPhoneContent()
    );
  }

  private _renderTabletContent() {

    const window = (
      <RecipeWindow>
        <RecipeBar
          isLoading={false}
          mode="notes"
          notesNum={this.state.notes.length}
          color={this.state.barColor}
          onModeChangeRequest={this._onModeChange}
        >
          {this._renderHeader(this._params)}
        </RecipeBar>
      </RecipeWindow>
    );

    return (
      <ImageBackground
        style={styles.background}
        source={imported.backgroundImg}>
        <SideIconsNavBar
          style={{ backgroundColor: "transparent" }}
          leftIcon={{
            visible: true,
            source: imported.backArrow,
            onPress: () => { this.props.navigation.goBack(); },
          }}
          rightIcon={{
            visible: true,
            source: imported.navbarAppliancesIcon,
            onPress: () => { this.DashboardModal && this.DashboardModal.toggle(); },
          }}
        />
        <DashboardModal ref={(me) => this.DashboardModal = me} navigation={this.props.navigation} />
        {/* TODO searchbar is sometimes hidden when pressed while beeing on top of view */}
        {Platform.OS == "ios" ? (
          <KeyboardAvoidingView
            contentContainerStyle={{ width: "100%", height: "100%" }}
            behavior="position"
            keyboardVerticalOffset={-125}>
            {window}
          </KeyboardAvoidingView>
        ) : window
        }
      </ImageBackground>
    );
  }

  private _renderPhoneContent() {
    const params = this._params;

    return (
      <ImageBackground
        style={styles.background}
        source={imported.backgroundImg}>
        <NavBarBase
          middleElement={
            <CenterBars
              mode="notes"
              color="black"
              onSummaryPress={() => this.props.navigation.goBack()}
              onStepByStepPress={this._onStepByStepPress}
            />
          }
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            zIndex: 1,
            position: "absolute",
            top: 0,
            width: "100%",
          }}
        />
        <MealPlannerModal
          recipeToBeAdded={params.recipe}
          isVisible={this.state.plannerModalVisible}
          onClose={() => this.setState({ plannerModalVisible: false })}
        />
        {this._renderPhoneWindow()}
      </ImageBackground>
    );
  }

  private _renderPhoneWindow() {
    const params = this._params;

    const scrollable = (
      <ScrollView
        ref={(instance) => { this._scrollView = instance as ScrollView | null; }}
        keyboardShouldPersistTaps="always"
        showsVerticalScrollIndicator={false}>
        <RecipeWindowPhone>
          <PhoneBackgroundImages
            image1={params.image1}
            image2={params.image2}
          >
            <View style={styles.ratingContainer}>
              <ScaledText
                strategyOrStrategies={(size) => FontScalingStrategy.ScaleDownIfNeeded(size, 2, 13)}
                style={styles.recipeFont}
              >
                {noNull(params.recipe.title.sv(), "?")}
              </ScaledText>
              <View style={styles.starsContainer}>
                <Stars rating={params.rating} />
              </View>
            </View>
            <View
              style={{
                position: "absolute",
                top: 10,
                flexDirection: "row",
              }}>
              <View style={{ width: 15 }} />
              <MealPlannerButton
                color="white"
                onPress={this._onMealPlannerPress}
              />
              <View style={{ width: 15 }} />
              <FavoriteButton
                color="white"
                checked={this.state.favorite}
                onPress={this._onFavoritePress}
              />
            </View>
            <NotesButton
              color="white"
              style={{
                position: "absolute",
                top: 9,
                right: 7,
              }}
              notesNum={this.state.notes.length}
            />
          </PhoneBackgroundImages>
          {this._renderNotesView()}
        </RecipeWindowPhone>
      </ScrollView>
    );

    if (Platform.OS == "ios") {
      return (
        <KeyboardAvoidingView
          contentContainerStyle={{ width: "100%", height: "100%" }}
          behavior="position"
          keyboardVerticalOffset={-QUICK_CHOICE_BAR_HEIGHT}>
          {scrollable}
        </KeyboardAvoidingView>
      );
    } else {
      return scrollable;
    }
  }

  private readonly _onModeChange = (mode: RecipeBarMode) => {
    if (mode == "summary") {
      if (!this.props.navigation.goBack("RecipeSummary")) {
        this.props.navigation.goBack();
      }
    } else if (mode == "stepByStep") {
      this._onStepByStepPress();
    }
  }
}

export interface NoteBoxProps {
  note: NoteModel;
  displayTitle?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  recipe?: RecipeModel;
}

export const NoteBox = (props: NoteBoxProps) => {
  const IS_STEP_NOTE = props && props.recipe ? true : false;
  const note = props.note;
  const text = noNull(note.text.sv(), "");
  const date = noNull(note.date.sv(), new Date()).toLocaleDateString();
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
    <TouchableScale
      style={[{
        ...PlatformSelect({
          anyTablet: {
            width: 250,
            minHeight: 200,
          },
        }),
        padding: 20,
      }, styles.noteBox, props.style]}
      onPress={props.onPress}
      scaleFactor={0.95}
    >
      {(props.displayTitle != false) && <NoteTitle note={note} />}
      <TextScaledOnPhone style={styles.noteDateText}>{date}</TextScaledOnPhone>
      {IS_TABLET ?
        <VerticalSpacer height={8} /> :
        <Hr style={{ marginTop: 9, marginBottom: 6 }} />}
        {IS_STEP_NOTE && <DeleteButton
                onPress={() => {
                  this._deleteNotePressed(note);
                }}
        />}
      <TextScaledOnPhone style={styles.noteContentText}>{text}</TextScaledOnPhone>
    </TouchableScale>
  );
};

const IsStepNote = (note?: NoteModel) => {
  if (note) {
    return typeof note.step.sv() == "number";
  }
  return false;
};

export const StrTitleFromNote = (note: NoteModel) => {
  const step: number | null = note.step.sv();
  if (step === null) {
    return noNull(note.title.sv(), "") as string;
  } else {
    return `${I18n.t("step")} ${(step + 1)}`;
  }
};

// too long note title causes problems with row alignment
// solved with numberOfLines={1}
const NoteTitle = (props: { note: NoteModel }) => (
  <TextScaledOnPhone
    numberOfLines={1}
    style={[PlatformSelect<TextStyle>({
      anyTablet: {
        marginBottom: 32,
        textAlign: "center",
      },
      anyPhone: {
        marginBottom: 13,
      },
    }), styles.noteTitleText]}
  >
    {StrTitleFromNote(props.note) || I18n.t("note")}
  </TextScaledOnPhone>
);

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: "black",
  },
  ratingContainer: PlatformSelect<ViewStyle>({
    anyTablet: {
      backgroundColor: "transparent",
      height: 200,
      alignItems: "center",
      justifyContent: "center",
    },
    anyPhone: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
  }),
  childrenContainer: {
    ...PlatformSelect<ViewStyle>({
      anyTablet: {
        paddingTop: 35,
      },
    }),
    backgroundColor: "white",
  },
  starsContainer: PlatformSelect<ViewStyle>({
    anyTablet: {
      marginTop: 12,
      alignItems: "center",
    },
  }),
  recipeFont: {
    ...PlatformSelect<TextStyle>({
      anyTablet: {
        marginTop: 21,
        fontSize: 35,
        letterSpacing: 3,
        textAlign: "center",
      },
      anyPhone: {
        fontSize: 14,
        letterSpacing: 2.06,
        fontWeight: "900",
      },
    }),
    fontFamily: "Muli",
    color: "#ffffff",
    textAlign: "center",
  },
  notesView: {
    ...PlatformSelect<ViewStyle>({
      anyTablet: {
        paddingTop: 28,
        paddingHorizontal: 50,
        paddingBottom: 40,
      },
      anyPhone: {
        paddingTop: 16,
        paddingHorizontal: 16,
        paddingBottom: 22,
      },
    }),

    backgroundColor: "white",
  },
  notesSearchBar: {
    ...PlatformSelect<ViewStyle>({
      anyTablet: {
        width: 570, height: 38,
        paddingHorizontal: 18,
        borderColor: "#d8d8d8",
        justifyContent: "center",
      },
      anyPhone: {
        width: "100%",
        height: 38,
        justifyContent: "center",
        paddingHorizontal: 12,
        marginBottom: 20,
        borderColor: "rgba(216, 216, 216, 0.5)",
      },
    }),

    borderRadius: 2,
    shadowColor: "rgba(0, 0, 0, 0.1)",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowRadius: 8,
    shadowOpacity: 1,
    borderStyle: "solid",
    borderWidth: 1,
  },
  notesSearchBarText: {
    fontFamily: "Muli",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 2,
    color: "#676767",
  },
  notesContainer: {
    minHeight: 282,
    ...PlatformSelect<ViewStyle>({
      anyTablet: {
        paddingVertical: 39,
        paddingHorizontal: 47,
        alignItems: "flex-end",
      },
      anyPhone: {
        padding: 17,
      },
    }),
  },
  noteTitleText: {
    fontFamily: "Merriweather",
    fontSize: (IS_TABLET ? 24 : 20),
    fontWeight: "300",
    fontStyle: "italic",
    color: "#000000",
  },
  noteBox: {
    backgroundColor: "#ffffff",
    shadowColor: "rgba(0, 0, 0, 0.3)",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowRadius: 4,
    shadowOpacity: 1,
  },
  noteDateText: {
    opacity: 0.5,
    fontFamily: "Muli",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 2,
    color: "#000000",
  },
  noteContentText: {
    fontFamily: "Muli",
    fontSize: 12,
    lineHeight: 16,
    color: "#000000",
  },
  noNotesText: {
    maxWidth: 480,
    backgroundColor: "transparent",
    opacity: 0.75,
    fontFamily: "Merriweather",
    fontSize: 14,
    fontStyle: "italic",
    lineHeight: 22,
    color: "#676767",
  },
});
