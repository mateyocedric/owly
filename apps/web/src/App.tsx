import React, { useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { TooltipProvider, Toaster } from "@owly/ui";
import { Header } from "./components/layout/Header.js";
import { Footer } from "./components/layout/Footer.js";
import { LandingPage } from "./pages/Landing.js";
import { AgeGatePage } from "./pages/AgeGate.js";
import { InterestSelectPage } from "./pages/InterestSelect.js";
import {
  SessionPage,
  SessionChatPage,
  SessionVideoPage,
} from "./pages/session/index.js";
import { AdminLayout } from "./pages/admin/index.js";
import { AdminMetricsPage } from "./pages/admin/metrics/index.js";
import { AdminReportsPage } from "./pages/admin/reports/index.js";
import { AdminUsersPage } from "./pages/admin/users/index.js";
import { AdminWordsPage } from "./pages/admin/words/index.js";
import { SettingsPage } from "./pages/Settings.js";
import { PrivacyPage } from "./pages/Privacy.js";
import { TermsPage } from "./pages/Terms.js";
import { GuidelinesPage } from "./pages/Guidelines.js";
import { ComponentsPage } from "./pages/Components.js";

function AppRoutes() {
  const location = useLocation();
  const isSession = location.pathname.startsWith("/session");

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("owly-chat-lock", isSession);
    return () => root.classList.remove("owly-chat-lock");
  }, [isSession]);

  return (
    <div
      className={`owly-app flex flex-col ${isSession ? "h-dvh overflow-hidden" : "min-h-screen"}`}
    >
      <Header />
      <main className="flex min-h-0 flex-1 flex-col">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/age-gate" element={<AgeGatePage />} />
          <Route path="/interests" element={<InterestSelectPage />} />
          <Route path="/session" element={<SessionPage />} />
          <Route path="/session/chat" element={<SessionChatPage />} />
          <Route path="/session/video" element={<SessionVideoPage />} />
          <Route path="/chat" element={<Navigate to="/session" replace />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="metrics" replace />} />
            <Route path="metrics" element={<AdminMetricsPage />} />
            <Route path="reports" element={<AdminReportsPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="words" element={<AdminWordsPage />} />
          </Route>
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/guidelines" element={<GuidelinesPage />} />
          <Route path="/components" element={<ComponentsPage />} />
        </Routes>
      </main>
      {!isSession && <Footer />}
      <Toaster position="bottom-right" richColors />
    </div>
  );
}

export default function App() {
  return (
    <TooltipProvider>
      <AppRoutes />
    </TooltipProvider>
  );
}
