import React, { Component } from "react";
import { NavigationScreenProps } from "react-navigation";
import { I18n } from "iocentro-apps-common-bits";

import { ApplianceWizardButton, ApplianceWizardPage, Hr } from "../components/appliance_wizard/ApplianceWizardPage";

export class RegistrationFailed extends Component<NavigationScreenProps<{}>, {}> {
    public render() {
        return (
            <ApplianceWizardPage
                title1={I18n.t("devreg_registration")} title2={I18n.t("devreg_failed")}
                header={I18n.t("devreg_registration") + " " + I18n.t("devreg_failed")}
                message={I18n.t("devreg_failed_help")}
                buttons={ApplianceWizardButton.Exit}
                buttonPressed={() => this.props.navigation.goBack()}
                { ...this.props }>
                <Hr />

            </ApplianceWizardPage>
        );
    }
}
