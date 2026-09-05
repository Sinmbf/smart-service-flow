import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";
import axios from "../services/api";
import { useAuth } from "../auth/AuthContext";

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const { isAuthenticated } = useAuth();
  const currentLanguage = i18n.language;

  const changeLanguage = async (language) => {
    // 1. Always update local state instantly so the UI doesn't wait.
    i18n.changeLanguage(language);
    localStorage.setItem("language", language);

    // 2. If the user is signed in, persist to the server so their preference
    //    survives across devices. Fire-and-forget: a failure here should
    //    not block the user.
    if (!isAuthenticated) return;

    try {
      await axios.put(
        "/auth/me/language",
        { language: language.toUpperCase() },
        { skipGlobalErrorToast: true }
      );
    } catch {
      // Silent: the localStorage write is the source of truth for the
      // current session; the next page load will re-derive from the
      // (un-persisted) server value via /api/auth/me.
    }
  };

  return (
    <div className="flex items-center gap-1 sm:gap-1.5 bg-white/95 backdrop-blur-sm px-1.5 sm:px-2 py-1 sm:py-1.5 rounded-xl shadow-md">
      <Globe className="h-3.5 w-3.5 text-gray-500 hidden sm:block" />
      <div className="flex items-center gap-0.5 sm:gap-1">
        <button
          onClick={() => changeLanguage("en")}
          className={`text-[11px] sm:text-sm font-semibold transition-colors px-1.5 sm:px-1.5 py-0.5 rounded-md cursor-pointer ${
            currentLanguage === "en"
              ? "text-primary-700 bg-primary-50"
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
              ? "text-primary-700 bg-primary-50"
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
