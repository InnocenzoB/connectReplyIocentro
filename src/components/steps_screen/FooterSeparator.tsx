import React from "react";
import { Image, StyleSheet, View } from "react-native";

import { Hr } from "../Hr";

const completedCheckIconSmall = require("../../../img/steps/completedCheckIconSmall.png");

interface HorizonalSeparatorProps {
  done?: boolean;
}

export const FooterSeparator = ({ done = false }: HorizonalSeparatorProps) => {
  return done ? (
    <View style={styles.hrContainer}>
      <Hr style={styles.hrDone}/>
      <Image
        resizeMode="cover"
        source={completedCheckIconSmall}
        style={styles.stepDoneImg}
      />
      <Hr style={styles.hrDone}/>
    </View>
  ) : (
    <Hr style={{position: "absolute"}}/>
  );
};

const styles = StyleSheet.create({
  hrDone: {
    width: "43%",
  },
  hrContainer: {
    position: "absolute",
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  stepDoneImg: {
    marginTop: -15,
    backgroundColor: "white",
  },
});
