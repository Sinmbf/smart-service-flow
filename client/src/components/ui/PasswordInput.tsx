import type { InputHTMLAttributes } from "react";
import { forwardRef, useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";

interface PasswordInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ label, error, helperText, className = "", id, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-[#334155] mb-2"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B]">
            <Lock className="h-5 w-5" />
          </div>
          <input
            ref={ref}
            id={inputId}
            type={showPassword ? "text" : "password"}
            className={`w-full pl-11 pr-12 py-3 text-base text-[#1E293B] bg-[#F8FAFC] border rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-offset-0 ${
              error
                ? "border-[#DC2626] focus:ring-[#DC2626] focus:bg-white"
                : "border-[#E2E8F0] focus:ring-[#2563EB] focus:border-[#2563EB] focus:bg-white"
            } disabled:bg-[#F1F5F9] disabled:cursor-not-allowed placeholder:text-[#94A3B8] ${className}`}
            {...props}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#1E293B] transition-colors focus:outline-none"
            tabIndex={-1}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>
        {error && <p className="mt-1.5 text-sm text-[#DC2626]">{error}</p>}
        {helperText && !error && (
          <p className="mt-1.5 text-sm text-[#64748B]">{helperText}</p>
        )}
      </div>
    );
  }
);

PasswordInput.displayName = "PasswordInput";

export default PasswordInput;
