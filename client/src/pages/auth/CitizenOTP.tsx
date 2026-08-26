import type { FormEvent } from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import axios from "../../services/api";
import AuthLayout from "../../layouts/AuthLayout";
import { Button, Card, Input } from "../../components/ui";

const CitizenOTP = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [step, setStep] = useState<"phone" | "otp">("phone");

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const validatePhone = () => {
    const newErrors: { [key: string]: string } = {};
    if (!phone.trim()) {
      newErrors.phone = t("auth.validation.required");
    } else if (!/^(\+977)?[9][6-9]\d{8}$/.test(phone.replace(/\s/g, ""))) {
      newErrors.phone = t("auth.validation.mobileInvalid");
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendOTP = async (e: FormEvent<HTMLFormElement>) => {
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
    } catch (error: any) {
      setErrors({ api: error.response?.data?.message || t("auth.validation.required") });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setErrors({ otp: t("auth.validation.otpInvalid") });
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post("/auth/citizen/verify", {
        phoneNumber: phone.replace(/\s/g, ""),
        otp,
      });

      // Store token
      localStorage.setItem("token", response.data.token);

      console.log("✅ Citizen authenticated:", response.data.user);

      // Redirect to service selection
      navigate("/token/services");
    } catch (error: any) {
      setErrors({ otp: error.response?.data?.message || t("auth.validation.otpInvalid") });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <Card className="p-8 md:p-10 shadow-xl w-full max-w-md mx-auto">
        {/* Title */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-[#1E293B] mb-2">
            {t("auth.citizen.title")}
          </h2>
          <p className="text-sm text-[#64748B]">
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
              <p className="text-sm text-[#64748B] mb-2">
                {t("auth.citizen.otpInstruction")}
              </p>
              <p className="text-xs text-[#64748B]">
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

            {errors.otp && (
              <p className="text-sm text-[#DC2626] text-center">{errors.otp}</p>
            )}

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
              className="w-full text-sm text-[#2563EB] hover:text-[#1D4ED8] font-medium"
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

        <div className="mt-6 text-center">
          <button
            type="button"
            className="text-sm text-[#64748B] hover:text-[#1E293B] font-medium"
            onClick={() => navigate("/login")}
          >
            ← {t("auth.citizen.backToLogin")}
          </button>
        </div>
      </Card>
    </AuthLayout>
  );
};

export default CitizenOTP;