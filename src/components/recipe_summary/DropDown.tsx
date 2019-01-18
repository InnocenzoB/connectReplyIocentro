import React, { Component } from "react";
import { Image, LayoutAnimation, StyleSheet, View } from "react-native";

const filterDropdownArrow = require("../../../img/recipe_summary/filterDropdownArrow.png");

interface CollapsableProps {
  isCollapsed: boolean;
}

export const DropDownArrow = (props: CollapsableProps) => {
  return (
    <Image
      source={filterDropdownArrow}
      style={[
        {marginLeft: 5},
        props.isCollapsed ? styles.flip : {},
      ]}
    />
  );
};

export class DropDownAnimated extends Component<CollapsableProps> {
  public componentWillUpdate() {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.linear);
  }

  public render() {
    const { isCollapsed, children } = this.props;
    return (
      <View>{isCollapsed ? null : children}</View>
    );
  }
}

const styles = StyleSheet.create({
  flip: {
    transform: [{
      rotateX: "180deg",
    }],
  },
});
