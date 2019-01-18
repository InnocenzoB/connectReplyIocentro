import BgImage from "iocentro-patched-react-native-bgimage";
import React, { Component } from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { PlatformSelect } from "../Platform";

interface PaperViewProps {
  innerStyle?: StyleProp<ViewStyle>;
  outerStyle?: StyleProp<ViewStyle>;
}
export class PaperView extends Component<PaperViewProps> {
  public render() {
    const { innerStyle, outerStyle } = this.props;

    return (
      <View style={[styles.outer, outerStyle]}>
        <BgImage
          style={[styles.inner, innerStyle]}
          drawable="bgpaper">
          { this.props.children }
        </BgImage>
      </View>
    );
  }
}

export class Paper extends Component<{}> {
  public render() {
    return (
      <PaperView innerStyle={styles.paperPaddings}>
        { this.props.children }
      </PaperView>
     );
  }
}

const styles = StyleSheet.create({
  paperPaddings: {
    ...PlatformSelect({
      anyTablet: {
        paddingTop: 20,
        paddingLeft: 49,
        paddingRight: 62,
        paddingBottom: 20,
        minHeight: 600,
      },
      anyPhone: {
        paddingTop: 20,
        paddingLeft: 10,
        paddingRight: 10,
        paddingBottom: 10,
        minHeight: 500,
      },
    }),
  },
  outer: {
    borderRadius: 4,
    overflow: "hidden",
    flex: 1,
  },
  inner: {
    flex: 1,
  },
});
