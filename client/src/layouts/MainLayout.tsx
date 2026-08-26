import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";
import LanguageSwitcher from "../components/LanguageSwitcher";

interface MainLayoutProps {
  children: ReactNode;
  showHeader?: boolean;
}

const MainLayout = ({ children, showHeader = true }: MainLayoutProps) => {
  const { t } = useTranslation();
  const location = useLocation();
  const isTokenRoute = location.pathname.startsWith("/token");
  const isMonitor = location.pathname === "/token/monitor";
  const isServices = location.pathname === "/token/services";
  const isScanner = location.pathname === "/token/scanner";

  return (
    <div className="min-h-screen bg-[#0f172a] relative overflow-hidden">
      {/* Subtle dot texture */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.07]">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="dot" width="28" height="28" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1" fill="white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dot)" />
        </svg>
      </div>

      {/* Header */}
      {showHeader && (
        <header className="relative z-10 px-4 pt-4 pb-4 sm:px-6 md:px-8 lg:pt-6 lg:pb-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            {/* Logo + Title */}
            <div className="flex items-center gap-2.5 sm:gap-3 md:gap-4 flex-shrink-0">
              <div className="bg-white p-2 sm:p-3 md:p-4 rounded-2xl shadow-lg">
                <svg
                  className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-[#2563EB]"
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
              <div className="hidden xs:block">
                <h1 className="text-base sm:text-xl md:text-2xl font-bold text-white leading-tight">
                  {t("common.appName")}
                </h1>
                <p className="text-[10px] sm:text-xs md:text-sm text-white/60 mt-0.5">
                  Government Service Management System
                </p>
              </div>
            </div>

            {/* Right controls */}
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              {/* Token route nav pill */}
              {isTokenRoute && (
                <nav className="flex items-center gap-0.5 sm:gap-1 bg-white/95 backdrop-blur-md rounded-xl p-1 shadow-lg">
                  <Link
                    to="/token/scanner"
                    className={`text-[10px] xs:text-xs sm:text-sm px-2 sm:px-3 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap cursor-pointer ${
                      isScanner
                        ? "bg-gradient-to-r from-[#1E40AF] to-[#3B82F6] text-white"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <span className="hidden sm:inline">{t("common.home")}</span>
                    <span className="sm:hidden">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                    </span>
                  </Link>
                  <Link
                    to="/token/monitor"
                    className={`text-[10px] xs:text-xs sm:text-sm px-2 sm:px-3 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap cursor-pointer ${
                      isMonitor
                        ? "bg-gradient-to-r from-[#1E40AF] to-[#3B82F6] text-white"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <span className="hidden md:inline">{t("token.monitor.title")}</span>
                    <span className="md:hidden">{t("token.monitor.title")}</span>
                  </Link>
                  <Link
                    to="/token/services"
                    className={`text-[10px] xs:text-xs sm:text-sm px-2 sm:px-3 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap cursor-pointer ${
                      isServices
                        ? "bg-gradient-to-r from-[#1E40AF] to-[#3B82F6] text-white"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <span className="hidden sm:inline">{t("token.services.continueButton")}</span>
                    <span className="sm:hidden">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                    </span>
                  </Link>
                </nav>
              )}
              <LanguageSwitcher />
            </div>
          </div>
        </header>
      )}

      {/* Main content */}
      <main className="relative z-10 px-4 pb-8 sm:px-6 md:px-8 lg:pb-12">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
};

export default MainLayout;
