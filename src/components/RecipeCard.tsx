import { I18n } from "iocentro-apps-common-bits";
import { ImageModel, RecipeModel, TimesModel } from "iocentro-collection-manager";
import { ioCentroDispatch, ioCentroEndpoint, ioCentroEndpointParam, ioCentroEndpointType } from "iocentro-connectivity";
import React, { Component, PureComponent } from "react";
import {
  Animated,
  Image,
  ImageBackground,
  ImageRequireSource,
  ImageURISource,
  StyleProp,
  StyleSheet,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import { Subscription } from "rxjs";

import { IS_TABLET, PlatformSelect } from "../Platform";
import { getUiPresentationValue, noNull } from "../Utils";
import { IconButton } from "./Buttons";
import { TextScaledOnPhone } from "./ScaledText";
import { RectangleInsets } from "./SearchBar";
import { TouchableScale } from "./TouchableScale";

const placeholder = require("../../img/recipes/placeholder.png");
const favUnchecked = require("../../img/recipes/favUnchecked.png");
const favChecked = require("../../img/recipes/favChecked.png");
const ingredientXIcon = require("../../img/icons/ingredientXIcon.png");

interface CardData {
  name: string;
  timeAndDifficulty: string;
  favorite: boolean;
}

interface IconProps {
  iconSource?: ImageURISource | null;
  onIconPress?: () => void;
}

interface CardImageProps {
  id: string;
  source: ImageURISource;
  blur?: boolean;
}

export interface RecipeCardIconProps {
  source?: ImageURISource | null;
  onPress?: (model: RecipeModel) => void;
}

interface CardViewStyle {
  style?: StyleProp<ViewStyle>;
}

interface CardDescriptionStyle {
  cardDescriptionStyle?: StyleProp<ViewStyle>;
  nameTextStyle?: StyleProp<TextStyle>;
}

interface CardDescriptionProps extends CardData, IconProps, CardDescriptionStyle {
  hideInfo?: boolean;
}

interface RecipeCardViewProps extends CardImageProps, CardDescriptionProps, CardViewStyle {
}

interface RecipeCardData extends CardData {
  source: ImageURISource;
}

interface RecipeCardProps extends CardViewStyle, CardDescriptionStyle {
  model: RecipeModel;

  icon?: RecipeCardIconProps;
  scaleFactor?: number;
  blur?: boolean;
  hideInfo?: boolean;

  // if none of onPress is specified, pressing is disabled
  onPress?: (model: RecipeModel) => void;
  onLongPress?: (model: RecipeModel) => void;
}

export class RecipeCard extends PureComponent<RecipeCardProps, RecipeCardData> {
  constructor(props) {
    super(props);

    this.state = {
      name: "",
      timeAndDifficulty: "",
      favorite: false,
      source: {},
    };
  }

  private _modelChanged: Subscription;

  public componentWillMount() {
    this._modelChanged = this.props.model.modelChanged.subscribe(this.updateData);
    this.updateData();
  }

  public componentWillReceiveProps() {
    this.updateData();
  }

  public componentWillUnmount() {
    this._modelChanged.unsubscribe();
  }

  public render() {
    const {
      style,
      cardDescriptionStyle,
      nameTextStyle,
      model,
      icon,
      scaleFactor,
      blur,
      hideInfo,
      onPress,
      onLongPress,
      children,
    } = this.props;

    const {
      name,
      timeAndDifficulty,
      favorite,
      source,
    } = this.state;

    const onIconPress = icon && icon.onPress;

    return (
      <TouchableScale
        scaleFactor={scaleFactor}
        onPress={() => { onPress && onPress(model); }}
        onLongPress={() => { onLongPress && onLongPress(model); }}
        disabled={!(onPress || onLongPress)}>
        <RecipeCardView
          {...{
            style,
            cardDescriptionStyle,
            nameTextStyle,
            blur,
            hideInfo,
            id: noNull<string>(model.id.sv(), ""),
            name,
            timeAndDifficulty,
            favorite,
            source,
          }}
          iconSource={icon && icon.source}
          onIconPress={() => {
            if (icon && onIconPress) {
              onIconPress(model);
            } else {
              if (favorite) {
                model.removeFromFavorites();
              } else {
                model.markAsFavorite();
              }
            }
          }}
        />
        {children}
      </TouchableScale>
    );
  }

  private updateData = () => {
    this.updateUri();
    const model = this.props.model;

    const time = model.time.sv() as TimesModel | null;
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
    const complexity: string = getUiPresentationValue(model.complexity, "");

    this.setState({
      name: noNull<string>(model.title.sv(), "?"),
      timeAndDifficulty: `${I18n.t("x_mins", { value: total })} • ${complexity}`,
      favorite: !!model.isFavorite.sv(),
    });
  }

  private updateUri = () => {
    return new Promise((resolve, reject) => {
      try {
        const model = this.props.model;
        let uri: string | undefined;
        const image = model.imageThumbnail.sv() as ImageModel | null;
        const imgDesc = image && image.default();
        if (imgDesc) {
          const param = new ioCentroEndpointParam(ioCentroEndpointType.getAsset);
          param.setValue(imgDesc.link);
          uri = ioCentroDispatch.uriGen((
            new ioCentroEndpoint(param)).getUri());
        }
        this.setState({ source: { uri } }, () => resolve());
      } catch (e) {
        reject(e);
      }
    });
  }
}

interface RecipeTextCardData {
  name: string;
  time: number | "?";
  complexity: string;
}

export interface RecipeTextCardStyles {
  style?: StyleProp<ViewStyle>;
  textContainerStyle?: StyleProp<ViewStyle>;
  removeIconContainerStyle?: StyleProp<ViewStyle>;
  text?: StyleProp<TextStyle>; // common for both texts
  recipeTitle?: StyleProp<TextStyle>;
  recipeDescription?: StyleProp<TextStyle>;
}

export interface RecipeTextCardProps extends RecipeCardProps, RecipeTextCardStyles {
  onRemove?: () => void;
  styles: RecipeTextCardStyles;
  hideIcon?: boolean;
  removeIconSource?: ImageURISource | ImageRequireSource;
}

export class RecipeTextCard extends PureComponent<RecipeTextCardProps, RecipeTextCardData> {
  public state = {
    name: "",
    time: 0,
    complexity: "",
  };

  private _modelChanged: Subscription;

  public componentWillMount() {
    this._modelChanged = this.props.model.modelChanged
      .subscribe(this._updateData);
    this._updateData();
  }

  public componentWillReceiveProps() {
    this._updateData();
  }

  public render() {
    const { onPress, onLongPress, model } = this.props;
    return (
      <RecipeTextCardView
        {...this.state}
        onPress={onPress ? () => onPress(model) : undefined}
        onLongPress={onLongPress ? () => onLongPress(model) : undefined}
        onRemove={this.props.onRemove}
        styles={this.props.styles}
        hideIcon={this.props.hideIcon}
        removeIconSource={this.props.removeIconSource}
      />
    );
  }

  public componentWillUnmount() {
    this._modelChanged.unsubscribe();
  }

  private _updateData = () => {
    const model = this.props.model;

    const time = model.time.sv() as TimesModel | null;
    let preparation: number | null = null;
    let cooking: number | null = null;
    let total: number | "?" = "?";
    if (time) {
      preparation = time.preparation.sv();
      cooking = time.cooking.sv();
      if ((preparation !== null) && (cooking !== null)) {
        total = preparation + cooking;
      }
    }
    const complexity: string = getUiPresentationValue(model.complexity, "");

    this.setState({
      name: noNull(model.title.sv(), "?"),
      complexity,
      time: total,
    });
  }
}

interface RecipeTextCardViewProps extends RecipeTextCardData {
  // when none of onPress is specified card is not 'pressable'
  onPress?: () => void;
  onLongPress?: () => void;
  onRemove?: () => void;
  styles: RecipeTextCardStyles;
  hideIcon?: boolean;
  removeIconSource?: ImageURISource | ImageRequireSource;
}

const RecipeTextCardView = (props: RecipeTextCardViewProps) => {
  const { name, complexity, time, onRemove, onPress, removeIconSource, onLongPress } = props;
  // const strInPlural = (n: number, s: string = "s") => (n > 1) ? s : "";
  const touchableExpandRect = new RectangleInsets(10);

  return (
    <TouchableScale
      disabled={!(onPress || onLongPress)}
      onPress={onPress}
      onLongPress={onLongPress}
      style={[styles.textCardView, props.styles.style]}
    >
      <View style={props.styles.textContainerStyle}>
        <TextScaledOnPhone style={[styles.textCardNameText, props.styles.text, props.styles.recipeTitle]}>
          {name.toUpperCase()}
        </TextScaledOnPhone>
        <TextScaledOnPhone style={[styles.textCardDescriptionText, props.styles.text, props.styles.recipeDescription]}>{
          `${complexity} • ` +
          `${time} ${I18n.t("min")}`
        }</TextScaledOnPhone>
      </View>
      {!props.hideIcon &&
        <IconButton
          style={props.styles.removeIconContainerStyle}
          hitSlop={touchableExpandRect}
          pressRetentionOffset={touchableExpandRect}
          onPress={onRemove}
          icon={removeIconSource || ingredientXIcon}
        />
      }
    </TouchableScale>
  );
};

const RecipeCardView = (props: RecipeCardViewProps) => {
  const {
    style,
    cardDescriptionStyle,
    nameTextStyle,
    id,
    source,
    blur,
    hideInfo,
    name,
    timeAndDifficulty,
    favorite,
    iconSource,
    onIconPress,
  } = props;

  return (
    <View style={[styles.cardContainer, style]}>
      <CardImage id={id} source={source} blur={blur} />
      <CardDescription
        cardDescriptionStyle={cardDescriptionStyle}
        nameTextStyle={nameTextStyle}
        hideInfo={hideInfo}
        name={name.toUpperCase()}
        timeAndDifficulty={timeAndDifficulty}
        favorite={favorite}
        iconSource={iconSource}
        onIconPress={onIconPress}
      />
    </View>
  );
};

interface CardImageState {
  imageRef: number | null;
  blurVal: Animated.Value;
}

const BLUR_VALUE = PlatformSelect({
  ios: 5,
  android: 2,
});

class CardImage extends Component<CardImageProps, CardImageState> {

  public state = {
    imageRef: null,
    blurVal: new Animated.Value(0),
  };
  private blurInAnimation = Animated.timing(
    this.state.blurVal,
    {
      toValue: 1,
      duration: 1000,
    },
  );
  private blurOutAnimation = Animated.timing(
    this.state.blurVal,
    {
      toValue: 0,
      duration: 1000,
    },
  );

  public componentDidMount() {
    if (this.props.blur) {
      this.blurInAnimation.start();
    }
  }

  public shouldComponentUpdate(nextProps, nextState, _nextContext) {
    const blurEquals = this.props.blur === nextProps.blur;

    if (!blurEquals) {
      if (nextProps.blur) {
        this.blurInAnimation.start();
      } else {
        this.blurOutAnimation.start();
      }
      return false;
    }

    const propsEquals = JSON.stringify(nextProps) === JSON.stringify(this.props);
    const stateEquals = JSON.stringify(nextState) === JSON.stringify(this.state);

    return !propsEquals || !stateEquals;
  }

  public render() {
    const { id, source } = this.props;

    return (
      <ImageBackground
        key={"placeholder:" + id}
        style={styles.imageContainer}
        imageStyle={{ resizeMode: "cover" }}
        resizeMode="cover"
        source={placeholder}
      >
        <Image
          key={"img:" + id}
          style={StyleSheet.absoluteFill}
          resizeMethod={"resize"}
          source={source}
        />
        <Animated.Image
          key={"img blurred:" + id}
          style={[StyleSheet.absoluteFill, { opacity: this.state.blurVal }]}
          resizeMethod={"resize"}
          source={source}
          blurRadius={BLUR_VALUE}
        />
      </ImageBackground>
    );
  }
}

const iconTouchExpand = new RectangleInsets(10);

const CardDescription = (props: CardDescriptionProps) => {
  const {
    cardDescriptionStyle,
    nameTextStyle,
    hideInfo,
    favorite,
    name,
    timeAndDifficulty,
    iconSource,
    onIconPress,
  } = props;

  const icon = (iconSource === undefined) ? (favorite ? favChecked : favUnchecked) : iconSource;

  return (
    <View style={[styles.descriptionContainer, cardDescriptionStyle]}>
      <View style={styles.nameFavContainer}>
        <View style={styles.textContainer}>
          <TextScaledOnPhone style={[styles.name, nameTextStyle]}>{name}</TextScaledOnPhone>
          {!hideInfo &&
            <View style={{ opacity: 0.5 }}>
              <TextScaledOnPhone style={styles.timeAndDifficulty}>{timeAndDifficulty}</TextScaledOnPhone>
            </View>
          }
        </View>
        {icon &&
          <IconButton
            style={styles.iconContainer}
            onPress={onIconPress}
            disabled={!onIconPress}
            hitSlop={iconTouchExpand}
            pressRetentionOffset={iconTouchExpand}
            iconStyle={{ width: 22, height: 22 }}
            iconProps={{
              resizeMode: "center",
            }}
            icon={icon}
          />
        }
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
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
  imageContainer: {
    flex: 1,
  },
  descriptionContainer: {
    paddingTop: 6,
    paddingLeft: 7,
    paddingRight: 6,
    paddingBottom: 6,
    backgroundColor: "#ffffff",
  },
  nameFavContainer: {
    flexDirection: "row",
  },
  textContainer: {
    flex: 1,
  },
  iconContainer: {
    justifyContent: "flex-start",
    alignContent: "flex-end",
  },
  name: {
    fontFamily: "Muli",
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 1,
    color: "#000000",
  },
  timeAndDifficulty: {
    fontFamily: "Merriweather",
    fontSize: 13,
    fontWeight: "300",
    fontStyle: "italic",
    letterSpacing: 0.46,
    color: "#000000",
  },
  textCardView: {
    backgroundColor: "#ffffff",
    shadowColor: "rgba(0, 0, 0, 0.2)",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowRadius: 4,
    shadowOpacity: 1,
  },
  textCardNameText: {
    fontFamily: "Muli",
    fontSize: IS_TABLET ? 18 : 14,
    fontWeight: "bold",
    fontStyle: "normal",
    letterSpacing: 1.5,
    color: "#000000",
  },
  textCardDescriptionText: {
    fontFamily: "Merriweather",
    fontSize: 12,
    fontWeight: "300",
    fontStyle: "italic",
    letterSpacing: 0.36,
    color: "#000000",
  },
});
