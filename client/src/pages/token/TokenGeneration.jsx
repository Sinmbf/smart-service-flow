import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import MainLayout from "../../layouts/MainLayout";
import Card from "../../components/ui/Card";
import { useAuth } from "../../auth/AuthContext";
import { useActiveToken } from "../../hooks/useActiveToken";
import { generateToken } from "../../services/tokens";

const TokenGeneration = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { activeToken, isLoading: activeLoading } = useActiveToken();
  const service = location.state?.service;

  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (activeToken && !isLoading) {
      navigate(`/token/display/${activeToken.id}`, { replace: true });
      return;
    }
    if (!service) {
      navigate("/token/services", { replace: true });
      return;
    }
    if (!isAuthenticated) {
      navigate("/citizen-login", { replace: true, state: { service } });
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        if (!service?.id) {
          setError(
            i18n.language === "ne"
              ? "सेवा छानिएन। कृपया सेवा चयन गर्नुहोस्।"
              : "No service selected. Please pick a service."
          );
          return;
        }
        const data = await generateToken({ serviceId: service.id });
        if (cancelled) return;
        // Use URL-based navigation so the user can refresh, share, or
        // come back to their token later from the dashboard.
        navigate(`/token/display/${data.token.id}`, {
          state: {
            id: data.token.id,
            tokenNumber: data.token.tokenNumber,
            position: data.token.position,
            status: data.token.status,
            service,
            qrPayload: data.qrPayload,
            generatedAt: data.token.generatedAt,
          },
          replace: true,
        });
      } catch (err) {
        if (cancelled) return;
        console.error("[TokenGeneration] error:", err);
        // 409 with activeToken — server says we already have one. Route there.
        if (err.response?.status === 409 && err.response?.data?.activeToken) {
          navigate(`/token/display/${err.response.data.activeToken.id}`, { replace: true });
          return;
        }
        setError(
          err.response?.data?.message ||
            (i18n.language === "ne"
              ? "टोकन बनाउन सकिएन। कृपया पुनः प्रयास गर्नुहोस्।"
              : "Failed to generate token. Please try again.")
        );
      }
    })();

    return () => {
      cancelled = true;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [service?.id, isAuthenticated, authLoading, navigate]);

  return (
    <MainLayout>
      <Card className="backdrop-blur-md bg-white/95">
        <div className="text-center space-y-6 py-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {t("token.generation.title")}
            </h2>
            <p className="text-gray-600 mt-2">
              {t("token.generation.subtitle")}
            </p>
          </div>

          {error ? (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700" role="alert">
              {error}
              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => navigate("/token/services")}
                  className="text-sm font-semibold text-primary-700 hover:underline"
                >
                  {t("common.back")}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center space-y-6">
              <div className="relative w-24 h-24">
                <div className="absolute inset-0 border-8 border-gray-200 rounded-full" />
                <div className="absolute inset-0 border-8 border-primary-700 border-t-transparent rounded-full animate-spin" />
              </div>
              <p className="text-lg font-medium text-gray-700 animate-pulse">
                {t("token.generation.generating")}
              </p>
            </div>
          )}
        </div>
      </Card>
    </MainLayout>
  );
};

export default TokenGeneration;
