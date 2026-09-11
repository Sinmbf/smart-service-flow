import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  PhoneCall,
  SkipForward,
  RotateCcw,
  CheckCircle2,
  Clock,
  Users,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import MainLayout from "../../layouts/MainLayout";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import {
  fetchStageQueue,
  checkInToken,
  skipToken,
  recallToken,
  completeToken,
} from "../../services/staff";

const POLL_MS = 5000;

/**
 * A single token row on the queue board.
 */
function TokenRow({ token, isNe, actions, actionLabels, actionBusyId, tone = "default" }) {
  const toneStyles = {
    default: "bg-white border-neutral-200",
    serving: "bg-primary-50 border-primary-200",
    skipped: "bg-amber-50 border-amber-200",
  };

  return (
    <div
      className={`flex items-center justify-between gap-3 p-3 rounded-xl border ${toneStyles[tone]}`}
    >
      <div className="min-w-0">
        <p className="font-heading font-semibold text-neutral-900">
          {token.tokenNumber}{" "}
          <span className="font-normal text-neutral-600">
            — {token.user?.name || (isNe ? "नागरिक" : "Citizen")}
          </span>
        </p>
        <p className="text-xs text-neutral-500">
          {token.user?.phoneNumber}
          {token.position != null ? ` · #${token.position}` : ""}
        </p>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        {actions.map(({ key, onClick, icon: Icon, variant }) => (
          <Button
            key={key}
            size="sm"
            variant={variant}
            isLoading={actionBusyId === `${token.id}:${key}`}
            disabled={actionBusyId != null}
            onClick={() => onClick(token.id)}
          >
            <Icon className="h-4 w-4 mr-1" />
            {actionLabels[key]}
          </Button>
        ))}
      </div>
    </div>
  );
}

function Section({ title, icon: Icon, count, children }) {
  return (
    <div>
      <h2 className="flex items-center gap-2 text-sm font-heading font-semibold text-neutral-700 uppercase tracking-wide mb-2">
        <Icon className="h-4 w-4" /> {title} <span className="text-neutral-400">({count})</span>
      </h2>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

const QueueBoard = () => {
  const { stageId } = useParams();
  const { t, i18n } = useTranslation();
  const isNe = i18n.language === "ne";

  const [stage, setStage] = useState(null);
  const [queue, setQueue] = useState({ serving: [], called: [], checkedIn: [], waiting: [], recentlySkipped: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionBusyId, setActionBusyId] = useState(null);
  const [actionError, setActionError] = useState("");

  const load = useCallback(async () => {
    try {
      const data = await fetchStageQueue(stageId);
      setStage(data.stage);
      setQueue(data.queue);
      setError("");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          (isNe ? "क्यू लोड गर्न सकिएन।" : "Failed to load the queue."),
      );
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stageId]);

  useEffect(() => {
    load();
    const intervalId = setInterval(load, POLL_MS);
    return () => clearInterval(intervalId);
  }, [load]);

  const runAction = async (actionKey, tokenId, fn) => {
    setActionBusyId(`${tokenId}:${actionKey}`);
    setActionError("");
    try {
      await fn(tokenId);
      await load();
    } catch (err) {
      setActionError(
        err.response?.data?.message ||
          (isNe ? "कार्य असफल भयो।" : "Action failed. Please try again."),
      );
    } finally {
      setActionBusyId(null);
    }
  };

  const actionLabels = {
    checkIn: t("staff.queue.checkIn", "Check In"),
    skip: t("staff.queue.skip", "Skip"),
    recall: t("staff.queue.recall", "Recall"),
    complete: t("staff.queue.complete", "Complete"),
  };

  const stageName = stage ? (isNe ? stage.nameNe : stage.nameEn) : "";
  const serviceName = stage ? (isNe ? stage.service?.nameNe : stage.service?.nameEn) : "";

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto py-4">
        <Link
          to="/staff/dashboard"
          className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-700 mb-3"
        >
          <ArrowLeft className="h-4 w-4" /> {t("staff.queue.back", "Back to dashboard")}
        </Link>

        <h1 className="text-2xl sm:text-3xl font-heading font-bold text-neutral-900 tracking-tight">
          {stageName || t("staff.queue.title", "Queue Board")}
        </h1>
        {serviceName && <p className="mt-1 text-neutral-600">{serviceName}</p>}

        {error && (
          <div
            className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-start gap-2"
            role="alert"
          >
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {actionError && (
          <div
            className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-start gap-2"
            role="alert"
          >
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span>{actionError}</span>
          </div>
        )}

        {loading ? (
          <p className="mt-6 text-neutral-500">{t("staff.queue.loading", "Loading queue...")}</p>
        ) : (
          <Card className="mt-6 p-6 space-y-6">
            <Section title={t("staff.queue.serving", "Serving")} icon={PhoneCall} count={queue.serving.length}>
              {queue.serving.length === 0 && (
                <p className="text-sm text-neutral-400">{t("staff.queue.empty", "None")}</p>
              )}
              {queue.serving.map((token) => (
                <TokenRow
                  key={token.id}
                  token={token}
                  isNe={isNe}
                  tone="serving"
                  actionBusyId={actionBusyId}
                  actionLabels={actionLabels}
                  actions={[
                    {
                      key: "complete",
                      icon: CheckCircle2,
                      variant: "success",
                      onClick: (id) => runAction("complete", id, completeToken),
                    },
                  ]}
                />
              ))}
            </Section>

            <Section
              title={t("staff.queue.called", "Called — citizen should proceed to counter")}
              icon={PhoneCall}
              count={queue.called.length}
            >
              {queue.called.length === 0 && (
                <p className="text-sm text-neutral-400">{t("staff.queue.empty", "None")}</p>
              )}
              {queue.called.map((token) => (
                <TokenRow
                  key={token.id}
                  token={token}
                  isNe={isNe}
                  actionBusyId={actionBusyId}
                  actionLabels={actionLabels}
                  actions={[
                    { key: "checkIn", icon: CheckCircle2, variant: "primary", onClick: (id) => runAction("checkIn", id, checkInToken) },
                    { key: "skip", icon: SkipForward, variant: "outline", onClick: (id) => runAction("skip", id, skipToken) },
                  ]}
                />
              ))}
            </Section>

            <Section title={t("staff.queue.waiting", "Waiting")} icon={Users} count={queue.waiting.length}>
              {queue.waiting.length === 0 && (
                <p className="text-sm text-neutral-400">{t("staff.queue.empty", "None")}</p>
              )}
              {queue.waiting.map((token) => (
                <TokenRow
                  key={token.id}
                  token={token}
                  isNe={isNe}
                  actionBusyId={actionBusyId}
                  actionLabels={actionLabels}
                  actions={[]}
                />
              ))}
            </Section>

            <Section
              title={t("staff.queue.skipped", "Recently skipped")}
              icon={RotateCcw}
              count={queue.recentlySkipped.length}
            >
              {queue.recentlySkipped.length === 0 && (
                <p className="text-sm text-neutral-400">{t("staff.queue.empty", "None")}</p>
              )}
              {queue.recentlySkipped.map((token) => (
                <TokenRow
                  key={token.id}
                  token={token}
                  isNe={isNe}
                  tone="skipped"
                  actionBusyId={actionBusyId}
                  actionLabels={actionLabels}
                  actions={token.recallable === false ? [] : [
                    {
                      key: "recall",
                      icon: RotateCcw,
                      variant: "secondary",
                      onClick: (id) => runAction("recall", id, recallToken),
                    },
                  ]}
                />
              ))}
            </Section>
          </Card>
        )}
      </div>
    </MainLayout>
  );
};

export default QueueBoard;
