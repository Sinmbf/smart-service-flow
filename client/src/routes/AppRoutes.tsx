import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import {
  Login,
  Register,
  VerifyPhone,
  ForgotPassword,
  ResetPassword,
  CitizenOTP,
  StaffRegister,
} from "../pages/auth";
import {
  QRScanner,
  ServiceSelection,
  TokenGeneration,
  TokenDisplay,
  Monitor,
} from "../pages/token";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect root to QR scanner (public entry) */}
        <Route path="/" element={<Navigate to="/token/scanner" replace />} />

        {/* Authentication routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/citizen-login" element={<CitizenOTP />} />
        <Route path="/staff-register" element={<StaffRegister />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-phone" element={<VerifyPhone />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Token Flow routes (protected) */}
        <Route path="/token/scanner" element={<QRScanner />} />
        <Route path="/token/services" element={<ServiceSelection />} />
        <Route path="/token/generate" element={<TokenGeneration />} />
        <Route path="/token/display" element={<TokenDisplay />} />
        <Route path="/token/monitor" element={<Monitor />} />

        {/* Catch-all - redirect to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
