import React from "react";
import { Image, StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import Video from "react-native-video";
import { I18n } from "iocentro-apps-common-bits";

import { noNull } from "../../Utils";
import { TextScaledOnPhone } from "../ScaledText";
import { TouchableScale, TouchableScaleProps } from "../TouchableScale";
import { FooterData, StepData } from "./Footer";
import { FooterSeparator } from "./FooterSeparator";
import { NotesButton, NotesButtonProps } from "./NotesButton";

const videoPlay = require("../../../img/steps/videoPlay.png");

export interface VideoSrc {
  uri: string;
}

interface VideoFooterProps extends StepData,
  FooterData,
  NotesButtonProps {
    videoSource: VideoSrc;
}

export const VideoFooter = (props: VideoFooterProps) => {
  const title = noNull(props.currentStepModel.title.sv(), "?");
  const description = noNull(props.currentStepModel.description.sv(), "");

  return (
    <View style={styles.container}>
      <View style={{ flex: 1, flexDirection: "row" }}>
        <View style={{ flex: 1 }} />
        <View style={{ flex: 3.93, alignItems: "center" }}>
          <FooterSeparator done={props.stepDone} />
          <View style={{ flex: 1, flexDirection: "row", marginTop: 29 }}>
            <VideoPlayer
              width={270}
              height={154}
              source={props.videoSource}
              containerStyle={styles.videoContainer}
            />
            <View style={{ flex: 1, paddingLeft: 26 }}>
              <TextScaledOnPhone style={styles.font1}>{title}</TextScaledOnPhone>
              <TextScaledOnPhone style={styles.font2}>{description}</TextScaledOnPhone>
            </View>
          </View>
        </View>
        <View style={{ flex: 1 }} />
      </View>
      {props.onNotesPress && <NotesButton {...props} />}
    </View>
  );
};

interface VideoPlayerState {
  paused: boolean;
}

interface VideoPlayerProps {
  width: number;
  height: number;
  source: VideoSrc;
  containerStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
}

export class VideoPlayer extends React.Component<VideoPlayerProps, VideoPlayerState> {
  private video: Video | null = null;

  constructor(props) {
    super(props);

    this.state = {
      paused: true,
    };
  }

  public componentWillReceiveProps() {
    this.onEnd();
  }

  public render() {
    const {
      width,
      height,
      source,
      containerStyle,
      style,
    } = this.props;

    const {
      paused,
    } = this.state;

    return (
      <View style={containerStyle}>
        <Video
          ref={(ref) => { this.video = ref; }}
          style={[style, {width, height}]}
          source={source}
          rate={1.0}
          paused={paused}
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
        <PlayButton
          width={width}
          height={height}
          containerStyle={styles.buttonContainer}
          style={styles.playButton}
          visible={paused}
          onPress={this.onPress}
        />
      </View>
    );
  }

  private onPress = () => {
    if (this.video) {
      this.video.presentFullscreenPlayer();
      this.setState({ paused: false });
    }
  }

  private onEnd = () => {
    this.setState({
      paused: true,
    }, () => {
      if (this.video) {
        this.video.dismissFullscreenPlayer();
        this.video.seek(0);
      }
    });
  }

  private onFullscreenPlayerWillDismiss = () => {
    this.setState({
      paused: true,
    }, () => {
      this.video && this.video.seek(0);
    });
  }
}

interface PlayButtonProps extends TouchableScaleProps {
  visible: boolean;
  width: number;
  height: number;
  containerStyle?: StyleProp<ViewStyle>;
}

const PlayButton = (props: PlayButtonProps) => {
  const {
    visible,
    containerStyle,
    width,
    height,
    ...rest,
  } = props;

  if (!visible) {
    return (
      <View style={[containerStyle, {backgroundColor: "transparent"}]}>
        <TouchableScale
          {...rest}>
        </TouchableScale>
      </View>
    );
  }

  return (
    <View style={[containerStyle, {width, height}]}>
      <TouchableScale
        {...rest}>
          <View style={styles.buttonCircle}>
            <View
              style={styles.buttonRectangle}>
              <Image source={videoPlay} />
            </View>
            <TextScaledOnPhone style={styles.buttonFont}>
              {I18n.t("watch").toUpperCase()}
            </TextScaledOnPhone>
          </View>
      </TouchableScale>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1.12,
    width: "100%",
    alignItems: "center",
  },
  font1: {
    marginTop: 25,
    fontFamily: "Muli",
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 2.36,
    color: "#000000",
  },
  font2: {
    marginTop: 12,
    fontFamily: "Muli",
    fontSize: 16,
    lineHeight: 22,
    color: "#000000",
  },
  videoContainer: {
    flex: 1,
    alignItems: "flex-end",
  },
  buttonContainer: {
    position: "absolute",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  playButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonCircle: {
    width: 90, height: 90,
    borderRadius: 90,
    borderWidth: 1,
    borderColor: "rgb(255, 255, 255)",
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonRectangle: {
    width: 30, height: 20,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: "rgb(255, 255, 255)",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonFont: {
    marginTop: 7,
    fontFamily: "Muli",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 2,
    color: "rgb(255, 255, 255)",
  },
});
