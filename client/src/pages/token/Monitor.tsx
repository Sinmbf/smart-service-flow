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
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight drop-shadow-sm">
            {t("token.monitor.title")}
          </h1>
          <p className="text-white/80 text-base sm:text-lg font-medium max-w-xl mx-auto">
            {t("token.monitor.subtitle")}
          </p>
        </div>

        {/* Refresh bar */}
        <div className="flex items-center justify-center gap-3 text-sm text-white/90">
          {lastUpdated && (
            <>
              <span>
                {t("token.monitor.lastUpdated")}:{" "}
                <span className="font-semibold text-white">{lastUpdated.toLocaleTimeString()}</span>
              </span>
              <button
                onClick={fetchQueue}
                className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-full text-xs font-semibold transition-colors cursor-pointer"
              >
                {t("token.monitor.refresh")}
              </button>
            </>
          )}
        </div>

        {/* Loading */}
        {loading ? (
          <div className="text-center py-16">
            <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
            <p className="text-white/70 font-medium">{t("common.loading")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((s) => (
              <Card key={s.id} className="bg-white/95 backdrop-blur-md shadow-xl rounded-2xl border-0 overflow-hidden">
                <div className="p-5 space-y-4">
                  {/* Service name */}
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-900 leading-tight">{s.name}</h3>
                    <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{t("token.display.service")}</span>
                  </div>

                  {/* Main stat: currently serving */}
                  <div className="bg-gradient-to-r from-blue-600 via-[#2563EB] to-indigo-500 text-white rounded-xl p-4 shadow-lg">
                    <div className="text-xs font-medium text-blue-100 uppercase tracking-wider">{t("token.monitor.currentlyServing")}</div>
                    <div className="text-5xl font-extrabold leading-none mt-1">{s.currentNumber}</div>
                    <div className="text-sm text-blue-100 mt-1">{t("token.display.status")}: {t("token.display.waiting")}</div>
                  </div>

                  {/* Secondary stats */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 rounded-xl p-3 text-center">
                      <div className="text-xs text-slate-500 font-medium">{t("token.monitor.inQueue")}</div>
                      <div className="text-xl font-extrabold text-slate-900">{s.waiting}</div>
                      <div className="text-[10px] text-slate-400">{t("token.monitor.people")}</div>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3 text-center">
                      <div className="text-xs text-slate-500 font-medium">{t("token.monitor.estimatedWait")}</div>
                      <div className="text-xl font-extrabold text-slate-900">~{s.estimatedWaitMinutes}</div>
                      <div className="text-[10px] text-slate-400">{t("token.display.minutes")}</div>
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
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#0ea5e9] via-[#2563EB] to-[#6366f1] hover:from-[#0284c7] hover:to-[#4f46e5] text-white text-lg font-bold px-8 py-4 rounded-2xl shadow-xl shadow-blue-900/20 transition-all hover:scale-[1.03] active:scale-[0.98] cursor-pointer"
          >
            {t("token.monitor.getToken")}
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
          </a>
        </div>
      </div>
    </MainLayout>
  );
};

export default Monitor;
