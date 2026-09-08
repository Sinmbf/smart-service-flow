import { useEffect, useState } from "react";
import { fetchMyActiveTokens } from "../services/tokens";
import { useAuth } from "../auth/AuthContext";

/**
 * Returns the current user's active token.
 *
 * - Fetches only after authentication has finished.
 * - Returns the first active token when one exists.
 * - Returns null when the user has no active token.
 * - Supports refreshKey for manually triggering a new check.
 */
export function useActiveToken(refreshKey = 0) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [activeToken, setActiveToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    // Authentication state is still being resolved.
    if (authLoading) {
      return;
    }

    // User is not logged in.
    if (!isAuthenticated) {
      setActiveToken(null);
      setError("");
      setIsLoading(false);
      return;
    }

    const loadActiveToken = async () => {
      setIsLoading(true);
      setError("");

      try {
        const data = await fetchMyActiveTokens();

        if (cancelled) {
          return;
        }

        const tokens = Array.isArray(data?.tokens) ? data.tokens : [];

        setActiveToken(tokens.length > 0 ? tokens[0] : null);
      } catch (err) {
        if (cancelled) {
          return;
        }

        setActiveToken(null);

        setError(
          err.response?.data?.message || "Could not check active tokens",
        );
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadActiveToken();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, authLoading, refreshKey]);

  return {
    activeToken,
    isLoading,
    error,
    setActiveToken,
  };
}
