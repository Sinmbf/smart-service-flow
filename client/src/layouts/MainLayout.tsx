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
    <div className="min-h-screen bg-neutral-100">
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid-main" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#0A3A48" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-main)" />
        </svg>
      </div>

      {/* Header */}
      {showHeader && (
        <header className="relative z-10 bg-white border-b border-neutral-200 px-3 py-3 sm:px-6 md:px-8 lg:py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-3 md:gap-4">
            {/* Logo + Title */}
            <Link to="/" className="flex items-center gap-2 sm:gap-3 md:gap-4 min-w-0 hover:opacity-90 transition-opacity">
              <div className="bg-primary-700 p-2.5 sm:p-3 md:p-3.5 rounded-xl shadow-md flex-shrink-0">
                <svg
                  className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 text-white"
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
              <div className="min-w-0 hidden sm:flex flex-col justify-center">
                <h1 className="text-base sm:text-xl md:text-xl font-heading font-bold text-neutral-900 leading-none truncate">
                  {t("common.appName")}
                </h1>
              </div>
            </Link>

            {/* Right controls */}
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              {/* Token route nav pill */}
              {isTokenRoute && (
                <nav aria-label="Token navigation" className="flex items-center gap-1 bg-neutral-100 rounded-lg p-1 shadow-sm">
                  <Link
                    to="/"
                    aria-label={t("common.home")}
                    aria-current={location.pathname === "/" ? "page" : undefined}
                    className={`px-3 py-2 rounded-md font-heading font-semibold transition-all min-h-[44px] flex items-center ${
                      location.pathname === "/"
                        ? "bg-gradient-to-r from-primary-700 to-primary-500 text-white shadow-md"
                        : "text-neutral-700 hover:bg-white"
                    }`}
                  >
                    <span className="hidden sm:inline text-sm">{t("common.home")}</span>
                    <span className="sm:hidden">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                    </span>
                  </Link>
                  <Link
                    to="/token/monitor"
                    aria-label={t("token.monitor.title")}
                    aria-current={isMonitor ? "page" : undefined}
                    className={`px-3 py-2 rounded-md font-heading font-semibold transition-all min-h-[44px] flex items-center ${
                      isMonitor
                        ? "bg-gradient-to-r from-primary-700 to-primary-500 text-white shadow-md"
                        : "text-neutral-700 hover:bg-white"
                    }`}
                  >
                    <span className="hidden md:inline text-sm">{t("token.monitor.title")}</span>
                    <span className="md:hidden">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </span>
                  </Link>
                  <Link
                    to="/token/services"
                    aria-label={t("token.services.continueButton")}
                    aria-current={isServices ? "page" : undefined}
                    className={`px-3 py-2 rounded-md font-heading font-semibold transition-all min-h-[44px] flex items-center ${
                      isServices
                        ? "bg-gradient-to-r from-primary-700 to-primary-500 text-white shadow-md"
                        : "text-neutral-700 hover:bg-white"
                    }`}
                  >
                    <span className="hidden sm:inline text-sm">{t("token.services.continueButton")}</span>
                    <span className="sm:hidden">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
      <main className="relative z-10 px-4 py-6 sm:px-6 md:px-8 lg:py-10">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
};

export default MainLayout;
