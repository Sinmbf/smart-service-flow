import type { FormEvent, KeyboardEvent } from "react";
import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../../layouts/AuthLayout";
import { Button, Card } from "../../components/ui";

const VerifyPhone = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Focus first input on mount
    inputRefs.current[0]?.focus();

    // Countdown timer
    if (resendCountdown > 0) {
      const timer = setTimeout(() => {
        setResendCountdown(resendCountdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendCountdown]);

  const handleChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) {
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError("");

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);

    if (/^\d+$/.test(pastedData)) {
      const newOtp = [...otp];
      for (let i = 0; i < pastedData.length && i < 6; i++) {
        newOtp[i] = pastedData[i];
      }
      setOtp(newOtp);
      setError("");

      // Focus the next empty input or the last one
      const nextIndex = Math.min(pastedData.length, 5);
      inputRefs.current[nextIndex]?.focus();
    }
  };

  const validateOtp = () => {
    const otpString = otp.join("");
    if (otpString.length !== 6) {
      setError(t("auth.validation.otpInvalid"));
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!validateOtp()) {
      return;
    }

    // Mock verification
    setIsLoading(true);
    const otpString = otp.join("");
    console.log("OTP verification:", otpString);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      // In real implementation, navigate to dashboard or next step
      navigate("/login");
    }, 1500);
  };

  const handleResend = () => {
    if (!canResend) return;

    // Mock resend
    console.log("Resending OTP...");
    setResendCountdown(60);
    setCanResend(false);
    setOtp(["", "", "", "", "", ""]);
    setError("");
    inputRefs.current[0]?.focus();
  };

  const handleChangeNumber = () => {
    // In real implementation, navigate back to registration or edit phone
    navigate("/register");
  };

  return (
    <AuthLayout>
      <Card className="p-6 sm:p-8">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-neutral-900 mb-2">
            {t("auth.verifyPhone.title")}
          </h2>
          <p className="text-sm text-neutral-600">
            {t("auth.verifyPhone.subtitle")}
          </p>
          {/* Mock phone number display */}
          <p className="mt-2 text-sm font-medium text-neutral-900">
            +977 98XXXXXXXX
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* OTP Input */}
          <div>
            <label className="block text-sm font-medium text-neutral-900 mb-3 text-center">
              {t("auth.verifyPhone.enterCode")}
            </label>
            <div className="flex justify-center gap-2 sm:gap-3">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  className={`w-10 h-12 sm:w-12 sm:h-14 text-center text-xl font-semibold border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0 ${
                    error
                      ? "border-red-600 focus:ring-red-500"
                      : "border-neutral-300 focus:ring-primary-500 focus:border-primary-500"
                  }`}
                />
              ))}
            </div>
            {error && (
              <p className="mt-2 text-sm text-red-600 text-center">{error}</p>
            )}
          </div>

          <Button
            type="submit"
            fullWidth
            isLoading={isLoading}
            disabled={isLoading}
          >
            {isLoading
              ? t("auth.verifyPhone.verifying")
              : t("auth.verifyPhone.verifyButton")}
          </Button>
        </form>

        {/* Resend & Change Number */}
        <div className="mt-6 space-y-3">
          <div className="text-center">
            {canResend ? (
              <button
                onClick={handleResend}
                className="text-sm text-primary-700 hover:text-primary-800 font-medium"
              >
                {t("auth.verifyPhone.resendCode")}
              </button>
            ) : (
              <p className="text-sm text-neutral-600">
                {t("auth.verifyPhone.resendIn")} {resendCountdown}{" "}
                {t("auth.verifyPhone.seconds")}
              </p>
            )}
          </div>
          <div className="text-center">
            <button
              type="button"
              onClick={handleChangeNumber}
              className="text-sm text-neutral-600 hover:text-neutral-900"
            >
              {t("auth.verifyPhone.changeNumber")}
            </button>
          </div>
        </div>
      </Card>
    </AuthLayout>
  );
};

export default VerifyPhone;
