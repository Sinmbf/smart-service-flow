import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import MainLayout from "../../layouts/MainLayout";
import Card from "../../components/ui/Card";
import axios from "../../services/api";

interface QueueInfo {
  id: string;
  name: string;
  currentNumber: number;
  lastNumber: number;
  waiting: number;
  estimatedWaitMinutes: number;
}

const Monitor = () => {
  const { t } = useTranslation();
  const [services, setServices] = useState<QueueInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchQueue = async () => {
    try {
      const response = await axios.get("/queue/status");
      setServices(response.data.services ?? getMock());
      setLastUpdated(new Date());
    } catch {
      setServices(getMock());
      setLastUpdated(new Date());
    } finally {
      setLoading(false);
    }
  };

  const getMock = (): QueueInfo[] => [
    { id: "citizenship", name: t("token.services.citizenship"), currentNumber: 12, lastNumber: 45, waiting: 33, estimatedWaitMinutes: 45 },
    { id: "passport", name: t("token.services.passport"), currentNumber: 7, lastNumber: 28, waiting: 21, estimatedWaitMinutes: 28 },
    { id: "landRegistry", name: t("token.services.landRegistry"), currentNumber: 3, lastNumber: 15, waiting: 12, estimatedWaitMinutes: 18 },
    { id: "permits", name: t("token.services.permits"), currentNumber: 19, lastNumber: 52, waiting: 33, estimatedWaitMinutes: 55 },
    { id: "taxClearance", name: t("token.services.taxClearance"), currentNumber: 5, lastNumber: 20, waiting: 15, estimatedWaitMinutes: 20 },
    { id: "birthCertificate", name: t("token.services.birthCertificate"), currentNumber: 1, lastNumber: 8, waiting: 7, estimatedWaitMinutes: 10 },
  ];

  useEffect(() => {
    fetchQueue();
    const i = setInterval(fetchQueue, 30000);
    return () => clearInterval(i);
  }, []);

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto space-y-8 py-4">
        {/* Header section */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl sm:text-4xl font-heading font-bold text-neutral-900 tracking-tight">
            {t("token.monitor.title")}
          </h1>
          <p className="text-neutral-700 text-base sm:text-lg max-w-xl mx-auto">
            {t("token.monitor.subtitle")}
          </p>
        </div>

        {/* Refresh bar */}
        <div className="flex items-center justify-center gap-4 text-sm text-neutral-700">
          {lastUpdated && (
            <>
              <span>
                {t("token.monitor.lastUpdated")}:{" "}
                <span className="font-semibold text-neutral-900">{lastUpdated.toLocaleTimeString()}</span>
              </span>
              <button
                onClick={fetchQueue}
                className="px-4 py-2 bg-white border-2 border-blue-500 text-blue-700 hover:bg-blue-50 rounded-lg text-sm font-heading font-semibold transition-colors min-h-[44px]"
              >
                {t("token.monitor.refresh")}
              </button>
            </>
          )}
        </div>

        {/* Loading */}
        {loading ? (
          <div className="text-center py-16" role="status" aria-live="polite">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-neutral-700 font-medium">{t("common.loading")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {services.map((s) => (
              <Card key={s.id} className="overflow-hidden">
                <div className="p-2 space-y-4">
                  {/* Service name */}
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-lg font-heading font-bold text-neutral-900 leading-tight">{s.name}</h3>
                    <span className="text-xs font-heading font-semibold text-blue-700 bg-blue-50 px-3 py-1 rounded-full whitespace-nowrap">
                      {t("token.display.service")}
                    </span>
                  </div>

                  {/* Main stat: currently serving */}
                  <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-blue-500 text-white rounded-xl p-4 shadow-md">
                    <div className="text-xs font-heading font-medium text-blue-100 uppercase tracking-wider">
                      {t("token.monitor.currentlyServing")}
                    </div>
                    <div className="text-5xl font-heading font-bold leading-none mt-2">
                      {s.currentNumber}
                    </div>
                    <div className="text-sm text-blue-100 mt-2">
                      {t("token.display.status")}: {t("token.display.waiting")}
                    </div>
                  </div>

                  {/* Secondary stats */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-neutral-100 rounded-lg p-3 text-center">
                      <div className="text-xs text-neutral-600 font-medium">{t("token.monitor.inQueue")}</div>
                      <div className="text-2xl font-heading font-bold text-neutral-900">{s.waiting}</div>
                      <div className="text-xs text-neutral-500">{t("token.monitor.people")}</div>
                    </div>
                    <div className="bg-neutral-100 rounded-lg p-3 text-center">
                      <div className="text-xs text-neutral-600 font-medium">{t("token.monitor.estimatedWait")}</div>
                      <div className="text-2xl font-heading font-bold text-neutral-900">~{s.estimatedWaitMinutes}</div>
                      <div className="text-xs text-neutral-500">{t("token.display.minutes")}</div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="text-center pt-6">
          <a
            href="/token/services"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-700 via-blue-600 to-blue-500 hover:from-blue-800 hover:via-blue-700 hover:to-blue-600 text-white text-lg font-heading font-bold px-8 py-4 rounded-lg shadow-lg hover:shadow-xl transition-all cursor-pointer min-h-[48px]"
          >
            {t("token.monitor.getToken")}
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
      </div>
    </MainLayout>
  );
};

export default Monitor;
