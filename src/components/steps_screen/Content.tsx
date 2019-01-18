import React from "react";
import { Image, StyleSheet, View } from "react-native";

import { ImageModel } from "iocentro-collection-manager";
import { ValueBase } from "iocentro-datamodel";

import { IS_TABLET, PlatformSelect } from "../../Platform";
import { PulsingIcon } from "../PulsingIcon";
import { FlexRow } from "./FlexRow";
import { ImageFromModel } from "./ImageFromModel";
import { QuickTip } from "./QuickTip";

const stepNoImagePlaceholder = require("../../../img/steps/stepNoImagePlaceholder.png");

interface StepFlexProps extends ContentProps {
  children?: React.ReactNode;
}

export const StepFlex = (props: StepFlexProps) => {
  const { children, ...rest } = props;
  return (
    <View style={{ flex: 1 }}>
      <Content
        {...rest}
      />
      {children}
    </View>
  );
};

export interface ContentProps {
  tip?: ValueBase;
  image?: ValueBase;
}

class Content extends React.Component<ContentProps, { height: number, width: number }> {
  constructor(props) {
    super(props);

    this.state = {
      width: 0,
      height: 0,
    };
  }
  public render() {
    const tipVal: string | null = this.props.tip ? this.props.tip.sv() : null;
    const tip = (tipVal !== null) ? <QuickTip text={tipVal} /> : null;
    const image: ImageModel | null = this.props.image ? this.props.image.sv() : null;
    return (
      <FlexRow right={IS_TABLET ? tip : null}>
        <View
          onLayout={(e) => {
            this.setState({
              width: e.nativeEvent.layout.width,
              height: e.nativeEvent.layout.height,
            });
          }}
          style={styles.contentContainer}>
          <PulsingIcon />
          {IS_TABLET ? (
            <StepImage
              image={image}
              width={this.state.width}
              height={this.state.height}
            />
          ) : (
              <PhoneContent
                tip={tipVal}
                image={image}
                width={this.state.width}
                height={this.state.height}
              />
            )}
        </View>
      </FlexRow>
    );
  }
}

interface ContentImplProps {
  image: ImageModel | null;
  width: number;
  height: number;
}

const StepImage = (props: ContentImplProps) => {
  const { image, width, height } = props;
  const w = Math.max(width - imageMargins, 0);
  const h = Math.max(height - imageMargins, 0);
  if (image) {
    return (
      <ImageFromModel
        width={w}
        height={h}
        image={image}
      />
    );
  } else {
    return (
      <Image
        style={{
          width: w, height: h,
        }}
        source={stepNoImagePlaceholder}
        resizeMode="contain"
      />
    );
  }
};

interface PhoneContentProps extends ContentImplProps {
  tip: string | null;
}

const PhoneContent = (props: PhoneContentProps) => {
  const { image, width, height, tip } = props;
  const tipH = tip !== null ? height / 3 : 0;
  const imageH = height - tipH;
  return (
    <View style={{ width, height, justifyContent: "center", alignItems: "center" }}>
      {(tip !== null) &&
        <View
          style={{
            padding: 3,
            width,
            height: tipH,
            justifyContent: "center",
            alignItems: "center",
            overflow: "hidden",
          }}>
          <QuickTip text={tip} />
        </View>
      }
      <StepImage
        width={Math.max(width - imageMargins, 0)}
        height={Math.max(imageH - imageMargins, 0)}
        image={image}
      />
    </View>
  );
};

const imageMargins = IS_TABLET ? 25 : 15;

const styles = StyleSheet.create({
  contentContainer: {
    ...PlatformSelect({
      anyTablet: {
        flex: 1.87,
      },
      anyPhone: {
        flex: 6.75,
      },
    }),
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
});
