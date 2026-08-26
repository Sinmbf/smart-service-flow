import type { InputHTMLAttributes, ReactNode } from "react";
import { forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, icon, className = "", id, ...props }, ref) => {
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
          {icon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B]">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`w-full ${icon ? 'pl-11' : 'pl-3.5'} pr-3.5 py-3 text-base text-[#1E293B] bg-[#F8FAFC] border rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-offset-0 ${
              error
                ? "border-[#DC2626] focus:ring-[#DC2626] focus:bg-white"
                : "border-[#E2E8F0] focus:ring-[#2563EB] focus:border-[#2563EB] focus:bg-white"
            } disabled:bg-[#F1F5F9] disabled:cursor-not-allowed placeholder:text-[#94A3B8] ${className}`}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1.5 text-sm text-[#DC2626]">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1.5 text-sm text-[#64748B]">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
