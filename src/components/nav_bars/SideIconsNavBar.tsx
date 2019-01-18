import React, { Component } from "react";
import { ImageRequireSource, ImageStyle, ImageURISource, StyleProp, ViewStyle } from "react-native";

import { IconButton } from "../Buttons";
import { NavBarBase, NavBarElement, NavBarNonElementProps } from "./NavBarBase";

const imported = {
  defaultLeftIcon: require("../../../img/common/navbarBackIcon.png"),
  defaultRightIcon: require("../../../img/common/navbarCloseIcon.png"),
};

export interface Size {
  width?: number | string;
  height?: number | string;
}

export function Rect(size?: number | string): Size {
  return { width: size, height: size };
}

export interface IconProps {
  visible?: boolean;
  source?: ImageURISource | ImageURISource[] | ImageRequireSource;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>; // touchable image container style
  imageStyle?: StyleProp<ImageStyle>;
  size?: Size;
}

/**
 * NavBar variation with icons (clickable images) on sides.
 *
 * Icons have default images that are taken if their source prop
 * is not passed or equals undefined.
 */
export interface SideIconsNavBarProps extends NavBarNonElementProps {
  leftIcon?: IconProps | null;
  middleElement?: NavBarElement;
  rightIcon?: IconProps | null;

  iconsSize?: Size;
}

export class SideIconsNavBar extends Component<SideIconsNavBarProps> {
  public static defaultProps: SideIconsNavBarProps = {
    leftIcon: {
      visible: true,
    },
    rightIcon: {
      visible: true,
    },
  };

  public render() {
    const {
      leftIcon,
      rightIcon,
      iconsSize,
      ...baseProps,
    } = this.props;

    return (
      <NavBarBase
        leftElement={
          <SideIcon
            defaultSource={imported.defaultLeftIcon}
            sizeProp={iconsSize}
            iconProps={leftIcon}
          />
        }
        {...baseProps}
        rightElement={
          <SideIcon
            defaultSource={imported.defaultRightIcon}
            sizeProp={iconsSize}
            iconProps={rightIcon}
          />
        }
      />
    );
  }
}

interface SideIconProps {
  defaultSource?: any;
  sizeProp?: Size;
  iconProps?: IconProps | null;
  style?: any;
}

export const SideIcon = (props: SideIconProps) => {
  const { defaultSource, sizeProp = Rect(64), iconProps } = props;
  if (!iconProps || iconProps.visible == false) {
    return null;
  }

  return (
    <IconButton
      onPress={iconProps.onPress}
      style={[{
        alignItems: "center", justifyContent: "center",
      }, sizeProp, iconProps.size, iconProps.style, props.style]}
      icon={iconProps.source || defaultSource}
      iconStyle={iconProps.imageStyle}
    />
  );
};
