import type { FormEvent } from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Mail, ArrowRight } from "lucide-react";
import axios from "../../services/api";
import AuthLayout from "../../layouts/AuthLayout";
import { Button, Input, PasswordInput, Card } from "../../components/ui";

const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverMessage, setServerMessage] = useState("");

  // Staff OTP step
  const [otpStep, setOtpStep] = useState(false);
  const [otp, setOtp] = useState("");
  const [pendingEmail, setPendingEmail] = useState("");

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.email.trim()) {
      newErrors.email = t("auth.validation.required");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t("auth.validation.emailInvalid");
    }

    if (!formData.password) {
      newErrors.password = t("auth.validation.required");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleStaffLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setServerMessage("");
    setErrors({});

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await axios.post("/auth/staff/login", {
        email: formData.email,
        password: formData.password,
      });

      setPendingEmail(formData.email);
      setOtpStep(true);
      setServerMessage(t("auth.staff.otpSentToConsole"));
    } catch (error: any) {
      setErrors({ api: error.response?.data?.message || t("auth.errors.generic") });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStaffOTPVerify = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setServerMessage("");
    setErrors({});

    if (otp.length !== 6) {
      setErrors({ otp: t("auth.validation.otpInvalid") });
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post("/auth/staff/verify-otp", {
        email: pendingEmail,
        otp,
      });

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      console.log("✅ Staff authenticated:", response.data.user);
      navigate("/token/scanner");
    } catch (error: any) {
      setErrors({ otp: error.response?.data?.message || t("auth.validation.otpInvalid") });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <Card className="p-6 sm:p-8 w-full max-w-md mx-auto">
        {/* Title */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-heading font-bold text-neutral-900 mb-2">
            {t("auth.login.title")}
          </h2>
          <p className="text-base text-neutral-700">{t("auth.login.subtitle")}</p>
        </div>

        {/* Messages */}
        {serverMessage && (
          <div className="mb-6 p-4 bg-neutral-100 border border-neutral-300 rounded-lg text-base text-neutral-800" role="status">
            {serverMessage}
          </div>
        )}
        {errors.api && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-base text-red-700" role="alert">
            {errors.api}
          </div>
        )}

        {/* Staff Login */}
        {!otpStep && (
          <form onSubmit={handleStaffLogin} className="space-y-6" noValidate aria-describedby="login-error">
            <Input
              label={t("auth.staff.email")}
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              error={errors.email}
              autoComplete="username"
              placeholder="staff@government.gov"
              icon={<Mail className="h-5 w-5" />}
            />

            <PasswordInput
              label={t("auth.staff.password")}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              error={errors.password}
              autoComplete="current-password"
              placeholder="••••••••"
            />

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-3 cursor-pointer group min-h-[44px]">
                <input
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={(e) =>
                    setFormData({ ...formData, rememberMe: e.target.checked })
                  }
                  className="w-5 h-5 text-primary-600 bg-white border-2 border-neutral-300 rounded focus-visible:ring-4 focus-visible:ring-primary-200 focus-visible:ring-offset-2 cursor-pointer"
                />
                <span className="text-base text-neutral-700 group-hover:text-neutral-900">
                  {t("auth.login.rememberMe")}
                </span>
              </label>

              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                className="text-base text-neutral-700 hover:text-neutral-900 font-medium hover:underline min-h-[44px] flex items-center"
              >
                {t("auth.login.forgotPassword")}
              </button>
            </div>

            <Button
              type="submit"
              fullWidth
              isLoading={isLoading}
              disabled={isLoading}
              icon={!isLoading && <ArrowRight className="h-5 w-5" />}
            >
              {isLoading ? t("auth.staff.signingIn") : t("auth.staff.loginButton")}
            </Button>
          </form>
        )}

        {/* Staff OTP Verification */}
        {otpStep && (
          <form onSubmit={handleStaffOTPVerify} className="space-y-6" noValidate>
            <div className="text-center mb-4">
              <p className="text-base text-neutral-700">
                {t("auth.staff.enterOtp")}
              </p>
              <p className="text-sm text-neutral-600 mt-2">
                {t("auth.staff.otpConsoleNote")}
              </p>
            </div>

            <Input
              label={t("auth.staff.otpCode")}
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              error={errors.otp}
              placeholder="123456"
              maxLength={6}
              inputMode="numeric"
            />

            <Button
              type="submit"
              fullWidth
              isLoading={isLoading}
              disabled={isLoading}
            >
              {isLoading ? t("auth.staff.verifying") : t("auth.staff.verifyButton")}
            </Button>

            <button
              type="button"
              className="w-full text-base text-neutral-700 hover:text-neutral-900 font-medium min-h-[44px]"
              onClick={() => {
                setOtpStep(false);
                setOtp("");
                setErrors({});
              }}
            >
              ← {t("auth.staff.backToLogin")}
            </button>
          </form>
        )}

        {/* Divider */}
        {!otpStep && (
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-200"></div>
            </div>
            <div className="relative flex justify-center text-base">
              <span className="px-4 bg-white text-neutral-600">{t("common.or")}</span>
            </div>
          </div>
        )}

        {!otpStep && (
          <div className="text-center">
            <p className="text-base text-neutral-700">
              {t("auth.staff.noAccount")}{" "}
              <button
                type="button"
                onClick={() => navigate("/staff-register")}
                className="text-neutral-900 hover:text-primary-700 font-semibold hover:underline inline-flex items-center gap-1 min-h-[44px]"
              >
                {t("auth.staff.registerLink")}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </p>
          </div>
        )}
      </Card>
    </AuthLayout>
  );
};

export default Login;
