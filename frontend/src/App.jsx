import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useLocation,
} from "react-router-dom";
import Home from "./pages/Home";
import Batches from "./pages/Batches";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import GradeDetails from "./pages/GradeDetails";

function FooterNav() {
  return (
    <div className="sticky bottom-0 w-full bg-white dark:bg-[#111a22] border-t border-slate-200 dark:border-slate-800 px-6 py-3 flex justify-between items-center z-40">
      <Link to="/" className="flex flex-col items-center gap-1 text-primary">
        <span className="material-symbols-outlined !text-[24px]">
          dashboard
        </span>
        <span className="text-[10px] font-medium">Home</span>
      </Link>
      <Link
        to="/batches"
        className="flex flex-col items-center gap-1 text-slate-400 hover:text-slate-600"
      >
        <span className="material-symbols-outlined !text-[24px]">
          folder_open
        </span>
        <span className="text-[10px] font-medium">Batches</span>
      </Link>
      <Link
        to="/reports"
        className="flex flex-col items-center gap-1 text-slate-400 hover:text-slate-600"
      >
        <span className="material-symbols-outlined !text-[24px]">
          bar_chart
        </span>
        <span className="text-[10px] font-medium">Reports</span>
      </Link>
      <Link
        to="/settings"
        className="flex flex-col items-center gap-1 text-slate-400 hover:text-slate-600"
      >
        <span className="material-symbols-outlined !text-[24px]">settings</span>
        <span className="text-[10px] font-medium">Settings</span>
      </Link>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}

function AppLayout() {
  const location = useLocation();
  const isResultsPage = location.pathname === "/results";

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-white transition-colors duration-200">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/batches" element={<Batches />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/results" element={<GradeDetails />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      {!isResultsPage && <FooterNav />}
    </div>
  );
}
