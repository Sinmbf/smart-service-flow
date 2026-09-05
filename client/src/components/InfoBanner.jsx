import { useState } from "react";
import { X } from "lucide-react";

/**
 * InfoBanner — dismissible reminder when the user lands on the token
 * display page after a fresh login and there's an existing active
 * token from a prior session.
 */
const InfoBanner = ({ message, onDismiss }) => {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;
  return (
    <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800 shadow-sm">
      <button
        onClick={() => { setVisible(false); onDismiss?.(); }}
        className="text-amber-600 hover:text-amber-800 mt-0.5"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
      <p className="leading-relaxed">{message}</p>
    </div>
  );
};

export default InfoBanner;
