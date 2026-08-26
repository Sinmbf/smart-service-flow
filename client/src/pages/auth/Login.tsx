import type { FormEvent } from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Mail, User, Users, ArrowRight } from "lucide-react";
import AuthLayout from "../../layouts/AuthLayout";
import { Button, Input, PasswordInput, Card } from "../../components/ui";

type UserType = "citizen" | "staff";

const Login = () => {
  const { t } = useTranslation();
  const [userType, setUserType] = useState<UserType>("citizen");
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
    rememberMe: false,
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.identifier.trim()) {
      newErrors.identifier = t("auth.validation.required");
    }

    if (!formData.password) {
      newErrors.password = t("auth.validation.required");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrors({});

    if (!validateForm()) {
      return;
    }

    // Mock submission
    setIsLoading(true);
    console.log("Login form data:", { ...formData, userType });

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setSuccessMessage(t("auth.login.successMessage"));
      // In real implementation, redirect to dashboard
    }, 1500);
  };

  return (
    <AuthLayout>
      <Card className="p-8 shadow-xl">
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
            onClick={() => setUserType("citizen")}
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
            onClick={() => setUserType("staff")}
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

        {successMessage && (
          <div className="mb-4 p-3 bg-[#16A34A]/10 border border-[#16A34A] rounded-lg text-sm text-[#16A34A]">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label={t("auth.login.emailOrMobile")}
            type="text"
            value={formData.identifier}
            onChange={(e) =>
              setFormData({ ...formData, identifier: e.target.value })
            }
            error={errors.identifier}
            autoComplete="username"
            placeholder="yourname@example.com"
            icon={<Mail className="h-5 w-5" />}
          />

          <PasswordInput
            label={t("auth.login.password")}
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
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

            <Link
              to="/forgot-password"
              className="text-sm text-[#2563EB] hover:text-[#1D4ED8] font-medium hover:underline"
            >
              {t("auth.login.forgotPassword")}
            </Link>
          </div>

          <Button
            type="submit"
            fullWidth
            isLoading={isLoading}
            disabled={isLoading}
            icon={!isLoading && <ArrowRight className="h-5 w-5" />}
          >
            {isLoading ? t("auth.login.signingIn") : t("auth.login.loginButton")}
          </Button>
        </form>

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
            <Link
              to="/register"
              className="text-[#2563EB] hover:text-[#1D4ED8] font-semibold hover:underline inline-flex items-center gap-1"
            >
              {t("auth.login.registerLink")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </p>
        </div>
      </Card>
    </AuthLayout>
  );
};

export default Login;
