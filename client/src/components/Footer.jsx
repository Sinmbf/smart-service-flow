import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="border-t border-neutral-200 bg-white py-12 sm:py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-12">
          {/* Column 1: App info */}
          <div className="mb-6 md:mb-0">
            <Link
              to="/"
              className="flex items-center gap-2 mb-4 hover:opacity-90 transition-opacity">
              <div className="bg-primary-700 p-2.5 sm:p-3 md:p-3.5 rounded-xl flex-shrink-0">
                <svg
                  className="h-5 w-5 sm:h-6 md:h-7 text-white"
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

            <p className="text-neutral-600 text-sm lg:text-base leading-relaxed">
              {t("common.appSubtitle")}
            </p>
          </div>

          {/* Column 2: Navigation */}
          <nav className="space-y-3 md:space-y-4">
            <h4 className="font-heading font-semibold text-neutral-900 text-sm mb-3">
              {t("footer.services")}
            </h4>
            <ul className="space-y-2 text-neutral-700 text-sm">
              <li>
                <Link
                  to="/token/services"
                  className={["hover:text-primary-700", "transition-colors"].join(" ")}
                >
                  {t("footer.generateToken")}
                </Link>
              </li>
              <li>
                <Link
                  to="/token/monitor"
                  className={["hover:text-primary-700", "transition-colors"].join(" ")}
                >
                  {t("footer.monitorQueue")}
                </Link>
              </li>
            </ul>
          </nav>

          {/* Column 3: Legal */}
          <nav className="space-y-3 md:space-y-4">
            <h4 className="font-heading font-semibold text-neutral-900 text-sm mb-3">
              {t("footer.legal")}
            </h4>
            <ul className="space-y-2 text-neutral-700 text-sm">
              {/* TODO: Replace placeholder anchors with real routes when Privacy Policy and Terms of Service pages are created */}
              <li>
                <a
                  href="#"
                  className={["hover:text-primary-700", "transition-colors"].join(" ")}
                >
                  {t("footer.privacyPolicy")}
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className={["hover:text-primary-700", "transition-colors"].join(" ")}
                >
                  {t("footer.termsOfService")}
                </a>
              </li>
            </ul>
          </nav>
        </div>

        {/* Bottom divider */}
        <div className="mt-12 pt-8 border-t border-neutral-100">
          <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 text-neutral-500 text-xs text-center">
              <span>© 2026 {t("common.appName")}. {t("footer.allRightsReserved")}.</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;