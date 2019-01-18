import { I18n } from "iocentro-apps-common-bits";
import {
  ioCentroDispatch,
  ioCentroEndpoint,
  ioCentroEndpointParam,
  ioCentroEndpointType,
  ioCentroRequest,
  ioCentroSuccessResult,
  ioCentroTouActiveObject,
} from "iocentro-connectivity";
import React, { Component } from "react";
import { FlatList, StyleSheet } from "react-native";
import DeviceInfo from "react-native-device-info";
import { ModalProps } from "react-native-modal";

import { Dims, IS_TABLET } from "../../Platform";
import { GradientTextButton } from "../Buttons";
import { VerticalSpacer } from "../dashboard/Common";
import { CheckBox } from "../login_screen/CheckBox";
import { TextScaledOnPhone } from "../ScaledText";
import { TouchableScale } from "../TouchableScale";
import { PaperModalStateless } from "./Base";

export class Agreement {
  constructor(
    public readonly label: string,
    public readonly mandatory: boolean,
  ) {
  }

  public selected: boolean = false;
  public backendOptionCodes: string[];

  public hasRequiredSelection() {
    return this.selected || !this.mandatory;
  }
}

const SUPPORTED_LANGS = ["it", "en", "es", "de", "ln", "fr"];
const SUPPORTED_COUNTRIES = ["IT", "EN", "ES", "DE", "NL", "FR"];

const fetchAgreementsCodes = () => {
  const endPointParams = new ioCentroEndpointParam(ioCentroEndpointType.touActive);
  const deviceCountry = DeviceInfo.getDeviceCountry();
  const deviceLanguage = DeviceInfo.getDeviceLocale().slice(0, 2);
  endPointParams.setValue([
    SUPPORTED_COUNTRIES.includes(deviceCountry) ? deviceCountry : "EN",
    SUPPORTED_LANGS.includes(deviceLanguage) ? deviceLanguage : "en",
  ]);

  return new Promise<ioCentroTouActiveObject>((resolve, reject) => {
    ioCentroDispatch.request(
      new ioCentroRequest(
        new ioCentroEndpoint(endPointParams),
        (result, _request) => {
          if (!(result instanceof ioCentroSuccessResult)) {
            reject(["Fetching failed", result]);
            return;
          }
          if (!Array.isArray(result.parsedObject)) {
            reject(["Not an array", result]);
            return;
          }

          const backendTouObject = result.parsedObject[0] as ioCentroTouActiveObject;

          if (!(backendTouObject instanceof ioCentroTouActiveObject)) {
            reject(["Not an ioCentroTouActiveObject", result]);
            return;
          }

          resolve(backendTouObject);
        },
      ),
    );
  });
};

export interface AgreementsCodesInfo {
  termOfUseCode: string;
  selectedOptionCodes: string[];
}

export type AgreementsModalCallback = (
  allMandatorySelected: boolean,
  codesInfo?: AgreementsCodesInfo,
) => void;

export interface AgreementsState {
  visible: boolean;
  callback?: AgreementsModalCallback;
}

export interface AgreementsProps extends Partial<ModalProps> {
}

export class AgreementsModal extends Component<AgreementsProps, AgreementsState> {
  private agreements: Agreement[];
  private backendCodesDesciptor: ioCentroTouActiveObject;

  constructor(props) {
    super(props);
    this.agreements = [
      new Agreement("terms_acceptance", true),
      new Agreement("privacy_acceptance", true),
      new Agreement("optional_acceptance1", false),
      new Agreement("optional_acceptance2", false),
    ];
  }

  public state: AgreementsState = {
    visible: false,
  };

  public render() {
    const {
      style,
      children,
      ...modalProps,
    } = this.props;
    const {
      visible,
      callback,
    } = this.state;

    const allMandatorySelected = this.agreements.every((ag) => ag.hasRequiredSelection());

    return (
      <PaperModalStateless
        {...modalProps}
        isVisible={visible}
        onHideRequest={() => { this.hide(); callback && callback(false); }}
        style={[{
          alignSelf: "center",
          width: Dims.windowDimensions.width * (IS_TABLET ? 0.7 : 0.9),
          maxHeight: Dims.windowDimensions.height * (IS_TABLET ? 0.7 : 0.9),
        }, style]}
        paperStyle={{ padding: 20, paddingBottom: 42 }}
        title1={I18n.t("agreements_title")}
        bottomElement={
          <GradientTextButton
            theme={allMandatorySelected ? "red" : "grey"}
            disabled={!allMandatorySelected}
            style={{ width: 180, height: 48 }}
            text={I18n.t("ok").toUpperCase()}
            onPress={() => { this.hide(); callback && callback(allMandatorySelected, this.getSelectedCodes()); }}
          />
        }
        bottomElementOffset={24}
      >
        <FlatList
          data={this.agreements}
          alwaysBounceVertical={false}
          keyExtractor={(_item, index) => index.toString()}
          ItemSeparatorComponent={() => (<VerticalSpacer height={10} />)}
          renderItem={({ item }) => (
            <AgreementComponent
              data={item}
              onUpdate={this.onAgreementsUpdate}
            />
          )}
        />
      </PaperModalStateless>
    );
  }

  public readonly show = (callback: AgreementsModalCallback) => {
    this.setState({ visible: true, callback });
  }

  public readonly hide = () => {
    this.setState({ visible: false });
  }

  private onAgreementsUpdate = () => {
    this.forceUpdate();
  }

  private getSelectedCodes = () => {
    if (!this.backendCodesDesciptor) {
      return;
    }
    const selectedOptionCodes: string[] = [];
    this.agreements.forEach((a, i) => {
      const agreement = this.backendCodesDesciptor.agreements[i];
      if (!agreement) {
        return;
      }
      // Assuming first code is Yes, second is No
      const code = agreement.agreementValuesCodes[a.selected ? 0 : 1];
      selectedOptionCodes.push(code);
    });
    return {
      termOfUseCode: this.backendCodesDesciptor.termOfUseCode,
      selectedOptionCodes,
    };
  }

  public componentDidMount() {
    fetchAgreementsCodes().then((backendCodesDesciptor) => {
      this.backendCodesDesciptor = backendCodesDesciptor;
    }).catch(([message, response]) => {
      // tslint:disable-next-line:no-console
      console.warn("fetchAgreementsCodes fail:", message, response)
    });
  }
}

interface AgreementProps {
  data: Agreement;
  onUpdate: () => void;
}

const AgreementComponent = ({ data, onUpdate }: AgreementProps) => {
  return (
    <TouchableScale
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingRight: 30, // (db): there are some layout problems:
        // agreement text is taking too much space rendering its contents outside of screen
      }}
      onPress={() => { data.selected = !data.selected; onUpdate(); }}
    >
      <CheckBox
        checked={data.selected}
        textStyle={{ color: "black" }}
        onPress={() => { data.selected = !data.selected; onUpdate(); }}
      />
      <TextScaledOnPhone style={styles.agreementText}>
        {I18n.t(data.label)}
        <TextScaledOnPhone style={{ fontWeight: "900" }}>
          {data.mandatory ? " *" : ""}
        </TextScaledOnPhone>
      </TextScaledOnPhone>
    </TouchableScale>
  );
};

const styles = StyleSheet.create({
  agreementText: {
    fontFamily: "Muli",
    fontSize: 12,
    letterSpacing: 2,
    color: "black",
    marginLeft: Dims.scaleH(6),
  },
});
