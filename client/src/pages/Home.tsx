import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import MainLayout from "../layouts/MainLayout";
import Card from "../components/ui/Card";
import { Users, Gauge } from "lucide-react";

const Home = () => {
  const { t } = useTranslation();

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto py-10 px-4">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-neutral-900 mb-4">
            {t("common.appName")}
          </h1>
          <p className="text-lg md:text-xl text-neutral-700 max-w-2xl mx-auto">
            {t("common.appSubtitle")}
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {/* Get Queue Token Card */}
          <Card className="hover:border-blue-300">
            <div className="p-4 text-center space-y-6">
              <div className="bg-gradient-to-br from-blue-700 to-blue-500 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto shadow-lg">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-heading font-bold text-neutral-900">
                {t("home.getQueueToken")}
              </h2>
              <p className="text-base text-neutral-700">
                {t("home.getQueueTokenDesc")}
              </p>
              <Link
                to="/token/services"
                className="group inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-700 via-blue-600 to-blue-500 hover:from-blue-800 hover:via-blue-700 hover:to-blue-600 text-white font-heading font-semibold rounded-lg px-6 py-3.5 transition-all duration-200 w-full text-base shadow-md hover:shadow-lg"
              >
                {t("home.startQueue")}
                <Users className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
              </Link>
            </div>
          </Card>

          {/* View Live Queue Status Card */}
          <Card className="hover:border-emerald-300">
            <div className="p-4 text-center space-y-6">
              <div className="bg-gradient-to-br from-emerald-600 to-emerald-500 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto shadow-lg">
                <Gauge className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-heading font-bold text-neutral-900">
                {t("home.viewLiveQueue")}
              </h2>
              <p className="text-base text-neutral-700">
                {t("home.viewLiveQueueDesc")}
              </p>
              <Link
                to="/token/monitor"
                className="group inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white font-heading font-semibold rounded-lg px-6 py-3.5 transition-all duration-200 w-full text-base shadow-md hover:shadow-lg"
              >
                {t("home.viewQueue")}
                <Gauge className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
              </Link>
            </div>
          </Card>

          {/* Staff Login Card */}
          <Card className="hover:border-violet-300">
            <div className="p-4 text-center space-y-6">
              <div className="bg-gradient-to-br from-violet-600 to-violet-500 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto shadow-lg">
                <ShieldIcon className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-heading font-bold text-neutral-900">
                {t("home.staffLogin")}
              </h2>
              <p className="text-base text-neutral-700">
                {t("home.staffLoginDesc")}
              </p>
              <Link
                to="/login"
                className="group inline-flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-700 hover:to-violet-600 text-white font-heading font-semibold rounded-lg px-6 py-3.5 transition-all duration-200 w-full text-base shadow-md hover:shadow-lg"
              >
                {t("home.loginAsStaff")}
                <ShieldIcon className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
              </Link>
            </div>
          </Card>
        </div>

        {/* QR Code Display Section */}
        <div className="text-center">
          <h2 className="text-2xl font-heading font-bold text-neutral-900 mb-4">
            {t("home.displayQrCode")}
          </h2>
          <p className="text-lg text-neutral-700 mb-8">
            {t("home.displayQrCodeDesc")}
          </p>

          <Card className="inline-block">
            <div className="p-6 sm:p-8">
              <div className="bg-neutral-100 rounded-xl p-6 inline-block">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(window.location.origin + "/token/services")}&format=png`}
                  alt="QR code for queue services"
                  className="w-48 h-48 object-contain"
                />
              </div>
              <p className="text-sm text-neutral-600 mt-6">
                {t("home.qrInstructions")}
              </p>
            </div>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default Home;

// Inline Shield icon
const ShieldIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);
