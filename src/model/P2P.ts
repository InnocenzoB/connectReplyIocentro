import { BaseDeviceModel, DeviceStore } from "iocentro-apps-common-bits";
import { WhpP2P } from "iocentro-whp-p2p";
import { NativeEventEmitter } from "react-native";
import { CookProcessorModel } from "./CookProcessorModel";

class P2P {
  private static maxScaleUpdatesPerSecond = 5;
  private static lastReading: number;
  public static P2PEmitter = new NativeEventEmitter(WhpP2P);
  public static OnPublishKVPDataSubscription = P2P.P2PEmitter.addListener(
    "OnPublishKVPData",
    (response) => {
      const tmp: BaseDeviceModel[] = DeviceStore.instance.getDevices().filter((model) => {
        return model.activationCode.sv() === response.said;
      });
      if (tmp.length > 0) {
        const device = tmp[0] as CookProcessorModel;
        for (const v in response.values) {
          P2P.handlePotencialWeight(device, v, response.values[v]);
        }
      }
    },
  );
  public static OnConnectionStatusChangeSubscription = P2P.P2PEmitter.addListener(
    "OnConnectionStatusChange",
    (response) => {
      const tmp: BaseDeviceModel[] = DeviceStore.instance.getDevices().filter((model) => {
        return model.activationCode.sv() == response.said;
      });
      if (tmp.length) {
        const device = tmp[0] as CookProcessorModel;
        device.isDirectlyConnected.updateValue(response.connected === 1);
      }
    });

  public static doOneTimeInit = (init: Array<{ mac: any; said: any; }>) => {
    WhpP2P.doOneTimeInit(init);
  }

  public static stopP2P = () => {
    WhpP2P.stopP2P();
  }

  public static restartP2P = () => {
    WhpP2P.restartP2P();
  }

  public static handlePotencialWeight = (device: CookProcessorModel, key: string, value) => {
    const allowedKeys = [
      "Cooker_QuickStatusWeight",
      "CookProc_CycleStatusCumulativeWeight",
    ];

    if (allowedKeys.includes(key) == false) {
      return;
    }

    if (typeof value !== "string") {
      return;
    }
    const canBeUpdated = () => {
      const delta = new Date().getTime() - P2P.lastReading;
      if (delta < 1000 / P2P.maxScaleUpdatesPerSecond) { return false; }
      if (device.weight.sv() === Math.floor(Number(value) / 10)) { return false; }
      P2P.lastReading = new Date().getTime();
      return true;
    }

    if (canBeUpdated()) {
      device.weight.updateValue(Math.floor(Number(value) / 10));
    }
  }

  public static getDevicesList = () => {
    const devices: BaseDeviceModel[] = DeviceStore.instance.getDevices();

    const minimalRep = devices
      .filter((v) => {
        const isMac = v.macAddress.sv() && (v.macAddress.sv() as string).length > 0;
        const isSaid = v.activationCode.sv() && (v.activationCode.sv() as string).length > 0;
        return isMac && isSaid;
      })
      .map((v) => ({
        mac: v.macAddress.sv(),
        said: v.activationCode.sv(),
      }));
      return minimalRep;
  }
}

export { P2P };
