
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Phone, User, UserPlus, ArrowRight } from "lucide-react";
import AuthLayout from "../../layouts/AuthLayout";
import { Button, Input, PasswordInput, Card } from "../../components/ui";

const Register = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    lastName: "",
    email: "",
    mobileNumber: "",
    password: "",
    confirmPassword: "",
    agreeToTerms,
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = t("auth.validation.required");
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = t("auth.validation.required");
    }

    if (!formData.email.trim()) {
      newErrors.email = t("auth.validation.required");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t("auth.validation.emailInvalid");
    }

    if (!formData.mobileNumber.trim()) {
      newErrors.mobileNumber = t("auth.validation.required");
    } else if (!/^(\+977)?[9][6-9]\d{8}$/.test(formData.mobileNumber.replace(/\s/g, ""))) {
      newErrors.mobileNumber = t("auth.validation.mobileInvalid");
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

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = t("auth.validation.termsRequired");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    if (!validateForm()) {
      return;
    }

    // Mock submission
    setIsLoading(true);
    console.log("Registration form data:", {
      ...formData,
      password: "[REDACTED]",
      confirmPassword: "[REDACTED]",
    });

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      // In real implementation, navigate to verify-phone with phone number
      navigate("/verify-phone");
    }, 1500);
  };

  return (
    <AuthLayout>
      <Card className="p-8 shadow-xl min-h-[520px]">
        {/* Title */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-neutral-900 mb-2">
            {t("auth.register.title")}
          </h2>
          <p className="text-sm text-neutral-600">
            {t("auth.register.subtitle")}
          </p>
        </div>

        {/* Step Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <div className="flex flex-col items-center flex-1">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-700 to-primary-500 text-white flex items-center justify-center font-semibold text-sm shadow-md">
                1
              </div>
              <span className="text-xs text-primary-700 font-medium mt-2">
                {t("auth.register.step1")}
              </span>
            </div>
            <div className="flex-1 h-0.5 bg-neutral-200 mx-2 -mt-6"></div>
            <div className="flex flex-col items-center flex-1">
              <div className="w-10 h-10 rounded-full bg-neutral-200 text-neutral-500 flex items-center justify-center font-semibold text-sm">
                2
              </div>
              <span className="text-xs text-neutral-500 mt-2">
                {t("auth.register.step2")}
              </span>
            </div>
            <div className="flex-1 h-0.5 bg-neutral-200 mx-2 -mt-6"></div>
            <div className="flex flex-col items-center flex-1">
              <div className="w-10 h-10 rounded-full bg-neutral-200 text-neutral-500 flex items-center justify-center font-semibold text-sm">
                3
              </div>
              <span className="text-xs text-neutral-500 mt-2">
                {t("auth.register.step3")}
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label={t("auth.register.firstName")}
              type="text"
              value={formData.fullName}
              onChange={(e) =>
                setFormData({ ...formData, fullName: e.target.value })
              }
              error={errors.fullName}
              autoComplete="given-name"
              placeholder={t("auth.register.firstNamePlaceholder")}
              icon={<UserIcon className="h-5 w-5" />}
            />

            <Input
              label={t("auth.register.lastName")}
              type="text"
              value={formData.lastName}
              onChange={(e) =>
                setFormData({ ...formData, lastName: e.target.value })
              }
              error={errors.lastName}
              autoComplete="family-name"
              placeholder={t("auth.register.lastNamePlaceholder")}
              icon={<UserIcon className="h-5 w-5" />}
            />
          </div>

          <Input
            label={t("auth.register.email")}
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            error={errors.email}
            autoComplete="email"
            placeholder="ram.tamang@example.com"
            icon={<Mail className="h-5 w-5" />}
          />

          <Input
            label={t("auth.register.mobileNumber")}
            type="tel"
            value={formData.mobileNumber}
            onChange={(e) =>
              setFormData({ ...formData, mobileNumber: e.target.value })
            }
            error={errors.mobileNumber}
            autoComplete="tel"
            placeholder="+977 98XXXXXXXX"
            icon={<Phone className="h-5 w-5" />}
          />

          <div className="grid grid-cols-2 gap-4">
            <PasswordInput
              label={t("auth.register.password")}
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              error={errors.password}
              autoComplete="new-password"
              placeholder="••••••••"
            />

            <PasswordInput
              label={t("auth.register.confirmPassword")}
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
              error={errors.confirmPassword}
              autoComplete="new-password"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="flex items-start gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={formData.agreeToTerms}
                onChange={(e) =>
                  setFormData({ ...formData, agreeToTerms: e.target.checked })
                }
                className="w-4 h-4 mt-0.5 text-primary-700 bg-white border-neutral-300 rounded focus:ring-2 focus:ring-primary-500 focus:ring-offset-0 cursor-pointer"
              />
              <span className="text-sm text-neutral-600 group-hover:text-neutral-900">
                {t("auth.register.termsAgree")}
              </span>
            </label>
            {errors.agreeToTerms && (
              <p className="mt-1.5 text-sm text-red-600">
                {errors.agreeToTerms}
              </p>
            )}
          </div>

          <Button
            type="submit"
            fullWidth
            isLoading={isLoading}
            disabled={isLoading}
            icon={!isLoading && <UserPlus className="h-5 w-5" />}
          >
            {isLoading
              ? t("auth.register.registering")
              : t("auth.register.registerButton")}
          </Button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-neutral-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-neutral-600">{t("common.or")}</span>
          </div>
        </div>

        <div className="text-center">
          <p className="text-sm text-neutral-600">
            {t("auth.register.haveAccount")}{" "}
            <Link
              to="/login"
              className="text-primary-700 hover:text-primary-800 font-semibold hover:underline inline-flex items-center gap-1"
            >
              {t("auth.register.loginLink")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </p>
        </div>
      </Card>
    </AuthLayout>
  );
};

export default Register;
