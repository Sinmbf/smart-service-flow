import { createContext, useCallback, useContext, useEffect, useState } from "react";
import axios from "../services/api";

const AuthContext = createContext(null);

// localStorage key for the JWT. Kept as-is for backward compatibility with
// the previous direct `localStorage.setItem("token", ...)` calls — the
// storage key is part of the contract that other parts of the app may rely on.
export const TOKEN_KEY = "token";

/**
 * AuthProvider
 *
 * Hydrates the current user on mount by calling `GET /api/auth/me` with the
 * stored JWT. If that request fails (no token, expired, or `pwd` claim is
 * stale because of a password change), the token is cleared and the user is
 * treated as logged out.
 *
 * The user object is NEVER persisted to localStorage — it is always derived
 * from the live server response, so we never end up with a user object that
 * disagrees with the server (e.g. role changed since last login).
 *
 * `login(token, user)` is the single call site for "I just authenticated" —
 * it stores the token, updates state, and lets the rest of the app react.
 * `logout()` clears state and storage.
 */
export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(Boolean(token));

  // Hydrate from the server whenever the token changes (initial load, login, logout).
  useEffect(() => {
    let cancelled = false;

    const hydrate = async () => {
      if (!token) {
        if (!cancelled) {
          setUser(null);
          setIsLoading(false);
        }
        return;
      }

      try {
        const response = await axios.get("/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (cancelled) return;
        setUser(response.data.user);
      } catch {
        if (cancelled) return;
        // Token is missing/expired/revoked — drop it and treat as logged out.
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setUser(null);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    hydrate();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const login = useCallback((newToken, newUser) => {
    if (!newToken) {
      throw new Error("login() requires a token");
    }
    localStorage.setItem(TOKEN_KEY, newToken);
    setToken(newToken);
    setUser(newUser ?? null);
    setIsLoading(false);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const value = {
    user,
    token,
    isAuthenticated: Boolean(user),
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * useAuth — hook for consuming the auth context.
 * Throws if used outside of an <AuthProvider>.
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth() must be used within an <AuthProvider>");
  }
  return ctx;
}
