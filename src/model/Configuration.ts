import {
    BaseDeviceModel,
    clearCMScachesOnLogout,
    ConfigurationBase,
    CreateRegisterActionData,
    devicesFetchLogin,
    devicesRemoveLogout,
    DeviceStore,
    FetchExternalResourceWithAction,
    I18n,
    I18nDigestObjectAsTranslationUpdate,
    RegisterForPushNotificationsUniversal,
    UserModel,
    wampConnectLogin,
    DeletePushNotificationEndpointFromBE,
} from "iocentro-apps-common-bits";
import { ConfigStore, EntitySubType, EntityType, SourceUserData } from "iocentro-collection-manager";
import {
    ioCentroCollectionResponse,
    ioCentroDeviceObject,
    ioCentroDispatch,
    ioCentroEndpoint,
    ioCentroEndpointParam,
    ioCentroEndpointType,
    ioCentroRequest,
    ioCentroStringProcessors,
    ioCentroSuccessResult,
    ioCentroTypes,
    ioCentroUserAuthentication,
} from "iocentro-connectivity";
import { Alert, Platform } from "react-native";
import DeviceInfo from "react-native-device-info";

import { TopNavigate } from "../navigation/CommonNavigation";
import { KAStorage } from "../tools/KAStorage";
import { CookProcessorMirrorer } from "./CookProcessorMirrorer";
import { COOK_PROCESSOR_TYPE_ID, CookProcessorModel } from "./CookProcessorModel";
import { KitchenAidUserModel } from "./KitchenAidUserModel";
import { MealPlannerCollectionStore } from "./MealPlannerRxTx";
import { P2P } from "./P2P";
import { ShoppingListCollectionStore } from "./shopping_list/ShoppingListCollectionStore";
import { UserCreationsCollectionStore } from "./user_creations/UserCreationsCollectionStore";

const devicesFetchLoginWithSelect: ioCentroTypes.ioCentroLoginAction = {
    name: "devices-fetch-with-select",
    action: (): Promise<void> => {
        return new Promise((resolve: () => void) => {
            devicesFetchLogin.action()
                .then(() => {
                    const devices: BaseDeviceModel[] = DeviceStore.instance.getDevices();
                    if (devices.length > 0) {
                        DeviceStore.instance.select(devices[0]);
                    }
                    P2P.doOneTimeInit(P2P.getDevicesList());

                    resolve();
                }).then(tryRestoringRecipe);
        });
    },
    hasToBlockLogin: devicesFetchLogin.hasToBlockLogin,
    skipInDemo: false,
};

const mealPlannerSetupAction: ioCentroTypes.ioCentroLoginAction = {
    name: "meal-planner-setup-action",
    action: (): Promise<void> => {
        return new Promise((resolve, reject) => {
            const src = new SourceUserData({
                userCode: ioCentroUserAuthentication.instance.userCode(),
                application: "KADMOBIAPP",
                type: "meal-planner",
            });
            src.drain().then(() => {
                MealPlannerCollectionStore.instance.addSource(src);
                resolve();
            }).catch(() => {
                reject();
            });
        });
    },
    hasToBlockLogin: true,
    skipInDemo: true,
};

const shoppingListSetupAction: ioCentroTypes.ioCentroLoginAction = {
    name: "shopping-list-setup-action",
    action: (): Promise<void> => {
        return new Promise((resolve, reject) => {
            const src = new SourceUserData({
                userCode: ioCentroUserAuthentication.instance.userCode(),
                application: "KADMOBIAPP",
                type: "shopping-list",
            });
            src.drain().then(() => {
                ShoppingListCollectionStore.instance.addSource(src);
                resolve();
            }).catch(() => {
                reject();
            });
        });
    },
    hasToBlockLogin: true,
    skipInDemo: true,
};

const userModelFetchAction: ioCentroTypes.ioCentroLoginAction = {
    name: "user-model-fetch-action",
    action: (): Promise<void> => {
        return new Promise((resolve, reject) => {
            UserModel.instance().fetch().then(() => {
                resolve();
            }).catch(() => {
                reject();
            });
        });
    },
    hasToBlockLogin: true,
    skipInDemo: false,
};

const userCreationsSetupAction: ioCentroTypes.ioCentroLoginAction = {
    name: "user-creations-setup-action",
    action: (): Promise<void> => {
        return new Promise((resolve, reject) => {
            const src = new SourceUserData({
                userCode: ioCentroUserAuthentication.instance.userCode(),
                application: "KADMOBIAPP",
                type: "user-creations",
            });
            src.drain().then(() => {
                UserCreationsCollectionStore.instance.addSource(src);
                resolve();
            }).catch(() => {
                reject();
            });
        });
    },
    hasToBlockLogin: true,
    skipInDemo: true,
};

