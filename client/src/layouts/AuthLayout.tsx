import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../components/LanguageSwitcher";

interface AuthLayoutProps {
  children: ReactNode;
}

const AuthLayout = ({ children }: AuthLayoutProps) => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-[#0f172a] relative overflow-hidden">
      {/* Subtle dot texture */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.07]">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="dot-auth" width="28" height="28" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1" fill="white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dot-auth)" />
        </svg>
      </div>

      {/* Header */}
      <header className="relative z-10 px-4 pt-4 pb-6 sm:px-8 lg:px-12 lg:pt-8 lg:pb-10">
        <div className="max-w-md mx-auto lg:max-w-5xl lg:flex lg:items-center lg:justify-between">
          {/* Logo + Title */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="bg-white p-2.5 sm:p-3 md:p-4 rounded-2xl shadow-lg flex-shrink-0">
              <svg
                className="h-9 w-9 sm:h-10 sm:w-10 md:h-12 md:w-12 text-[#2563EB]"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12 3L2 8V10H22V8L12 3Z" fill="currentColor" />
                <rect x="4" y="10" width="3" height="8" fill="currentColor" />
                <rect x="10" y="10" width="4" height="8" fill="currentColor" />
                <rect x="17" y="10" width="3" height="8" fill="currentColor" />
                <rect x="2" y="18" width="20" height="2" fill="currentColor" />
                <circle cx="12" cy="6" r="1" fill="#DC2626" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white leading-tight">
                {t("common.appName")}
              </h1>
              <p className="text-xs sm:text-sm text-white/60 mt-0.5 hidden sm:block">
                Government Service Management System
              </p>
            </div>
          </div>

          {/* Language Switcher */}
          <div className="mt-3 lg:mt-0">
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 px-4 pb-8 sm:px-6 lg:px-12">
        <div className="max-w-md mx-auto lg:flex lg:items-center lg:justify-center lg:min-h-[calc(100vh-200px)]">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AuthLayout;
