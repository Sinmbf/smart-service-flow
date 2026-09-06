import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { QrCode, Clock, ChevronRight, AlertCircle } from "lucide-react";
import MainLayout from "../layouts/MainLayout";
import Card from "../components/ui/Card";
import { Skeleton } from "../components/ui/Skeleton";
import { useAuth } from "../auth/AuthContext";
import { fetchMyActiveTokens } from "../services/tokens";

const STATUS_LABEL = {
  GENERATED: "Waiting",
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

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setError("");
      try {
        const data = await fetchMyActiveTokens();
        if (!cancelled) setTokens(data.tokens || []);
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message || "Could not load tokens");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

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
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-start gap-2" role="alert">
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
                          <div className="mt-1 flex items-center gap-3 text-xs text-neutral-500">
                            <span className="inline-flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" />
                              {STATUS_LABEL[tok.status] || tok.status}
                            </span>
                            <span>·</span>
                            <span>
                              {t("dashboard.generatedAtLabel", "Generated")}{" "}
                              {new Date(tok.generatedAt).toLocaleString(
                                isNe ? "ne-NP" : "en-US"
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
