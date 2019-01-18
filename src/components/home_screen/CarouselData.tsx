import { I18n } from "iocentro-apps-common-bits";
import { RecipeModel } from "iocentro-collection-manager";
import React from "react";
import { ImageBackground, StyleSheet, TextStyle, View } from "react-native";

import { Dims, IS_TABLET, PlatformSelect } from "../../Platform";
import { GradientTextButton } from "../Buttons";
import { RecipeCard } from "../RecipeCard";
import { TextScaledOnPhone } from "../ScaledText";

export interface CarouselData {
  item: any;
  onPress: (item: any) => void;
  renderItem: (entry: any, isActive: boolean) => JSX.Element;
}

export class CarouselDataRecipe implements CarouselData {
  public item: any;
  public onPress: (item: any) => void;
  public renderItem = (_: any, isActive: boolean) => {
    if (this.item instanceof RecipeModel) {
      const recipeModel = this.item as RecipeModel;
      return (
        <RecipeCard
          cardDescriptionStyle={styles.descriptionContainer}
          nameTextStyle={styles.nameTextStyle}
          key={recipeModel.id.sv()}
          style={styles.recipe}
          model={recipeModel}
          scaleFactor={0.95}
          onPress={() => { this.onPress(this.item); }}
          blur={!isActive}
        />
      );
    }
    return <View />;
  }

  public constructor(item: any, onPress: (model: any) => void) {
    this.onPress = onPress;
    this.item = item;
  }
}

export class CarouselDataGetStarted implements CarouselData {
  public item: any;
  public onPress: (item: any) => void;
  public renderItem = (entry: any, _: boolean) => {
    const image = IS_TABLET ?
      require("../../../img/noDevicesTile.jpg")
      : require("../../../img/noDevicesTilePhone.jpg");
    return (
      <View key={entry.index.toString()} style={styles.getStarted}>
        <ImageBackground
          style={[{ padding: "8%", justifyContent: "flex-end", alignItems: "flex-end", width: "100%", height: "100%" }]}
          imageStyle={{ resizeMode: "cover" }}
          source={image}
        >
          <View style={{}}>
            <TextScaledOnPhone style={styles.getStartedText}>{I18n.t("GetStarted_AddCard")}</TextScaledOnPhone>
            <GradientTextButton
              theme="red"
              style={styles.getStartedButtonStyle}
              text={I18n.t("AddAppliance_AddCard").toUpperCase()}
              onPress={() => { this.onPress(this.item); }}
            />
          </View>
        </ImageBackground>
      </View>
    );
  }

  public constructor(onPress: () => void) {
    this.onPress = onPress;
    this.item = {};
  }
}

export const cardDims = PlatformSelect({
  anyTablet: {
    width: 438,
    height: 482,
  },
  anyPhone: {
    width: 225,
    height: 247,
  },
});

export const cardDimsScaled = (() => {
  let width: number;
  let height: number;
  if (IS_TABLET) {
    const ratio = cardDims.width / cardDims.height;
    height = Dims.scaleV(cardDims.height);
    width = height * ratio;
  } else {
    const ratio = cardDims.height / cardDims.width;
    width = Dims.scaleH(cardDims.width);
    height = width * ratio;
  }
  return { width, height };
})();

const styles = StyleSheet.create({
  recipe: {
    ...cardDimsScaled,
  },
  descriptionContainer: {
    ...PlatformSelect({
      anyTablet: {
        paddingTop: 13,
        paddingLeft: 19,
        paddingRight: 17,
        paddingBottom: 19,
      },
      anyPhone: {
        paddingTop: 6,
        paddingLeft: 13,
        paddingRight: 7,
        paddingBottom: 9,
      },
    }),
  },
  nameTextStyle: {
    fontSize: 16,
    letterSpacing: 1.23,
  },
  getStarted: {
    ...cardDimsScaled,
    borderRadius: 2,
    shadowColor: "rgba(0, 0, 0, 0.1)",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowRadius: 10,
    shadowOpacity: 1,
    borderStyle: "solid",
    borderWidth: IS_TABLET ? 2 : 1.2,
    borderColor: "#ffffff",
  },
  getStartedText: {
    ...PlatformSelect<TextStyle>({
      anyTablet: {
        fontSize: 20,
        lineHeight: 24,
        letterSpacing: 2,
      },
      anyPhone: {
        fontSize: 16,
        lineHeight: 24,
        letterSpacing: 1.6,
        textAlign: "right",
      },
    }),
    fontFamily: "Merriweather",
    fontStyle: "italic",
  },
  getStartedButtonStyle: {
    height: 48,
    ...PlatformSelect({
      anyTablet: {
        width: 180,
        marginTop: 8,
      },
      anyPhone: {
        width: 148,
        marginTop: 6,
      },
    }),
  },
});
