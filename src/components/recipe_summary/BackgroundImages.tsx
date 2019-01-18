import React, { Component, ReactNode } from "react";
import { Image, ImageBackground, ImageURISource, View } from "react-native";

const placeholderRecipeHero = require("../../../img/recipe_summary/placeholderRecipeHero.png");

export interface BackgroundImagesProps {
  image1?: ImageURISource;
  image2?: ImageURISource;
}

export const ImageOrView = (props: {image?: ImageURISource}) => {

  if (props.image && props.image.uri) {
    return (
      <Image
        key={"img:" + props.image.uri}
        style={{flex: 1}}
        source={props.image}
      />
    );
  }

  return <View style={{flex: 1, backgroundColor: "transparent"}} />;
};

export class BackgroundImages extends Component<BackgroundImagesProps, {}> {
  public render() {
    return (
      <View style={{width: 896}}>
        {this.props.children}
        <View
          style={{
            width: 896,
            height: 379,
            position: "absolute",
            zIndex: -1,
          }}>
          <ImageBackground
            style={{flex: 1, flexDirection: "row"}}
            imageStyle={{ resizeMode: "cover" }}
            source={placeholderRecipeHero}>
            <ImageOrView image={this.props.image1}/>
            <ImageOrView image={this.props.image2}/>
            <View
              style={{
                position: "absolute",
                width: "100%",
                height: "100%",
                backgroundColor: "rgba(59, 23, 4, 0.4)",
              }}
            />
          </ImageBackground>
        </View>
      </View>
    );
  }
}

interface PhoneBackgroundImages extends BackgroundImagesProps {
  children?: ReactNode;
}

export const PhoneBackgroundImages = (props: PhoneBackgroundImages) => {
  return (
    <View
      style={{
        width: "100%",
        height: 153,
      }}>
      <ImageBackground
        style={{
          flex: 1,
          flexDirection: "row",
        }}
        imageStyle={{resizeMode: "cover"}}
        source={placeholderRecipeHero}
      >
        <ImageOrView image={props.image1}/>
        <ImageOrView image={props.image2}/>
        <View
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(59, 23, 4, 0.4)",
          }}>
          {props.children}
        </View>
      </ImageBackground>
    </View>
  );
};
