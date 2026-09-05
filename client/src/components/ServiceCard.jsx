import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Building2, ArrowRight } from "lucide-react";

/**
 * ServiceCard — one service tile in the ServiceList grid.
 * Picks EN/NE name + description from the active i18n language.
 */
const ServiceCard = ({ service }) => {
  const { t, i18n } = useTranslation();
  const isNe = i18n.language === "ne";

  const name = isNe ? service.nameNe : service.nameEn;
  const description = isNe ? service.descriptionNe : service.descriptionEn;
  const officeName = service.office ? (isNe ? service.office.nameNe : service.office.nameEn) : null;

  return (
    <Link
      to={`/services/${service.id}`}
      className="group block bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-primary-300 transition-all duration-200"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {service.category && (
            <span className="inline-block text-xs font-semibold uppercase tracking-wide text-primary-700 bg-primary-50 px-2 py-0.5 rounded-full mb-2">
              {service.category}
            </span>
          )}
          <h3 className="font-heading font-bold text-lg text-neutral-900 leading-snug">
            {name}
          </h3>
        </div>
        <ArrowRight className="h-5 w-5 text-neutral-300 group-hover:text-primary-700 group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-1" />
      </div>

      {description && (
        <p className="mt-2 text-sm text-neutral-600 line-clamp-2">{description}</p>
      )}

      {officeName && (
        <div className="mt-4 flex items-center gap-2 text-xs text-neutral-500">
          <Building2 className="h-4 w-4 flex-shrink-0" />
          <span className="truncate">{officeName}</span>
        </div>
      )}

      <span className="sr-only">{t("services.list.viewDetails")}</span>
    </Link>
  );
};

export default ServiceCard;
