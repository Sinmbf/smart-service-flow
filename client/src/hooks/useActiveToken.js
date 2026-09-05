import { useEffect, useState } from "react";
import { fetchMyActiveTokens } from "../services/tokens";

/**
 * useActiveToken — returns the current user's first active (non-terminal)
 * token, or null if they don't have one.
 *
 * The hook fetches from /api/tokens?mine=true on mount. It also re-fetches
 * when `refreshKey` changes — callers can pass a counter to force a refresh
 * (e.g. after navigating back from a generated token).
 *
 * Returns: { activeToken, isLoading, error, refresh }
 */
export function useActiveToken(refreshKey = 0) {
  const [activeToken, setActiveToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setError("");
      try {
        const data = await fetchMyActiveTokens();
        if (cancelled) return;
        const tokens = data?.tokens || [];
        setActiveToken(tokens.length > 0 ? tokens[0] : null);
      } catch (err) {
        if (cancelled) return;
        setError(err.response?.data?.message || "Could not check active tokens");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  return { activeToken, isLoading, error, setActiveToken };
}
