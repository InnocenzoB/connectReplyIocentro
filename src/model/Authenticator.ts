import SInfo from "react-native-sensitive-info";

import { ConfigStore } from "iocentro-collection-manager";
import {
  ioCentroUserAuthentication,
  ioCentroUtility,
} from "iocentro-connectivity";
import { Env } from "iocentro-apps-common-bits";

import { Configuration } from "./Configuration";

export class Authenticator {

  public static async isAuthenticated(): Promise<boolean> {
    try {
      if (Authenticator._token != null) {
        const error = await ConfigStore.loadConfig();
        if (error != null) { return false; }
        return true;
      }
      const email = await SInfo.getItem("rememberEmail", {});
      const password = await SInfo.getItem("rememberPassword", {});
      const storedEnv = await SInfo.getItem("env", {});
      const previousEnv = Configuration.instance.getEnv();
      if (!(email && password)) {
        return false;
      }
      if (storedEnv) {
         Configuration.instance.changeEnv(storedEnv);
      }

      const authenticated = await Authenticator.authenticate(email, password, true);

      if (!authenticated && storedEnv) {
        Configuration.instance.changeEnv(previousEnv);
      }
      return authenticated;
    } catch (e) {
      return false;
    }
  }

  public static async authenticate(email: string, password: string, remember: boolean) : Promise<boolean> {
      try {
        await Authenticator._login(email, password, remember);
        if (Authenticator._token == null) { throw new Error("Login failed"); }

        const error = await ConfigStore.loadConfig();
        if (error != null) { throw new Error("Load config failed"); }
        return true;
      } catch (e) {
        // TODO alert errors?
        return false;
      }
  }

  public static signOut() {
    Authenticator._token = null;
    ioCentroUserAuthentication.instance.logout();
    SInfo.deleteItem("rememberEmail", {});
    SInfo.deleteItem("rememberPassword", {});
    SInfo.deleteItem("env", {});
  }

  public static getToken() {
    return (Authenticator._token === null) ? null : Authenticator._token.slice();
  }

  private static _login(email: string, password: string, _remember: boolean) {
    return new Promise((resolve) => {
      Authenticator._token = null;

      if (!_remember) {
        SInfo.deleteItem("rememberEmail", {});
        SInfo.deleteItem("rememberPassword", {});
        SInfo.deleteItem("env", {});
      }

      ioCentroUserAuthentication.instance.login(email, password, (r) => {
        const success = ioCentroUtility.successResult(r);
        if (success) {
          Authenticator._token = ioCentroUserAuthentication.instance.accessToken();
          if (_remember) {
            SInfo.setItem("rememberEmail", email, {});
            SInfo.setItem("rememberPassword", password, {});
            const env = Configuration.instance.getEnv();

            if (env != Env.production) {
              SInfo.setItem("env", Configuration.instance.getEnv(), {});
            }
          }
        }
        resolve();
      });
    });
  }

  private static _token: string | null = null;
}
