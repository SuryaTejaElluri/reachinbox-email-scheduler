import React from "react";
import type { EmailStatus } from "../types";

interface Props {
  status: EmailStatus;
}

export const EmailStatusBadge: React.FC<Props> = ({ status }) => {
  let styles = "bg-gray-100 text-gray-700 border-gray-300";
  let dot = "bg-gray-400";

  switch (status) {
    case "PENDING":
      styles = "bg-slate-100 text-slate-700 border-slate-300";
      dot = "bg-slate-400";
      break;
    case "SCHEDULED":
      styles = "bg-blue-50 text-blue-700 border-blue-200";
      dot = "bg-blue-500";
      break;
    case "SENDING":
      styles = "bg-amber-50 text-amber-700 border-amber-200";
      dot = "bg-amber-500 animate-spin";
      break;
    case "SENT":
      styles = "bg-emerald-50 text-emerald-700 border-emerald-200";
      dot = "bg-emerald-500";
      break;
    case "FAILED":
      styles = "bg-rose-50 text-rose-700 border-rose-200";
      dot = "bg-rose-500";
      break;
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium rounded-full border ${styles}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {status}
    </span>
  );
};
