import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const changeLanguage = (language: "en" | "ne") => {
    i18n.changeLanguage(language);
    localStorage.setItem("language", language);
  };
  const currentLanguage = i18n.language;

  return (
    <div className="flex items-center gap-1 sm:gap-1.5 bg-white/95 backdrop-blur-sm px-1.5 sm:px-2 py-1 sm:py-1.5 rounded-xl shadow-md">
      <Globe className="h-3.5 w-3.5 text-gray-500 hidden sm:block" />
      <div className="flex items-center gap-0.5 sm:gap-1">
        <button
          onClick={() => changeLanguage("en")}
          className={`text-[11px] sm:text-sm font-semibold transition-colors px-1.5 sm:px-1.5 py-0.5 rounded-md cursor-pointer ${
            currentLanguage === "en"
              ? "text-[#2563EB] bg-blue-50"
              : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
          }`}
        >
          <span className="sm:hidden">EN</span>
          <span className="hidden sm:inline">English</span>
        </button>
        <span className="text-gray-300 text-[11px] sm:text-xs">|</span>
        <button
          onClick={() => changeLanguage("ne")}
          className={`text-[11px] sm:text-sm font-semibold transition-colors px-1.5 py-0.5 rounded-md cursor-pointer ${
            currentLanguage === "ne"
              ? "text-[#2563EB] bg-blue-50"
              : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
          }`}
        >
          <span className="sm:hidden">ने</span>
          <span className="hidden sm:inline">नेपाली</span>
        </button>
      </div>
    </div>
  );
};

export default LanguageSwitcher;
