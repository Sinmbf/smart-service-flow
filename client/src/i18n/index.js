import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./en/common.json";
import ne from "./ne/common.json";

const savedLanguage = localStorage.getItem("language");

i18n.use(initReactI18next).init({
  resources: {
    en,
    ne,
  },

  lng === "ne" ? "ne" : "en",
  fallbackLng: "en",

  interpolation,
});
export default i18n;