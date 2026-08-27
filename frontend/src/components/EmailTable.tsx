import React, { useState } from "react";
import type { ScheduledEmail } from "../types";
import { EmailStatusBadge } from "./EmailStatusBadge";
import { Search, RefreshCw, CheckCircle2 } from "lucide-react";

interface Props {
  emails: ScheduledEmail[];
  onRefresh?: () => void;
}

export const EmailTable: React.FC<Props> = ({ emails, onRefresh }) => {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");

  const filteredEmails = emails.filter((email) => {
    const matchesSearch =
      email.to.toLowerCase().includes(search.toLowerCase()) ||
      email.subject.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === "ALL" || email.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleString([], {
      dateStyle: "short",
      timeStyle: "medium",
    });
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
      {/* Table Header Controls */}
      <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 bg-slate-50/70 dark:bg-slate-855/60">
        <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
          <span>Scheduled Dispatch Ledger</span>
          <span className="bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 text-xs px-2.5 py-0.5 rounded-full font-mono font-bold">
            {emails.length}
          </span>
        </h3>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search recipient..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </div>

          {/* Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">PENDING</option>
            <option value="SCHEDULED">SCHEDULED</option>
            <option value="SENDING">SENDING</option>
            <option value="SENT">SENT</option>
            <option value="FAILED">FAILED</option>
          </select>

          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-2 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white dark:hover:bg-slate-800 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-colors"
              title="Refresh Emails"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider">
              <th className="py-3.5 px-4">Recipient</th>
              <th className="py-3.5 px-4">Subject</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Scheduled At</th>
              <th className="py-3.5 px-4">Sent At</th>
              <th className="py-3.5 px-4">Retries</th>
              <th className="py-3.5 px-4">Diagnostics</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-normal">
            {filteredEmails.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400 italic">
                  No emails match your filter criteria.
                </td>
              </tr>
            ) : (
              filteredEmails.map((email) => (
                <tr key={email.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-semibold text-slate-900 dark:text-white">
                    {email.to}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 max-w-[200px] truncate">
                    {email.subject}
                  </td>
                  <td className="py-3.5 px-4">
                    <EmailStatusBadge status={email.status} />
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 font-mono">
                    {formatDate(email.scheduledAt)}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 font-mono">
                    {formatDate(email.sentAt)}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 font-mono">
                    {email.retryCount > 0 ? (
                      <span className="text-amber-600 dark:text-amber-400 font-bold">
                        {email.retryCount} / {email.maxRetries}
                      </span>
                    ) : (
                      "0"
                    )}
                  </td>
                  <td className="py-3.5 px-4 max-w-[250px]">
                    {email.error ? (
                      <span className="text-rose-600 dark:text-rose-400 font-mono text-[11px] truncate block" title={email.error}>
                        ⚠️ {email.error}
                      </span>
                    ) : email.status === "SENT" ? (
                      <span className="text-emerald-500 font-semibold flex items-center gap-1 text-[11px]">
                        <CheckCircle2 className="w-3 h-3" /> Dispatched
                      </span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
