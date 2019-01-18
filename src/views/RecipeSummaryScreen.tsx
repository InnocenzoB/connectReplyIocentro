import { DeviceStore, I18n } from "iocentro-apps-common-bits";
import { AccessoryModel, ImageModel, NoteModel, RecipeModel, TimesModel } from "iocentro-collection-manager";
import { ioCentroDispatch, ioCentroEndpoint, ioCentroEndpointParam, ioCentroEndpointType } from "iocentro-connectivity";
import React, { Component, ReactNode } from "react";
import {
  ImageBackground,
  ImageURISource,
  ScrollView,
  StyleSheet,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import { NavigationScreenProps } from "react-navigation";
import { Subscription } from "rxjs";

import { DashboardModal } from "../components/dashboard/Dashboard";
import { Loading } from "../components/Loading";
import { MealPlannerModal } from "../components/meal_planner/MealPlannerModal";
import { NAV_BAR_PHONE_HEIGHT, NavBarBase } from "../components/nav_bars/NavBarBase";
import { SideIconsNavBar } from "../components/nav_bars/SideIconsNavBar";
import { QUICK_CHOICE_BAR_HEIGHT } from "../components/QuickChoiceBottomBar";
import { BackgroundImages, PhoneBackgroundImages } from "../components/recipe_summary/BackgroundImages";
import { Description } from "../components/recipe_summary/Description";
import { FavoriteButton } from "../components/recipe_summary/FavoriteButton";
import { MealPlannerButton } from "../components/recipe_summary/MealPlannerButton";
import {
  CenterBars,
  NotesButton,
  RecipeBar,
  RecipeBarColors,
  RecipeBarMode,
} from "../components/recipe_summary/RecipeBar";
import { RecipeInfoProps } from "../components/recipe_summary/RecipeInfo";
import { RecipeInfoList } from "../components/recipe_summary/RecipeInfoList";
import { RecipeWindow } from "../components/recipe_summary/RecipeWindow";
import { ShoppingList } from "../components/recipe_summary/ShoppingList";
import { Stars } from "../components/recipe_summary/Stars";
import { Tools } from "../components/recipe_summary/Tools";
import { RoundButton, RoundButtonType } from "../components/RoundButton";
import { FontScalingStrategy, ScaledText, TextScaledOnPhone } from "../components/ScaledText";
import { HorizontalSpacer } from "../components/steps_screen/Overview";
import { CookProcessorModel } from "../model/CookProcessorModel";
import { IS_TABLET, PlatformSelect } from "../Platform";
import { getCountryISOCodeForLocale, getUiPresentationValue, noNull } from "../Utils";
import { GlobalNotesParams } from "./GlobalNotes";

const backgroundImg = require("../../img/common/woodBackground.png");
const backArrow = require("../../img/common/backArrow.png");
const navbarAppliancesIcon = require("../../img/home_screen/navbarAppliancesIcon.png");

// interface RecipeInfoData {
//   name: string;
//   value: string;
// }

interface DirectionsData {
  text: string;
  tip: string | null;
  mode: string;
}

interface ToolsData {
  name: string;
  id: string;
}

// interface NutritionData {
//   name: string;
//   value: string;
// }
// export interface SummaryScreenData extends NotesData {
//   name: string;
//   rating: number;
//   image1: ImgSrc;
//   image2: ImgSrc;
//   recipeInfo: RecipeInfoData[];
//   favorite: boolean;
//   ingridients: string[];
//   directions: DirectionsData[];
//   tools: ToolsData[];
//   nutrition: {
//     dataLeft: NutritionData[];
//     dataRight: NutritionData[];
//   };
// }

type RecipeContentData = GlobalNotesParams & { notes: NoteModel[] };

interface RecipeSummaryScreenState {
  // TODO smooth gradient change
  barColor: RecipeBarColors;

  recipe: RecipeModel;
  reipeContentData?: RecipeContentData;
}

export interface RecipeScreenParams {
  recipe: RecipeModel;
}

type RecipeSummaryScreenProps = NavigationScreenProps<RecipeScreenParams>;

export class RecipeSummaryScreen extends Component<RecipeSummaryScreenProps, RecipeSummaryScreenState> {
  constructor(props: RecipeSummaryScreenProps) {
    super(props);

    const params = this.props.navigation.state.params;
    if (params && params.recipe) {
      this.state = {
        barColor: "black",
        recipe: params.recipe,
      };
    } else {
      throw new Error("recipie model is undefined");
    }
  }

  public render() {
    const recipeSummaryContent = (
      <RecipeSummaryContent
        recipe={this.state.recipe}
        onScroll={this._onScroll}
        onCreatePress={this._onCreatePress}
        onNotePress={() => this._onModeChange("notes")}
        onDataUpdate={(reipeContentData) => { this.setState({ reipeContentData }); }}
      />
    );

    return (
      <ImageBackground
        style={styles.background}
        source={backgroundImg}>
        {IS_TABLET ?
          <SideIconsNavBar
            style={{ backgroundColor: "transparent" }}
            leftIcon={{
              visible: true,
              source: backArrow,
              onPress: () => { this.props.navigation.goBack(); },
            }}
            rightIcon={{
              visible: true,
              source: navbarAppliancesIcon,
              onPress: () => { this._dashboardModal && this._dashboardModal.toggle(); },
            }}
          /> :
          <NavBarBase
            middleElement={
              <CenterBars
                mode="summary"
                color="black"
                onStepByStepPress={this._onCreatePress}
                textStyle={{ fontSize: getCountryISOCodeForLocale() == "DE" ? 9 : 11 }}
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
        }
        {IS_TABLET && <DashboardModal ref={(me) => this._dashboardModal = me} navigation={this.props.navigation} />}
        {IS_TABLET ?
          (
            <RecipeWindow>
              <RecipeBar
                isLoading={false}
                mode="summary"
                notesNum={this.state.reipeContentData && this.state.reipeContentData.notes.length}
                color={this.state.reipeContentData ? this.state.barColor : "white"}
                onModeChangeRequest={this._onModeChange}>
                {recipeSummaryContent}
              </RecipeBar>
            </RecipeWindow>
          ) : (
            recipeSummaryContent
          )}
      </ImageBackground>
    );
  }

  private readonly _onScroll = (offset: number) => {
    const newColor: RecipeBarColors = (offset < 330) ? "black" : "white";
    if (this.state.barColor != newColor) {
      this.setState({
        barColor: newColor,
      });
    }
  }

  private readonly _onModeChange = (mode: RecipeBarMode) => {
    if (mode == "notes") {
      if (!this.state.reipeContentData) {
        return;
      }
      this.props.navigation.navigate("GlobalNotes", this.state.reipeContentData);
    } else if (mode == "stepByStep") {
      this._onCreatePress();
    }
  }

  private readonly _onCreatePress = () => {
    const device = DeviceStore.instance.getSelected() as CookProcessorModel | null;
    if (device) {
      device.requestedProgram.updateValue(this.state.recipe.id.sv());
    }

    this.props.navigation.navigate("Steps", { recipe: this.state.recipe });
  }

  private _dashboardModal: DashboardModal | null = null;
}

const CreateButton = (props: { onPress?: () => void, createButtonText?: string }) => {
  return (
    <View style={styles.buttonContainer}>
      <RoundButton
        type={RoundButtonType.Play}
        text={props.createButtonText || I18n.t("start").toUpperCase()}
        onPress={props.onPress}
      />
    </View>
  );
};

export interface RecipeSummaryContentProps {
  recipe: RecipeModel;
  onScroll?: (offset: number) => void;
  onCreatePress?: () => void;
  createButtonText?: string;
  onDataUpdate?: (params: RecipeContentData) => void;

  // Phone
  onNotePress?: () => void; // when not passed note button is not rendered
}

export interface RecipeSummaryContentState {
  title: string;
  rating: number;
  image1: ImageURISource;
  image2: ImageURISource;
  recipeInfo: RecipeInfoProps[];
  favorite: boolean;
  directions: DirectionsData[];
  tools: ToolsData[];
  notes: NoteModel[];
  description: string;

  plannerModalVisible: boolean;
  isLoading: boolean;
}

export class RecipeSummaryContent extends Component<RecipeSummaryContentProps, RecipeSummaryContentState> {
  constructor(props) {
    super(props);

    this.state = {
      title: "",
      rating: 0,
      image1: {},
      image2: {},
      recipeInfo: [],
      favorite: false,
      directions: [],
      tools: [],
      notes: [],
      plannerModalVisible: false,
      isLoading: true,
      description: "",
    };
  }

  private _updateImages() {
    const recipe = this.props.recipe;
    const imageWallpaper = recipe.imageWallpaper.sv() as ImageModel | null;
    const imageIngredients = recipe.imageIngredients.sv() as ImageModel | null;

    const getUri = (image: ImageModel | null) => {
      if (!image) { return; }
      const def = image.default();
      if (!def) { return; }
      const param = new ioCentroEndpointParam(ioCentroEndpointType.getAsset);
      param.setValue(def.link);
      return ioCentroDispatch.uriGen((
        new ioCentroEndpoint(param)).getUri());
    };

    const img1 = getUri(imageIngredients);
    this.setState({
      image1: {
        uri: img1,
      },
    });
    const img2 = getUri(imageWallpaper);
    this.setState({
      image2: {
        uri: img2,
      },
    });
  }

  private readonly _updateData = () => {
    this._updateImages();
    const recipe = this.props.recipe;

    const time = recipe.time.sv() as TimesModel | null;
    let preparation: number | null = null;
    let cooking: number | null = null;
    let total: string = "?";
    if (time) {
      preparation = time.preparation.sv();
      cooking = time.cooking.sv();
      if ((preparation !== null) && (cooking !== null)) {
        total = (preparation + cooking).toString();
      }
    }

    const preparationStr = noNull(preparation, "?");
    const coookingStr = noNull(cooking, "?");
    const complexity: string = getUiPresentationValue(recipe.complexity, "");
    const serves: string = recipe.yield.sv();

    const info = [
      {
        name: I18n.t("prep"),
        value: preparationStr + ` ${I18n.t("min")}`,
      },
      {
        name: I18n.t("cook"),
        value: coookingStr + ` ${I18n.t("min")}`,
      },
      {
        name: I18n.t("total"),
        value: total + ` ${I18n.t("min")}`,
      },
    ];

    if (complexity != "") {
      info.push({
        name: I18n.t("skill"),
        value: complexity.toLowerCase(),
      });
    }

    if (serves) {
      info.push({
        name: I18n.t("serves"),
        value: serves,
      });
    }
    /* BIOT-9861
    const steps = noNull<RecipeStepModel[], RecipeStepModel[]>(recipe.steps.sv(), []);
    const directions = steps.map((step) => {
      return {
        text: noNull(step.description.sv(), ""),
        tip: step.tip.sv() as string | null,
        mode: step.commands.sv()[0].deviceCommandParameterInstances.
          find((v) => v.parameterKey == "Mode").parameterValue,
      };
    }); */
    const accessoriesModels = noNull<AccessoryModel[], AccessoryModel[]>(recipe.accessories.sv(), []);
    const accessories: ToolsData[] = accessoriesModels.map((a) => {
      return {
        name: noNull(a.title.sv(), "?"),
        id: noNull(a.id.sv(), ""),
      };
    });

    this.setState({
      title: noNull(recipe.title.sv(), "?"),
      rating: noNull(recipe.rating.sv(), 0),
      favorite: noNull(recipe.isFavorite.sv(), false),
      recipeInfo: info,
      directions: [],
      tools: accessories,
      notes: noNull(recipe.notes.items.sv(), []),
      description: noNull(recipe.description.sv(), ""),
    }, () => {
      this.props.onDataUpdate && this.props.onDataUpdate({
        favorite: this.state.favorite,
        rating: this.state.rating,
        image1: this.state.image1,
        image2: this.state.image2,
        notes: this.state.notes,
        recipe,
      });
    });
  }

  private _recipeSubscribe: Subscription | undefined;
  private _notesSubscribe: Subscription | undefined;

  public componentWillMount() {
    this._prepareData();
  }

  public componentWillUnmount() {
    if (this._recipeSubscribe) {
      this._recipeSubscribe.unsubscribe();
    }
    if (this._notesSubscribe) {
      this._notesSubscribe.unsubscribe();
    }
  }

  private async _prepareData() {
    const recipe = this.props.recipe;
    try {
      await Promise.all([
        recipe.translateFully(),
        recipe.notesQuery(),
        recipe.getRating(),
      ]);
    } catch (e) {
      if (__DEV__) {
        // tslint:disable-next-line:no-console
        console.log(`Error in _prepareData(): ${e} translateFully or notesQuery: or getRating;`);
      }
    }

    this._recipeSubscribe = recipe.modelChanged.subscribe(this._updateData);
    this._notesSubscribe = recipe.notes.modelChanged.subscribe(this._updateData);
    this._updateData();
    this.setState({ isLoading: false });
  }

  private _renderSummary() {
    return (
      <View>
        <View style={styles.summaryContentContainer}>
          {IS_TABLET ? (
            <View>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}>
                <RecipeInfoList
                  style={styles.recipeInfo}
                  data={this.state.recipeInfo}
                  spaceBetweenItems={IS_TABLET ? 30 : 0}
                />
                <View style={{ flexDirection: "row" }}>
                  <MealPlannerButton
                    onPress={this._onMealPlannerPress}
                  />
                  <HorizontalSpacer width={52} />
                  <FavoriteButton
                    checked={this.state.favorite}
                    onPress={this._onFavoritePress}
                  />
                </View>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}>
                <ShoppingList
                  style={styles.shoppingList}
                  recipe={this.props.recipe}
                />
                <View>
                  <Description text={this.state.description}
                    style={styles.directions} />
                  {/* BIOT-9861 <Directions
                    style={styles.directions}
                    data={this.state.directions}
                  /> */}
                  {(this.state.tools.length > 0) &&
                    <Tools
                      style={styles.tools}
                      data={this.state.tools}
                    />
                  }
                </View>
              </View>
              {/*<ComplimentaryDishes
                // TODO recipies from common category
                data={[this.state.recipe, this.state.recipe, this.state.recipe]}
              />*/}
            </View>
          ) : (
              <View
                style={{
                  paddingHorizontal: 19,
                }}>
                <RecipeInfoList
                  style={styles.recipeInfo}
                  data={this.state.recipeInfo}>
                </RecipeInfoList>
                <ShoppingList
                  style={styles.shoppingList}
                  recipe={this.props.recipe}
                />
                <Description text={this.state.description}
                  style={styles.directions} />
                {/* BIOT-9861 <Directions
                  style={styles.directions}
                  data={this.state.directions}
                /> */}
                {(this.state.tools.length > 0) &&
                  <Tools
                    style={styles.tools}
                    data={this.state.tools}
                  />
                }
                {/*<ComplimentaryDishes
                  // TODO recipies from common category
                  data={[this.state.recipe, this.state.recipe]}
                />*/}
              </View>
            )}
        </View>
      </View>
    );
  }

  private _renderPhone() {
    const { onCreatePress, createButtonText, onNotePress } = this.props;

    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
      >
        <RecipeWindowPhone>
          <PhoneBackgroundImages
            image1={this.state.image1}
            image2={this.state.image2}
          >
            <View style={styles.ratingContainer}>
              <ScaledText
                strategyOrStrategies={(size) => FontScalingStrategy.ScaleDownIfNeeded(size, 2, 13)}
                style={styles.recipeFont}
              >
                {this.state.title}
              </ScaledText>
              <View style={styles.starsContainer}>
                <Stars rating={this.state.rating} />
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
            {onNotePress &&
              <NotesButton
                style={{
                  position: "absolute",
                  top: 9,
                  right: 7,
                }}
                notesNum={this.state.notes.length}
                onNotesPress={onNotePress}
              />
            }
          </PhoneBackgroundImages>
          <View style={styles.childrenContainer}>
            {this._renderSummary()}
          </View>
          <CreateButton onPress={onCreatePress} createButtonText={createButtonText} />
        </RecipeWindowPhone>
      </ScrollView>
    );
  }

  private _renderTablet() {
    const { onScroll, onCreatePress, createButtonText } = this.props;
    return (
      <View>
        <BackgroundImages
          image1={this.state.image1}
          image2={this.state.image2}
        />
        <ScrollView
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={8}
          onScroll={(event) => { event && onScroll && onScroll(event.nativeEvent.contentOffset.y); }}>
          <View style={styles.ratingContainer}>
            <TextScaledOnPhone style={styles.recipeFont}>{this.state.title}</TextScaledOnPhone>
            <View style={styles.starsContainer}>
              <Stars rating={this.state.rating} />
            </View>
          </View>
          <View>
            <View style={styles.childrenContainer}>
              {this._renderSummary()}
            </View>
            <CreateButton onPress={onCreatePress} createButtonText={createButtonText} />
          </View>
        </ScrollView>
      </View>
    );
  }

  private readonly _onMealPlannerPress = () => {
    this.setState({ plannerModalVisible: true });
  }

  private readonly _onFavoritePress = () => {
    if (this.state.favorite) {
      this.setState({ favorite: false }, () => {
        this.props.recipe.removeFromFavorites();
      });
    } else {
      this.setState({ favorite: true }, () => {
        this.props.recipe.markAsFavorite();
      });
    }
  }

  public render() {
    return (
      <View style={{ flex: 1 }}>
        <MealPlannerModal
          recipeToBeAdded={this.props.recipe}
          isVisible={this.state.plannerModalVisible}
          onClose={() => this.setState({ plannerModalVisible: false })}
        />
        <Loading style={{ backgroundColor: "transparent" }} visible={this.state.isLoading} />
        {!this.state.isLoading && (
          IS_TABLET ? this._renderTablet() : this._renderPhone()
        )}
      </View>
    );
  }
}

