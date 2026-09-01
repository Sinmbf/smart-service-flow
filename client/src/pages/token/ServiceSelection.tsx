import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import MainLayout from "../../layouts/MainLayout";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";

interface Service {
  id: string;
  icon: React.ReactNode;
  nameKey: string;
  descKey: string;
}

const ServiceSelection = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [selectedService, setSelectedService] = useState<string>("");

  const services: Service[] = [
    {
      id: "citizenship",
      nameKey: "token.services.citizenship",
      descKey: "token.services.citizenshipDesc",
      icon: (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
        </svg>
      ),
    },
    {
      id: "passport",
      nameKey: "token.services.passport",
      descKey: "token.services.passportDesc",
      icon: (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20 5H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 12H4V7h16v10zM6 10h2v2H6zm0 3h8v2H6zm10-3h2v5h-2z" />
        </svg>
      ),
    },
    {
      id: "landRegistry",
      nameKey: "token.services.landRegistry",
      descKey: "token.services.landRegistryDesc",
      icon: (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 9.3V4h-3v2.6L12 3 2 12h3v8h6v-6h2v6h6v-8h3l-3-2.7zM17 18h-2v-6H9v6H7v-7.81l5-4.5 5 4.5V18z" />
        </svg>
      ),
    },
    {
      id: "permits",
      nameKey: "token.services.permits",
      descKey: "token.services.permitsDesc",
      icon: (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
          <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11zM8 15h8v2H8v-2zm0-3h8v2H8v-2zm0-3h5v2H8V9z" />
        </svg>
      ),
    },
    {
      id: "taxClearance",
      nameKey: "token.services.taxClearance",
      descKey: "token.services.taxClearanceDesc",
      icon: (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
          <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z" />
        </svg>
      ),
    },
    {
      id: "birthCertificate",
      nameKey: "token.services.birthCertificate",
      descKey: "token.services.birthCertificateDesc",
      icon: (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" />
        </svg>
      ),
    },
  ];

  const handleServiceSelect = (serviceId: string) => {
    setSelectedService(serviceId);
  };

  const handleContinue = () => {
    if (selectedService) {
      // Redirect to verification before generating token
      navigate("/citizen-login", { state: { service: selectedService } });
    }
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <Card className="backdrop-blur-md bg-white/95">
          <div className="space-y-6 py-2">
            {/* Title */}
            <div className="text-center px-2">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                {t("token.services.title")}
              </h2>
              <p className="text-gray-600 mt-2 text-sm sm:text-base md:text-lg">
                {t("token.services.subtitle")}
              </p>
            </div>

            {/* Services Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 px-2">
              {services.map((service) => (
                <button
                  key={service.id}
                  onClick={() => handleServiceSelect(service.id)}
                  className={`
                    p-4 md:p-5 rounded-xl border-2 transition-all duration-200 text-left
                    ${
                      selectedService === service.id
                        ? "border-primary-500 bg-primary-50 shadow-md scale-[1.02]"
                        : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm hover:scale-[1.01]"
                    }
                  `}
                >
                  <div className="flex items-center gap-4">
                    {/* Icon */}
                    <div
                      className={`
                      p-3 md:p-4 rounded-lg flex-shrink-0 transition-all duration-200
                      ${
                        selectedService === service.id
                          ? "bg-gradient-to-br from-primary-700 to-primary-500 text-white"
                          : "bg-gray-100 text-gray-600"
                      }
                    `}
                    >
                      {service.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-base sm:text-lg">
                        {t(service.nameKey)}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
                        {t(service.descKey)}
                      </p>
                    </div>

                    {/* Checkmark */}
                    {selectedService === service.id && (
                      <div className="flex-shrink-0 animate-scale-in">
                        <svg
                          className="w-6 h-6 md:w-7 md:h-7 text-primary-700"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Continue Button */}
            <div className="pt-2 px-2">
              <Button
                onClick={handleContinue}
                disabled={!selectedService}
                className="w-full md:w-auto md:min-w-64 md:mx-auto md:block"
              >
                {t("token.services.continueButton")}
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Add animation for checkmark */}
      <style>{`
        @keyframes scale-in {
          0% {
            transform: scale(0);
          }
          50% {
            transform: scale(1.2);
          }
          100% {
            transform: scale(1);
          }
        }
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      `}</style>
    </MainLayout>
  );
};

export default ServiceSelection;
