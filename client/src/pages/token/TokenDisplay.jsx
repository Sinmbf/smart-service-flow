import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import MainLayout from "../../layouts/MainLayout";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";

const TokenDisplay = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const tokenData = location.state;

  const [currentServing, setCurrentServing] = useState("A001");
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  useEffect(() => {
    // If no token data, redirect to service selection
    if (!tokenData) {
      navigate("/token/services");
      return;
    }

    // Simulate updating "currently serving" number every 3 seconds
    const interval = setInterval(() => {
      const prefix = currentServing.charAt(0);
      const num = parseInt(currentServing.slice(1));
      const newNum = String(num + 1).padStart(3, "0");
      setCurrentServing(`${prefix}${newNum}`);
    }, 3000);

    return () => clearInterval(interval);
  }, [tokenData, navigate, currentServing]);

  if (!tokenData) {
    return null;
  }

  const handleCancelToken = () => {
    setShowCancelConfirm(true);
  };

  const confirmCancel = () => {
    // Navigate back to service selection
    navigate("/token/services");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "waiting":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "called":
        return "bg-primary-100 text-primary-800 border-primary-200";
      case "serving":
        return "bg-green-100 text-green-800 border-green-200";
      case "completed":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <MainLayout>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Main Token Card - Spans 2 columns on desktop */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="backdrop-blur-md bg-white/95">
            <div className="space-y-6 py-2">
              {/* Title */}
              <div className="text-center px-2">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                  {t("token.display.title")}
                </h2>
                <p className="text-gray-600 mt-2 text-sm sm:text-base">
                  {t("token.display.subtitle")}
                </p>
              </div>

              {/* Token Number - Large Display */}
              <div className="bg-gradient-to-br from-primary-700 to-primary-500 rounded-2xl p-8 md:p-10 mx-2 text-center shadow-lg animate-pulse-slow">
                <p className="text-white/90 text-xs sm:text-sm font-medium mb-3">
                  {t("token.display.tokenNumber")}
                </p>
                <p className="text-white text-5xl sm:text-6xl md:text-7xl font-bold tracking-wider">
                  {tokenData.tokenNumber}
                </p>
              </div>

              {/* Token Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-2">
                {/* Service */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <span className="text-gray-600 font-medium text-xs sm:text-sm block mb-2 break-words">
                    {t("token.display.service")}
                  </span>
                  <span className="text-gray-900 font-semibold text-base sm:text-lg break-words">
                    {t(`token.services.${tokenData.service}`)}
                  </span>
                </div>

                {/* Queue Position */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <span className="text-gray-600 font-medium text-xs sm:text-sm block mb-2 break-words">
                    {t("token.display.queuePosition")}
                  </span>
                  <span className="text-gray-900 font-semibold text-2xl sm:text-3xl break-words">
                    {tokenData.queuePosition}
                  </span>
                </div>

                {/* Estimated Wait Time */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <span className="text-gray-600 font-medium text-xs sm:text-sm block mb-2 break-words">
                    {t("token.display.estimatedWait")}
                  </span>
                  <span className="text-gray-900 font-semibold text-base sm:text-lg break-words">
                    ~{tokenData.estimatedWait} {t("token.display.minutes")}
                  </span>
                </div>

                {/* Status */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <span className="text-gray-600 font-medium text-xs sm:text-sm block mb-2 break-words">
                    {t("token.display.status")}
                  </span>
                  <span
                    className={`inline-block px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold border ${getStatusColor(
                      tokenData.status
                    )} break-words`}
                  >
                    {t(`token.display.${tokenData.status}`)}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Notification Notice - Mobile */}
          <div className="lg:hidden bg-primary-50 border-2 border-primary-200 rounded-xl p-4 mx-2">
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6 text-primary-700 flex-shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-xs sm:text-sm text-primary-900 leading-relaxed">
                {t("token.display.keepThisPage")}
              </p>
            </div>
          </div>

          {/* Cancel Button - Mobile */}
          <div className="lg:hidden px-2">
            {!showCancelConfirm ? (
              <Button
                onClick={handleCancelToken}
                className="w-full bg-red-600 hover:bg-red-700"
              >
                {t("token.display.cancelToken")}
              </Button>
            ) : (
              <Card className="backdrop-blur-md bg-red-50 border-2 border-red-200">
                <div className="space-y-4">
                  <p className="text-center text-red-900 font-medium text-sm sm:text-base">
                    {t("token.display.confirmCancel")}
                  </p>
                  <div className="flex gap-3">
                    <Button
                      onClick={() => setShowCancelConfirm(false)}
                      variant="secondary"
                      className="flex-1"
                    >
                      {t("common.cancel")}
                    </Button>
                    <Button
                      onClick={confirmCancel}
                      variant="danger"
                      className="flex-1"
                    >
                      {t("common.submit")}
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Sidebar - Desktop */}
        <div className="space-y-4 lg:sticky lg:top-6">
          {/* Currently Serving Card */}
          <Card className="backdrop-blur-md bg-white/95">
            <div className="text-center space-y-3 py-2">
              <p className="text-gray-600 font-medium text-sm sm:text-base">
                {t("token.display.currentlyServing")}
              </p>
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 mx-2 border-2 border-gray-200">
                <p className="text-gray-900 text-3xl sm:text-4xl md:text-5xl font-bold animate-pulse-slow">
                  {currentServing}
                </p>
              </div>
            </div>
          </Card>

          {/* Notification Notice - Desktop */}
          <div className="hidden lg:block">
            <Card className="backdrop-blur-md bg-primary-50 border-2 border-primary-200">
              <div className="flex items-start gap-3">
                <svg
                  className="w-6 h-6 text-primary-700 flex-shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                <div>
                  <h4 className="font-semibold text-primary-900 mb-1 text-sm">
                    Important
                  </h4>
                  <p className="text-xs text-primary-900 leading-relaxed">
                    {t("token.display.keepThisPage")}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Cancel Button - Desktop */}
          <div className="hidden lg:block">
            {!showCancelConfirm ? (
              <Button
                onClick={handleCancelToken}
                className="w-full bg-red-600 hover:bg-red-700"
              >
                {t("token.display.cancelToken")}
              </Button>
            ) : (
              <Card className="backdrop-blur-md bg-red-50 border-2 border-red-200">
                <div className="space-y-4">
                  <p className="text-center text-red-900 font-medium text-sm">
                    {t("token.display.confirmCancel")}
                  </p>
                  <div className="space-y-2">
                    <Button
                      onClick={() => setShowCancelConfirm(false)}
                      variant="secondary"
                      className="w-full"
                    >
                      {t("common.cancel")}
                    </Button>
                    <Button
                      onClick={confirmCancel}
                      variant="danger"
                      className="w-full"
                    >
                      {t("common.submit")}
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Add subtle pulse animation */}
      <style>{`
        @keyframes pulse-slow {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.95;
          }
        }
        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
      `}</style>
    </MainLayout>
  );
};

export default TokenDisplay;
