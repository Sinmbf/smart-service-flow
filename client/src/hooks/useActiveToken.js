import { useEffect, useState } from "react";
import { fetchMyActiveTokens } from "../services/tokens";
import { useAuth } from "../auth/AuthContext";

/**
 * useActiveToken — returns the current user's first active (non-terminal)
 * token, or null if they don't have one (or if they're not signed in).
 *
 * The hook re-fetches whenever the auth state changes (login/logout) or
 * `refreshKey` changes — callers can pass a counter to force a refresh
 * (e.g. after navigating back from a generated token).
 *
 * Returns: { activeToken, isLoading, error, refresh }
 */
export function useActiveToken(refreshKey = 0) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [activeToken, setActiveToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    if (authLoading) return;
    if (!isAuthenticated) {
      setActiveToken(null);
      setError("");
      setIsLoading(false);
      return;
    }
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
  }, [isAuthenticated, authLoading, refreshKey]);

  return { activeToken, isLoading, error, setActiveToken };
}
