import React from "react";
import type { EmailStatus } from "../types";

interface Props {
  status: EmailStatus;
}

export const EmailStatusBadge: React.FC<Props> = ({ status }) => {
  let styles = "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700";
  let dot = "bg-slate-400";

  switch (status) {
    case "PENDING":
      styles = "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700";
      dot = "bg-slate-400";
      break;
    case "SCHEDULED":
      styles = "bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800";
      dot = "bg-indigo-500 animate-pulse";
      break;
    case "SENDING":
      styles = "bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800";
      dot = "bg-amber-500 animate-pulse";
      break;
    case "SENT":
      styles = "bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800";
      dot = "bg-emerald-500";
      break;
    case "FAILED":
      styles = "bg-rose-50 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800";
      dot = "bg-rose-500";
      break;
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-bold rounded-full border shadow-2xs ${styles}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {status}
    </span>
  );
};