const fetchManualUrl = () => {
    const endPointParams = new ioCentroEndpointParam(ioCentroEndpointType.cmsQuery);
    endPointParams.setValue([
        "KADMOBIAPP", // application
        "appliancemodels", // type
        "", // text
        "", // filter
        0, // skip
        1, // limit
    ]);

    const fetchManualForLanguage = (language: string) => {
        return new Promise<string>((resolve, reject) => {
            ioCentroDispatch.request(
                new ioCentroRequest(
                    new ioCentroEndpoint(endPointParams),
                    (result, _request) => {
                        if (!(result instanceof ioCentroSuccessResult)) {
                            reject(["Fetching failed", result]);
                            return;
                        }
                        const responseObject = result.parsedObject as ioCentroCollectionResponse;
                        if (!(responseObject instanceof ioCentroCollectionResponse)) {
                            reject(["Not an ioCentroCollectionResponse", result]);
                            return;
                        }

                        const items = responseObject.items;
                        const firstApplianceModel = items[0];

                        // tslint:disable:no-string-literal
                        if (!firstApplianceModel || !firstApplianceModel["manuals"]) {
                            reject(["No appliance models or no manuals", result]);
                            return;
                        }

                        const firstManual = firstApplianceModel["manuals"][0];
                        if (!firstManual) {
                            reject(["Invalid first manual in appliance", result]);
                            return;
                        }

                        const href = firstManual.href;
                        if (!href) {
                            reject(["No href in appliance manual", result]);
                            return;
                        }
                        // tslint:enable:no-string-literal
                        resolve(ioCentroDispatch.uriGen("/assets" + href));
                    },
                    [{ key: "Accept-Language", value: language }],
                ),
            );
        });
    };

    return new Promise<string>((resolve, reject) => {
        const appLanguage = Configuration.instance.getLanguageLimitedByAllowed();
        fetchManualForLanguage(appLanguage)
            .then(resolve)
            .catch((reason) => {
                // tslint:disable-next-line:no-console
                console.log(`Failed to fetch user manual in ${appLanguage} language; trying "en"`, reason);
                fetchManualForLanguage("en").then(resolve).catch(reject);
            });
    });
};

const fetchManualUrlAction: (callback: (url: string) => void) => ioCentroTypes.ioCentroLoginAction = (callback) => ({
    name: "fetch-manual-url-action",
    action: (): Promise<void> => {
        return new Promise((resolve) => {
            fetchManualUrl().then((url) => {
                callback(url);
                resolve();
            }).catch(() => {
                // tslint:disable-next-line:no-console
                console.log("[LoginAction] Failed to fetch URL for user manual!");
            });
        });
    },
    hasToBlockLogin: false,
    skipInDemo: false,
});

function tryRestoringRecipe() {
    const RECIPE_RESTORING_PERIOD_MS = 12 * 60 * 60 * 1000; // 12h
    const selectedDevice = DeviceStore.instance.getSelected() as CookProcessorModel;
    if (!selectedDevice) {
        // no device - don't restore anything
        return;
    }
    KAStorage.GetRecipeProgress((savedProgress) => {
        if (Date.now() - savedProgress.timestamp > RECIPE_RESTORING_PERIOD_MS) {
            KAStorage.ClearRecipeProgress();
            return;
        }
        const currentStepOnDevice = selectedDevice.currentStep.sv();
        const isRecipeRunning = currentStepOnDevice != 0;
        if (!isRecipeRunning || currentStepOnDevice != savedProgress.currentStep) {
            // tslint:disable-next-line:no-console
            console.log(["Restore not possible"],
                "isRecipeRunning", isRecipeRunning,
                "savedProgress", savedProgress,
                "savedProgress.currentStep", savedProgress.currentStep,
                "currentStepOnDevice", currentStepOnDevice);
            KAStorage.ClearRecipeProgress();
            return;
        }
        ConfigStore.getSource().fetchDetailedById(savedProgress.recipeId).then(
            ([recipe]) => {
                if (!recipe) {
                    return;
                }
                Alert.alert(
                    I18n.t("restore_recipe_question"),
                    I18n.t("unfinished_recipe_notice", {
                        recipeTitle: recipe.title.sv(),
                        currentStep: savedProgress.currentStep,
                        finishedSteps: savedProgress.finishedSteps,
                    }),
                    [{
                        text: I18n.t("dismiss"),
                        onPress: KAStorage.ClearRecipeProgress,
                        style: "destructive",
                    }, {
                        text: I18n.t("restore"),
                        onPress: () => {
                            KAStorage.ClearRecipeProgress();
                            TopNavigate("Steps", {
                                recipe,
                                currentStep: savedProgress.currentStep,
                                finishedSteps: savedProgress.finishedSteps,
                            });
                        },
                    }],
                );
            },
        );

    });
}

function I18nConfigure() {
    const de = require("../../assets/dictionaries/de.json");
    const en = require("../../assets/dictionaries/en.json");
    const fr = require("../../assets/dictionaries/fr.json");
    const it = require("../../assets/dictionaries/it.json");
    const es = require("../../assets/dictionaries/es.json");
    const nl = require("../../assets/dictionaries/nl.json");

    I18n.translations = {
        en,
        de,
        fr,
        it,
        es,
        nl,
    };
}

export class Configuration extends ConfigurationBase {
    public static instance = new Configuration();

