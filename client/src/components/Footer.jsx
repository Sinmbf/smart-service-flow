import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-neutral-950 text-neutral-400 py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 grid grid-cols-1 md:grid-cols-3 gap-10">
        <div className="space-y-4">
          <Link to="/" className="text-xl font-heading font-bold text-white">
            {t("common.appName")}
          </Link>
          <p className="text-sm leading-relaxed">
            {t("home.hero.subheadline")}
          </p>
        </div>

        <div className="space-y-4">
          <h4 className="font-heading font-bold text-white">{t("footer.services")}</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/token/services" className="hover:text-white transition-colors">{t("footer.generateToken")}</Link></li>
            <li><Link to="/token/monitor" className="hover:text-white transition-colors">{t("footer.monitorQueue")}</Link></li>
          </ul>
        </div>

        <div className="space-y-4">
          <h4 className="font-heading font-bold text-white">{t("footer.legal")}</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="#" className="hover:text-white transition-colors">{t("footer.privacyPolicy")}</Link></li>
            <li><Link to="#" className="hover:text-white transition-colors">{t("footer.termsOfService")}</Link></li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 mt-12 pt-8 border-t border-neutral-800 text-center text-xs">
        &copy; {new Date().getFullYear()} {t("common.appName")}. {t("footer.allRightsReserved")}.
      </div>
    </footer>
  );
};

export default Footer;
