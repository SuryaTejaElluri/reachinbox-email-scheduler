import React from "react";
import type { ScheduledEmail } from "../types";

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
        <div className="p-4 bg-white border border-gray-200 rounded-xl shadow-xs">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total</span>
          <p className="mt-1 text-2xl font-bold text-gray-900">{total}</p>
        </div>

        <div className="p-4 bg-emerald-50/50 border border-emerald-200/80 rounded-xl shadow-xs">
          <span className="text-xs font-medium text-emerald-700 uppercase tracking-wide">Sent</span>
          <p className="mt-1 text-2xl font-bold text-emerald-600">{sent}</p>
        </div>

        <div className="p-4 bg-blue-50/50 border border-blue-200/80 rounded-xl shadow-xs">
          <span className="text-xs font-medium text-blue-700 uppercase tracking-wide">Pending</span>
          <p className="mt-1 text-2xl font-bold text-blue-600">{pending}</p>
        </div>

        <div className="p-4 bg-amber-50/50 border border-amber-200/80 rounded-xl shadow-xs">
          <span className="text-xs font-medium text-amber-700 uppercase tracking-wide">Sending</span>
          <p className="mt-1 text-2xl font-bold text-amber-600">{sending}</p>
        </div>

        <div className="p-4 bg-rose-50/50 border border-rose-200/80 rounded-xl shadow-xs">
          <span className="text-xs font-medium text-rose-700 uppercase tracking-wide">Failed</span>
          <p className="mt-1 text-2xl font-bold text-rose-600">{failed}</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="p-4 bg-white border border-gray-200 rounded-xl shadow-xs space-y-2">
        <div className="flex justify-between items-center text-xs font-medium">
          <span className="text-gray-700">
            Campaign Progress ({sent} / {total} emails sent)
          </span>
          <span className="text-indigo-600 font-semibold">{progressPercentage}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>
    </div>
  );
};
