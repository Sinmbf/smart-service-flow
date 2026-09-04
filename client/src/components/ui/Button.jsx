
const Button = ({
  variant = "primary",
  size = "md",
  fullWidth = false,
  isLoading = false,
  icon = undefined,
  children,
  className = "",
  disabled,
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center font-heading font-semibold rounded-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer min-h-[48px] min-w-[44px]";

  const variants = {
    // Primary — solid teal (only for ONE primary action per screen)
    primary:
      "bg-primary-700 text-white hover:bg-primary-800 focus-visible:ring-primary-300 shadow-sm hover:shadow-md active:scale-[0.98]",

    // Secondary — subtle filled neutral (for "View" / "Cancel" / less-prominent actions)
    secondary:
      "bg-neutral-100 text-neutral-900 hover:bg-neutral-200 focus-visible:ring-neutral-300 shadow-none",

    // Outline — bordered, transparent (for "Back", "Change", link-like actions)
    outline:
      "bg-white text-neutral-700 border border-neutral-300 hover:border-neutral-400 hover:bg-neutral-50 focus-visible:ring-neutral-300 shadow-none",

    // Danger — red, only for destructive actions (Cancel/Delete/Remove)
    danger:
      "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-300 shadow-sm hover:shadow-md active:scale-[0.98]",

    // Success — green, for "Confirm"/"Verify"/"Approve" positive actions
    success:
      "bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:ring-emerald-300 shadow-sm hover:shadow-md active:scale-[0.98]",

    // Ghost — text only, for tertiary actions
    ghost:
      "bg-transparent text-neutral-700 hover:bg-neutral-100 focus-visible:ring-neutral-300 shadow-none",
  };

  const sizes = {
    sm: "px-4 py-2.5 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-7 py-3.5 text-lg",
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
