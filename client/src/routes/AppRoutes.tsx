import { BrowserRouter, Routes, Route } from "react-router-dom";
import { checkHealth } from "../services/health";
import Test from "../components/Test";

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
      <Test />
    </>
  );
}

export default AppRoutes;
