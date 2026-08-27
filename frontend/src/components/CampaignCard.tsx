import React from "react";
import type { Campaign } from "../types";
import { CampaignStatusBadge } from "./CampaignStatusBadge";
import { Calendar, Gauge, ArrowRight, Edit3, Trash2 } from "lucide-react";

interface Props {
  campaign: Campaign;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (campaign: Campaign) => void;
}

export const CampaignCard: React.FC<Props> = ({ campaign, onView, onEdit, onDelete }) => {
  const recipientCount = campaign.emails?.length || campaign._count?.emails || 0;
  const sentCount = campaign.emails?.filter((e) => e.status === "SENT").length || 0;
  const pendingCount = campaign.emails?.filter((e) => e.status === "PENDING" || e.status === "SCHEDULED").length || 0;
  const failedCount = campaign.emails?.filter((e) => e.status === "FAILED").length || 0;

  const progressPct = recipientCount > 0 ? Math.round((sentCount / recipientCount) * 100) : 0;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm hover:shadow-xl hover:border-indigo-500/50 dark:hover:border-indigo-500/50 transition-all flex flex-col justify-between space-y-4 group">
      <div className="space-y-3">
        <div className="flex justify-between items-start gap-3">
          <h3
            onClick={() => onView(campaign.id)}
            className="font-bold text-slate-900 dark:text-white text-base hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer line-clamp-1 transition-colors"
          >
            {campaign.subject}
          </h3>
          <CampaignStatusBadge status={campaign.status} />
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 italic font-normal">
          "{campaign.body}"
        </p>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-300">
          <span>Delivery Progress</span>
          <span className="font-mono text-indigo-600 dark:text-indigo-400">{progressPct}%</span>
        </div>
        <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-4 gap-1.5 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl text-center text-xs border border-slate-100 dark:border-slate-800">
        <div>
          <span className="block text-slate-400 text-[10px] uppercase font-bold">Total</span>
          <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">{recipientCount}</span>
        </div>
        <div>
          <span className="block text-emerald-500 text-[10px] uppercase font-bold">Sent</span>
          <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">{sentCount}</span>
        </div>
        <div>
          <span className="block text-indigo-500 text-[10px] uppercase font-bold">Queued</span>
          <span className="font-bold text-indigo-600 dark:text-indigo-400 font-mono">{pendingCount}</span>
        </div>
        <div>
          <span className="block text-rose-500 text-[10px] uppercase font-bold">Failed</span>
          <span className="font-bold text-rose-600 dark:text-rose-400 font-mono">{failedCount}</span>
        </div>
      </div>

      {/* Metadata */}
      <div className="text-[11px] text-slate-500 dark:text-slate-400 space-y-1.5 pt-1 border-t border-slate-100 dark:border-slate-800 font-medium">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" /> Start:
          </span>
          <span className="text-slate-700 dark:text-slate-300 font-mono">
            {new Date(campaign.startTime).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Gauge className="w-3.5 h-3.5 text-slate-400" /> Rate Limits:
          </span>
          <span className="text-slate-700 dark:text-slate-300 font-mono">
            {campaign.delaySeconds}s delay • {campaign.hourlyLimit}/hr
          </span>
        </div>
      </div>

      {/* Card Actions */}
      <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
        <button
          onClick={() => onView(campaign.id)}
          className="flex-1 py-2 px-3 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/80 text-indigo-700 dark:text-indigo-300 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
        >
          <span>View Details</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onEdit(campaign.id)}
          className="p-2 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          title="Edit Campaign"
        >
          <Edit3 className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(campaign)}
          className="p-2 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors"
          title="Delete Campaign"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
