import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { Campaign } from "../types";
import { campaignService } from "../services/campaignService";
import { useAuth } from "../context/AuthContext";
import { CampaignCard } from "../components/CampaignCard";
import { CampaignStatusBadge } from "../components/CampaignStatusBadge";
import { DeleteCampaignDialog } from "../components/DeleteCampaignDialog";
import {
  Search,
  Plus,
  RefreshCw,
  LayoutGrid,
  List,
  Layers,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Mail,
} from "lucide-react";

export const CampaignListPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & sorting
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "recipients">("newest");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Deletion modal state
  const [deletingCampaign, setDeletingCampaign] = useState<Campaign | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchCampaigns = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await campaignService.getCampaigns();
      setCampaigns(data);
    } catch (err: any) {
      console.error("Failed to load campaigns:", err);
      setError(
        err.response?.data?.message || "Failed to connect to backend server. Please verify backend service."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  const handleDeleteConfirm = async () => {
    if (!deletingCampaign) return;
    try {
      setIsDeleting(true);
      await campaignService.deleteCampaign(deletingCampaign.id);
      setCampaigns((prev) => prev.filter((c) => c.id !== deletingCampaign.id));
      setDeletingCampaign(null);
    } catch (err: any) {
      console.error("Delete campaign error:", err);
      alert(err.response?.data?.message || "Failed to delete campaign");
    } finally {
      setIsDeleting(false);
    }
  };

  // KPI calculations
  const totalCampaigns = campaigns.length;
  const scheduledCount = campaigns.filter((c) => c.status === "SCHEDULED").length;
  const completedCount = campaigns.filter((c) => c.status === "COMPLETED").length;
  const totalEmailsCount = campaigns.reduce(
    (acc, c) => acc + (c.emails?.length || c._count?.emails || 0),
    0
  );

  const filteredCampaigns = campaigns
    .filter((campaign) => {
      const matchesSearch =
        campaign.subject.toLowerCase().includes(search.toLowerCase()) ||
        campaign.body.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "ALL" || campaign.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === "recipients") {
        const rA = a.emails?.length || a._count?.emails || 0;
        const rB = b.emails?.length || b._count?.emails || 0;
        return rB - rA;
      }
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();
      return sortBy === "newest" ? timeB - timeA : timeA - timeB;
    });

  return (
    <div className="space-y-8 pb-12">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Campaigns Dashboard
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
              {totalCampaigns} Active
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-normal">
            Welcome back{user?.name ? `, ${user.name}` : ""}. Monitor and orchestrate your distributed email queues.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchCampaigns}
            disabled={loading}
            className="px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-750 transition-all flex items-center gap-2 shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-indigo-500" : ""}`} />
            <span>Refresh</span>
          </button>
          <Link
            to="/campaigns/new"
            className="px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-xl shadow-md shadow-indigo-500/20 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>New Campaign</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Total Schedules</span>
            <Layers className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">{totalCampaigns}</div>
          <div className="text-[10px] text-slate-400 font-medium">All recorded campaigns</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-indigo-500 text-xs font-bold uppercase tracking-wider">
            <span>Queued / Active</span>
            <Clock className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-mono">{scheduledCount}</div>
          <div className="text-[10px] text-slate-400 font-medium">Processing in BullMQ</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-emerald-500 text-xs font-bold uppercase tracking-wider">
            <span>Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">{completedCount}</div>
          <div className="text-[10px] text-slate-400 font-medium">Successfully delivered</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-purple-500 text-xs font-bold uppercase tracking-wider">
            <span>Total Contacts</span>
            <Mail className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-black text-purple-600 dark:text-purple-400 font-mono">{totalEmailsCount}</div>
          <div className="text-[10px] text-slate-400 font-medium">Targeted email recipients</div>
        </div>
      </div>

      {/* Toolbar: Search, Status Filter, Sort, View toggle */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3.5">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search campaigns by subject or keywords..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
          >
            <option value="ALL">All Statuses</option>
            <option value="SCHEDULED">SCHEDULED</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="FAILED">FAILED</option>
          </select>

          {/* Sort Filter */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="recipients">Most Contacts</option>
          </select>

          {/* View Toggle */}
          <div className="inline-flex rounded-xl border border-slate-200 dark:border-slate-700 p-1 bg-slate-50 dark:bg-slate-800">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg text-xs font-medium transition-colors ${
                viewMode === "grid"
                  ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-lg text-xs font-medium transition-colors ${
                viewMode === "table"
                  ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-2xl text-xs text-rose-600 dark:text-rose-400 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
          <button onClick={fetchCampaigns} className="underline font-bold hover:text-rose-800 dark:hover:text-rose-300">
            Retry Connection
          </button>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-56 bg-slate-100 dark:bg-slate-800/60 rounded-3xl animate-pulse border border-slate-200/50 dark:border-slate-800"
            />
          ))}
        </div>
      ) : filteredCampaigns.length === 0 ? (
        /* Empty State */
        <div className="p-12 text-center bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 rounded-3xl space-y-4 shadow-sm">
          <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mx-auto">
            <Mail className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {search || statusFilter !== "ALL" ? "No matching campaigns" : "No campaigns created yet"}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              {search || statusFilter !== "ALL"
                ? "Try adjusting your search terms or status filter."
                : "Create your first email campaign to start automated background queue dispatching."}
            </p>
          </div>
          <Link
            to="/campaigns/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Create Campaign</span>
          </Link>
        </div>
      ) : viewMode === "grid" ? (
        /* Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCampaigns.map((campaign) => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              onView={(id) => navigate(`/campaigns/${id}`)}
              onEdit={(id) => navigate(`/campaigns/${id}/edit`)}
              onDelete={(c) => setDeletingCampaign(c)}
            />
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Subject</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Start Time</th>
                  <th className="py-3.5 px-4">Delay</th>
                  <th className="py-3.5 px-4">Hourly Cap</th>
                  <th className="py-3.5 px-4">Emails</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-normal">
                {filteredCampaigns.map((campaign) => (
                  <tr key={campaign.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    <td
                      onClick={() => navigate(`/campaigns/${campaign.id}`)}
                      className="py-3.5 px-4 font-bold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer"
                    >
                      {campaign.subject}
                    </td>
                    <td className="py-3.5 px-4">
                      <CampaignStatusBadge status={campaign.status} />
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 font-mono">
                      {new Date(campaign.startTime).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 font-mono">{campaign.delaySeconds}s</td>
                    <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 font-mono">{campaign.hourlyLimit}/hr</td>
                    <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 font-mono">
                      {campaign.emails?.length || campaign._count?.emails || 0}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => navigate(`/campaigns/${campaign.id}`)}
                          className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 rounded-lg hover:bg-indigo-100 font-bold"
                        >
                          View
                        </button>
                        <button
                          onClick={() => navigate(`/campaigns/${campaign.id}/edit`)}
                          className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 font-bold"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeletingCampaign(campaign)}
                          className="px-2.5 py-1 bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 rounded-lg hover:bg-rose-100 font-bold"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteCampaignDialog
        isOpen={!!deletingCampaign}
        campaignSubject={deletingCampaign?.subject || ""}
        isDeleting={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingCampaign(null)}
      />
    </div>
  );
};
