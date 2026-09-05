
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "../../services/api";
import AuthLayout from "../../layouts/AuthLayout";
import { Button, Card, Input } from "../../components/ui";
import { useAuth } from "../../auth/AuthContext";

const CitizenOTP = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [step, setStep] = useState("phone");

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const validatePhone = () => {
    const newErrors = {};
    if (!phone.trim()) {
      newErrors.phone = t("auth.validation.required");
    } else if (!/^(\+977)?[9][6-9]\d{8}$/.test(phone.replace(/\s/g, ""))) {
      newErrors.phone = t("auth.validation.mobileInvalid");
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!validatePhone()) return;

    setIsLoading(true);
    try {
      await axios.post("/auth/citizen/send-otp", {
        phoneNumber: phone.replace(/\s/g, ""),
      });
      setStep("otp");
      // In dev mode, OTP is logged to console
      // You can check server console at: localhost:5000
    } catch (error) {
      setErrors({ api: error.response?.data?.message || t("auth.validation.required") });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setErrors({ otp: t("auth.validation.otpInvalid") });
      return;
    }

    // If the server responded with NAME_REQUIRED on the previous attempt,
    // jump to the name step before retrying.
    if (errors.api?.code === "NAME_REQUIRED") {
      setStep("name");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post("/auth/citizen/verify", {
        phoneNumber: phone.replace(/\s/g, ""),
        otp,
      });

      // Hand off to AuthContext
      login(response.data.token, response.data.user);

      console.log("✅ Citizen authenticated:", response.data.user);

      // Check if a service was selected before verification
      const pendingService = location.state?.service;
      if (pendingService) {
        // Go directly to token generation with selected service
        navigate("/token/generate", { state: { service: pendingService } });
      } else {
        // No service selected yet, go to service selection
        navigate("/token/services");
      }
    } catch (error) {
      const data = error.response?.data;
      // First-time login: server tells us a name is required.
      if (data?.code === "NAME_REQUIRED") {
        setStep("name");
        return;
      }
      setErrors({ otp: data?.message || t("auth.validation.otpInvalid") });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitName = async (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed.length < 2 || trimmed.length > 80) {
      setErrors({ name: t("auth.validation.nameLength") });
      return;
    }

    setIsLoading(true);
    setErrors({});
    try {
      const response = await axios.post("/auth/citizen/verify", {
        phoneNumber: phone.replace(/\s/g, ""),
        otp,
        name: trimmed,
      });

      login(response.data.token, response.data.user);
      console.log("✅ Citizen authenticated:", response.data.user);

      const pendingService = location.state?.service;
      if (pendingService) {
        navigate("/token/generate", { state: { service: pendingService } });
      } else {
        navigate("/token/services");
      }
    } catch (error) {
      const data = error.response?.data;
      setErrors({ api: data?.message || t("auth.errors.generic") });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <Card className="p-8 md:p-10 shadow-xl w-full max-w-md mx-auto">
        {/* Title */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-neutral-900 mb-2">
            {t("auth.citizen.title")}
          </h2>
          <p className="text-sm text-neutral-600">
            {t("auth.citizen.subtitle")}
          </p>
        </div>

        {/* Phone Entry */}
        {step === "phone" && (
          <form onSubmit={handleSendOTP} className="space-y-5">
            {errors.api && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                {errors.api}
              </div>
            )}
            <Input
              label={t("auth.citizen.phoneNumber")}
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              error={errors.phone}
              placeholder="+977 98XXXXXXXX"
            />

            <Button
              type="submit"
              fullWidth
              isLoading={isLoading}
              disabled={isLoading}
            >
              {isLoading ? t("auth.citizen.sendingOtp") : t("auth.citizen.sendOtp")}
            </Button>
          </form>
        )}

        {/* OTP Entry */}
        {step === "otp" && (
          <form onSubmit={handleVerifyOTP} className="space-y-5">
            <div className="text-center">
              <p className="text-sm text-neutral-600 mb-2">
                {t("auth.citizen.otpInstruction")}
              </p>
              <p className="text-xs text-neutral-600">
                {t("auth.citizen.otpConsoleNote")}
              </p>
            </div>

            <Input
              label={t("auth.citizen.enterOtp")}
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              error={errors.otp}
              placeholder="123456"
              maxLength={6}
            />

            <Button
              type="submit"
              fullWidth
              isLoading={isLoading}
              disabled={isLoading}
            >
              {isLoading ? t("auth.citizen.submitting") : t("auth.citizen.confirmOtp")}
            </Button>

            <button
              type="button"
              className="w-full text-sm text-primary-700 hover:text-primary-800 font-medium"
              onClick={() => {
                setStep("phone");
                setOtp("");
                setErrors({});
              }}
            >
              {t("auth.citizen.backToPhone")}
            </button>
          </form>
        )}

        {/* Name Entry (first-time citizens only) */}
        {step === "name" && (
          <form onSubmit={handleSubmitName} className="space-y-5">
            <div className="text-center">
              <p className="text-sm text-neutral-600 mb-2">
                {t("auth.citizen.namePrompt")}
              </p>
            </div>

            {errors.api && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                {errors.api}
              </div>
            )}

            <Input
              label={t("auth.citizen.nameLabel")}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={errors.name}
              placeholder={t("auth.citizen.namePlaceholder")}
              maxLength={80}
              autoFocus
            />

            <Button
              type="submit"
              fullWidth
              isLoading={isLoading}
              disabled={isLoading}
            >
              {t("auth.citizen.nameContinue")}
            </Button>
          </form>
        )}

        <div className="mt-6 text-center">
          <button
            type="button"
            className="text-sm text-neutral-600 hover:text-neutral-900 font-medium"
            onClick={() => navigate("/")}
          >
            ← {t("auth.citizen.backToHome")}
          </button>
        </div>
      </Card>
    </AuthLayout>
  );
};

export default CitizenOTP;