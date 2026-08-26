import type { FormEvent } from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Mail, User as UserIcon, Users, Briefcase, ArrowRight } from "lucide-react";
import axios from "../../services/api";
import AuthLayout from "../../layouts/AuthLayout";
import { Button, Input, PasswordInput, Card } from "../../components/ui";

const StaffRegister = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    employeeId: "",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverMessage, setServerMessage] = useState("");

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = t("auth.validation.required");
    }

    if (!formData.email.trim()) {
      newErrors.email = t("auth.validation.required");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t("auth.validation.emailInvalid");
    }

    if (!formData.password) {
      newErrors.password = t("auth.validation.required");
    } else if (formData.password.length < 8) {
      newErrors.password = t("auth.validation.passwordMinLength");
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = t("auth.validation.required");
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t("auth.validation.passwordMismatch");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setServerMessage("");
    setErrors({});

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await axios.post("/auth/staff/register", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        employeeId: formData.employeeId || undefined,
      });

      setServerMessage(response.data.message);

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error: any) {
      setErrors({ api: error.response?.data?.message || t("auth.errors.generic") });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <Card className="p-8 shadow-xl">
        {/* Title */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 mb-3">
            <Users className="h-8 w-8 text-[#2563EB]" />
          </div>
          <h2 className="text-2xl font-bold text-[#1E293B] mb-2">
            {t("auth.staffRegister.title")}
          </h2>
          <p className="text-sm text-[#64748B]">
            {t("auth.staffRegister.subtitle")}
          </p>
        </div>

        {serverMessage && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
            {serverMessage}
          </div>
        )}

        {errors.api && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {errors.api}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label={t("auth.staffRegister.fullName")}
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            error={errors.name}
            autoComplete="name"
            placeholder="Ram Tamang"
            icon={<UserIcon className="h-5 w-5" />}
          />

          <Input
            label={t("auth.staffRegister.email")}
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            error={errors.email}
            autoComplete="email"
            placeholder="staff@government.gov"
            icon={<Mail className="h-5 w-5" />}
          />

          <Input
            label={t("auth.staffRegister.employeeId")}
            type="text"
            value={formData.employeeId}
            onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
            placeholder="EMP-2026-XXX"
            icon={<Briefcase className="h-5 w-5" />}
          />

          <PasswordInput
            label={t("auth.staffRegister.password")}
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            error={errors.password}
            autoComplete="new-password"
            placeholder="••••••••"
          />

          <PasswordInput
            label={t("auth.staffRegister.confirmPassword")}
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            error={errors.confirmPassword}
            autoComplete="new-password"
            placeholder="••••••••"
          />

          <Button
            type="submit"
            fullWidth
            isLoading={isLoading}
            disabled={isLoading}
            icon={!isLoading && <ArrowRight className="h-5 w-5" />}
          >
            {isLoading ? t("auth.staffRegister.creating") : t("auth.staffRegister.createButton")}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-[#64748B]">
            {t("auth.staffRegister.haveAccount")}{" "}
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="text-[#2563EB] hover:text-[#1D4ED8] font-semibold hover:underline"
            >
              {t("auth.staffRegister.loginLink")}
            </button>
          </p>
        </div>
      </Card>
    </AuthLayout>
  );
};

export default StaffRegister;