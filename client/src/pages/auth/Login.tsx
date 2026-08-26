import type { FormEvent } from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Mail, User, Users, ArrowRight, Smartphone } from "lucide-react";
import axios from "../../services/api";
import AuthLayout from "../../layouts/AuthLayout";
import { Button, Input, PasswordInput, Card } from "../../components/ui";

type UserType = "citizen" | "staff";

const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [userType, setUserType] = useState<UserType>("citizen");
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

  const handleCitizenLogin = () => {
    navigate("/citizen-login");
  };

  return (
    <AuthLayout>
      <Card className="p-8 shadow-xl w-full max-w-md mx-auto">
        {/* Title */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-[#1E293B] mb-2">
            {t("auth.login.title")}
          </h2>
          <p className="text-sm text-[#64748B]">{t("auth.login.subtitle")}</p>
        </div>

        {/* User Type Tabs */}
        <div className="flex gap-3 mb-6">
          <button
            type="button"
            onClick={() => {
              setUserType("citizen");
              setOtpStep(false);
              setErrors({});
              setServerMessage("");
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-all ${
              userType === "citizen"
                ? "bg-white text-[#2563EB] border-2 border-[#2563EB] shadow-sm"
                : "bg-[#F8FAFC] text-[#64748B] border-2 border-transparent hover:bg-[#F1F5F9]"
            }`}
          >
            <User className="h-5 w-5" />
            <span>{t("auth.login.citizen")}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setUserType("staff");
              setOtpStep(false);
              setErrors({});
              setServerMessage("");
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-all ${
              userType === "staff"
                ? "bg-white text-[#2563EB] border-2 border-[#2563EB] shadow-sm"
                : "bg-[#F8FAFC] text-[#64748B] border-2 border-transparent hover:bg-[#F1F5F9]"
            }`}
          >
            <Users className="h-5 w-5" />
            <span>{t("auth.login.staff")}</span>
          </button>
        </div>

        {/* Messages */}
        {serverMessage && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
            {serverMessage}
          </div>
        )}
        {errors.api && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {errors.api}
          </div>
        )}

        {/* Citizen Login */}
        {userType === "citizen" && (
          <div className="space-y-5">
            <p className="text-sm text-[#64748B] text-center">
              {t("auth.citizen.quickAccess")}
            </p>
            <Button
              type="button"
              fullWidth
              onClick={handleCitizenLogin}
              icon={<Smartphone className="h-5 w-5" />}
            >
              {t("auth.citizen.loginWithPhone")}
            </Button>
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#E2E8F0]"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-[#64748B]">{t("common.or")}</span>
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm text-[#64748B]">
                {t("auth.login.noAccount")}{" "}
                <button
                  type="button"
                  onClick={() => navigate("/staff-register")}
                  className="text-[#2563EB] hover:text-[#1D4ED8] font-semibold hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  {t("auth.login.staffRegister")}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </p>
            </div>
          </div>
        )}

        {/* Staff Login */}
        {userType === "staff" && !otpStep && (
          <form onSubmit={handleStaffLogin} className="space-y-5">
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

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={(e) =>
                    setFormData({ ...formData, rememberMe: e.target.checked })
                  }
                  className="w-4 h-4 text-[#2563EB] bg-white border-[#CBD5E1] rounded focus:ring-2 focus:ring-[#2563EB] focus:ring-offset-0 cursor-pointer"
                />
                <span className="text-sm text-[#64748B] group-hover:text-[#334155]">
                  {t("auth.login.rememberMe")}
                </span>
              </label>

              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                className="text-sm text-[#2563EB] hover:text-[#1D4ED8] font-medium hover:underline"
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
        {userType === "staff" && otpStep && (
          <form onSubmit={handleStaffOTPVerify} className="space-y-6">
            <div className="text-center mb-4">
              <p className="text-sm text-[#64748B]">
                {t("auth.staff.enterOtp")}
              </p>
              <p className="text-xs text-[#64748B] mt-1">
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
              className="w-full text-sm text-[#64748B] hover:text-[#1E293B] font-medium"
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

        {/* No OTP step for citizen, so add divider at bottom of staff only */}
        {userType === "staff" && !otpStep && (
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#E2E8F0]"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-[#64748B]">{t("common.or")}</span>
            </div>
          </div>
        )}

        {userType === "staff" && !otpStep && (
          <div className="text-center">
            <p className="text-sm text-[#64748B]">
              {t("auth.staff.noAccount")}{" "}
              <button
                type="button"
                onClick={() => navigate("/staff-register")}
                className="text-[#2563EB] hover:text-[#1D4ED8] font-semibold hover:underline inline-flex items-center gap-1"
              >
                {t("auth.staff.registerLink")}
                <ArrowRight className="h-4 w-4" />
              </button>
            </p>
          </div>
        )}
      </Card>
    </AuthLayout>
  );
};

export default Login;