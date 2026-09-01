import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import LanguageSwitcher from "../components/LanguageSwitcher";

interface AuthLayoutProps {
  children: ReactNode;
}

const AuthLayout = ({ children }: AuthLayoutProps) => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-neutral-100">
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid-auth" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#0A3A48" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-auth)" />
        </svg>
      </div>

      {/* Header */}
      <header className="relative z-10 px-4 pt-6 pb-8 sm:px-8 lg:px-12 lg:pt-10">
        <div className="max-w-5xl mx-auto lg:flex lg:items-center lg:justify-between">
          {/* Logo + Title */}
          <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
            <div className="bg-primary-700 p-3 rounded-xl shadow-md flex-shrink-0">
              <svg
                className="h-10 w-10 text-white"
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
              <h1 className="text-xl font-heading font-bold text-neutral-900 leading-tight">
                {t("common.appName")}
              </h1>
            </div>
          </Link>

          {/* Language Switcher */}
          <div className="mt-4 lg:mt-0">
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 px-4 pb-12 sm:px-6 lg:px-12">
        <div className="max-w-md mx-auto lg:max-w-5xl lg:flex lg:items-center lg:justify-center lg:min-h-[calc(100vh-200px)]">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AuthLayout;
