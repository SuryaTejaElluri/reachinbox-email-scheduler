import React from "react";
import type { CampaignStatus } from "../types";

interface Props {
  status: CampaignStatus;
}

export const CampaignStatusBadge: React.FC<Props> = ({ status }) => {
  let styles = "bg-slate-100 dark:bg-slate-850 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700";
  let dot = "bg-slate-400";
  let label: string = status;

  switch (status) {
    case "SCHEDULED":
      styles = "bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800";
      dot = "bg-indigo-500 animate-pulse";
      label = "Scheduled";
      break;
    case "COMPLETED":
      styles = "bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800";
      dot = "bg-emerald-500";
      label = "Completed";
      break;
    case "FAILED":
      styles = "bg-rose-50 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800";
      dot = "bg-rose-500";
      label = "Failed";
      break;
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-bold rounded-full border shadow-2xs ${styles}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
};
