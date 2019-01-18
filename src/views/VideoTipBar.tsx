import React from "react";
import { Image } from "react-native";
import Video from "react-native-video";
import { I18n } from "iocentro-apps-common-bits";

import { QUICK_CHOICE_BAR_HEIGHT } from "../components/QuickChoiceBottomBar";
import { TextScaledOnPhone } from "../components/ScaledText";
import { VideoTipData } from "../components/steps_screen/VideoTip";
import { TouchableScale } from "../components/TouchableScale";

const videoPlay = require("../../img/steps/videoPlay.png");

interface VideoTipBarProps {
  videoTip: VideoTipData;
}

interface VideoTipBarState {
  playing: boolean;
}

export class VideoTipBar extends React.Component<VideoTipBarProps, VideoTipBarState> {
  private video: Video | null = null;

  constructor(props) {
    super(props);

    this.state = {
      playing: false,
    };
  }

  public render() {
    let txt = this.props.videoTip.tip;
    if (txt.length > 22) {
      txt = txt.substring(0, 22) + "...";
    }

    return (
      <TouchableScale
        onPress={this.onPress}
        style={{
          width: "100%",
          height: 30,
          position: "absolute",
          backgroundColor: "rgb(151, 151, 151)",
          bottom: QUICK_CHOICE_BAR_HEIGHT,
          justifyContent: "space-between",
          alignItems: "center",
          flexDirection: "row",
          paddingVertical: 8,
          paddingHorizontal: 18,
        }}>
        <Image source={videoPlay} />
        <TextScaledOnPhone
          style={{
            fontFamily: "Muli",
            fontSize: 11,
            fontWeight: "900",
            letterSpacing: 2,
            color: "rgb(255, 255, 255)",
          }}>
          {I18n.t("watch_tutorial").toUpperCase()}
        </TextScaledOnPhone>
        <TextScaledOnPhone
          numberOfLines={1}
          ellipsizeMode={"tail"}
          lineBreakMode={"tail"}
          style={{
            fontFamily: "Muli",
            fontSize: 11,
            letterSpacing: 1,
            color: "rgb(255, 255, 255)",
          }}>
          {txt}
        </TextScaledOnPhone>
        <Video
          ref={(ref) => { this.video = ref; }}
          source={this.props.videoTip.source}
          rate={1.0}
          paused={!this.state.playing}
          volume={1.0}
          muted={false}
          ignoreSilentSwitch={"obey"}
          resizeMode="cover"
          repeat={false}
          onLoad={() => {}}
          onBuffer={() => {}}
          onProgress={() => {}}
          onEnd={this.onEnd}
          onAudioBecomingNoisy={() => {}}
          onAudioFocusChanged={() => {}}
          // TOFIX fullscreen not working on android
          onFullscreenPlayerWillDismiss={this.onFullscreenPlayerWillDismiss}
        />
      </TouchableScale>
    );
  }

  private onPress = () => {
    if (this.video) {
      this.video.presentFullscreenPlayer();
      this.setState({
        playing: true,
      });
    }
  }

  private onEnd = () => {
    this.setState({
      playing: false,
    }, () => {
      if (this.video) {
        this.video.dismissFullscreenPlayer();
        this.video.seek(0);
      }
    });
  }

  private onFullscreenPlayerWillDismiss = () => {
    this.setState({
      playing: false,
    }, () => {
      this.video && this.video.seek(0);
    });
  }
}
