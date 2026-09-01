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
            className="block text-base font-medium text-neutral-700 mb-2"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500">
            <Lock className="h-5 w-5" />
          </div>
          <input
            ref={ref}
            id={inputId}
            type={showPassword ? "text" : "password"}
            aria-invalid={error ? "true" : "false"}
            aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
            className={`w-full min-h-[48px] pl-11 pr-12 py-3 text-base text-neutral-900 bg-white border-2 rounded-lg transition-all focus:outline-none focus:ring-4 ${
              error
                ? "border-red-600 focus:ring-red-200"
                : "border-neutral-300 focus:border-primary-500 focus:ring-primary-200"
            } disabled:bg-neutral-100 disabled:cursor-not-allowed placeholder:text-neutral-400 ${className}`}
            {...props}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-900 transition-colors min-h-[44px] min-w-[44px] p-2"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>
        {error && (
          <p id={`${inputId}-error`} role="alert" className="mt-2 text-base text-red-600">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={`${inputId}-helper`} className="mt-2 text-base text-neutral-600">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

PasswordInput.displayName = "PasswordInput";

export default PasswordInput;
