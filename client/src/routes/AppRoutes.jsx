import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Login, Register, VerifyPhone, ForgotPassword, ResetPassword, CitizenOTP, StaffRegister } from "../pages/auth";
import Home from "../pages/Home";
import { QRScanner, ServiceSelection, TokenGeneration, TokenDisplay, Monitor } from "../pages/token";

// Scrolls the window to the top whenever the route changes,
// so navigating between pages always starts from the top.
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  return null;
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* Landing page - public entry point for all users */}
        <Route path="/" element={<Home />} />

        {/* Authentication routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/citizen-login" element={<CitizenOTP />} />
        <Route path="/staff-register" element={<StaffRegister />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-phone" element={<VerifyPhone />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

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
