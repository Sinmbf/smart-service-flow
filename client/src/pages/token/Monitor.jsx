import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Activity, Users, Clock, RefreshCw, ArrowRight, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import MainLayout from "../../layouts/MainLayout";
import Card from "../../components/ui/Card";
import { Skeleton } from "../../components/ui";
import axios from "../../services/api";

const Monitor = () => {
  // ponytail: auto-refresh every 30s so skipped tokens show without manual refresh
  // ponytail: turn approaching msg per policy
  const { t } = useTranslation();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

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

  const getMock = ()=> [
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

  // Density-based color logic for queue load (not random teal)
  const getLoadColor = (waiting) => {
    if (waiting < 15) return { dot: "bg-emerald-500", label: t("token.monitor.queueLoad.low") };
    if (waiting < 30) return { dot: "bg-amber-500", label: t("token.monitor.queueLoad.medium") };
    return { dot: "bg-red-500", label: t("token.monitor.queueLoad.high") };
  };

  const getServiceName = (id, defaultName) => {
    const key = `token.services.${id}`;
    const translated = t(key);
    return translated !== key ? translated : defaultName;
  };

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto space-y-8 py-4">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 mb-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75 animate-ping"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
              {t("token.monitor.title")} · {t("token.monitor.live")}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-heading font-bold text-neutral-900 tracking-tight">
            {t("token.monitor.title")}
          </h1>
          <p className="text-neutral-600 text-base sm:text-lg max-w-xl mx-auto">
            {t("token.monitor.subtitle")}
          </p>
        </div>

        {/* Refresh bar */}
        <div className="flex items-center justify-center gap-4 text-sm text-neutral-600">
          {lastUpdated && (
            <>
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                {t("token.monitor.lastUpdated")}
                <span className="font-semibold text-neutral-900">{lastUpdated.toLocaleTimeString()}</span>
              </span>
              <button
                onClick={fetchQueue}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-neutral-300 hover:border-neutral-400 hover:bg-neutral-50 text-neutral-900 rounded-lg text-sm font-heading font-semibold transition-colors min-h-[44px] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-neutral-200 focus-visible:ring-offset-2"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                {t("token.monitor.refresh")}
              </button>
            </>
          )}
        </div>

        {/* Loading */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5" role="status" aria-label="Loading queue status">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="p-5 space-y-4">
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-20 w-full" />
                <div className="grid grid-cols-2 gap-3">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { staggerChildren: 0.05 }
              }
            }}
          >
            {services.map((s) => {
              const load = getLoadColor(s.waiting);
              return (
                <motion.div
                  key={s.id}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 }
                  }}
                >
                  <Card className="overflow-hidden hover:border-neutral-300">
                    <div className="p-1 space-y-4">
                      {/* Service name + load indicator */}
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-lg font-heading font-bold text-neutral-900 leading-tight">
                          {getServiceName(s.id, s.name)}
                        </h3>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <span className={`w-2 h-2 rounded-full ${load.dot}`}></span>
                          <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                            {load.label}
                          </span>
                        </div>
                      </div>

                      {/* Main stat: currently serving — solid neutral-900 anchor */}
                      <div className="bg-neutral-900 text-white rounded-xl p-4 shadow-sm">
                        <div className="text-xs font-heading font-medium text-white/70 uppercase tracking-wider">
                          {t("token.monitor.currentlyServing")}
                        </div>
                        <div className="text-5xl font-heading font-bold leading-none mt-2 tabular-nums">
                          {s.currentNumber}
                        </div>
                        <div className="text-sm text-white/70 mt-2 flex items-center gap-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          {t("token.display.status")}
                        </div>
                      </div>

                      {/* Secondary stats — neutral surface, semantic accent on numbers */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-3 text-center">
                          <div className="text-xs text-neutral-500 font-medium flex items-center justify-center gap-1 break-words">
                            <Users className="h-3 w-3 flex-shrink-0" />
                            {t("token.monitor.inQueue")}
                          </div>
                          <div className="text-2xl font-heading font-bold text-neutral-900 mt-1 tabular-nums">
                            {s.waiting}
                          </div>
                          <div className="text-xs text-neutral-500">{t("token.monitor.people")}</div>
                        </div>
                        <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-3 text-center">
                          <div className="text-xs text-neutral-500 font-medium flex items-center justify-center gap-1 break-words">
                            <Clock className="h-3 w-3 flex-shrink-0" />
                            {t("token.monitor.estimatedWait")}
                          </div>
                          <div className="text-2xl font-heading font-bold text-neutral-900 mt-1 tabular-nums">
                            ~{s.estimatedWaitMinutes}
                          </div>
                          <div className="text-xs text-neutral-500">{t("token.display.minutes")}</div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* CTA — single primary action */}
        <div className="text-center pt-6">
          <a
            href="/token/services"
            className="inline-flex items-center gap-2 bg-primary-700 hover:bg-primary-800 text-white text-lg font-heading font-bold px-8 py-4 rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer min-h-[48px] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-300 focus-visible:ring-offset-2"
          >
            {t("token.monitor.getToken")}
            <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </div>
    </MainLayout>
  );
};

export default Monitor;
