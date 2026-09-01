import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  isLoading?: boolean;
  icon?: ReactNode;
  children: ReactNode;
}

const Button = ({
  variant = "primary",
  size = "md",
  fullWidth = false,
  isLoading = false,
  icon,
  children,
  className = "",
  disabled,
  ...props
}: ButtonProps) => {
  const baseStyles =
    "inline-flex items-center justify-center font-heading font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-primary-200 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md cursor-pointer min-h-[48px] min-w-[44px]";

  const variants = {
    primary:
      "bg-gradient-to-r from-primary-700 via-primary-600 to-primary-500 text-white hover:from-primary-800 hover:via-primary-700 hover:to-primary-600 focus:ring-primary-300 shadow-lg hover:shadow-xl active:scale-[0.98]",
    secondary:
      "bg-white text-neutral-900 hover:bg-neutral-50 border-2 border-primary-500 focus:ring-primary-200",
    danger:
      "bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 focus:ring-red-200 shadow-lg hover:shadow-xl active:scale-[0.98]",
    ghost:
      "bg-transparent text-primary-700 hover:bg-primary-50 focus:ring-primary-200 shadow-none",
  };

  const sizes = {
    sm: "px-4 py-2.5 text-sm",
    md: "px-6 py-3.5 text-base",
    lg: "px-8 py-4 text-lg",
  };

  const widthClass = fullWidth ? "w-full" : "";

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <svg
            className="animate-spin -ml-1 mr-2.5 h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          {children}
        </>
      ) : (
        <>
          {icon && <span className="mr-2.5" aria-hidden="true">{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
};

export default Button;
