import type { FormEvent } from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../../layouts/AuthLayout";
import { Button, Input, PasswordInput, Card } from "../../components/ui";
import { ArrowLeft } from "lucide-react";

const ResetPassword = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    verificationCode: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.verificationCode.trim()) {
      newErrors.verificationCode = t("auth.validation.required");
    }

    if (!formData.newPassword) {
      newErrors.newPassword = t("auth.validation.required");
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = t("auth.validation.passwordMinLength");
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = t("auth.validation.required");
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = t("auth.validation.passwordMismatch");
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
    console.log("Reset password data:", {
      verificationCode: formData.verificationCode,
      newPassword: "[REDACTED]",
    });

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setSuccessMessage(t("auth.resetPassword.successMessage"));
      // In real implementation, navigate to login
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    }, 1500);
  };

  return (
    <AuthLayout>
      <Card className="p-6 sm:p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-[#1E293B] mb-2">
            {t("auth.resetPassword.title")}
          </h2>
          <p className="text-sm text-[#64748B]">
            {t("auth.resetPassword.subtitle")}
          </p>
        </div>

        {successMessage && (
          <div className="mb-4 p-3 bg-[#16A34A]/10 border border-[#16A34A] rounded-lg text-sm text-[#16A34A]">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label={t("auth.resetPassword.verificationCode")}
            type="text"
            value={formData.verificationCode}
            onChange={(e) =>
              setFormData({ ...formData, verificationCode: e.target.value })
            }
            error={errors.verificationCode}
            placeholder="123456"
            autoComplete="one-time-code"
          />

          <PasswordInput
            label={t("auth.resetPassword.newPassword")}
            value={formData.newPassword}
            onChange={(e) =>
              setFormData({ ...formData, newPassword: e.target.value })
            }
            error={errors.newPassword}
            autoComplete="new-password"
            placeholder="••••••••"
          />

          <PasswordInput
            label={t("auth.resetPassword.confirmPassword")}
            value={formData.confirmPassword}
            onChange={(e) =>
              setFormData({ ...formData, confirmPassword: e.target.value })
            }
            error={errors.confirmPassword}
            autoComplete="new-password"
            placeholder="••••••••"
          />

          <Button
            type="submit"
            fullWidth
            isLoading={isLoading}
            disabled={isLoading}
          >
            {isLoading
              ? t("auth.resetPassword.resetting")
              : t("auth.resetPassword.resetButton")}
          </Button>
        </form>

        <div className="mt-6">
          <Link
            to="/login"
            className="flex items-center justify-center gap-2 text-sm text-[#64748B] hover:text-[#1E293B] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("auth.resetPassword.backToLogin")}
          </Link>
        </div>
      </Card>
    </AuthLayout>
  );
};

export default ResetPassword;
