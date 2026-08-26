import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../components/LanguageSwitcher";

interface AuthLayoutProps {
  children: ReactNode;
}

const AuthLayout = ({ children }: AuthLayoutProps) => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1E40AF] via-[#2563EB] to-[#3B82F6] relative overflow-hidden">
      {/* Background decorative elements - Nepali temple silhouettes */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Mountain/Temple silhouettes at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-48 sm:h-64 opacity-20">
          <svg
            className="w-full h-full"
            viewBox="0 0 1200 300"
            fill="none"
            preserveAspectRatio="xMidYMax slice"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Temple structures */}
            <path d="M50 280 L80 240 L110 280 Z" fill="white" opacity="0.3" />
            <path d="M70 280 L90 250 L110 280 Z" fill="white" opacity="0.2" />
            <rect
              x="65"
              y="280"
              width="50"
              height="20"
              fill="white"
              opacity="0.25"
            />

            <path
              d="M200 270 L240 220 L280 270 Z"
              fill="white"
              opacity="0.35"
            />
            <path
              d="M220 270 L240 235 L260 270 Z"
              fill="white"
              opacity="0.25"
            />
            <rect
              x="215"
              y="270"
              width="50"
              height="30"
              fill="white"
              opacity="0.3"
            />

            <path d="M400 265 L445 210 L490 265 Z" fill="white" opacity="0.3" />
            <path d="M420 265 L445 225 L470 265 Z" fill="white" opacity="0.2" />
            <rect
              x="415"
              y="265"
              width="60"
              height="35"
              fill="white"
              opacity="0.25"
            />

            <path
              d="M650 275 L685 230 L720 275 Z"
              fill="white"
              opacity="0.35"
            />
            <path
              d="M665 275 L685 240 L705 275 Z"
              fill="white"
              opacity="0.25"
            />
            <rect
              x="660"
              y="275"
              width="50"
              height="25"
              fill="white"
              opacity="0.3"
            />

            <path
              d="M850 268 L895 215 L940 268 Z"
              fill="white"
              opacity="0.32"
            />
            <path
              d="M870 268 L895 230 L920 268 Z"
              fill="white"
              opacity="0.22"
            />
            <rect
              x="865"
              y="268"
              width="60"
              height="32"
              fill="white"
              opacity="0.27"
            />

            <path
              d="M1050 278 L1080 238 L1110 278 Z"
              fill="white"
              opacity="0.3"
            />
            <path
              d="M1065 278 L1080 248 L1095 278 Z"
              fill="white"
              opacity="0.2"
            />
            <rect
              x="1060"
              y="278"
              width="40"
              height="22"
              fill="white"
              opacity="0.25"
            />
          </svg>
        </div>
      </div>

      {/* Header */}
      <header className="relative z-10 px-4 pt-4 pb-6 sm:px-6">
        <div className="max-w-md mx-auto flex items-start justify-between">
          <div className="flex items-center gap-3">
            {/* Government Building Icon */}
            <div className="bg-white/95 backdrop-blur-sm p-3 rounded-2xl shadow-lg">
              <svg
                className="h-10 w-10 text-[#2563EB]"
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
              <h1 className="text-xl font-bold text-white leading-tight">
                {t("common.appName")}
              </h1>
              <p className="text-xs text-white/90 mt-0.5">
                Government Service Management System
              </p>
            </div>
          </div>
          <LanguageSwitcher />
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 px-4 pb-8 sm:px-6">
        <div className="max-w-md mx-auto">{children}</div>
      </main>
    </div>
  );
};

export default AuthLayout;
