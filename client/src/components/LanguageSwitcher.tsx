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
    <div className="flex items-center gap-2">
      <Globe className="h-4 w-4 text-[#64748B]" />
      <button
        onClick={() => changeLanguage("en")}
        className={`text-sm font-medium transition-colors ${
          currentLanguage === "en"
            ? "text-[#2563EB]"
            : "text-[#64748B] hover:text-[#1E293B]"
        }`}
      >
        English
      </button>
      <span className="text-[#E2E8F0]">|</span>
      <button
        onClick={() => changeLanguage("ne")}
        className={`text-sm font-medium transition-colors ${
          currentLanguage === "ne"
            ? "text-[#2563EB]"
            : "text-[#64748B] hover:text-[#1E293B]"
        }`}
      >
        नेपाली
      </button>
    </div>
  );
};

export default LanguageSwitcher;
