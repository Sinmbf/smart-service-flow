import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Search } from "lucide-react";
import MainLayout from "../../layouts/MainLayout";
import ServiceCard from "../../components/ServiceCard";
import { Skeleton } from "../../components/ui/Skeleton";
import { fetchServices } from "../../services/services";

const ServiceList = () => {
  const { t, i18n } = useTranslation();
  const [services, setServices] = useState([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Debounced fetch on search change.
  useEffect(() => {
    let cancelled = false;
    const handle = setTimeout(async () => {
      setIsLoading(true);
      setError("");
      try {
        const data = await fetchServices({
          search: search.trim(),
          lang: i18n.language,
        });
        if (!cancelled) setServices(data.services || []);
      } catch {
        if (!cancelled) setError(t("services.list.error"));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [search, i18n.language, t]);

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto py-4">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-neutral-900 tracking-tight">
            {t("services.list.title")}
          </h1>
          <p className="mt-2 text-neutral-600">{t("services.list.subtitle")}</p>
        </div>

        {/* Search */}
        <div className="relative mb-6 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("services.list.searchPlaceholder")}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-300 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none transition"
            aria-label={t("services.list.searchPlaceholder")}
          />
        </div>

        {error && (
          <div
            className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 mb-6"
            role="alert"
          >
            {error}
          </div>
        )}

        {/* Loading skeletons */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-40 w-full rounded-2xl" />
            ))}
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-16 text-neutral-500">
            {t("services.list.empty")}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default ServiceList;
