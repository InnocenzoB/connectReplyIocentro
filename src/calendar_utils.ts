// from: react-native-calendars
import { LocaleConfig } from "react-native-calendars";
import XDate from "xdate";
import { Configuration } from "./model/Configuration";

import { I18n } from "iocentro-apps-common-bits";

export type Timestamp = number;

export class TimePeriod {
  constructor(
    public begin: XDate,
    public end: XDate,
  ) {
    if (begin.diffMilliseconds(end) < 0) {
      throw new Error("begin > end");
    }
  }

  public toString() {
    return `${xdateToString(this.begin)} | ${xdateToString(this.end)}`;
  }

  public toTimestamp(): TimeStampPeriod {
    return {
      begin: this.begin.getTime(),
      end: this.end.getTime(),
    };
  }

  public getDates() {
    const dates: XDate[] = [];
    const day = this.begin.clone();
    while (day.diffDays(this.end) >= 0) {
      dates.push(day.clone());
      day.addDays(1);
    }
    return dates;
  }

  public contains(date: XDate) {
    return this.begin.diffMilliseconds(date) >= 0 && this.end.diffMilliseconds(date) <= 0;
  }
}

export interface TimeStampPeriod {
  begin: Timestamp;
  end: Timestamp;
}

export const MILISECONDS_IN_DAY = 24 * 60 * 60 * 1000;

export function getWeek(date: XDate, firstDayOfWeek = 0): TimePeriod {
  const dayOfWeek = date.getDay();
  return new TimePeriod(
    date.clone()
      .clearTime()
      .addDays(- dayOfWeek + firstDayOfWeek),
    date.clone()
      .clearTime()
      .addDays(6 - dayOfWeek + firstDayOfWeek)
      .addMilliseconds(MILISECONDS_IN_DAY - 1), // addMilliseconds only in getWeekTs?
  );
}

export function getWeekTs(date: XDate): TimeStampPeriod {
  return getWeek(date).toTimestamp();
}

export function getMonth(date: XDate): TimePeriod {
  const year = date.getFullYear();
  // tslint:disable-next-line:no-shadowed-variable
  const month = date.getMonth();
  const daysInMonth = XDate.getDaysInMonth(year, month);

  const firstDay = date.clone().setDate(1).clearTime(); // addMilliseconds only in getMonthTs?
  const lastDay = firstDay.clone().setDate(daysInMonth).addMilliseconds(MILISECONDS_IN_DAY - 1);

  return new TimePeriod(firstDay, lastDay);
}

export function getMonthTs(date: XDate): TimeStampPeriod {
  return getMonth(date).toTimestamp();
}

export function getDay(date: XDate): TimePeriod {
  const firstMsInDay: XDate = date.clone().clearTime();
  const lastMsInDay: XDate = firstMsInDay.clone().addMilliseconds(MILISECONDS_IN_DAY - 1);

  return new TimePeriod(firstMsInDay, lastMsInDay);
}

export function getDayTs(date: XDate): TimeStampPeriod {
  return getDay(date).toTimestamp();
}

export function sameWeek(a, b, firstDayOfWeek = 0) {
  let dayDifference: number = a.diffDays(b);
  const earlierDay = dayDifference < 0 ? b.clone() : a.clone();
  dayDifference = Math.abs(dayDifference);

  let firstDayOfWeekInsidePeriod = false;
  if (dayDifference < 7) {
    for (let i = 0; i < dayDifference; i++) {
      if (earlierDay.addDays(1).getDay() == firstDayOfWeek) {
        firstDayOfWeekInsidePeriod = true;
        break;
      }
    }
  } else {
    firstDayOfWeekInsidePeriod = true;
  }

  return !firstDayOfWeekInsidePeriod;
}

// -- dateutils.js

export function sameMonth(a, b) {
  return a instanceof XDate && b instanceof XDate &&
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth();
}

