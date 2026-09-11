import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Mail, User, Users, Briefcase, ArrowRight } from "lucide-react";
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
    officeId: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverMessage, setServerMessage] = useState("");
  const [offices, setOffices] = useState([]);

  useEffect(() => {
    axios
      .get("/services", { params: { pageSize: 100 } })
      .then((r) => {
        const by = new Map(
          (r.data.services || []).map((s) => [s.office.id, s.office]),
        );
        setOffices([...by.values()]);
      })
      .catch(() => {});
  }, []);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = t("auth.validation.required");
    }

    if (!formData.email.trim()) {
      newErrors.email = t("auth.validation.required");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t("auth.validation.emailInvalid");
    }

    if (!formData.officeId)
      newErrors.officeId = "Government office is required";

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

  const handleSubmit = async (e) => {
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
        employeeId: formData.employeeId,
        officeId: formData.officeId,
      });

      setServerMessage(response.data.message);

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      setErrors({
        api: error.response?.data?.message || t("auth.errors.generic"),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <Card className="p-8 shadow-xl">
        {/* Title */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-50 mb-3">
            <Users className="h-8 w-8 text-primary-700" />
          </div>
          <h2 className="text-2xl font-bold text-neutral-900 mb-2">
            {t("auth.staffRegister.title")}
          </h2>
          <p className="text-sm text-neutral-600">
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
            icon={<User className="h-5 w-5" />}
          />

          <Input
            label={t("auth.staffRegister.email")}
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            error={errors.email}
            autoComplete="email"
            placeholder="staff@government.gov"
            icon={<Mail className="h-5 w-5" />}
          />

          <Input
            label={t("auth.staffRegister.employeeId")}
            type="text"
            value={formData.employeeId}
            onChange={(e) =>
              setFormData({ ...formData, employeeId: e.target.value })
            }
            placeholder="EMP-2026-XXX"
            icon={<Briefcase className="h-5 w-5" />}
          />

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Government Office
            </label>
            <select
              value={formData.officeId}
              onChange={(e) =>
                setFormData({ ...formData, officeId: e.target.value })
              }
              className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg"
            >
              <option value="">Select government office</option>
              {offices.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.nameEn}
                </option>
              ))}
            </select>
            {errors.officeId && (
              <p className="text-xs text-red-600 mt-1">{errors.officeId}</p>
            )}
          </div>

          <PasswordInput
            label={t("auth.staffRegister.password")}
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            error={errors.password}
            autoComplete="new-password"
            placeholder="••••••••"
          />

          <PasswordInput
            label={t("auth.staffRegister.confirmPassword")}
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
            icon={!isLoading && <ArrowRight className="h-5 w-5" />}
          >
            {isLoading
              ? t("auth.staffRegister.creating")
              : t("auth.staffRegister.createButton")}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-neutral-600">
            {t("auth.staffRegister.haveAccount")}{" "}
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="text-primary-700 hover:text-primary-800 font-semibold hover:underline"
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
