
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../../layouts/AuthLayout";
import { Button, Input, Card } from "../../components/ui";
import { ArrowLeft } from "lucide-react";

const ForgotPassword = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const validateForm = () => {
    if (!identifier.trim()) {
      setError(t("auth.validation.required"));
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!validateForm()) {
      return;
    }

    // Mock submission
    setIsLoading(true);
    console.log("Forgot password request for:", identifier);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setSuccessMessage(t("auth.forgotPassword.successMessage"));
      // In real implementation, navigate to reset-password with token
      setTimeout(() => {
        navigate("/reset-password");
      }, 2000);
    }, 1500);
  };

  return (
    <AuthLayout>
      <Card className="p-6 sm:p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-neutral-900 mb-2">
            {t("auth.forgotPassword.title")}
          </h2>
          <p className="text-sm text-neutral-600">
            {t("auth.forgotPassword.subtitle")}
          </p>
        </div>

        {successMessage && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label={t("auth.forgotPassword.emailOrMobile")}
            type="text"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            error={error}
            placeholder="yourname@example.com"
            autoComplete="username"
          />

          <Button
            type="submit"
            fullWidth
            isLoading={isLoading}
            disabled={isLoading}
          >
            {isLoading
              ? t("auth.forgotPassword.sending")
              : t("auth.forgotPassword.sendButton")}
          </Button>
        </form>

        <div className="mt-6">
          <Link
            to="/login"
            className="flex items-center justify-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("auth.forgotPassword.backToLogin")}
          </Link>
        </div>
      </Card>
    </AuthLayout>
  );
};

export default ForgotPassword;
