import { I18n } from "iocentro-apps-common-bits";
import React from "react";
import {
  Dimensions,
  Image,
  ImageRequireSource,
  ImageURISource,
  Linking,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import Modal from "react-native-modal";

import { IS_TABLET, PlatformSelect } from "../../Platform";
import { IconButton, ThemedTextButton } from "../Buttons";
import { Hr } from "../Hr";
import { TextScaledOnPhone } from "../ScaledText";
import { HorizontalSpacer } from "../steps_screen/Overview";

const imported = {
  modalCloseIcon: require("../../../img/icons/modalCloseIcon.png"),
};

export interface ApplianceData {
  description: string;
  icon?: ImageURISource | ImageURISource[] | ImageRequireSource;
  price?: number;
  url?: string;
}

export type ApplianceDataWithName = {
  name: string;
} & ApplianceData;

interface ApplianceModalProps {
  isVisible: boolean;
  onClose: () => void;
  applianceData: ApplianceDataWithName;
}

export const ApplianceModal = (props: ApplianceModalProps) => (
  <Modal
    isVisible={props.isVisible}
    backdropOpacity={0.5}
    style={{ alignSelf: "center" }}
    onBackdropPress={props.onClose}
  >
    <View style={styles.applianceModal}>
      <IconButton
        icon={imported.modalCloseIcon}
        style={{ alignSelf: "flex-start" }}
        onPress={props.onClose}
      />
      <View style={styles.applianceModalContent}>
        <ApplianceHeader {...props.applianceData} />
        <Hr style={PlatformSelect<ViewStyle>({
          anyTablet: { marginVertical: 18 },
          anyPhone: { marginTop: 10, marginBottom: 17 },
        })} />
        <View style={{
          flexDirection: "row",
          ...PlatformSelect<ViewStyle>({
            anyPhone: {
              paddingRight: 13,
              paddingLeft: 6,
            },
          }),
        }}>
          <ApplianceIcon icon={props.applianceData.icon} />
          <HorizontalSpacer width={IS_TABLET ? 33 : 20} />
          <ApplianceDescription {...props.applianceData} />
        </View>
      </View>
    </View>
  </Modal>
);

const ApplianceIcon = ({ icon }) => (
  !icon ? null :
    <Image source={icon} resizeMode="contain"
      style={PlatformSelect<ViewStyle>({
        anyTablet: { maxWidth: 140, maxHeight: 140 },
        anyPhone: { maxWidth: 100, maxHeight: 105, marginTop: 10 },
      })}
    />
);

/* Looks like price is no more. */
// const AppliancePrice = ({ price }) => (
//   !price ? null :
//     <View>
//       <Hr style={{ marginVertical: 14, height: 1 }} />
//       <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
//         <TextScaledOnPhone style={styles.boldedText}>STARTING AT</TextScaledOnPhone>
//         <TextScaledOnPhone style={styles.priceText}>€{price}</TextScaledOnPhone>
//       </View>
//     </View>
// );

const ApplianceDescription = (props: ApplianceData) => (
  <View style={{ flex: 1 }}>
    <TextScaledOnPhone style={styles.descriptionText}>{props.description}</TextScaledOnPhone>
    {/* Looks like price is no more. */}
    {/*<AppliancePrice price={props.price} /> */}
  </View>
);

const ApplianceHeader = (props: ApplianceDataWithName) => (
  <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
    <TextScaledOnPhone style={styles.applianceModalNameText}>{props.name}</TextScaledOnPhone>
    <ThemedTextButton
      theme="red"
      text={I18n.t("learn_more").toUpperCase()}
      onPress={() => { props.url && Linking.openURL(props.url); }}
      touchableExpand={5}
    />
  </View>
);

const styles = StyleSheet.create({
  applianceModal: {
    ...PlatformSelect({
      anyTablet: {
        padding: 20,
        paddingBottom: 40,
      },
      anyPhone: {
        padding: 15,
        paddingBottom: 25,
      },
    }),

    width: 512,
    maxWidth: Dimensions.get("window").width - 40,

    borderRadius: 2,
    backgroundColor: "#ffffff",
    shadowColor: "rgba(0, 0, 0, 0.5)",
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowRadius: 34,
    shadowOpacity: 1,
  },
  applianceModalContent: {
    ...PlatformSelect({
      anyTablet: {
        paddingHorizontal: 28,
        paddingVertical: 15,
      },
      anyPhone: {
        paddingHorizontal: 2,
        paddingVertical: 15,
      },
    }),
  },
  applianceModalNameText: {
    fontFamily: "Merriweather",
    fontSize: 18,
    fontWeight: "300",
    fontStyle: "italic",
    color: "#000000",
  },
  boldedText: {
    fontFamily: "Muli",
    fontSize: 11,
    fontWeight: "900",
    lineHeight: 11,
    letterSpacing: 2,
    color: "#000000",
  },
  priceText: {
    fontFamily: "Muli",
    fontSize: 14,
    color: "#000000",
  },
  descriptionText: {
    fontFamily: "Muli",
    fontSize: 14,
    lineHeight: 17,
    color: "#000000",
  },
});
