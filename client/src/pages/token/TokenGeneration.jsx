import { useEffect, useRef, useState } from "react";
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
  const { activeToken, isLoading: activeTokenLoading } = useActiveToken();

  const service = location.state?.service;

  const [error, setError] = useState("");

  // Prevent duplicate token-generation requests.
  // React StrictMode can execute effects twice in development.
  const generationStartedRef = useRef(false);

  useEffect(() => {
    // Wait until authentication and active-token checks are complete.
    if (authLoading || activeTokenLoading) {
      return;
    }

    // Make sure a service was selected.
    if (!service?.id) {
      setError(
        i18n.language === "ne"
          ? "सेवा छानिएन। कृपया सेवा चयन गर्नुहोस्।"
          : "No service selected. Please pick a service.",
      );
      return;
    }

    // Redirect unauthenticated users.
    if (!isAuthenticated) {
      navigate("/citizen-login", {
        replace: true,
        state: { service },
      });
      return;
    }

    // If the citizen already has an active token,
    // do not generate another one.
    if (activeToken) {
      navigate(`/token/display/${activeToken.id}`, {
        replace: true,
      });
      return;
    }

    // Prevent duplicate requests caused by React StrictMode.
    if (generationStartedRef.current) {
      return;
    }

    generationStartedRef.current = true;

    let cancelled = false;

    const createToken = async () => {
      try {
        const data = await generateToken({
          serviceId: service.id,
        });

        // Stop if the component has already unmounted.
        if (cancelled) {
          return;
        }

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
        if (cancelled) {
          return;
        }

        // Backend returns 409 when an active token already exists.
        // Open that token instead of displaying an error.
        if (
          err.response?.status === 409 &&
          err.response?.data?.activeToken?.id
        ) {
          navigate(`/token/display/${err.response.data.activeToken.id}`, {
            replace: true,
          });
          return;
        }

        setError(
          err.response?.data?.message ||
            (i18n.language === "ne"
              ? "टोकन बनाउन सकिएन। कृपया पुनः प्रयास गर्नुहोस्।"
              : "Failed to generate token. Please try again."),
        );
      }
    };

    createToken();

    return () => {
      cancelled = true;
    };
  }, [
    service,
    isAuthenticated,
    authLoading,
    activeToken,
    activeTokenLoading,
    navigate,
    i18n.language,
  ]);

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
            <div
              className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700"
              role="alert"
            >
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
