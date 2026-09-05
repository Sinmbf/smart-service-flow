import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import QRCode from "qrcode";
import MainLayout from "../../layouts/MainLayout";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { fetchToken, cancelToken } from "../../services/tokens";

const STATUS_FALLBACK_LABEL = {
  GENERATED: "Waiting",
  CHECKED_IN: "Checked in",
  SERVING: "Now serving",
  COMPLETED: "Completed",
  SKIPPED: "Skipped",
  EXPIRED: "Expired",
  CANCELLED: "Cancelled",
  DEFERRED: "Deferred",
};

const TokenDisplay = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { id: tokenIdParam } = useParams();
  const initialToken = location.state;

  const [token, setToken] = useState(initialToken || null);
  const [isLoading, setIsLoading] = useState(!initialToken);
  const [loadError, setLoadError] = useState("");
  const [liveStatus, setLiveStatus] = useState(null);
  const [qrSvg, setQrSvg] = useState(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState("");
  const qrCanvasRef = useRef(null);

  // If no state was passed (e.g. page reload or deep link), fetch the token
  // by id from the URL.
  useEffect(() => {
    if (initialToken?.id) return;
    if (!tokenIdParam) {
      navigate("/token/services", { replace: true });
      return;
    }
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setLoadError("");
      try {
        const data = await fetchToken(tokenIdParam);
        if (cancelled) return;
        setToken({ ...data.token, qrPayload: initialToken?.qrPayload || null });
      } catch (err) {
        if (cancelled) return;
        setLoadError(
          err.response?.status === 404
            ? "This token no longer exists."
            : err.response?.data?.message || "Could not load this token."
        );
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [tokenIdParam, initialToken, navigate]);

  // Resolve service display name from token.service (real object) or fallback.
  const serviceName = (() => {
    const s = token?.service;
    if (!s) return "";
    if (typeof s === "string") return t(`token.services.${s}`);
    return i18n.language === "ne" ? s.nameNe : s.nameEn;
  })();

  // Render QR code into an SVG.
  useEffect(() => {
    if (!token?.qrPayload) return;
    QRCode.toString(
      token.qrPayload,
      { type: "svg", margin: 1, color: { dark: "#0A3A48", light: "#FFFFFF" }, width: 240 },
      (err, svg) => {
        if (!err) setQrSvg(svg);
      }
    );
  }, [token?.qrPayload]);

  // Poll the token endpoint every 8s while we have an id (lightweight).
  useEffect(() => {
    if (!token?.id) return;
    let cancelled = false;
    const tick = async () => {
      try {
        const data = await fetchToken(token.id);
        if (cancelled) return;
        if (data?.token?.status) setLiveStatus(data.token.status);
      } catch {
        /* ignore — polling is best-effort */
      }
    };
    tick();
    const interval = setInterval(tick, 8000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [token?.id]);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="max-w-2xl mx-auto py-12 text-center">
          <div className="inline-block w-12 h-12 border-4 border-neutral-200 border-t-primary-700 rounded-full animate-spin" />
          <p className="mt-3 text-sm text-neutral-600">Loading your token…</p>
        </div>
      </MainLayout>
    );
  }

  if (loadError) {
    return (
      <MainLayout>
        <div className="max-w-md mx-auto py-12">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700" role="alert">
            {loadError}
          </div>
          <Button onClick={() => navigate("/token/services")} className="mt-4 w-full">
            {t("common.back")}
          </Button>
        </div>
      </MainLayout>
    );
  }

  if (!token) return null;

  const status = liveStatus || token.status || "GENERATED";
  const statusKey = STATUS_FALLBACK_LABEL[status] ? status : "GENERATED";
  const generatedDate = token.generatedAt ? new Date(token.generatedAt) : new Date();

  const handleCancelToken = () => {
    setShowCancelConfirm(true);
    setCancelError("");
  };
  const confirmCancel = async () => {
    if (!token?.id) return;
    setCancelling(true);
    setCancelError("");
    try {
      await cancelToken(token.id);
      // Route to the home page; the CTA hook will now show "Get a Token"
      navigate("/", { replace: true });
    } catch (err) {
      setCancelError(err.response?.data?.message || "Failed to cancel token");
    } finally {
      setCancelling(false);
      setShowCancelConfirm(false);
    }
  };

  return (
    <MainLayout>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Main Token Card */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="backdrop-blur-md bg-white/95">
            <div className="space-y-6 py-2">
              <div className="text-center px-2">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                  {t("token.display.title")}
                </h2>
                <p className="text-gray-600 mt-2 text-sm sm:text-base">
                  {t("token.display.subtitle")}
                </p>
              </div>

              <div className="bg-gradient-to-br from-primary-700 to-primary-500 rounded-2xl p-8 md:p-10 mx-2 text-center shadow-lg">
                <p className="text-white/90 text-xs sm:text-sm font-medium mb-3">
                  {t("token.display.tokenNumber")}
                </p>
                <p className="text-white text-5xl sm:text-6xl md:text-7xl font-bold tracking-wider">
                  {token.tokenNumber}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-2">
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <span className="text-gray-600 font-medium text-xs sm:text-sm block mb-2 break-words">
                    {t("token.display.service")}
                  </span>
                  <span className="text-gray-900 font-semibold text-base sm:text-lg break-words">
                    {serviceName}
                  </span>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <span className="text-gray-600 font-medium text-xs sm:text-sm block mb-2 break-words">
                    {t("token.display.queuePosition")}
                  </span>
                  <span className="text-gray-900 font-semibold text-2xl sm:text-3xl break-words">
                    {token.position}
                  </span>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <span className="text-gray-600 font-medium text-xs sm:text-sm block mb-2 break-words">
                    {t("token.display.status")}
                  </span>
                  <span className="inline-block px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold border bg-blue-50 text-blue-800 border-blue-200">
                    {STATUS_FALLBACK_LABEL[statusKey]}
                  </span>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <span className="text-gray-600 font-medium text-xs sm:text-sm block mb-2 break-words">
                    {t("token.display.generatedAt", "Generated")}
                  </span>
                  <span className="text-gray-900 font-semibold text-sm break-words">
                    {generatedDate.toLocaleString(i18n.language === "ne" ? "ne-NP" : "en-US")}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Mobile cancel */}
          <div className="lg:hidden px-2">
            {cancelError && (
              <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700" role="alert">
                {cancelError}
              </div>
            )}
            {!showCancelConfirm ? (
              <Button onClick={handleCancelToken} className="w-full bg-red-600 hover:bg-red-700">
                {t("token.display.cancelToken")}
              </Button>
            ) : (
              <Card className="backdrop-blur-md bg-red-50 border-2 border-red-200">
                <div className="space-y-4">
                  <p className="text-center text-red-900 font-medium text-sm sm:text-base">
                    {t("token.display.confirmCancel")}
                  </p>
                  <div className="flex gap-3">
                    <Button onClick={() => setShowCancelConfirm(false)} variant="secondary" className="flex-1" disabled={cancelling}>
                      {t("common.cancel")}
                    </Button>
                    <Button onClick={confirmCancel} variant="danger" className="flex-1" disabled={cancelling} isLoading={cancelling}>
                      {cancelling ? "..." : t("common.submit")}
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4 lg:sticky lg:top-6">
          {/* QR code card */}
          <Card className="backdrop-blur-md bg-white/95">
            <div className="text-center space-y-3 py-2">
              <p className="text-gray-600 font-medium text-sm sm:text-base">
                {t("token.display.qrTitle", "Your QR code")}
              </p>
              <div
                className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 mx-2 border-2 border-gray-200 flex items-center justify-center min-h-[256px]"
                aria-label="Token QR code"
                ref={qrCanvasRef}
                dangerouslySetInnerHTML={{ __html: qrSvg || "" }}
              />
              <p className="text-xs text-gray-500">
                {t("token.display.qrHint", "Show this code at the office for check-in.")}
              </p>
            </div>
          </Card>

          {/* Notice card */}
          <Card className="bg-primary-50 border-2 border-primary-200">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-primary-700 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <h4 className="font-semibold text-primary-900 mb-1 text-sm">Important</h4>
                <p className="text-xs text-primary-900 leading-relaxed">
                  {t("token.display.keepThisPage")}
                </p>
              </div>
            </div>
          </Card>

          {/* Desktop cancel */}
          <div className="hidden lg:block">
            {cancelError && (
              <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700" role="alert">
                {cancelError}
              </div>
            )}
            {!showCancelConfirm ? (
              <Button onClick={handleCancelToken} className="w-full bg-red-600 hover:bg-red-700">
                {t("token.display.cancelToken")}
              </Button>
            ) : (
              <Card className="backdrop-blur-md bg-red-50 border-2 border-red-200">
                <div className="space-y-4">
                  <p className="text-center text-red-900 font-medium text-sm">
                    {t("token.display.confirmCancel")}
                  </p>
                  <div className="space-y-2">
                    <Button onClick={() => setShowCancelConfirm(false)} variant="secondary" className="w-full" disabled={cancelling}>
                      {t("common.cancel")}
                    </Button>
                    <Button onClick={confirmCancel} variant="danger" className="w-full" disabled={cancelling} isLoading={cancelling}>
                      {cancelling ? "..." : t("common.submit")}
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default TokenDisplay;
