import React, { useState } from "react";
import type { ScheduledEmail } from "../types";
import { EmailStatusBadge } from "./EmailStatusBadge";

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
    <div className="bg-white border border-gray-200 rounded-xl shadow-xs overflow-hidden">
      {/* Table Header Controls */}
      <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 bg-gray-50/50">
        <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
          <span>Scheduled Emails</span>
          <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-0.5 rounded-full font-medium">
            {emails.length}
          </span>
        </h3>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <input
            type="text"
            placeholder="Search recipient..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
          />

          {/* Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
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
              className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-white rounded-lg border border-transparent hover:border-gray-200 transition-colors"
              title="Refresh Emails"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-gray-100/70 border-b border-gray-200 text-gray-600 font-semibold uppercase tracking-wider">
              <th className="py-3 px-4">Recipient</th>
              <th className="py-3 px-4">Subject</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Scheduled At</th>
              <th className="py-3 px-4">Sent At</th>
              <th className="py-3 px-4">Retries</th>
              <th className="py-3 px-4">Error</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 font-normal">
            {filteredEmails.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-gray-500 italic">
                  No emails match your filter criteria.
                </td>
              </tr>
            ) : (
              filteredEmails.map((email) => (
                <tr key={email.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="py-3 px-4 font-medium text-gray-900">{email.to}</td>
                  <td className="py-3 px-4 text-gray-600 max-w-[200px] truncate">{email.subject}</td>
                  <td className="py-3 px-4">
                    <EmailStatusBadge status={email.status} />
                  </td>
                  <td className="py-3 px-4 text-gray-500">{formatDate(email.scheduledAt)}</td>
                  <td className="py-3 px-4 text-gray-500">{formatDate(email.sentAt)}</td>
                  <td className="py-3 px-4 text-gray-500">
                    {email.retryCount > 0 ? (
                      <span className="text-amber-600 font-semibold">
                        {email.retryCount} / {email.maxRetries}
                      </span>
                    ) : (
                      "0"
                    )}
                  </td>
                  <td className="py-3 px-4 max-w-[250px]">
                    {email.error ? (
                      <span className="text-red-600 font-mono text-[11px] truncate block" title={email.error}>
                        ⚠️ {email.error}
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
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
