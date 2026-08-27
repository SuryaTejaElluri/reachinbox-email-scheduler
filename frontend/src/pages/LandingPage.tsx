import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Sparkles,
  Zap,
  ShieldCheck,
  Clock,
  ArrowRight,
  Database,
  FileSpreadsheet,
  BarChart3,
  Activity,
  Sliders,
} from "lucide-react";

export const LandingPage: React.FC = () => {
  const { isAuthenticated, googleLogin, demoLogin } = useAuth();
  const navigate = useNavigate();

  // Interactive schedule simulator state
  const [simRecipients, setSimRecipients] = useState<number>(6);
  const [simDelay, setSimDelay] = useState<number>(3);
  const [simHourlyCap, setSimHourlyCap] = useState<number>(100);

  const handleDemoClick = async () => {
    if (isAuthenticated) {
      navigate("/campaigns");
    } else {
      await demoLogin("marketer@reachinbox.com", "Growth Marketer");
      navigate("/campaigns");
    }
  };

  // Compute simulation timeline
  const now = new Date();
  const simulatedEmails = Array.from({ length: simRecipients }).map((_, idx) => {
    const dispatchTime = new Date(now.getTime() + idx * simDelay * 1000);
    return {
      index: idx + 1,
      email: `lead_${idx + 1}@acme-corp.io`,
      time: dispatchTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      delayOffset: `+${idx * simDelay}s`,
    };
  });

  return (
    <div className="space-y-24 py-6 overflow-hidden">
      {/* 1. HERO SECTION */}
      <section className="relative pt-6 pb-12 sm:pt-12 sm:pb-20 text-center">
        {/* Background Ambient Glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-gradient-to-tr from-indigo-500/20 via-purple-500/20 to-pink-500/20 rounded-full blur-3xl -z-10 pointer-events-none animate-pulse-glow" />

        <div className="max-w-4xl mx-auto space-y-8 px-4">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 dark:bg-slate-900/80 border border-indigo-200/80 dark:border-indigo-800/60 shadow-sm backdrop-blur-md text-xs font-bold text-indigo-600 dark:text-indigo-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>High-Throughput Distributed Email Scheduler</span>
            <span className="hidden sm:inline-block w-1 h-1 rounded-full bg-indigo-400" />
            <span className="hidden sm:inline-block text-slate-500 dark:text-slate-400 font-normal">
              Zero-Cron Architecture
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.08]">
            Schedule Cold Outreach with <br className="hidden sm:inline" />
            <span className="gradient-text">Absolute Delivery Precision</span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
            A state-of-the-art email scheduling platform built on BullMQ delayed queues, Redis sliding-window rate limiters, and atomic state transitions for bulletproof sender reputation.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={googleLogin}
              type="button"
              className="px-6 py-3.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-900 dark:text-white font-bold text-xs rounded-2xl border border-slate-300 dark:border-slate-700 shadow-md hover:shadow-lg transition-all flex items-center gap-3 group"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Sign in with Google</span>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={handleDemoClick}
              type="button"
              className="px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs rounded-2xl shadow-xl shadow-indigo-500/25 transition-all flex items-center gap-2.5"
            >
              <Zap className="w-4 h-4 fill-white" />
              <span>Launch Interactive Workspace</span>
            </button>

            <Link
              to="/campaigns"
              className="px-5 py-3.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-2xl transition-all"
            >
              View Campaigns
            </Link>
          </div>

          {/* Quick Metrics Strip */}
          <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto border-t border-slate-200/60 dark:border-slate-800/60">
            <div>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white">0%</div>
              <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Cron Job Overhead</div>
            </div>
            <div>
              <div className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">BullMQ</div>
              <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Queue Worker</div>
            </div>
            <div>
              <div className="text-2xl font-extrabold text-purple-600 dark:text-purple-400">Redis</div>
              <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Hourly Rate Limiter</div>
            </div>
            <div>
              <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">100%</div>
              <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Restart Recovery</div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. INTERACTIVE QUEUE & TIMELINE SIMULATOR */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8 relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                <Sliders className="w-3.5 h-3.5" /> Interactive Dispatch Simulator
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                See Distributed Scheduling in Action
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Adjust the sliders to simulate how BullMQ calculates staggered email delivery offsets.
              </p>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300">
              <Activity className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
              <span>Engine Status: Healthy</span>
            </div>
          </div>

          {/* Interactive Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800">
            {/* Control 1: Recipients */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                <span>Recipients Count</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-mono">{simRecipients} emails</span>
              </div>
              <input
                type="range"
                min="2"
                max="10"
                value={simRecipients}
                onChange={(e) => setSimRecipients(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <div className="text-[10px] text-slate-400">Range: 2 to 10 recipients</div>
            </div>

            {/* Control 2: Delay */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                <span>Delay Between Sends</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-mono">{simDelay} seconds</span>
              </div>
              <input
                type="range"
                min="1"
                max="15"
                value={simDelay}
                onChange={(e) => setSimDelay(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <div className="text-[10px] text-slate-400">Min safe spacing: 2s per worker</div>
            </div>

            {/* Control 3: Hourly Cap */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                <span>Hourly Throttle Limit</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-mono">{simHourlyCap}/hr</span>
              </div>
              <input
                type="range"
                min="20"
                max="300"
                step="20"
                value={simHourlyCap}
                onChange={(e) => setSimHourlyCap(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <div className="text-[10px] text-slate-400">Redis sliding-window cap</div>
            </div>
          </div>

          {/* Visual Staggered Timeline Grid */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Calculated BullMQ Delayed Job Sequence:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {simulatedEmails.map((item) => (
                <div
                  key={item.index}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-2xs group hover:border-indigo-500 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-[10px] font-black font-mono">
                      #{item.index}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 font-mono truncate max-w-[140px]">
                        {item.email}
                      </div>
                      <div className="text-[10px] text-slate-400">{item.time}</div>
                    </div>
                  </div>
                  <div className="px-2 py-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold font-mono rounded-md shrink-0">
                    {item.delayOffset}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3. SIX CORE ARCHITECTURAL PILLARS */}
      <section className="max-w-6xl mx-auto px-4 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Engineered for Resilient Outreach
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            A production-grade architecture that guarantees zero duplicate sends, handles crashes gracefully, and respects sender domain health.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: Zap,
              title: "BullMQ Distributed Workers",
              desc: "Background async concurrency powered by Redis delayed jobs with exponential backoff retries on transient errors.",
              tag: "Core Engine",
            },
            {
              icon: ShieldCheck,
              title: "Token Bucket Rate Limiting",
              desc: "Redis-backed sliding hourly windows that enforce strict quotas per sender to safeguard your domain reputation.",
              tag: "Deliverability",
            },
            {
              icon: Clock,
              title: "Zero-Cron Fault Recovery",
              desc: "No fragile node-cron loops. Server restart automatically scans and safely re-enqueues orphaned pending emails.",
              tag: "Reliability",
            },
            {
              icon: FileSpreadsheet,
              title: "CSV Bulk Recipient Parser",
              desc: "Upload contacts via CSV with instant client-side RFC-5322 validation, deduplication, and schedule offset preview.",
              tag: "Workflows",
            },
            {
              icon: Database,
              title: "PostgreSQL & Prisma ORM",
              desc: "ACID compliant relational tracking with atomic state transitions preventing race conditions during concurrent worker claims.",
              tag: "Database",
            },
            {
              icon: BarChart3,
              title: "Granular Analytics & Logs",
              desc: "Live visibility into every dispatch status (PENDING, SCHEDULED, SENDING, SENT, FAILED) with Ethereal preview links.",
              tag: "Observability",
            },
          ].map((feature, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-lg shadow-slate-200/50 dark:shadow-none hover:border-indigo-500/80 dark:hover:border-indigo-500/80 transition-all hover:-translate-y-1 space-y-4 group"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <feature.icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full">
                  {feature.tag}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {feature.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. FINAL CTA BANNER */}
      <section className="max-w-4xl mx-auto px-4">
        <div className="relative rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-950 to-purple-950 border border-indigo-500/30 p-8 sm:p-12 text-center text-white space-y-6 overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/20 via-transparent to-transparent pointer-events-none" />
          
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight relative z-10">
            Ready to Dispatch Your Next Campaign?
          </h2>
          <p className="text-xs sm:text-sm text-indigo-200 max-w-xl mx-auto font-normal relative z-10 leading-relaxed">
            Create your first schedule in seconds with automated delays, custom recipient lists, and complete deliverability safeguards.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2 relative z-10">
            <button
              onClick={googleLogin}
              type="button"
              className="px-6 py-3.5 bg-white hover:bg-slate-100 text-slate-950 font-bold text-xs rounded-2xl shadow-xl transition-all flex items-center gap-2"
            >
              <span>Get Started with Google</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={handleDemoClick}
              type="button"
              className="px-6 py-3.5 bg-indigo-600/80 hover:bg-indigo-600 border border-indigo-400/30 text-white font-bold text-xs rounded-2xl transition-all"
            >
              Instant 1-Click Demo
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
