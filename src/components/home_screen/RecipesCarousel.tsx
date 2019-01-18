import { RecipeModel } from "iocentro-collection-manager";
import React, { Component } from "react";
import { StyleProp, View, ViewStyle } from "react-native";
import Carousel from "react-native-snap-carousel";
import { Dims } from "../../Platform";
import { cardDimsScaled, CarouselData } from "./CarouselData";

export type RecipeId = string;

interface RecipesCarouselProps {
  data: CarouselData[];
  style?: StyleProp<ViewStyle>;
  onPress?: (model: RecipeModel) => void;
}

export class RecipesCarousel extends Component<RecipesCarouselProps, { index: any }> {
  constructor(props) {
    super(props);
    this.state = { index: 1 };
  }
  public render() {
    // TODO carousel customization and improvment
    return (
      <View
        style={[
          this.props.style,
          { marginLeft: -Dims.scaledDimensions.width * 0.25 },
        ]}>
        <Carousel
          data={this.props.data}
          firstItem={1}
          renderItem={this._renderItem.bind(this)}
          itemWidth={cardDimsScaled.width}
          sliderWidth={Dims.scaledDimensions.width * 1.25}
          enableMomentum={true}
          enableSnap={true}
          shouldOptimizeUpdates
          inactiveSlideScale={0.8}
          inactiveSlideOpacity={1}
          onSnapToItem={this._onSnap.bind(this)}
        />
      </View>
    );
  }

  private _onSnap = (index) => { this.setState({ index }); };

  private _renderItem(entry: any) {
    const { item: model, index } = entry;
    return (model as CarouselData).renderItem(entry, this.state.index == index);
  }
}
