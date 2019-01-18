import { ConnectPhone } from "../components/appliance_wizard/ConnectPhone";
import { CantFindCodePage, ManuallyEnterCode, ScanSaidPage } from "../components/appliance_wizard/SaidSteps";
import {
  ApplianceAlreadyClaimedPage, ConnectToWifiPage, ConnectToWifiWpsBegin,
  ConnectToWifiWpsCompatibile, ConnectWithWpsPage, FinalVerificationPage, RegisterAppliancePage, RegistrationFailedPage,
} from "../components/appliance_wizard/WizardSteps";

// export const ApplianceWizard = StackNavigator({
//   ScanSaidPage: { screen: ScanSaidPage },
//   // ConnectToWifiWpsCompatibile: {screen: ConnectToWifiWpsCompatibile },
//   // ConnectWithWpsPage: {screen: ConnectWithWpsPage },
//   // ConnectToWifiPage: { screen: ConnectToWifiPage },
//   CantFindCodePage: { screen: CantFindCodePage },
//   // ApplianceAlreadyClaimedPage: { screen : ApplianceAlreadyClaimedPage },
//   // FinalVerificationPage: {screen: FinalVerificationPage },
//   // RegisterAppliancePage: { screen: RegisterAppliancePage },
//   ManuallyEnterCode: { screen : ManuallyEnterCode },
// },
//   {
//     initialRouteName: "ScanSaidPage",
//     headerMode: "none",
//   },
// );

/*
export const ApplianceWizardScreens = {
  ApplianceWizard: { screen: ScanSaidPage },
  CantFindCodePage: { screen: CantFindCodePage },
  ManuallyEnterCode: { screen: ManuallyEnterCode },
};
*/

export const ApplianceWizardScreens = {
  ApplianceWizard: { screen: ScanSaidPage },
  ConnectToWifiWpsCompatibile: { screen: ConnectToWifiWpsCompatibile },
  ConnectWithWpsPage: { screen: ConnectWithWpsPage },
  ConnectToWifiPage: { screen: ConnectToWifiPage },
  CantFindCodePage: { screen: CantFindCodePage },
  ApplianceAlreadyClaimedPage: { screen: ApplianceAlreadyClaimedPage },
  FinalVerificationPage: { screen: FinalVerificationPage },
  RegisterAppliancePage: { screen: RegisterAppliancePage },
  ManuallyEnterCode: { screen: ManuallyEnterCode },
  ConnectPhone: { screen: ConnectPhone },
  RegistrationFailedPage: { screen: RegistrationFailedPage },
  ConnectToWifiWpsBegin: { screen: ConnectToWifiWpsBegin },
};
