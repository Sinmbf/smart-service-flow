import { useTranslation } from "react-i18next";

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (language: "en" | "ne") => {
    i18n.changeLanguage(language);
    localStorage.setItem("language", language);
  };

  return (
    <div>
      <button onClick={() => changeLanguage("en")}>English</button>

      <button onClick={() => changeLanguage("ne")}>नेपाली</button>
    </div>
  );
};

export default LanguageSwitcher;
