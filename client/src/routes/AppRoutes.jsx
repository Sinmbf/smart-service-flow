import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Login, Register, VerifyPhone, ForgotPassword, ResetPassword, CitizenOTP, StaffRegister } from "../pages/auth";
import Home from "../pages/Home";
import Dashboard from "../pages/Dashboard";
import StaffDashboard from "../pages/StaffDashboard";
import { QRScanner, ServiceSelection, TokenGeneration, TokenDisplay, Monitor } from "../pages/token";
import ProtectedRoute from "../components/ProtectedRoute";
import { useAuth } from "../auth/AuthContext";

// Scrolls the window to the top whenever the route changes,
// so navigating between pages always starts from the top.
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  return null;
}

/**
 * SmartRedirect — when an authed user lands on a public auth page
 * (e.g. /login or /staff-register), push them to the right dashboard
 * for their role. Otherwise render the public page.
 */
function SmartRedirect({ children, kind }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) return null;

  if (isAuthenticated) {
    const role = (user?.role || "").toUpperCase();
    if (role === "STAFF" || role === "ADMIN") {
      return <Navigate to="/staff/dashboard" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  // Citizens and staff have separate auth entry points; keep a logged-in
  // staff member from accidentally landing on the citizen OTP page.
  if (kind === "citizen" && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  // Stash the intended destination so the login page can return after
  // a successful sign-in (currently the login form ignores this, but
  // it is set up for future use).
  return <div data-from={location.state?.from?.pathname}>{children}</div>;
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* Landing page - public entry point for all users */}
        <Route path="/" element={<Home />} />

        {/* Authentication routes — authed users get redirected to their dashboard */}
        <Route path="/login" element={<SmartRedirect kind="staff"><Login /></SmartRedirect>} />
        <Route path="/citizen-login" element={<SmartRedirect kind="citizen"><CitizenOTP /></SmartRedirect>} />
        <Route path="/staff-register" element={<SmartRedirect><StaffRegister /></SmartRedirect>} />
        <Route path="/register" element={<SmartRedirect><Register /></SmartRedirect>} />
        <Route path="/verify-phone" element={<VerifyPhone />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Protected dashboards */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute roles={["CITIZEN", "STAFF", "ADMIN"]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff/dashboard"
          element={
            <ProtectedRoute roles={["STAFF", "ADMIN"]}>
              <StaffDashboard />
            </ProtectedRoute>
          }
        />

        {/* Token Flow routes (public, no auth needed) */}
        <Route path="/token/scanner" element={<QRScanner />} />
        <Route path="/token/services" element={<ServiceSelection />} />
        <Route path="/token/generate" element={<TokenGeneration />} />
        <Route path="/token/display" element={<TokenDisplay />} />
        <Route path="/token/monitor" element={<Monitor />} />

        {/* Catch-all - redirect to landing page */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
