import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Sparkles,
  Zap,
  ShieldCheck,
  Clock,
  ArrowRight,
  UserCheck,
  CheckCircle2,
} from "lucide-react";

export const LoginPage: React.FC = () => {
  const { googleLogin, demoLogin, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || "/campaigns";

  const [isDemoLoading, setIsDemoLoading] = useState(false);
  const [customEmail, setCustomEmail] = useState("");
  const [customName, setCustomName] = useState("");
  const [showCustomDemo, setShowCustomDemo] = useState(false);

  // If already logged in, redirect
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleInstantDemo = async (email?: string, name?: string) => {
    try {
      setIsDemoLoading(true);
      await demoLogin(email || "demo@reachinbox.com", name || "Demo Marketer");
      navigate(from, { replace: true });
    } catch (err) {
      console.error("Demo login failed:", err);
      alert("Failed to authenticate demo user. Make sure backend is running.");
    } finally {
      setIsDemoLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-6 px-4">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Side: Value Props & Feature Highlight */}
        <div className="lg:col-span-6 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/80 text-indigo-600 dark:text-indigo-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" /> Next-Gen Email Outreach Platform
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
              Scale Your Email Scheduling with <span className="gradient-text">Precision & Reliability</span>
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Distribute high-volume personalized emails with BullMQ queue architecture, Redis-backed rate limiting, and zero-cron crash recovery.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            {[
              {
                icon: Zap,
                title: "BullMQ Distributed Engine",
                desc: "Delayed concurrency with persistent state",
              },
              {
                icon: ShieldCheck,
                title: "Hourly Token Bucket Limiter",
                desc: "Avoid ESP account suspensions and spam traps",
              },
              {
                icon: Clock,
                title: "Fault-Tolerant Restart Recovery",
                desc: "Server restarts safely re-enqueue pending jobs",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3 rounded-2xl bg-white/60 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60 backdrop-blur-sm"
              >
                <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                  <item.icon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-200">{item.title}</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Authentication Box */}
        <div className="lg:col-span-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-indigo-500/5 dark:shadow-black/50 space-y-6">
            <div className="space-y-1.5 text-center sm:text-left">
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                Sign in to your account
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Choose your preferred authentication method to continue
              </p>
            </div>

            {/* Google Authentication Button */}
            <button
              onClick={googleLogin}
              type="button"
              className="w-full flex items-center justify-center gap-3 py-3.5 px-4 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-100 font-semibold text-xs rounded-2xl border border-slate-300 dark:border-slate-700 shadow-xs hover:shadow-md transition-all group"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
              <ArrowRight className="w-3.5 h-3.5 ml-auto text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Divider */}
            <div className="relative flex items-center justify-center">
              <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
              <span className="bg-white dark:bg-slate-900 px-3 text-[11px] font-medium text-slate-400 uppercase tracking-wider shrink-0">
                or instant access
              </span>
              <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
            </div>

            {/* Instant Demo Login Button */}
            <div className="space-y-3">
              <button
                onClick={() => handleInstantDemo()}
                disabled={isDemoLoading}
                type="button"
                className="w-full flex items-center justify-center gap-2.5 py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs rounded-2xl shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-50 group"
              >
                <UserCheck className="w-4 h-4" />
                <span>{isDemoLoading ? "Authenticating Demo..." : "Instant Demo Login (1-Click)"}</span>
              </button>

              <button
                onClick={() => setShowCustomDemo(!showCustomDemo)}
                type="button"
                className="w-full text-center text-[11px] font-semibold text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                {showCustomDemo ? "Hide Custom Demo" : "Login with Custom Demo Email"}
              </button>

              {showCustomDemo && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (customEmail) handleInstantDemo(customEmail, customName || undefined);
                  }}
                  className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 animate-in fade-in slide-in-from-top-2"
                >
                  <input
                    type="email"
                    required
                    placeholder="Enter your email (e.g. alex@reachinbox.com)"
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                  <input
                    type="text"
                    placeholder="Your Name (Optional)"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                  <button
                    type="submit"
                    disabled={isDemoLoading}
                    className="w-full py-2 bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 dark:hover:bg-slate-600 text-white rounded-xl text-xs font-semibold transition-colors"
                  >
                    Enter Workspace
                  </button>
                </form>
              )}
            </div>

            {/* Security note */}
            <div className="pt-2 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>JWT Session • TLS Secured • Isolated Workspace</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
