import React from "react";
import type { CampaignStatus } from "../types";

interface Props {
  status: CampaignStatus;
}

export const CampaignStatusBadge: React.FC<Props> = ({ status }) => {
  let styles = "bg-gray-100 text-gray-700 border-gray-300";
  let dot = "bg-gray-400";
  let label: string = status;

  switch (status) {
    case "SCHEDULED":
      styles = "bg-blue-50 text-blue-700 border-blue-200";
      dot = "bg-blue-500 animate-pulse";
      label = "Scheduled";
      break;
    case "COMPLETED":
      styles = "bg-emerald-50 text-emerald-700 border-emerald-200";
      dot = "bg-emerald-500";
      label = "Completed";
      break;
    case "FAILED":
      styles = "bg-rose-50 text-rose-700 border-rose-200";
      dot = "bg-rose-500";
      label = "Failed";
      break;
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border shadow-xs ${styles}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
};
