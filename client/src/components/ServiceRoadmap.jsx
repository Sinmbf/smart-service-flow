import { useTranslation } from "react-i18next";
import { MapPin, FileText, Check, Loader } from "lucide-react";

/**
 * Status keys for roadmap stages. `current` is the stage the user is
 * currently being served; `completed` is everything before; `upcoming` is
 * what's ahead; `remaining` is an alias for `upcoming` used in the spec.
 *
 * The "current" state is a placeholder until Step 14 (per-token progress
 * tracking). For now we just render the stepper visually.
 */
const STATUS_STYLES = {
  completed: {
    circle: "bg-primary-700 text-white border-primary-700",
    label: "text-primary-700",
    line: "bg-primary-700",
  },
  current: {
    circle: "bg-white text-primary-700 border-primary-700 ring-4 ring-primary-100",
    label: "text-primary-700",
    line: "bg-neutral-200",
  },
  upcoming: {
    circle: "bg-white text-neutral-500 border-neutral-300",
    label: "text-neutral-700",
    line: "bg-neutral-200",
  },
  remaining: {
    circle: "bg-white text-neutral-500 border-neutral-300",
    label: "text-neutral-700",
    line: "bg-neutral-200",
  },
};

const StatusIcon = ({ status }) => {
  if (status === "completed") return <Check className="h-4 w-4" aria-hidden="true" />;
  if (status === "current") return <Loader className="h-4 w-4" aria-hidden="true" />;
  return null;
};

/**
 * ServiceRoadmap — vertical stepper rendering a service's stages.
 *
 * @param {{ stages: Array, currentStageOrder?: number, languageAware?: boolean }} props
 *   `stages`: array of { id, stageOrder, nameEn, nameNe, location, documents[] }
 *   `currentStageOrder`: optional 1-based stage number to mark as `current`
 *   (everything before it becomes `completed`). Omit for the read-only view.
 */
const ServiceRoadmap = ({ stages = [], currentStageOrder, languageAware = true }) => {
  const { t, i18n } = useTranslation();
  const isNe = languageAware && i18n.language === "ne";

  const pick = (en, ne) => (isNe ? ne : en);

  if (stages.length === 0) return null;

  return (
    <ol className="relative space-y-0" aria-label={t("services.roadmap.ariaLabel")}>
      {stages.map((stage, idx) => {
        const isLast = idx === stages.length - 1;
        const status =
          typeof currentStageOrder === "number"
            ? stage.stageOrder < currentStageOrder
              ? "completed"
              : stage.stageOrder === currentStageOrder
              ? "current"
              : "upcoming"
            : "remaining";
        const s = STATUS_STYLES[status];

        return (
          <li key={stage.id} className="relative flex gap-4 pb-6 last:pb-0">
            {/* Connector line + circle */}
            <div className="flex flex-col items-center flex-shrink-0">
              <span
                className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full border-2 text-sm font-semibold ${s.circle}`}
                aria-current={status === "current" ? "step" : undefined}
              >
                <StatusIcon status={status} />
                <span className={status === "completed" || status === "current" ? "sr-only" : ""}>
                  {stage.stageOrder}
                </span>
              </span>
              {!isLast && (
                <span
                  className={`w-0.5 flex-1 mt-1 ${s.line}`}
                  aria-hidden="true"
                />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pt-1">
              <p className={`text-xs font-semibold uppercase tracking-wide ${s.label}`}>
                {t(`services.roadmap.status.${status}`)}
                <span className="ml-2 text-neutral-400 font-normal normal-case">
                  {t("services.roadmap.stepLabel", { n: stage.stageOrder })}
                </span>
              </p>
              <p className="mt-0.5 font-semibold text-neutral-900 text-base">
                {pick(stage.nameEn, stage.nameNe)}
              </p>
              {stage.location && (
                <p className="mt-1 text-xs text-neutral-500 flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                  {stage.location}
                </p>
              )}
              {stage.documents && stage.documents.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {stage.documents.map((doc) => (
                    <li
                      key={doc.id}
                      className="text-xs text-neutral-600 flex items-start gap-1.5"
                    >
                      <FileText className="h-3.5 w-3.5 flex-shrink-0 mt-0.5 text-neutral-400" />
                      <span>{pick(doc.nameEn, doc.nameNe)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
};

export default ServiceRoadmap;
