import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Building2, ArrowRight, Info, Search, QrCode, AlertTriangle } from "lucide-react";
import MainLayout from "../../layouts/MainLayout";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import { useAuth } from "../../auth/AuthContext";
import { fetchServices } from "../../services/services";
import { useActiveToken } from "../../hooks/useActiveToken";

const ServiceSelection = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();
  const { activeToken, isLoading: activeTokenLoading } = useActiveToken();
  const [selectedService, setSelectedService] = useState(null);
  const [services, setServices] = useState([]);
  const [search, setSearch] = useState("");
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState("");

  const isNe = i18n.language === "ne";

  // Load the real service list from the API (same source as /services).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setListLoading(true);
      setListError("");
      try {
        const data = await fetchServices({ pageSize: 100 });
        if (!cancelled) setServices(data.services || []);
      } catch {
        if (!cancelled) setListError(t("token.services.loadError"));
      } finally {
        if (!cancelled) setListLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [t]);

  const filtered = search.trim()
    ? services.filter((s) => {
        const haystack = `${s.nameEn} ${s.nameNe} ${s.category || ""}`.toLowerCase();
        return haystack.includes(search.trim().toLowerCase());
      })
    : services;

  const handleServiceSelect = (service) => {
    setSelectedService(service);
  };

  const handleContinue = () => {
    if (!selectedService) return;
    // If the citizen is already authenticated, skip the phone+OTP step
    // and go straight to token generation. Otherwise verify the phone
    // number first.
    if (isLoading) return;
    if (isAuthenticated) {
      navigate("/token/generate", { state: { service: selectedService } });
    } else {
      navigate("/citizen-login", { state: { service: selectedService } });
    }
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        {/* Block new tokens if already have an active one */}
        {isAuthenticated && activeToken && (
          <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 flex-shrink-0" />
            <div>
              <p className="font-medium">{t("token.services.activeTokenExists", "You already have an active token")}</p>
              <p className="mt-1 text-amber-700">{t("token.services.cancelFirst", "Please cancel or complete it before generating a new one.")}</p>
              <div className="mt-3 flex gap-2">
                <a href={`/token/display/${activeToken.id}`} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary-700 text-white text-xs font-medium hover:bg-primary-800">
                  <QrCode className="h-3.5 w-3.5" /> {t("token.display.yourToken")}
                </a>
              </div>
            </div>
          </div>
        )}
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

            {/* Search */}
            <div className="relative px-2 max-w-md">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("token.services.searchPlaceholder")}
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none transition"
                aria-label={t("token.services.searchPlaceholder")}
              />
            </div>

            {listError && (
              <div className="px-2">
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700" role="alert">
                  {listError}
                </div>
              </div>
            )}

            {/* Services Grid */}
            {listLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 px-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-28 rounded-xl bg-neutral-100 animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 px-2">
                {filtered.length === 0 ? (
                  <p className="col-span-full text-center text-gray-500 py-10">
                    {t("token.services.empty")}
                  </p>
                ) : (
                  filtered.map((service) => (
                    <div
                      key={service.id}
                      onClick={() => handleServiceSelect(service)}
                      className={`
                        p-4 md:p-5 rounded-xl border-2 transition-all duration-200 text-left cursor-pointer
                        ${
                          selectedService?.id === service.id
                            ? "border-primary-500 bg-primary-50 shadow-md scale-[1.02]"
                            : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm hover:scale-[1.01]"
                        }
                      `}
                    >
                      <div className="flex items-start gap-4">
                        {/* Icon */}
                        <div
                          className={`
                            p-3 md:p-4 rounded-lg flex-shrink-0 transition-all duration-200
                            ${
                              selectedService?.id === service.id
                                ? "bg-gradient-to-br from-primary-700 to-primary-500 text-white"
                                : "bg-gray-100 text-gray-600"
                            }
                          `}
                        >
                          <Building2 className="h-7 w-7 md:h-8 md:w-8" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 text-base sm:text-lg">
                            {isNe ? service.nameNe : service.nameEn}
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-600 mt-0.5 line-clamp-2">
                            {isNe ? service.descriptionNe : service.descriptionEn}
                          </p>
                          {service.office && (
                            <p className="text-xs text-gray-500 mt-1 flex items-start gap-1">
                              <Building2 className="h-3 w-3 mt-0.5 flex-shrink-0" />
                              <span>{isNe ? service.office.nameNe : service.office.nameEn}</span>
                            </p>
                          )}
                        </div>

                        {/* Checkmark */}
                        {selectedService?.id === service.id && (
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

                      {/* Details link */}
                      <div className="mt-3 pt-3 border-t border-gray-100 flex justify-end">
                        <Link
                          to={`/services/${service.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 text-xs font-medium text-primary-700 hover:text-primary-800 hover:underline"
                        >
                          <Info className="h-3.5 w-3.5" />
                          {t("token.services.viewDetails")}
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Continue Button */}
            <div className="pt-2 px-2">
              <Button
                onClick={handleContinue}
                disabled={!selectedService || Boolean(activeToken)}
                className="w-full md:w-auto md:min-w-64 md:mx-auto md:block"
              >
                {t("token.services.continueButton")}
                {selectedService && <ArrowRight className="h-4 w-4 inline ml-1" />}
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
