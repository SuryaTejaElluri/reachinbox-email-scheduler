import React from "react";
import type { ScheduledEmail } from "../types";
import { CheckCircle2, Clock, Send, AlertTriangle, Layers } from "lucide-react";

interface Props {
  emails: ScheduledEmail[];
}

export const CampaignStats: React.FC<Props> = ({ emails }) => {
  const total = emails.length;
  const sent = emails.filter((e) => e.status === "SENT").length;
  const pending = emails.filter((e) => e.status === "PENDING" || e.status === "SCHEDULED").length;
  const sending = emails.filter((e) => e.status === "SENDING").length;
  const failed = emails.filter((e) => e.status === "FAILED").length;

  const progressPercentage = total > 0 ? Math.round((sent / total) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Total</span>
            <Layers className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-slate-900 dark:text-white">{total}</p>
        </div>

        <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 rounded-2xl shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <span>Sent</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">{sent}</p>
        </div>

        <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/80 rounded-2xl shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider">
            <span>Queued</span>
            <Clock className="w-3.5 h-3.5 text-indigo-500" />
          </div>
          <p className="text-2xl font-bold font-mono text-indigo-600 dark:text-indigo-400">{pending}</p>
        </div>

        <div className="p-4 bg-amber-50/50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 rounded-2xl shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider">
            <span>Sending</span>
            <Send className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
          </div>
          <p className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400">{sending}</p>
        </div>

        <div className="p-4 bg-rose-50/50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/80 rounded-2xl shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-rose-600 dark:text-rose-400 text-xs font-bold uppercase tracking-wider">
            <span>Failed</span>
            <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
          </div>
          <p className="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400">{failed}</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xs space-y-2">
        <div className="flex justify-between items-center text-xs font-semibold text-slate-700 dark:text-slate-300">
          <span>
            Dispatch Execution ({sent} / {total} emails completed)
          </span>
          <span className="text-indigo-600 dark:text-indigo-400 font-mono font-bold">{progressPercentage}%</span>
        </div>
        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-indigo-500 to-emerald-500 h-2.5 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>
    </div>
  );
};
