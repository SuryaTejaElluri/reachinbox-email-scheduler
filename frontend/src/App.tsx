import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { Navbar } from "./components/Navbar";
import { ProtectedRoute } from "./components/ProtectedRoute";

import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { AuthCallbackPage } from "./pages/AuthCallbackPage";
import { CampaignListPage } from "./pages/CampaignListPage";
import { CreateCampaignPage } from "./pages/CreateCampaignPage";
import { CampaignDetailsPage } from "./pages/CampaignDetailsPage";
import { EditCampaignPage } from "./pages/EditCampaignPage";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col antialiased transition-colors duration-200">
            {/* Sticky Modern Navbar */}
            <Navbar />

            {/* Main Application Routes */}
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/auth/callback" element={<AuthCallbackPage />} />

                {/* Protected Workspace Routes */}
                <Route
                  path="/campaigns"
                  element={
                    <ProtectedRoute>
                      <CampaignListPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/campaigns/new"
                  element={
                    <ProtectedRoute>
                      <CreateCampaignPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/campaigns/:id"
                  element={
                    <ProtectedRoute>
                      <CampaignDetailsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/campaigns/:id/edit"
                  element={
                    <ProtectedRoute>
                      <EditCampaignPage />
                    </ProtectedRoute>
                  }
                />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>

            {/* Footer */}
            <footer className="border-t border-slate-200/80 dark:border-slate-800/80 bg-white/50 dark:bg-slate-950/50 backdrop-blur-md py-8 transition-colors">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-md flex items-center justify-center text-white font-black text-[10px]">
                    R
                  </div>
                  <span className="font-bold text-slate-800 dark:text-slate-200">ReachInbox Email Scheduler</span>
                  <span>•</span>
                  <span>BullMQ & Redis Architecture</span>
                </div>

                <div className="flex items-center gap-4 font-medium">
                  <Link to="/" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                    Home
                  </Link>
                  <Link to="/campaigns" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                    Campaigns
                  </Link>
                  <Link to="/login" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                    Sign In
                  </Link>
                </div>
              </div>
            </footer>
          </div>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;