    private backendTenant = "kitchenaid";
    private translationListeners: Set<(error?: boolean) => void> | "notified" = new Set();
    private manualUrl: string = "";
    private manualUrlListeners: Set<(manulUrl: string) => void> | "notified" = new Set();

    public init() {
        super.init();
        this.changeEnv(this.getEnv());
        I18nConfigure();

        const translationFile = () => {
            const l = this.getLanguageLimitedByAllowed();
            return `https://kitchenaid.services.iocentro.io/static/kitchenaid/mobileapp/labels/${l}.json`;
        };

        FetchExternalResourceWithAction(
            translationFile(),
            (json) => {
                I18nDigestObjectAsTranslationUpdate(json, "", this.getLanguageLimitedByAllowed());
            },
            (hasFailed: boolean) => {
                if (this.translationListeners != "notified") {
                    this.translationListeners.forEach((listener) => { listener(hasFailed); });
                    this.translationListeners.clear();
                    this.translationListeners = "notified";
                }
            },
        );

        UserModel.setupCreator(() => {
            return new KitchenAidUserModel();
        });

        // Setup default backend host related parameters
        ioCentroDispatch.overrideHostDecorator(
            ioCentroStringProcessors.tenantSubtenantProcessorGenerator(this.backendTenant),
        );

        // Setup recipes datasource
        ConfigStore.setConfig({
            application: "KADMOBIAPP",
            type: EntityType.Recipe,
            subType: EntitySubType.KitchenAid,
            language: this.getLanguageLimitedByAllowed(),
            attributesAvailable: [
                "recipeCategory",
                "recipeCuisine",
                "complexity",
            ],
            trackSources: true,
            trackModels: true,
        });

        // Setup device factories
        DeviceStore.instance.registerFactory({
            name: "cookprocessor-factory",
            factory: (backendDev: ioCentroDeviceObject): (BaseDeviceModel | null) => {
                if (backendDev.deviceTypeId === COOK_PROCESSOR_TYPE_ID) {
                    return new CookProcessorModel();
                }

                return null;
            },
            mirrorer: CookProcessorMirrorer,
            mirrorerForDemo: null,
            dontUseDefaultMirrorer: true,
        });

        // Setup login/logout actions
        ioCentroUserAuthentication.instance.addLoginAction(devicesFetchLoginWithSelect);
        ioCentroUserAuthentication.instance.addLoginAction(wampConnectLogin);
        ioCentroUserAuthentication.instance.addLoginAction(mealPlannerSetupAction);
        ioCentroUserAuthentication.instance.addLoginAction(shoppingListSetupAction);
        ioCentroUserAuthentication.instance.addLoginAction(userCreationsSetupAction);
        ioCentroUserAuthentication.instance.addLoginAction(userModelFetchAction);
        ioCentroUserAuthentication.instance.addLoginAction(fetchManualUrlAction((url) => {
            this.manualUrl = url;
            if (this.manualUrlListeners != "notified") {
                this.manualUrlListeners.forEach((listener) => { listener(this.manualUrl); });
                this.manualUrlListeners.clear();
                this.manualUrlListeners = "notified";
            }
        }));
        ioCentroUserAuthentication.instance.addLoginAction(
            RegisterForPushNotificationsUniversal(this.generatePushConfiguration()),
        );
        ioCentroUserAuthentication.instance.addLogoutAction(devicesRemoveLogout);
        ioCentroUserAuthentication.instance.addLogoutAction(clearCMScachesOnLogout);
        ioCentroUserAuthentication.instance.addLogoutAction(DeletePushNotificationEndpointFromBE);
    }

    public addTranslationListener(listener: (error?: boolean) => void) {
        if (this.translationListeners == "notified") {
            setTimeout(listener); // translation already fetched - just notify the listener asynchronously
        } else {
            this.translationListeners.add(listener);
        }
    }

    public getManualUrl(callback: (manualUrl: string) => void) {
        if (this.manualUrlListeners == "notified") {
            setTimeout(() => callback(this.manualUrl));
        } else {
            this.manualUrlListeners.add(callback);
        }
    }

    private generatePushConfiguration(): CreateRegisterActionData {
        let arn = "";

        const isAndroid = Platform.OS === "android";
        if (isAndroid) {
            arn = "arn:aws:sns:eu-west-1:415297121621:app/GCM/KITCHENAID_ANDROID_STORE";
        } else {
            if (DeviceInfo.getBundleId() === "com.reply.KitchenAid") {
                arn = "arn:aws:sns:eu-west-1:415297121621:app/APNS/KITCHENAID_IOS_REPLY";
            } else {
                arn = "arn:aws:sns:eu-west-1:415297121621:app/APNS/KITCHENAID_IOS_STORE";
            }
        }

        return {
            appEndpoint: arn,
            appName: isAndroid ? "KADMOBAAPP" : "KADMOBIAPP",
            IdentityPoolId: "eu-west-1:d08aac8e-fb9f-4382-bb2e-3916fcf79afa",
            region: "eu-west-1",
            requestPermissions: true,
            senderId: "1033080740234",
        };
    }
}
