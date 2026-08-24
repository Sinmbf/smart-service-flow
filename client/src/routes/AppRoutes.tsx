import { BrowserRouter, Routes, Route } from "react-router-dom";
import { checkHealth } from "../services/health";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePlaceholder />} />
      </Routes>
    </BrowserRouter>
  );
}

function HomePlaceholder() {
  return (
    <>
      <button onClick={() => checkHealth()}>Check Health</button>
    </>
  );
}

export default AppRoutes;
