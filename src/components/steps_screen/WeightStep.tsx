import React from "react";
import { Image, StyleSheet, View } from "react-native";

import { ImageModel } from "iocentro-collection-manager";
import { ValueBase } from "iocentro-datamodel";
import { UserModel } from "iocentro-apps-common-bits";

import { noNull } from "../../Utils";

import { Dims, IS_TABLET, PlatformSelect } from "../../Platform";
import { PulsingIcon } from "../PulsingIcon";
import { RoundButtonParam, RoundButtonParamType } from "../RoundButtonParam";
import { HorizontalWeight, VerticalWeight } from "../VerticalWeight";
import { ContentProps } from "./Content";
import { FlexRow } from "./FlexRow";
import { FooterData } from "./Footer";
import { ImageFromModel } from "./ImageFromModel";
import { QuickTip } from "./QuickTip";
import { KitchenAidUserModel, UnitSystem } from "../../model/KitchenAidUserModel";
import * as _ from "lodash";

const completedCheckIconLarge = require("../../../img/steps/completedCheckIconLarge.png");
const weightScaleAlert = require("../../../img/steps/713WeightScaleAlert.png");

interface WeightStepFlexProps extends WeightStepProps {
  children?: React.ReactNode;
}

export const WeightStepFlex = (props: WeightStepFlexProps) => {
  const { children, ...rest } = props;
  return (
    <View style={{ flex: 1 }}>
      <WeightStep
        {...rest}
      />
      {children}
    </View>
  );
};

type WeightStepModes = "normal" | "small";

export interface WeightStepData extends FooterData {
  weight: ValueBase;
  weightIncrementalAmount: ValueBase;
  weightTargetOverfill: ValueBase;
  weightTargetReached: ValueBase;
}

export interface WeightStepProps extends WeightStepData, ContentProps {
  mode: WeightStepModes;
}

class WeightStep extends React.Component<WeightStepProps, { height: number, width: number }> {
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
    const weight: number = noNull(this.props.weight.sv(), 0);
    const weightIncrementalAmount: number = noNull(this.props.weightIncrementalAmount.sv(), 3000);

    let imageIcon: "alert" | "completed" | undefined;
    if (!!this.props.weightTargetReached.sv()) {
      imageIcon = "completed";
    }
    if (!!this.props.weightTargetOverfill.sv()) {
      imageIcon = "alert";
    }

    const weightConv = (w: number): number => {
      const isImperial = (UserModel.instance() as KitchenAidUserModel).unit.sv() === UnitSystem.Imperial;

      if (isImperial) {
        return w/28.3;
      } else {
        return w;
      }
    };

    const weightTxt = (w: number): string => {
      const isImperial = (UserModel.instance() as KitchenAidUserModel).unit.sv() === UnitSystem.Imperial;
      //remove unit of measure
      
      if (isImperial) {
        return `${_.round(w/28.3, 1)} `;
      } else {
        return `${w}`;
      }
    };

    const flexMargin = { flex: margins[this.props.mode] };
    const { mode } = this.props;
    return (
      <FlexRow
        style={IS_TABLET ? {} : { flexDirection: "column-reverse" }}
        left={
          IS_TABLET ? (
            <VerticalWeight
              text={weightTxt(weight)}
              value={weightConv(weight)}
              max={weightConv(weightIncrementalAmount * 1.1)}
              size={mode == "normal" ? 300 : 230}
              line={weightConv(weightIncrementalAmount)}
              tooltipVisible={image !== null}
            />
          ) : (
              <HorizontalWeight
                text={weightTxt(weight)}
                value={weightConv(weight)}
                max={weightConv(weightIncrementalAmount * 1.1)}
                size={260} // TOFIX do not change this value
                line={weightConv(weightIncrementalAmount)}
                tooltipVisible={image !== null}
              />
            )
        }
        right={tip}
        leftStyle={[styles.leftSide, flexMargin]}
        rightStyle={[styles.rightStyle, flexMargin]}>
        <PulsingIcon />
        <View
          style={{
            flex: IS_TABLET ? 1 : 1.5,
            justifyContent: "center",
            alignItems: "center",
          }}
          onLayout={(e) => {
            this.setState({
              width: e.nativeEvent.layout.width,
              height: e.nativeEvent.layout.height,
            });
          }}>
          {(image === null) ? (
            <View
              style={{
                justifyContent: "center",
                alignItems: "center",
                flex: 1,
              }}>
              <RoundButtonParam
                type={RoundButtonParamType.Weight}
                value={weight}
                minValue={0}
                maxValue={weightIncrementalAmount}
                readonly={true}
                theme="white"
                size={IS_TABLET ? (mode == "normal" ? "xl" : "l") : (tip == null ? "l" : "s")}
                progress={true}
              />
              <ImageIcon imageIcon={imageIcon} />
            </View>
          ) : (
              <View
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                  flex: 1,
                }}>
                <ImageFromModel
                  image={image}
                  width={Math.max(this.state.width - 25, 0)}
                  height={Math.max(this.state.height - 25, 0)}
                />
                <ImageIcon imageIcon={imageIcon} />
              </View>
            )}
        </View>
      </FlexRow>
    );
  }
}

interface ImageIconProps {
  imageIcon?: "alert" | "completed";
}

const ImageIcon = (props: ImageIconProps) => {
  const { imageIcon } = props;
  if (!imageIcon) {
    return null;
  }
  const iconSrc = imageIcon == "completed" ? completedCheckIconLarge : weightScaleAlert;
  return (
    <Image
      source={iconSrc}
      style={{
        flex: 1,
        position: "absolute",
      }}
    />
  );
};

const margins: {[key in WeightStepModes]} = {
  normal: IS_TABLET ? 1 : 0.6,
  small: IS_TABLET ? 1.5 : 0.6,
};

const styles = StyleSheet.create({
  leftSide: {
    alignItems: IS_TABLET ? "flex-end" : "center",
    paddingBottom: Dims.scaleV(15),
  },
  rightStyle: {
    ...PlatformSelect({
      anyPhone: {
        paddingHorizontal: Dims.scaleH(40),
        paddingTop: Dims.scaleV(15),
      },
    }),
  },
});
