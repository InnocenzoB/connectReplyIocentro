import React, { Component } from "react";
import {
  GestureResponderEvent,
  Image,
  ImageProperties,
  ImageRequireSource,
  ImageStyle,
  ImageURISource,
  StyleProp,
  StyleSheet,
  TextStyle,
  ViewStyle,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";

import { TextScaledOnPhone } from "./ScaledText";
import { TouchableScale, TouchableScaleProps } from "./TouchableScale";

// Android does not accept empty array as gradient input
export const EMPTY_GRADIENT = ["transparent", "transparent"];

export interface StyledButtonProps extends TouchableScaleProps {
  color?: string; /** Shorthand for style.backgroundColor */
  centered?: boolean;
}

/**
 * React-native <Button> cannot be styled (it takes native button style).
 */
export class StyledButton extends Component<StyledButtonProps> {
  public render() {
    const { color, style, centered, ...restProps } = this.props;

    return (
      <TouchableScale
        style={[{
          backgroundColor: color,
        },
        centered && {
          justifyContent: "center",
          alignItems: "center",
        }, style]}
        {...restProps}
      />
    );
  }
}

export type ButtonThemes = "red" | "grey" | "lightGrey" | "white" | "whiteBordered";

export interface GradientButtonProps extends StyledButtonProps {
  colors?: string[]; /** Gradient colors */
  disableReversing?: boolean;
  theme?: ButtonThemes;
}

interface ThemeProps {
  color: string;
  colors?: string[];
  textColor?: string;
  style?: StyleProp<ViewStyle>;
}

type ThemeMap = { [key in ButtonThemes]: ThemeProps };

const THEMES: ThemeMap = {
  red: {
    colors: ["rgba(255,255,255,0.125)", "rgba(0,0,0,0.125)"],
    color: "rgb(203, 0, 0)",
    textColor: "#ffffff",
  },
  grey: {
    colors: ["rgba(255, 255, 255, 0.1)", "rgba(0, 0, 0, 0.1)"],
    color: "rgb(103, 103, 103)",
    textColor: "#ffffff",
  },
  lightGrey: {
    colors: ["rgba(123,123,123,0.1)", "rgba(0,0,0,0.1)"],
    color: "#ffffff", // is misleading whe used in themedtextbutton
    style: {
      shadowColor: "rgba(0, 0, 0, 0.2)",
    },
    textColor: "#676767",
  },
  white: {
    colors: ["rgba(123,123,123,0.01)", "rgba(0,0,0,0.01)"],
    color: "#ffffff",
    style: {
      shadowColor: "rgba(0, 0, 0, 0.2)",
    },
    textColor: "#676767",
  },
  whiteBordered: {
    color: "transparent",
    textColor: "#ffffff",
    style: {
      borderColor: "#ffffff",
      borderRadius: 3,
      borderWidth: 2,
    },
  },
};

interface GradientButtonState {
  inPress: boolean;
}

/**
 * By default GradientButton reverses the gradient as the in press effect (scale down is disabled).
 *
 * This behavior can be changed by using disableReversing and/or passing scaleFactor explicitly.
 */
export class GradientButton extends Component<GradientButtonProps, GradientButtonState> {
  public state = {
    inPress: false,
  };

  public render() {
    const {
      style, theme,
      colors, color,
      children,
      onPressIn, onPressOut,
      disableReversing,
      ...rest,
    } = this.props;

    const themeProps: ThemeProps = this.getThemeProps();
    if (!themeProps.colors || themeProps.colors.length < 2) {
      // Android requires colors prop on lineargradient to be valid
      themeProps.colors = EMPTY_GRADIENT;
    }

    return (
      <StyledButton
        scaleFactor={disableReversing ? undefined : 1}
        {...rest}
        onPressIn={this.onPressIn}
        onPressOut={this.onPressOut}
      >
        <LinearGradient
          style={[
            styles.gradientButtonCommon,
            {
              backgroundColor: themeProps.color,
            },
            themeProps.style,
            style,
          ]}
          colors={themeProps.colors}
          children={children}
        />
      </StyledButton>
    );
  }

  private getThemeProps(): ThemeProps {
    const {
      theme,
      colors, color,
      disableReversing,
    } = this.props;
    const { inPress } = this.state;

    const themeProps: ThemeProps = Object.assign({}, THEMES[theme as ButtonThemes]);
    if (colors) {
      themeProps.colors = colors;
    }
    if (color) {
      themeProps.color = color;
    }

    if (inPress && !disableReversing && themeProps.colors) {
      themeProps.colors = themeProps.colors.slice().reverse();
    }

    return themeProps;
  }

  private onPressIn = (event: GestureResponderEvent) => {
    this.setState({ inPress: true });
    this.props.onPressIn && this.props.onPressIn(event);
  }
  private onPressOut = (event: GestureResponderEvent) => {
    this.setState({ inPress: false });
    this.props.onPressOut && this.props.onPressOut(event);
  }
}

export interface TextButtonProps extends StyledButtonProps {
  text?: string;
  textStyle?: StyleProp<TextStyle>;
}

export class TextButton extends Component<TextButtonProps> {
  public render() {
    const { text, textStyle, children, ...rest } = this.props;

    return (
      <StyledButton {...rest}>
        <TextScaledOnPhone style={textStyle}>{text}</TextScaledOnPhone>
        {children}
      </StyledButton>
    );
  }
}

export interface ThemedTextButtonProps extends TextButtonProps {
  theme?: ButtonThemes;
}

/**
 * Version of TextButton that uses styles.textCommon + theme color.
 */
export class ThemedTextButton extends Component<ThemedTextButtonProps> {
  public render() {
    const { textStyle, theme, ...rest } = this.props;

    return (
      <TextButton
        textStyle={[
          styles.textCommon,
          theme && { color: THEMES[theme].color },
          textStyle,
        ]}
        {...rest}
      />
    );
  }
}

export interface GradientTextButtonProps extends GradientButtonProps, TextButtonProps {
}

export class GradientTextButton extends Component<GradientTextButtonProps> {
  public render() {
    const { text, textStyle, children, theme, ...rest } = this.props;

    let textColor;
    if (theme) {
      textColor = THEMES[theme].textColor;
    }

    return (
      <GradientButton theme={theme} {...rest}>
        <TextScaledOnPhone
          style={[
            styles.textCommon,
            {
              color: textColor,
            }
            , textStyle,
          ]}
        >
          {text}
        </TextScaledOnPhone>
        {children}
      </GradientButton>
    );
  }
}

export interface IconButtonProps extends StyledButtonProps {
  round?: boolean;
  size?: number; // shortcut for width and height setting
  icon: ImageURISource | ImageURISource[] | ImageRequireSource;
  iconStyle?: StyleProp<ImageStyle>;
  iconProps?: Partial<ImageProperties>;
}

export class IconButton extends Component<IconButtonProps> {
  public render() {
    const { round, icon, iconStyle, style, size, children, iconProps, ...rest } = this.props;

    return (
      <StyledButton
        style={[
          size != undefined && { width: size, height: size },
          round && {
            borderRadius: 5000,
          },
          style,
        ]}
        {...rest}
      >
        <Image source={icon} style={iconStyle} {...iconProps} />
        {children}
      </StyledButton>
    );
  }
}

export interface GradientIconButtonProps extends GradientButtonProps, IconButtonProps {
}

export class GradientIconButton extends Component<GradientIconButtonProps> {
  public render() {
    const { round, icon, iconStyle, style, size, children, ...rest } = this.props;

    return (
      <GradientButton
        style={[
          size != undefined && { width: size, height: size },
          round && {
            borderRadius: 5000,
          },
          style,
        ]}
        {...rest}
      >
        <Image source={icon} style={iconStyle} />
        {children}
      </GradientButton>
    );
  }
}

const styles = StyleSheet.create({
  gradientButtonCommon: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 2,
    shadowColor: "rgba(0, 0, 0, 0.25)",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowRadius: 10,
    shadowOpacity: 1,
  },
  textCommon: {
    fontFamily: "Muli",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 2,
    backgroundColor: "transparent",
  },
});