export function sameDate(a, b) {
  return a instanceof XDate && b instanceof XDate &&
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

export function isGTE(a, b) {
  return b.diffDays(a) > -1;
}

export function isLTE(a, b) {
  return a.diffDays(b) > -1;
}

export function fromTo(a, b) {
  const days: XDate[] = [];
  let from = +a;
  const to = +b;
  for (; from <= to; from = new XDate(from, true).addDays(1).getTime()) {
    days.push(new XDate(from, true));
  }
  return days;
}

export function month(xd) {
  const year = xd.getFullYear();
  // tslint:disable-next-line:no-shadowed-variable
  const month = xd.getMonth();
  const days = new Date(year, month + 1, 0).getDate();

  const firstDay = new XDate(year, month, 1, 0, 0, 0, true);
  const lastDay = new XDate(year, month, days, 0, 0, 0, true);

  return fromTo(firstDay, lastDay);
}

export function weekDayNames(firstDayOfWeek = 0) {
  let weekDaysNames = XDate.locales[XDate.defaultLocale].dayNamesShort;
  const dayShift = firstDayOfWeek % 7;
  if (dayShift) {
    weekDaysNames = weekDaysNames.slice(dayShift).concat(weekDaysNames.slice(0, dayShift));
  }
  return weekDaysNames;
}

export function page(xd, firstDayOfWeek) {
  const days = month(xd);
  let before: XDate[] = [];
  let after: XDate[] = [];

  const fdow = ((7 + firstDayOfWeek) % 7) || 7;
  const ldow = (fdow + 6) % 7;

  firstDayOfWeek = firstDayOfWeek || 0;

  const from = days[0].clone();
  if (from.getDay() !== fdow) {
    from.addDays(-(from.getDay() + 7 - fdow) % 7);
  }

  const to = days[days.length - 1].clone();
  const day = to.getDay();
  if (day !== ldow) {
    to.addDays((ldow + 7 - day) % 7);
  }

  if (isLTE(from, days[0])) {
    before = fromTo(from, days[0]);
  }

  if (isGTE(to, days[days.length - 1])) {
    after = fromTo(days[days.length - 1], to);
  }

  return before.concat(days.slice(1, days.length - 1), after);
}

export interface XDateData {
  year: number;
  month: number;
  day: number;
  timestamp: number;
  dateString: string;
}

// -- interface.js

export function padNumber(n) {
  if (n < 10) {
    return "0" + n;
  }
  return n;
}

export function xdateToData(xdate): XDateData {
  const dateString = xdateToString(xdate);
  return {
    year: xdate.getFullYear(),
    month: xdate.getMonth() + 1,
    day: xdate.getDate(),
    timestamp: XDate(dateString, true).getTime(),
    dateString,
  };
}

export function xdateToString(xdate): string {
  return xdate.toString("yyyy-MM-dd");
}

export function parseDate(d) {
  if (!d) {
    return;
  } else if (d.timestamp) { // conventional data timestamp
    return XDate(d.timestamp, true);
  } else if (d instanceof XDate) { // xdate
    return XDate(d.toString("yyyy-MM-dd"), true);
  } else if (d.getTime) { // javascript date
    const dateString = d.getFullYear() + "-" + padNumber((d.getMonth() + 1)) + "-" + padNumber(d.getDate());
    return XDate(dateString, true);
  } else if (d.year) {
    const dateString = d.year + "-" + padNumber(d.month) + "-" + padNumber(d.day);
    return XDate(dateString, true);
  } else if (d) { // timestamp nuber or date formatted as string
    return XDate(d, true);
  }
}

// -- Other

// setTimeout to wait module load
setTimeout(() => Configuration.instance.addTranslationListener(() => {
  // tslint:disable-next-line:no-string-literal
  LocaleConfig.locales["en"] = {
    monthNames: [
      I18n.t("january"),
      I18n.t("february"),
      I18n.t("march"),
      I18n.t("april"),
      I18n.t("may"),
      I18n.t("june"),
      I18n.t("july"),
      I18n.t("august"),
      I18n.t("september"),
      I18n.t("october"),
      I18n.t("november"),
      I18n.t("december"),
    ],
    monthNamesShort: [
      I18n.t("january").substring(0, 3),
      I18n.t("february").substring(0, 3),
      I18n.t("march").substring(0, 3),
      I18n.t("april").substring(0, 3),
      I18n.t("may").substring(0, 3),
      I18n.t("june").substring(0, 3),
      I18n.t("july").substring(0, 3),
      I18n.t("august").substring(0, 3),
      I18n.t("september").substring(0, 3),
      I18n.t("october").substring(0, 3),
      I18n.t("november").substring(0, 3),
      I18n.t("december").substring(0, 3),
    ],
    dayNames: [
      I18n.t("sunday"),
      I18n.t("monday"),
      I18n.t("tuesday"),
      I18n.t("wednesday"),
      I18n.t("thursday"),
      I18n.t("friday"),
      I18n.t("saturday"),
    ],
    dayNamesShort: [
      I18n.t("sunday").substring(0, 1),
      I18n.t("monday").substring(0, 1),
      I18n.t("tuesday").substring(0, 1),
      I18n.t("wednesday").substring(0, 1),
      I18n.t("thursday").substring(0, 1),
      I18n.t("friday").substring(0, 1),
      I18n.t("saturday").substring(0, 1),
    ], // <- needed for calendar
    amDesignator: "AM",
    pmDesignator: "PM",
  };

  LocaleConfig.defaultLocale = "en";
}));
