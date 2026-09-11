import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import MainLayout from "../../layouts/MainLayout.jsx";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function Monitor() {
  const { t, i18n } = useTranslation();

  const isNe = i18n.language === "ne";

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadQueueStatus = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/queue/status`);

        if (!response.ok) {
          throw new Error(`Queue request failed: ${response.status}`);
        }

        const data = await response.json();

        if (cancelled) {
          return;
        }

        setServices(Array.isArray(data?.services) ? data.services : []);

        setError("");
      } catch (err) {
        if (cancelled) {
          return;
        }

        console.error("[Monitor] Failed to load queue status:", err);

        setError(
          isNe ? "लाइन स्थिति लोड गर्न सकिएन।" : "Failed to load queue status.",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    // Load immediately when the page opens.
    loadQueueStatus();

    // Refresh queue information every 3 seconds.
    const intervalId = setInterval(loadQueueStatus, 3000);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [isNe]);

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto p-8">
        {/* Page heading */}
        <h2 className="font-heading text-3xl text-teal-300 mb-6 border-b border-neutral-200 pb-2">
          {t("token.monitor.title", "Queue Status")}
        </h2>

        {/* Loading state */}
        {loading && services.length === 0 ? (
          <div className="text-neutral-500">
            {t("token.monitor.loading", "Loading queue status...")}
          </div>
        ) : error ? (
          /* Error state */
          <div
            className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700"
            role="alert"
          >
            {error}
          </div>
        ) : services.length === 0 ? (
          /* Empty state */
          <div className="text-neutral-500">
            {t("token.monitor.noServices", "No active services found.")}
          </div>
        ) : (
          /* Responsive card grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((service) => (
              <div
                key={service.id}
                className="bg-white border-t-8 border-primary-700 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition w-full"
              >
                {/* Service name */}
                <div className="mb-3">
                  <span className="text-base font-heading font-bold text-neutral-900">
                    {isNe ? service.nameNe || service.name : service.name}
                  </span>
                </div>

                {/* Current serving tokens */}
                <div className="mb-5">
                  <span className="text-sm font-bold uppercase tracking-[0.2em] text-neutral-500">
                    {t("token.monitor.nowServing", "Now serving:")}
                  </span>

                  <div className="mt-2 flex flex-wrap gap-3">
                    {(service.servingTokenNumbers || (service.currentToken ? [service.currentToken] : [])).length > 0 ? (
                      (service.servingTokenNumbers || [service.currentToken]).map((tokenNumber) => (
                        <div
                          key={tokenNumber}
                          className="text-5xl font-heading font-light text-primary-700 leading-none"
                        >
                          {tokenNumber}
                        </div>
                      ))
                    ) : (
                      <div className="text-5xl font-heading font-light text-neutral-300 leading-none">
                        —
                      </div>
                    )}
                  </div>
                </div>

                {/* Queue statistics */}
                <div className="space-y-2 text-sm text-neutral-600">
                  <div className="flex justify-between gap-4">
                    <span>{t("token.monitor.inQueue", "In queue:")}</span>
                    <b className="text-neutral-900">{service.waiting ?? 0}</b>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span>{t("token.monitor.proceedToCounter", "Proceed to counter:")}</span>
                    <b className="text-amber-700">{service.called ?? 0}</b>
                  </div>

                  {service.calledTokenNumbers?.length > 0 && (
                    <div className="text-xs text-amber-700 pt-1">
                      {service.calledTokenNumbers.join(", ")}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
