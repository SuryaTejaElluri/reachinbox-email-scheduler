import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { campaignService } from "../services/campaignService";

export const Navbar: React.FC = () => {
  const location = useLocation();
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("reachinbox_token")
  );
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleDemoLogin = async () => {
    try {
      setIsAuthenticating(true);
      const res = await campaignService.demoLogin("demo@reachinbox.com", "Demo User");
      localStorage.setItem("reachinbox_token", res.token);
      setToken(res.token);
      window.location.reload();
    } catch (err) {
      console.error("Demo login error:", err);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("reachinbox_token");
    setToken(null);
    window.location.reload();
  };

  return (
    <header className="bg-slate-900 text-white sticky top-0 z-40 border-b border-slate-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-md group-hover:scale-105 transition-transform">
              R
            </div>
            <div>
              <span className="font-bold text-base tracking-tight block leading-none">
                ReachInbox
              </span>
              <span className="text-[10px] text-indigo-400 font-medium tracking-wide uppercase">
                Email Scheduler
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation links */}
        <nav className="hidden sm:flex items-center gap-1">
          <Link
            to="/campaigns"
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              location.pathname === "/campaigns" || location.pathname === "/"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-300 hover:text-white hover:bg-slate-800"
            }`}
          >
            Campaigns
          </Link>
          <Link
            to="/campaigns/new"
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              location.pathname === "/campaigns/new"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-300 hover:text-white hover:bg-slate-800"
            }`}
          >
            + Create Campaign
          </Link>
        </nav>

        {/* Auth / Profile section */}
        <div className="flex items-center gap-3">
          {token ? (
            <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-700">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-slate-200 font-medium">Authenticated</span>
              <button
                onClick={handleLogout}
                className="ml-1 text-[11px] text-slate-400 hover:text-red-400 font-semibold"
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={handleDemoLogin}
              disabled={isAuthenticating}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
            >
              {isAuthenticating ? "Logging in..." : "Demo Authentication"}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
