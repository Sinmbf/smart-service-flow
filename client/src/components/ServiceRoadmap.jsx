import { useState } from "react";
import { useTranslation } from "react-i18next";
import { MapPin, FileText, Check, Loader, ChevronDown, ChevronUp } from "lucide-react";

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
const ServiceRoadmap = ({
  stages = [],
  currentStageOrder,
  languageAware = true,
  serviceNameEn,
  serviceNameNe,
}) => {
  const { t, i18n } = useTranslation();
  const isNe = languageAware && i18n.language === "ne";

  const pick = (en, ne) => (isNe ? ne : en);

  if (stages.length === 0) return null;

  return (
    <section
      className="relative rounded-2xl border border-neutral-200 bg-gradient-to-br from-white via-primary-50/30 to-white p-4 sm:p-6 shadow-sm"
      aria-label={t("services.roadmap.ariaLabel")}
    >
      {/* Header */}
      <header className="mb-5 pb-4 border-b border-neutral-200">
        <h2 className="font-heading font-bold text-lg sm:text-xl text-neutral-900">
          {pick(serviceNameEn, serviceNameNe) || t("services.roadmap.ariaLabel")}
        </h2>
        <p className="mt-1 text-xs text-neutral-500">
          {t("services.roadmap.stagesCount", { count: stages.length })}
        </p>
      </header>

      <ol className="relative space-y-0">
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
          const docCount = stage.documents?.length ?? 0;
          const showInlineDocs = docCount > 0 && docCount <= 2;

          return (
            <li key={stage.id} className="relative flex gap-4 pb-6 last:pb-0">
              {/* Connector line + circle */}
              <div className="flex flex-col items-center flex-shrink-0">
                <span
                  className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-full border-2 text-sm font-bold ${s.circle}`}
                  aria-current={status === "current" ? "step" : undefined}
                >
                  <StatusIcon status={status} />
                  <span className={status === "completed" || status === "current" ? "sr-only" : ""}>
                    {stage.stageOrder}
                  </span>
                </span>
                {!isLast && (
                  <span
                    className={`w-0.5 flex-1 mt-1 rounded-full ${s.line}`}
                    aria-hidden="true"
                  />
                )}
              </div>

              {/* Content */}
              <div className={`flex-1 min-w-0 pt-0.5 ${status === "current" ? "border-l-2 border-primary-300 pl-3 -ml-2 rounded-l" : ""}`}>
                <p className={`text-[11px] font-bold uppercase tracking-wider ${s.label}`}>
                  {t(`services.roadmap.status.${status}`)}
                  <span className="ml-2 text-neutral-400 font-medium normal-case tracking-normal">
                    {t("services.roadmap.stepLabel", { n: stage.stageOrder })}
                  </span>
                </p>
                <p className="mt-1 font-heading font-semibold text-neutral-900 text-base sm:text-lg leading-snug">
                  {pick(stage.nameEn, stage.nameNe)}
                </p>

                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-500">
                  {stage.location && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                      {stage.location}
                    </span>
                  )}
                  {typeof stage.baselineMinutes === "number" && (
                    <span className="inline-flex items-center gap-1">
                      <Loader className="h-3.5 w-3.5 flex-shrink-0" />
                      {t("services.roadmap.baselineMinutes", { n: stage.baselineMinutes })}
                    </span>
                  )}
                </div>

                {/* Documents */}
                {showInlineDocs && (
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

                {docCount > 2 && <CollapsibleDocs stage={stage} pick={pick} t={t} />}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
};

/**
 * CollapsibleDocs — used when a stage has 3+ required documents.
 * Renders a small count badge that toggles the full list.
 */
const CollapsibleDocs = ({ stage, pick, t }) => {
  const [open, setOpen] = useState(false);
  const count = stage.documents.length;
  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-700 hover:text-primary-800 px-2 py-1 -ml-2 rounded-md hover:bg-primary-50 transition"
        aria-expanded={open}
      >
        <FileText className="h-3.5 w-3.5" />
        {t("services.roadmap.documentsCount", { count })}
        {open ? (
          <ChevronUp className="h-3.5 w-3.5" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5" />
        )}
      </button>
      {open && (
        <ul className="mt-2 space-y-1 pl-2 border-l-2 border-primary-200">
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
  );
};

export default ServiceRoadmap;
