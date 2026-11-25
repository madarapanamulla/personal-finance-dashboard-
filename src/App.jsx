
import { useLocation, Routes, Route } from "react-router-dom";

import Sidebar from "./components/Sidebar";
import Header from "./components/Header";

import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Analytics from "./pages/Analytics";
import Budgets from "./pages/Budgets";
import Settings from "./pages/Settings";

import "./App.css";

function AppLayout() {
  const location = useLocation();

  const pageTitles = {
    "/": "Dashboard",
    "/transactions": "Transactions",
    "/analytics": "Analytics",
    "/budgets": "Budgets",
    "/settings": "Settings"
  };

  const title = pageTitles[location.pathname] || "Dashboard";

  return (
    <div className="app-container">
      <Sidebar />

      <main className="main-content">
        <Header title={title} />

        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/budgets" element={<Budgets />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
    </div>
  );
}

export default AppLayout;
