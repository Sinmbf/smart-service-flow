import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import MainLayout from "../layouts/MainLayout";
import Card from "../components/ui/Card";
import { Button } from "../components/ui";
import { Users, QrCode, Gauge } from "lucide-react";

const Home = () => {
  const { t } = useTranslation();

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto py-8 px-4">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {t("common.appName")}
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            {t("common.appSubtitle")}
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {/* Get Queue Token Card */}
          <Card className="backdrop-blur-md bg-white/95 hover:shadow-xl transition-all duration-200">
            <div className="p-6 sm:p-8 text-center space-y-6">
              <div className="bg-gradient-to-br from-[#1E40AF] to-[#3B82F6] rounded-full w-14 h-14 flex items-center justify-center mx-auto">
                <Users className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                {t("home.getQueueToken")}
              </h2>
              <p className="text-gray-600 text-sm">
                {t("home.getQueueTokenDesc")}
              </p>
              <Link
                to="/token/services"
                className="group inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#1E40AF] to-[#3B82F6] hover:from-[#1D4ED8] hover:to-[#2563EB] text-white font-semibold rounded-xl px-6 py-3 transition-all duration-200 w-full whitespace-nowrap text-sm sm:text-base leading-tight"
              >
                {t("home.startQueue")}
                <Users className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </Card>

          {/* View Live Queue Status Card */}
          <Card className="backdrop-blur-md bg-white/95 hover:shadow-xl transition-all duration-200">
            <div className="p-6 sm:p-8 text-center space-y-6">
              <div className="bg-gradient-to-br from-[#059669] to-[#10B981] rounded-full w-14 h-14 flex items-center justify-center mx-auto">
                <Gauge className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                {t("home.viewLiveQueue")}
              </h2>
              <p className="text-gray-600 text-sm">
                {t("home.viewLiveQueueDesc")}
              </p>
              <Link
                to="/token/monitor"
                className="group inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#059669] to-[#10B981] hover:from-[#047857] hover:to-[#059669] text-white font-semibold rounded-xl px-6 py-3 transition-all duration-200 w-full whitespace-nowrap text-sm sm:text-base leading-tight"
              >
                {t("home.viewQueue")}
                <Gauge className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </Card>

          {/* Staff Login Card */}
          <Card className="backdrop-blur-md bg-white/95 hover:shadow-xl transition-all duration-200">
            <div className="p-6 sm:p-8 text-center space-y-6">
              <div className="bg-gradient-to-br from-[#7C3AED] to-[#A855F7] rounded-full w-14 h-14 flex items-center justify-center mx-auto">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                {t("home.staffLogin")}
              </h2>
              <p className="text-gray-600 text-sm">
                {t("home.staffLoginDesc")}
              </p>
              <Link
                to="/login"
                className="group inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#7C3AED] to-[#A855F7] hover:from-[#6D28D9] hover:to-[#7C3AED] text-white font-semibold rounded-xl px-6 py-3 transition-all duration-200 w-full whitespace-nowrap text-sm sm:text-base leading-tight"
              >
                {t("home.loginAsStaff")}
                <Shield className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </Card>
        </div>

        {/* QR Code Display Section */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            {t("home.displayQrCode")}
          </h2>
          <p className="text-white/70 mb-6">
            {t("home.displayQrCodeDesc")}
          </p>

          <Card className="backdrop-blur-md bg-white/95 inline-block">
            <div className="p-6 sm:p-8">
              <div className="bg-gray-50 rounded-2xl p-6 inline-block">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(window.location.origin + "/token/services")}&format=png`}
                  alt="QR code for queue services"
                  className="w-48 h-48 object-contain"
                />
              </div>
              <p className="text-xs text-gray-500 mt-4">
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

// Shield icon since we're importing from lucide-react
const Shield = (props: any) => (
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