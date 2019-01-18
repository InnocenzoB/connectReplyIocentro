import React, { Component } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";

const DIAMETER_SMALL = 7;
const DIAMETER_LARGE = 14;

interface ConnectionAnimationProps {
  numberOfDots?: number;
  speedofDots?: number;
  timeOfFadeout?: number;
  style?: any;
}

interface ConnectionAnimationState {
  activeDot: number;
}

export class ConnectionAnimation extends Component<ConnectionAnimationProps, ConnectionAnimationState> {
  public static defaultProps: ConnectionAnimationProps = {
    numberOfDots: 13,
    speedofDots: 100,
    timeOfFadeout: 600,
  };
  private timer;
  private incrementer = -1;

  public constructor(props) {
    super(props);
    this.state = {
      activeDot: 1,
    };
  }

  public componentDidMount() {
    this.timer = setInterval(() => {
      if (this.state.activeDot == 1 || this.state.activeDot == this.props.numberOfDots) {
        this.incrementer = -this.incrementer;
      }
      this.setState({
        activeDot: this.state.activeDot + this.incrementer,
      });
    }, this.props.speedofDots);
  }

  public componentWillUnmount() {
    clearInterval(this.timer);
  }

  public render() {
    return (
      <View style={this.props.style}>
        {this.renderDots(this.props.numberOfDots!)}
      </View>
    );
  }

  private renderDots = (numberOfDots: number) => {
    const dots: JSX.Element[] = [];

    for (let i = 1; i <= numberOfDots; i++) {
      dots.push(
        <AnimatedDot
          key={i}
          size={i % 4 == 1 ? "large" : "small"}
          isActive={this.state.activeDot == i}
          timeOfFadeout={this.props.timeOfFadeout} />,
      );
    }
    return (
      <View style={styles.container}>
        {dots}
      </View>
    );
  }
}

interface AnimatedDotProps {
  size: "large" | "small";
  isActive?: boolean;
  timeOfFadeout?: number;
}

class AnimatedDot extends Component<AnimatedDotProps> {
  public static defaultProps = {
    size: "large",
  };

  private animatedOpacity = new Animated.Value(0);
  private borderWidth = 1;

  public constructor(props) {
    super(props);
  }

  public componentWillReceiveProps(nextProps: AnimatedDotProps) {
    nextProps.isActive && this.startAnimation();
  }

  private startAnimation = () => {
        this.borderWidth = 0;
        this.animatedOpacity.setValue(1);
        Animated.timing(
          this.animatedOpacity,
          {
            toValue: 0.4,
            duration: this.props.timeOfFadeout,
            easing: Easing.linear,
          },
        ).start(() => {
          this.borderWidth = 1;
          this.animatedOpacity.setValue(0);
          this.forceUpdate();
        });
  }

  public render() {
    const sizeBorder = {
      width: this.props.size == "large" ? DIAMETER_LARGE : DIAMETER_SMALL,
      height: this.props.size == "large" ? DIAMETER_LARGE : DIAMETER_SMALL,
    };
    const sizeDot = {
      width: this.props.size == "large" ?
        DIAMETER_LARGE - 2 * this.borderWidth : DIAMETER_SMALL - 2 * this.borderWidth,
      height: this.props.size == "large" ?
        DIAMETER_LARGE - 2 * this.borderWidth : DIAMETER_SMALL - 2 * this.borderWidth,
    };
    return (
      <View style={[styles.border, sizeBorder, { borderWidth: this.borderWidth }]}>
        <Animated.View style={[styles.circle, sizeDot, { opacity: this.animatedOpacity }]} />
      </View>
    );
  }

}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  circle: {
    backgroundColor: "rgb(203,0,0)",
    opacity: 0,
    borderRadius: 100,
  },
  border: {
    width: 100,
    height: 100,
    borderRadius: 100,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: "rgb(203,0,0)",
  },
});
