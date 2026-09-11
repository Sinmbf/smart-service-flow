import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { QrCode, Clock, ChevronRight, AlertCircle, CheckCircle2 } from "lucide-react";
import MainLayout from "../layouts/MainLayout";
import Card from "../components/ui/Card";
import { Skeleton } from "../components/ui/Skeleton";
import { useAuth } from "../auth/AuthContext";
import { fetchMyActiveTokens } from "../services/tokens";

const POLL_MS = 8000;

const STATUS_LABEL = {
  WAITING: "Waiting",
  CALLED: "Your turn — proceed to counter",
  CHECKED_IN: "Checked in",
  SERVING: "Now serving",
  COMPLETED: "Completed",
  SKIPPED: "Skipped",
  EXPIRED: "Expired",
  CANCELLED: "Cancelled",
  DEFERRED: "Deferred",
};

const Dashboard = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isNe = i18n.language === "ne";

  const [tokens, setTokens] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const data = await fetchMyActiveTokens();
      setTokens(data.tokens || []);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Could not load tokens");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    setIsLoading(true);
    load();
    // Poll so a status/stage change made at the counter (e.g. staff
    // completing a stage) shows up without the citizen having to
    // manually reload the page.
    const intervalId = setInterval(load, POLL_MS);
    return () => clearInterval(intervalId);
  }, [load]);

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto py-4">
        <h1 className="text-2xl sm:text-3xl font-heading font-bold text-neutral-900 tracking-tight">
          {t("dashboard.welcome", { name: user?.name || "" })}
        </h1>
        <p className="mt-2 text-neutral-600">{t("dashboard.subtitle")}</p>

        {/* Active tokens */}
        <section className="mt-6">
          <h2 className="font-heading font-semibold text-lg text-neutral-900 mb-3">
            {t("dashboard.activeTokens")}
          </h2>

          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-20 w-full rounded-2xl" />
              <Skeleton className="h-20 w-full rounded-2xl" />
            </div>
          ) : error ? (
            <div
              className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-start gap-2"
              role="alert"
            >
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          ) : tokens.length === 0 ? (
            <Card className="p-6 text-center">
              <QrCode className="h-10 w-10 text-neutral-300 mx-auto" />
              <p className="mt-3 text-sm text-neutral-600">
                {t("dashboard.noActiveTokens")}
              </p>
              <button
                type="button"
                onClick={() => navigate("/token/services")}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary-700 text-white text-sm font-semibold hover:bg-primary-800"
              >
                {t("dashboard.getTokenCta")}
                <ChevronRight className="h-4 w-4" />
              </button>
            </Card>
          ) : (
            <ul className="space-y-3">
              {tokens.map((tok) => {
                const serviceName = tok.service
                  ? isNe
                    ? tok.service.nameNe
                    : tok.service.nameEn
                  : "";
                const stageName = tok.currentStage
                  ? isNe
                    ? tok.currentStage.nameNe
                    : tok.currentStage.nameEn
                  : "";
                const totalStages = tok.service?._count?.stages || null;
                const stageOrder = tok.currentStage?.stageOrder;
                // A token that has already completed at least one stage
                // (serviceCompletedAt is set on stage handoff) but is
                // GENERATED again is waiting for its *next* stage, not
                // starting over — make that explicit instead of just
                // showing "Waiting" again, which reads like a reset/bug.
                const justAdvanced = tok.status === "WAITING" && !!tok.serviceCompletedAt;
                const isMultiStage = totalStages && totalStages > 1;

                return (
                  <li key={tok.id}>
                    <Link
                      to={`/token/display/${tok.id}`}
                      className="block group bg-white border border-neutral-200 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-primary-300 transition"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-gradient-to-br from-primary-700 to-primary-500 text-white flex-shrink-0">
                          <QrCode className="h-6 w-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-heading font-bold text-lg text-neutral-900">
                            {tok.tokenNumber}
                          </p>
                          <p className="text-sm text-neutral-600 truncate">
                            {serviceName}
                          </p>
                          {isMultiStage && stageName && (
                            <p className="text-xs text-primary-700 font-medium mt-0.5 truncate">
                              {t("dashboard.stageProgress", "Step {{current}} of {{total}}", {
                                current: stageOrder,
                                total: totalStages,
                              })}
                              {" · "}
                              {stageName}
                            </p>
                          )}
                          {justAdvanced && (
                            <p className="text-xs text-green-700 font-medium mt-0.5 flex items-center gap-1">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              {t(
                                "dashboard.advancedToNextStage",
                                "Previous step complete — now waiting for this step",
                              )}
                            </p>
                          )}
                          <div className="mt-1 flex items-center gap-3 text-xs text-neutral-500">
                            <span className="inline-flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" />
                              {STATUS_LABEL[tok.status] || tok.status}
                            </span>
                            <span>·</span>
                            <span>
                              {t("dashboard.generatedAtLabel", "Generated")}{" "}
                              {new Date(tok.generatedAt).toLocaleString(
                                isNe ? "ne-NP" : "en-US",
                              )}
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-neutral-300 group-hover:text-primary-700 group-hover:translate-x-0.5 transition flex-shrink-0" />
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
