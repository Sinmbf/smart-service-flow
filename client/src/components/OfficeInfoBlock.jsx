import { useTranslation } from "react-i18next";
import { Building2, MapPin, Clock } from "lucide-react";

/**
 * OfficeInfoBlock — read-only display of a GovernmentOffice's essentials.
 *
 * @param {{ office: { id, nameEn, nameNe, location, hours } }} props
 */
const OfficeInfoBlock = ({ office }) => {
  const { t, i18n } = useTranslation();
  if (!office) return null;

  const isNe = i18n.language === "ne";
  const name = isNe ? office.nameNe : office.nameEn;

  return (
    <section
      className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm"
      aria-label={t("services.office.ariaLabel")}
    >
      <h2 className="font-heading font-semibold text-neutral-900 flex items-center gap-2 mb-3">
        <span className="p-1.5 rounded-md bg-primary-50 text-primary-700">
          <Building2 className="h-5 w-5" />
        </span>
        {name}
      </h2>
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
        <div className="flex items-start gap-2">
          <MapPin className="h-4 w-4 text-neutral-400 flex-shrink-0 mt-0.5" />
          <div>
            <dt className="text-xs text-neutral-500">{t("services.office.location")}</dt>
            <dd className="text-neutral-800">{office.location}</dd>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <Clock className="h-4 w-4 text-neutral-400 flex-shrink-0 mt-0.5" />
          <div>
            <dt className="text-xs text-neutral-500">{t("services.office.hours")}</dt>
            <dd className="text-neutral-800">{office.hours}</dd>
          </div>
        </div>
      </dl>
    </section>
  );
};

export default OfficeInfoBlock;
