import { MandatoryGetValueTrait, OptionalGetUiPresentationTransform, ValueBase } from "iocentro-datamodel";

import { I18n } from "iocentro-apps-common-bits";
import { Configuration } from "./model/Configuration";

export function noNull<T, K = T>(val: T | null, def: K): T | K {
  return val === null ? def : val;
}

export function getUiPresentationValue<T>(valueBase: ValueBase, defaultValue: T): T {
  const v = valueBase.getValue();
  const transform = OptionalGetUiPresentationTransform(v);
  const vt = MandatoryGetValueTrait(v);
  return (vt && transform) ? transform(vt) : defaultValue;
}

export function getCountryISOCodeForLocale() {
  let ISOcode = "";
  switch (Configuration.instance.getLanguageLimitedByAllowed()) {
    case "en":
      ISOcode = "GB";
      break;
    case "de":
      ISOcode = "DE";
      break;
    case "fr":
      ISOcode = "FR";
      break;
    case "it":
      ISOcode = "IT";
      break;
    case "es":
      ISOcode = "ES";
      break;
    case "nl":
      ISOcode = "NL";
      break;
    default:
      ISOcode = "GB";
      break;
  }

  return ISOcode;
}

export interface CountryDescriptor {
  isoAlfa2: string;
  translation: string;
}

export const REGISTRATION_COUNTRIES: CountryDescriptor[] = [
  "COUNTRYEMPTY",
  // Europe
  "AL", "AD", "AT", "BY", "BE", "BA",
  "BG", "HR", "CY", "CZ", "DK", "EE",
  "FO", "FI", "FR", "DE", "GI", "GR",
  "HU", "IS", "IE", "IM", "IT", "LV",
  "LI", "LT", "LU", "MK", "MT", "MD",
  "MC", "ME", "NL", "NO", "PL", "PT",
  "RO", "RS", "RU", "SM", "SK", "SI",
  "ES", "SE", "CH", "UA", "GB", "VA",
  // Rest
  "AU", "NZ", "US", "CA"
].map((isoAlfa2) => ({ isoAlfa2, translation: "" }));

// setTimeout to wait module load
setTimeout(() => Configuration.instance.addTranslationListener(() => {
  REGISTRATION_COUNTRIES.forEach((country: CountryDescriptor) => {
    country.translation = I18n.t(country.isoAlfa2);
  });
  REGISTRATION_COUNTRIES.sort((a, b) => a.translation.localeCompare(b.translation));
}));

export function validatePhone(value): boolean {
  // tslint:disable-next-line:max-line-length
  const reg = /^(?:(?:\(?(?:00|\+)([1-4]\d\d|[1-9]\d?)\)?)?[\-\.\ \\\/]?)?((?:\(?\d{1,}\)?[\-\.\ \\\/]?){0,})(?:[\-\.\ \\\/]?(?:#|ext\.?|extension|x)[\-\.\ \\\/]?(\d+))?$/i;
  if (reg.test(value)) { return true; }
  return false;
}

export function validateEmail(email): boolean {
  // tslint:disable-next-line:max-line-length
  const reg = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (reg.test(email)) { return true; }
  return false;
}

export function verifyPassword(password) {
  return /^(\w{8,15})$/.test(password) &&
    /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password) &&
    !/[ !@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
}
