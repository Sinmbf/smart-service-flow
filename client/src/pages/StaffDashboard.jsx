import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Users,
  Clock,
  PhoneCall,
  ChevronRight,
  AlertCircle,
  ScanLine,
  Activity,
  LayoutList,
} from "lucide-react";
import MainLayout from "../layouts/MainLayout";
import Card from "../components/ui/Card";
import { Skeleton } from "../components/ui/Skeleton";
import { useAuth } from "../auth/AuthContext";
import { fetchQueueSummary } from "../services/staff";

const POLL_MS = 8000;

/** How long a stage's oldest waiting citizen has been waiting, in minutes. */
function waitMinutes(since) {
  if (!since) return null;
  return Math.max(0, Math.round((Date.now() - new Date(since).getTime()) / 60000));
}

function CountBadge({ value, label, tone }) {
  const toneStyles = {
    neutral: "bg-neutral-100 text-neutral-600",
    primary: "bg-primary-100 text-primary-800",
    amber: "bg-amber-100 text-amber-800",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${toneStyles[value > 0 ? tone : "neutral"]}`}
    >
      {value} {label}
    </span>
  );
}

function StageCard({ stage, isNe, t }) {
  const { counts, oldestWaitingSince } = stage;
  const hasWaiting = counts.waiting > 0;
  const wait = waitMinutes(oldestWaitingSince);

  return (
    <Link
      to={`/staff/queues/${stage.id}`}
      className={`block p-4 rounded-xl border transition group ${
        hasWaiting
          ? "bg-amber-50/60 border-amber-200 hover:border-amber-300"
          : "bg-white border-neutral-200 hover:border-primary-300 hover:shadow-sm"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="font-heading font-semibold text-neutral-900 truncate">
            {isNe ? stage.nameNe : stage.nameEn}
          </p>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <CountBadge value={counts.serving} label={t("staff.dashboard.serving", "serving")} tone="primary" />
            <CountBadge value={counts.called} label={t("staff.dashboard.called", "called")} tone="primary" />
            <CountBadge value={counts.waiting} label={t("staff.dashboard.waiting", "waiting")} tone="amber" />
          </div>
          {hasWaiting && wait !== null && (
            <p className="mt-1.5 text-xs text-amber-700 flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {t("staff.dashboard.longestWait", "Longest wait")}: {wait} {t("staff.dashboard.min", "min")}
            </p>
          )}
        </div>
        <ChevronRight className="h-5 w-5 text-neutral-300 group-hover:text-primary-700 group-hover:translate-x-0.5 transition flex-shrink-0" />
      </div>
    </Link>
  );
}

function FilterToggle({ filter, setFilter, activeCount, totalCount, t }) {
  const options = [
    {
      key: "active",
      label: t("staff.dashboard.filterActive", "Active"),
      count: activeCount,
      icon: Activity,
    },
    {
      key: "all",
      label: t("staff.dashboard.filterAll", "All"),
      count: totalCount,
      icon: LayoutList,
    },
  ];
  return (
    <div
      role="tablist"
      aria-label={t("staff.dashboard.filterLabel", "Filter queue boards")}
      className="inline-flex w-full sm:w-auto rounded-xl bg-neutral-100 p-1 gap-1"
    >
      {options.map((opt) => {
        const Icon = opt.icon;
        const isSelected = filter === opt.key;
        return (
          <button
            key={opt.key}
            type="button"
            role="tab"
            aria-selected={isSelected}
            onClick={() => setFilter(opt.key)}
            className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 text-sm font-semibold rounded-lg transition-all duration-150 ${
              isSelected
                ? "bg-white text-primary-800 shadow-sm"
                : "text-neutral-500 hover:text-neutral-800"
            }`}
          >
            <Icon className="h-4 w-4" />
            {opt.label}
            <span
              className={`inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1 rounded-full text-xs font-bold ${
                isSelected ? "bg-primary-100 text-primary-800" : "bg-neutral-200 text-neutral-600"
              }`}
            >
              {opt.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}

const hasActivity = (counts) => counts.serving > 0 || counts.checkedIn > 0 || counts.called > 0 || counts.waiting > 0;

const StaffDashboard = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const isNe = i18n.language === "ne";

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("active");

  const load = useCallback(async () => {
    try {
      const data = await fetchQueueSummary();
      setServices(data.services || []);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || t("staff.dashboard.summaryFailed", "Could not load the queue overview."));
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    load();
    const intervalId = setInterval(load, POLL_MS);
    return () => clearInterval(intervalId);
  }, [load]);

  const totalWaiting = services.reduce(
    (sum, s) => sum + s.stages.reduce((stageSum, st) => stageSum + st.counts.waiting, 0),
    0,
  );
  const totalActive = services.reduce(
    (sum, s) => sum + s.stages.reduce(
      (stageSum, st) => stageSum + st.counts.serving + st.counts.checkedIn + st.counts.called + st.counts.waiting,
      0,
    ),
    0,
  );

  const totalStageCount = services.reduce((sum, s) => sum + s.stages.length, 0);
  const activeStageCount = services.reduce(
    (sum, s) => sum + s.stages.filter((st) => hasActivity(st.counts)).length,
    0,
  );

  const visibleServices =
    filter === "active"
      ? services
          .map((s) => ({ ...s, stages: s.stages.filter((st) => hasActivity(st.counts)) }))
          .filter((s) => s.stages.length > 0)
      : services;

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto py-4">
        <h1 className="text-2xl sm:text-3xl font-heading font-bold text-neutral-900 tracking-tight">
          {t("staff.dashboard.welcome", { name: user?.name || "" })}
        </h1>
        <p className="mt-2 text-neutral-600">
          {loading
            ? t("staff.dashboard.subtitle")
            : totalActive > 0
            ? t("staff.dashboard.subtitleActive", {
                defaultValue: "{{count}} active tokens across all queues",
                count: totalActive,
              })
            : t("staff.dashboard.subtitleClear", "No active tokens right now.")}
        </p>

        <Link
          to="/staff/check-in"
          className="mt-6 flex items-center gap-3 p-4 bg-white border border-neutral-200 rounded-2xl hover:border-primary-300 hover:shadow-sm transition"
        >
          <div className="p-2.5 rounded-lg bg-gradient-to-br from-primary-700 to-primary-500 text-white flex-shrink-0">
            <ScanLine className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-heading font-semibold text-neutral-900">{t("staff.dashboard.checkIn", "Check-In")}</h3>
            <p className="text-xs text-neutral-500">{t("staff.dashboard.checkInDesc", "Scan a QR or look up by phone")}</p>
          </div>
          <ChevronRight className="h-5 w-5 text-neutral-300 flex-shrink-0" />
        </Link>

        <div className="mt-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
            <h2 className="flex items-center gap-2 font-heading font-semibold text-neutral-900">
              <Users className="h-5 w-5 text-neutral-500" />
              {t("staff.dashboard.queueBoards", "Queue Boards")}
            </h2>
            {!loading && totalStageCount > 0 && (
              <FilterToggle
                filter={filter}
                setFilter={setFilter}
                activeCount={activeStageCount}
                totalCount={totalStageCount}
                t={t}
              />
            )}
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-start gap-2" role="alert">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-20 w-full rounded-xl" />
              <Skeleton className="h-20 w-full rounded-xl" />
              <Skeleton className="h-20 w-full rounded-xl" />
            </div>
          ) : services.length === 0 ? (
            <Card className="p-6 text-center">
              <PhoneCall className="h-8 w-8 text-neutral-300 mx-auto" />
              <p className="mt-3 text-sm text-neutral-600">{t("staff.dashboard.noQueues", "No stages found.")}</p>
            </Card>
          ) : visibleServices.length === 0 ? (
            <Card className="p-6 text-center">
              <Users className="h-8 w-8 text-neutral-300 mx-auto" />
              <p className="mt-3 text-sm text-neutral-600">
                {t("staff.dashboard.noActiveQueues", "No queues have anyone waiting, called, checked in, or being served right now.")}
              </p>
              <button
                type="button"
                onClick={() => setFilter("all")}
                className="mt-3 text-sm font-semibold text-primary-700 hover:text-primary-800"
              >
                {t("staff.dashboard.showAllQueues", "Show all queues")}
              </button>
            </Card>
          ) : (
            <div className="space-y-5">
              {visibleServices.map((service) => (
                <div key={service.id}>
                  <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">
                    {isNe ? service.nameNe : service.nameEn}
                  </p>
                  <div className="space-y-2">
                    {service.stages.map((stage) => (
                      <StageCard key={stage.id} stage={stage} isNe={isNe} t={t} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default StaffDashboard;
