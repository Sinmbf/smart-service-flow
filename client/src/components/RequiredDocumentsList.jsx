import { useTranslation } from "react-i18next";
import { FileText, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

/**
 * RequiredDocumentsList — per-stage required documents.
 *
 * If `inline` is true (≤2 docs), renders inline. If false or >2 docs,
 * renders as a collapsible list with a count badge.
 */
const RequiredDocumentsList = ({ stage, inline = false }) => {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(true);
  const isNe = i18n.language === "ne";
  const docs = stage?.documents ?? [];
  const count = docs.length;

  if (count === 0) {
    return (
      <p className="text-xs text-neutral-400 mt-2">{t("services.documents.none")}</p>
    );
  }

  if (inline || count <= 2) {
    return (
      <ul className="mt-2 space-y-1">
        {docs.map((doc) => (
          <li key={doc.id} className="text-xs text-neutral-600 flex items-start gap-1.5">
            <FileText className="h-3.5 w-3.5 flex-shrink-0 mt-0.5 text-neutral-400" />
            <span>{isNe ? doc.nameNe : doc.nameEn}</span>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-700 hover:text-primary-800 px-2 py-1 -ml-2 rounded-md hover:bg-primary-50 transition"
        aria-expanded={open}
      >
        <FileText className="h-3.5 w-3.5" />
        {t("services.documents.countLabel", { count })}
        {open ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
      </button>
      {open && (
        <ul className="mt-2 space-y-1 pl-2 border-l-2 border-primary-200">
          {docs.map((doc) => (
            <li key={doc.id} className="text-xs text-neutral-600 flex items-start gap-1.5">
              <FileText className="h-3.5 w-3.5 flex-shrink-0 mt-0.5 text-neutral-400" />
              <span>{isNe ? doc.nameNe : doc.nameEn}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default RequiredDocumentsList;
