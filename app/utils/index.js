import { BaseConfig, Images } from "@config";
import i18n from "i18n-js";
import parsePhoneNumber from 'libphonenumber-js';
import memoize from "lodash.memoize";
import moment from 'moment';
import { Dimensions, I18nManager } from "react-native";
import { createThumbnail } from "react-native-create-thumbnail";
import * as RNLocalize from "react-native-localize";
import RNPreventScreenshot from "react-native-prevent-screenshot";

export const security = (isSecurity) => {
  RNPreventScreenshot.enabled(isSecurity);
}
const translationGetters = {
  en: () => require("../lang/en.json"),
  de: () => require("../lang/de.json")
};
const checkKeyTrans = (key) => {
  const cur_lan = getCurLan() == "en" ? translationGetters.en() : translationGetters.de();
  if (key in cur_lan) return key;
  else if (key.replace(" ", "-") in cur_lan) return key;
  else if (key.toLowerCase() in cur_lan) return key;
  else if (key.replace(" ", "-").toLowerCase() in cur_lan) return key;
  return false;
}
export const translate = (text, ...params) => {
  if (typeof text == "string") {
    const comma = text.indexOf("...");
    const key = checkKeyTrans(text.replace("...", ''));
    if (key) {
      text = textTranslate(key) + `${comma >= 0 ? "..." : ''}`;
    }
  }
  try {
    params?.forEach((item, index) => {
      text = text.replace(`%${index + 1}`, item);
    });
  } catch (error) {
  }
  return text;
}
export const textTranslate = memoize(
  (key, config) => i18n.t(key, config),
  (key, config) => (config ? key + JSON.stringify(config) : key)
);

export function setI18nConfig() {
  const fallback = { languageTag: "en", isRTL: false };

  const { languageTag, isRTL } =
    RNLocalize.findBestAvailableLanguage(Object.keys(translationGetters)) ||
    fallback;

  textTranslate.cache.clear();
  I18nManager.forceRTL(isRTL);
  i18n.translations = { [languageTag]: translationGetters[languageTag]() };
  i18n.locale = languageTag;
};
export const getCurLan = () => { return i18n.locale };
export const getDeviceWidth = (windows) => {
  return Dimensions.get(windows ? 'window' : 'screen').width;
}
export const getDeviceHeight = (windows) => {
  return Dimensions.get(windows ? 'window' : 'screen').height;
}
export const checkString = (str) => {
  try {
    if (!str || str == undefined || str == null || str == "" || str.toLowerCase() == "null" || str.toLowerCase() == "undefined") {
      return false;
    }
  } catch (err) { }
  return true;
}
/**
 * 
 * @param {date or null} date 
 * @param {int} type 0(from now), 1(hour:minute), 2(month day, year)
 * @returns {string}
 */
export const date2str = (date, type = 0) => {
  if (!date || !new Date(date)) return '';
  if (type == 0) {
    return moment(date).fromNow();
  } else if (type == 1) {
    return moment(date).format('H:mm');
  } else if (type == 2) {
    return moment(date).format('ll');   // Jun 1, 2021
  } else if (type == 3) {
    if (moment().isSame(moment(date), 'd')) {
      return moment(date).format('H:mm');
    } else if (moment().add(-1, "days").isSame(moment(date), 'd')) {
      return "yesterday";
    } else if (moment().isSame(moment(date), 'w')) {
      return moment(date).format('dddd');
    }
    return moment(date).format('ll');
  }
}
export const compareDate = (d1, d2, d1big = true) => { //d1 > d2 true
  var date1 = new Date(d1 || null);
  var date2 = new Date(d2 || null);
  if (d1big) return date1.getTime() - date2.getTime();
  return date2.getTime() - date1.getTime();
}
export const image_uri = (uri, obj_key = "uri", defPath = Images.def_avatar) => {
  try {
    if (typeof uri === "object") {
      if ("path" in uri) {
        uri = uri.path;
      } else if ("uri" in uri) {
        uri = uri.uri;
      } else if ("url" in uri) {
        uri = uri.url
      }
    }
    if (!checkString(uri)) {
      return defPath
    }
    if (typeof uri === "string") {
      const tmp_uri = uri.toLowerCase();
      if (tmp_uri.includes("file://") || tmp_uri.includes("content://") || tmp_uri.includes("http://") || tmp_uri.includes("https://")) {
        return { [obj_key]: uri };
      } else {
        return { [obj_key]: `${BaseConfig.SERVER_HOST}${uri}` }
      }
    }
  } catch (err) { }
  return defPath
}
const checkphone = (p1, p2) => {
  const phone1 = parsePhoneNumber(p1, 'CH');
  const phone2 = parsePhoneNumber(p2, 'CH');
  if (!phone1 || !phone2) return false;

  return phone1.nationalNumber == phone2.nationalNumber;
}
export const comparePhone = (phone1, phone2) => {
  if (phone1 == phone2) return true;
  if (!phone1 || !phone2) return false;
  try {
    if (typeof phone1 == "object") {
      for (let i = 0; i < phone1.length; i++) {
        if (checkphone(phone1[i]?.number, phone2))
          return true;
      }
    } else {
      return checkphone(phone1, phone2);
    }
  } catch (err) {
    return false;
  }
  return false;
}

export const _INTVAL = (v1) => (v1 || 0)
export const _MAX = (...values) => Math.max(...values.map(item => _INTVAL(item)))

export const videoThumbnail = async (url) => {
  return new Promise((resolve, reject) => {
    createThumbnail({ ...image_uri(url, "url"), timeStamp: 1000, format: 'png' })
      .then(resolve)
      .catch((err) => resolve({}));
  })
}
export const phoneformatter = (value) => {
  if (!value) return;
  try {
    return new parsePhoneNumber.AsYouType().input(value);
  } catch (error) {
  }
  return value;
};