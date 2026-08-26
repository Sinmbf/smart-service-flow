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
          <h2 className="text-2xl font-bold text-[#1E293B] mb-2">
            {t("auth.verifyPhone.title")}
          </h2>
          <p className="text-sm text-[#64748B]">
            {t("auth.verifyPhone.subtitle")}
          </p>
          {/* Mock phone number display */}
          <p className="mt-2 text-sm font-medium text-[#1E293B]">
            +977 98XXXXXXXX
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* OTP Input */}
          <div>
            <label className="block text-sm font-medium text-[#1E293B] mb-3 text-center">
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
                      ? "border-[#DC2626] focus:ring-[#DC2626]"
                      : "border-[#E2E8F0] focus:ring-[#2563EB] focus:border-[#2563EB]"
                  }`}
                />
              ))}
            </div>
            {error && (
              <p className="mt-2 text-sm text-[#DC2626] text-center">{error}</p>
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
                className="text-sm text-[#2563EB] hover:text-[#1D4ED8] font-medium"
              >
                {t("auth.verifyPhone.resendCode")}
              </button>
            ) : (
              <p className="text-sm text-[#64748B]">
                {t("auth.verifyPhone.resendIn")} {resendCountdown}{" "}
                {t("auth.verifyPhone.seconds")}
              </p>
            )}
          </div>
          <div className="text-center">
            <button
              type="button"
              onClick={handleChangeNumber}
              className="text-sm text-[#64748B] hover:text-[#1E293B]"
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
