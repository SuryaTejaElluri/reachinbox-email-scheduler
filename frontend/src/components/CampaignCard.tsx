import React from "react";
import type { Campaign } from "../types";
import { CampaignStatusBadge } from "./CampaignStatusBadge";

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

  return (
    <div className="bg-white border border-gray-200 hover:border-indigo-300 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-4">
      <div className="space-y-2">
        <div className="flex justify-between items-start gap-2">
          <h3
            onClick={() => onView(campaign.id)}
            className="font-bold text-gray-900 text-base hover:text-indigo-600 cursor-pointer line-clamp-1 transition-colors"
          >
            {campaign.subject}
          </h3>
          <CampaignStatusBadge status={campaign.status} />
        </div>

        <p className="text-xs text-gray-500 line-clamp-2 italic">
          "{campaign.body}"
        </p>
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-4 gap-2 p-2.5 bg-gray-50/80 rounded-xl text-center text-xs">
        <div>
          <span className="block text-gray-400 text-[10px] uppercase">Recipients</span>
          <span className="font-semibold text-gray-800">{recipientCount}</span>
        </div>
        <div>
          <span className="block text-emerald-500 text-[10px] uppercase">Sent</span>
          <span className="font-semibold text-emerald-600">{sentCount}</span>
        </div>
        <div>
          <span className="block text-blue-500 text-[10px] uppercase">Pending</span>
          <span className="font-semibold text-blue-600">{pendingCount}</span>
        </div>
        <div>
          <span className="block text-rose-500 text-[10px] uppercase">Failed</span>
          <span className="font-semibold text-rose-600">{failedCount}</span>
        </div>
      </div>

      {/* Metadata */}
      <div className="text-[11px] text-gray-500 space-y-1 pt-1 border-t border-gray-100">
        <div className="flex justify-between">
          <span>Start Time:</span>
          <span className="font-medium text-gray-700">
            {new Date(campaign.startTime).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Delay / Hourly Cap:</span>
          <span className="font-medium text-gray-700">
            {campaign.delaySeconds}s delay • {campaign.hourlyLimit}/hr
          </span>
        </div>
      </div>

      {/* Card Actions */}
      <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
        <button
          onClick={() => onView(campaign.id)}
          className="flex-1 py-1.5 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold transition-colors"
        >
          View Details
        </button>
        <button
          onClick={() => onEdit(campaign.id)}
          className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-gray-100 rounded-lg transition-colors"
          title="Edit Campaign"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <button
          onClick={() => onDelete(campaign)}
          className="p-1.5 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
          title="Delete Campaign"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
};