interface RecipeWindowPhoneProps {
  children?: ReactNode;
}

export const RecipeWindowPhone = ({ children }: RecipeWindowPhoneProps) => {
  return (
    <View
      style={{
        marginTop: 14 + NAV_BAR_PHONE_HEIGHT,
        marginHorizontal: 20,
        marginBottom: QUICK_CHOICE_BAR_HEIGHT + 35,
        backgroundColor: "transparent",
      }}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: "black",
  },
  buttonContainer: {
    ...PlatformSelect<ViewStyle>({
      anyPhone: {
        top: 109,
      },
    }),
    width: "100%",
    alignItems: "center",
    position: "absolute",
  },
  summaryContentContainer: {
    ...PlatformSelect<ViewStyle>({
      anyTablet: {
        marginLeft: 50,
        marginRight: 53,
        marginTop: 27,
        flex: 1,
      },
    }),
  },
  recipeInfo: {
    ...PlatformSelect<ViewStyle>({
      anyPhone: {
        marginTop: 42,
        marginBottom: 32,
        justifyContent: "space-between",
      },
    }),
    flexDirection: "row",
  },
  shoppingList: {
    ...PlatformSelect<ViewStyle>({
      anyTablet: {
        marginTop: 60,
        width: 250,
      },
    }),
  },
  directions: {
    ...PlatformSelect<ViewStyle>({
      anyTablet: {
        marginTop: 60,
        width: 465,
      },
      anyPhone: {
        marginBottom: 20,
      },
    }),
  },
  tools: {
    ...PlatformSelect<ViewStyle>({
      anyTablet: {
        marginVertical: 20,
      },
      anyPhone: {
        marginBottom: 20,
      },
    }),
  },
  nutrition: {
    marginTop: 20,
    width: 465,
  },
  childrenContainer: {
    ...PlatformSelect<ViewStyle>({
      anyTablet: {
        marginTop: 53,
        paddingTop: 35,
      },
    }),
    backgroundColor: "white",
  },
  ratingContainer: {
    ...PlatformSelect<ViewStyle>({
      anyTablet: {
        backgroundColor: "transparent",
        height: 326,
      },
      anyPhone: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
      },
    }),
  },
  starsContainer: {
    ...PlatformSelect<ViewStyle>({
      anyTablet: {
        marginTop: 21,
        alignItems: "center",
      },
    }),
  },
  recipeFont: {
    ...PlatformSelect<TextStyle>({
      anyTablet: {
        marginTop: 159,
        fontSize: 35,
        letterSpacing: 3,
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
});
