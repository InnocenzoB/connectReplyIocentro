import React from "react";
import { StyleSheet, View } from "react-native";

import { Dims } from "../../Platform";
import { Directions } from "./Directions";
import { FooterData, StepData } from "./Footer";
import { FooterSeparator } from "./FooterSeparator";
import { VideoPlayer, VideoSrc } from "./VideoFooter";
import { VideoQuickTip } from "./VideoTip";

interface VideoPhoneFlexProps extends StepData, FooterData {
  video?: VideoSrc;
  tip?: string;
}

export const VideoPhoneFlex = (props: VideoPhoneFlexProps) => {
  const {
    currentStepModel,
    video,
    ...rest,
  } = props;

  return (
    <View style={{ flex: 1 }}>
      <Directions currentStepModel={currentStepModel} style={{flex: 3.93}}/>
      {video &&
        <VideoPhone
          video={video}
          {...rest}
        />
      }
    </View>
  );
};

interface VideoPhoneProps extends FooterData {
  video: VideoSrc;
  tip?: string;
}

class VideoPhone extends React.Component<VideoPhoneProps, {width: number, height: number}> {
  constructor(props) {
    super(props);

    this.state = {
      width: 0,
      height: 0,
    };
  }
  public render() {
    const {
      tip,
      video,
      stepDone,
    } = this.props;
    return (
      <View style={styles.container}>
        <View style={{flex: 1, flexDirection: "row"}}>
          <View style={{flex: 1}}/>
          <View style={{flex: 3.93}}
          // TOFIX
          // this callback causes bug with step done icon on android (FooterSeparator)
          // workaround: set fixed video size
            onLayout={(e) => {
              this.setState({
                width: e.nativeEvent.layout.width,
                height: e.nativeEvent.layout.width / 1.75,
              });
            }}
          >
            <FooterSeparator done={stepDone} />
              <VideoPlayer
                containerStyle={styles.videoContainer}
                width={this.state.width}
                height={this.state.height}
                source={video}
              />
            <View style={styles.tipContainer}>
              {!!tip && <VideoQuickTip text={tip} />}
            </View>
          </View>
          <View style={{flex: 1}}/>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1.5,
    alignItems: "center",
  },
  videoContainer: {
    marginTop: Dims.scaleV(20),
  },
  tipContainer: {
    marginTop: Dims.scaleV(14),
  },
});
