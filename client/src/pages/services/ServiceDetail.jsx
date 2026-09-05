import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Building2, MapPin, Clock, ArrowLeft } from "lucide-react";
import MainLayout from "../../layouts/MainLayout";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import ServiceRoadmap from "../../components/ServiceRoadmap";
import { Skeleton } from "../../components/ui/Skeleton";
import { fetchServiceById } from "../../services/services";

const ServiceDetail = () => {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const isNe = i18n.language === "ne";

  const [service, setService] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setError("");
      try {
        const data = await fetchServiceById(id);
        if (!cancelled) setService(data.service);
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.status === 404 ? t("services.detail.notFound") : t("services.detail.error"));
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, t]);

  const pick = (en, ne) => (isNe ? ne : en);

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto py-4">
        <Link
          to="/services"
          className="inline-flex items-center gap-1.5 text-sm text-neutral-600 hover:text-neutral-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("services.detail.backToList")}
        </Link>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-2/3" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700" role="alert">
            {error}
          </div>
        ) : service ? (
          <>
            {/* Header */}
            <div className="mb-6">
              {service.category && (
                <span className="inline-block text-xs font-semibold uppercase tracking-wide text-primary-700 bg-primary-50 px-2 py-0.5 rounded-full mb-2">
                  {service.category}
                </span>
              )}
              <h1 className="text-2xl sm:text-3xl font-heading font-bold text-neutral-900 tracking-tight">
                {pick(service.nameEn, service.nameNe)}
              </h1>
              {pick(service.descriptionEn, service.descriptionNe) && (
                <p className="mt-2 text-neutral-600">
                  {pick(service.descriptionEn, service.descriptionNe)}
                </p>
              )}
            </div>

            {/* Office info */}
            {service.office && (
              <Card className="mb-6 p-5">
                <h2 className="font-heading font-semibold text-neutral-900 flex items-center gap-2 mb-3">
                  <Building2 className="h-5 w-5 text-primary-700" />
                  {pick(service.office.nameEn, service.office.nameNe)}
                </h2>
                <div className="space-y-2 text-sm text-neutral-600">
                  <p className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 flex-shrink-0" />
                    {service.office.location}
                  </p>
                  <p className="flex items-center gap-2">
                    <Clock className="h-4 w-4 flex-shrink-0" />
                    {service.office.hours}
                  </p>
                </div>
              </Card>
            )}

            {/* Stages (the ServiceRoadmap renders its own header) */}
            {service.stages && service.stages.length > 0 && (
              <div className="mb-6">
                <ServiceRoadmap
                  stages={service?.stages ?? []}
                  serviceNameEn={service?.nameEn}
                  serviceNameNe={service?.nameNe}
                />
              </div>
            )}

            {/* CTA */}
            <Button onClick={() => navigate("/token/services")} className="w-full sm:w-auto">
              {t("services.detail.getToken")}
            </Button>
          </>
        ) : null}
      </div>
    </MainLayout>
  );
};

export default ServiceDetail;
