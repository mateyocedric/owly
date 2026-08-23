import React from "react";
import { Routes, Route } from "react-router-dom";
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

export default function App() {
  return (
    <TooltipProvider>
      <div className="owly-app flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex flex-col">
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
        <Footer />
        <Toaster position="bottom-right" richColors />
      </div>
    </TooltipProvider>
  );
}
