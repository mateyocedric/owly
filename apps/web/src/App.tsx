import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { TooltipProvider, Toaster } from "@owly/ui";
import { Header } from "./components/layout/Header.js";
import { Footer } from "./components/layout/Footer.js";
import { LandingPage } from "./pages/Landing.js";
import { AgeGatePage } from "./pages/AgeGate.js";
import { InterestSelectPage } from "./pages/InterestSelect.js";
import { ChatPage } from "./pages/Chat.js";
import { AdminPage } from "./pages/Admin.js";
import { SettingsPage } from "./pages/Settings.js";
import { PrivacyPage } from "./pages/Privacy.js";
import { TermsPage } from "./pages/Terms.js";
import { GuidelinesPage } from "./pages/Guidelines.js";
import { ComponentsPage } from "./pages/Components.js";

function AppRoutes() {
  const location = useLocation();
  const isChat = location.pathname === "/chat";

  return (
    <div className={`owly-app flex flex-col ${isChat ? "h-dvh overflow-hidden" : "min-h-screen"}`}>
      <Header />
      <main className="flex min-h-0 flex-1 flex-col">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/age-gate" element={<AgeGatePage />} />
          <Route path="/interests" element={<InterestSelectPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/guidelines" element={<GuidelinesPage />} />
          <Route path="/components" element={<ComponentsPage />} />
        </Routes>
      </main>
      {!isChat && <Footer />}
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
