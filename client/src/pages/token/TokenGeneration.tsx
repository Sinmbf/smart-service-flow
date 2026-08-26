import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import MainLayout from "../../layouts/MainLayout";
import Card from "../../components/ui/Card";

const TokenGeneration = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const service = location.state?.service;

  useEffect(() => {
    // If no service selected, redirect back to service selection
    if (!service) {
      navigate("/token/services");
      return;
    }

    // Generate token after 2 seconds
    const timer = setTimeout(() => {
      // Generate a random token number (format: A001, B023, etc.)
      const prefix = String.fromCharCode(65 + Math.floor(Math.random() * 26)); // A-Z
      const number = String(Math.floor(Math.random() * 999) + 1).padStart(3, "0");
      const tokenNumber = `${prefix}${number}`;

      // Calculate queue position (simulated)
      const queuePosition = Math.floor(Math.random() * 15) + 1;

      // Calculate estimated wait time (5-10 minutes per person ahead)
      const estimatedWait = queuePosition * (Math.floor(Math.random() * 6) + 5);

      // Navigate to token display with generated data
      navigate("/token/display", {
        state: {
          tokenNumber,
          service,
          queuePosition,
          estimatedWait,
          status: "waiting",
          generatedAt: new Date().toISOString(),
        },
      });
    }, 2000);

    return () => clearTimeout(timer);
  }, [service, navigate]);

  return (
    <MainLayout>
      <Card className="backdrop-blur-md bg-white/95">
        <div className="text-center space-y-6 py-8">
          {/* Title */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {t("token.generation.title")}
            </h2>
            <p className="text-gray-600 mt-2">
              {t("token.generation.subtitle")}
            </p>
          </div>

          {/* Loading Animation */}
          <div className="flex flex-col items-center justify-center space-y-6">
            {/* Spinner */}
            <div className="relative w-24 h-24">
              <div className="absolute inset-0 border-8 border-gray-200 rounded-full"></div>
              <div className="absolute inset-0 border-8 border-[#2563EB] border-t-transparent rounded-full animate-spin"></div>
            </div>

            {/* Generating text */}
            <p className="text-lg font-medium text-gray-700 animate-pulse">
              {t("token.generation.generating")}
            </p>

            {/* Token Icon Animation */}
            <div className="flex items-center gap-2 animate-bounce">
              <svg
                className="w-12 h-12 text-[#2563EB]"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z" />
                <path d="M7 12h2v5H7zm4-3h2v8h-2zm4-3h2v11h-2z" />
              </svg>
            </div>
          </div>
        </div>
      </Card>
    </MainLayout>
  );
};

export default TokenGeneration;
