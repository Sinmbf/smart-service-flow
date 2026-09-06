import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Login, Register, VerifyPhone, ForgotPassword, ResetPassword, CitizenOTP, StaffRegister } from "../pages/auth";
import Home from "../pages/Home";
import Dashboard from "../pages/Dashboard";
import StaffDashboard from "../pages/StaffDashboard";
import ServiceList from "../pages/services/ServiceList";
import ServiceDetail from "../pages/services/ServiceDetail";
import { QRScanner, ServiceSelection, TokenGeneration, TokenDisplay, Monitor } from "../pages/token";
import CheckIn from "../pages/staff/CheckIn";
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
 * (currently only /login), push them to the right dashboard for their role.
 * Otherwise render the public page.
 *
 * Note: this only wraps /login. /citizen-login and /staff-register are NOT
 * wrapped, because the token flow + registration flow expect the user to
 * remain on those pages even after `login()` flips isAuthenticated true.
 */
function SmartRedirect({ children }) {
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

        {/* Authentication routes — /login redirects authed users to dashboard; */}
        {/* /citizen-login and /staff-register stay accessible so users can start */}
        {/* the flow or log in with a different account */}
        <Route path="/login" element={<SmartRedirect><Login /></SmartRedirect>} />
        <Route path="/citizen-login" element={<CitizenOTP />} />
        <Route path="/staff-register" element={<StaffRegister />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-phone" element={<VerifyPhone />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Protected dashboards */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute roles={["CITIZEN"]}>
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
        <Route
          path="/staff/check-in"
          element={
            <ProtectedRoute roles={["STAFF", "ADMIN"]}>
              <CheckIn />
            </ProtectedRoute>
          }
        />

        {/* Service information (public) */}
        <Route path="/services" element={<ServiceList />} />
        <Route path="/services/:id" element={<ServiceDetail />} />

        {/* Token Flow routes (public, no auth needed) */}
        <Route path="/token/scanner" element={<QRScanner />} />
        <Route path="/token/services" element={<ServiceSelection />} />
        <Route path="/token/generate" element={<TokenGeneration />} />
        <Route path="/token/display/:id" element={<TokenDisplay />} />
        <Route path="/token/display" element={<Navigate to="/dashboard" replace />} />
        <Route path="/token/monitor" element={<Monitor />} />

        {/* Catch-all - redirect to landing page */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
