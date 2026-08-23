import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { Campaign } from "../types";
import { campaignService } from "../services/campaignService";
import { CampaignCard } from "../components/CampaignCard";
import { CampaignStatusBadge } from "../components/CampaignStatusBadge";
import { DeleteCampaignDialog } from "../components/DeleteCampaignDialog";

export const CampaignListPage: React.FC = () => {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & sorting
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Deletion modal state
  const [deletingCampaign, setDeletingCampaign] = useState<Campaign | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchCampaigns = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // Ensure token exists (or attempt demo login automatically if first time)
      if (!localStorage.getItem("reachinbox_token")) {
        await campaignService.demoLogin();
      }
      const data = await campaignService.getCampaigns();
      setCampaigns(data);
    } catch (err: any) {
      console.error("Failed to load campaigns:", err);
      setError(
        err.response?.data?.message || "Failed to connect to server. Please check backend connection."
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

  const filteredCampaigns = campaigns
    .filter((campaign) => {
      const matchesSearch =
        campaign.subject.toLowerCase().includes(search.toLowerCase()) ||
        campaign.body.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "ALL" || campaign.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();
      return sortBy === "newest" ? timeB - timeA : timeA - timeB;
    });

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Campaigns</h1>
          <p className="text-xs text-gray-500 mt-1">
            Manage, schedule, and monitor your email outreach campaigns.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchCampaigns}
            disabled={loading}
            className="px-3.5 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-2xs"
          >
            <svg className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
          <Link
            to="/campaigns/new"
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors flex items-center gap-2"
          >
            <span>+</span> Create Campaign
          </Link>
        </div>
      </div>

      {/* Toolbar: Search, Filter, Sort, View toggle */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search campaigns by subject or content..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-hidden"
          />
          <svg className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Filter Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
          >
            <option value="ALL">All Statuses</option>
            <option value="SCHEDULED">SCHEDULED</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="FAILED">FAILED</option>
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 text-xs bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>

          {/* View Toggle Buttons */}
          <div className="inline-flex rounded-lg border border-gray-200 p-0.5 bg-gray-50">
            <button
              onClick={() => setViewMode("grid")}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                viewMode === "grid" ? "bg-white text-indigo-600 shadow-2xs" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                viewMode === "table" ? "bg-white text-indigo-600 shadow-2xs" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Table
            </button>
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 flex justify-between items-center">
          <span>⚠️ {error}</span>
          <button onClick={fetchCampaigns} className="underline font-semibold hover:text-red-800">
            Retry
          </button>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filteredCampaigns.length === 0 ? (
        /* Empty state */
        <div className="p-12 text-center bg-white border border-dashed border-gray-300 rounded-2xl space-y-4">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">No campaigns yet</h3>
            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
              Create your first email campaign to start scheduling emails with automated rate limiting and retries.
            </p>
          </div>
          <Link
            to="/campaigns/new"
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition-colors shadow-xs"
          >
            Create Campaign
          </Link>
        </div>
      ) : viewMode === "grid" ? (
        /* Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
        <div className="bg-white border border-gray-200 rounded-xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-100/70 border-b border-gray-200 text-gray-600 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Start Time</th>
                  <th className="py-3 px-4">Delay</th>
                  <th className="py-3 px-4">Hourly Cap</th>
                  <th className="py-3 px-4">Emails</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-normal">
                {filteredCampaigns.map((campaign) => (
                  <tr key={campaign.id} className="hover:bg-gray-50/80 transition-colors">
                    <td
                      onClick={() => navigate(`/campaigns/${campaign.id}`)}
                      className="py-3.5 px-4 font-semibold text-gray-900 hover:text-indigo-600 cursor-pointer"
                    >
                      {campaign.subject}
                    </td>
                    <td className="py-3.5 px-4">
                      <CampaignStatusBadge status={campaign.status} />
                    </td>
                    <td className="py-3.5 px-4 text-gray-500">
                      {new Date(campaign.startTime).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}
                    </td>
                    <td className="py-3.5 px-4 text-gray-600">{campaign.delaySeconds}s</td>
                    <td className="py-3.5 px-4 text-gray-600">{campaign.hourlyLimit}/hr</td>
                    <td className="py-3.5 px-4 text-gray-600">
                      {campaign.emails?.length || campaign._count?.emails || 0}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => navigate(`/campaigns/${campaign.id}`)}
                          className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-md hover:bg-indigo-100 font-medium"
                        >
                          View
                        </button>
                        <button
                          onClick={() => navigate(`/campaigns/${campaign.id}/edit`)}
                          className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeletingCampaign(campaign)}
                          className="px-2.5 py-1 bg-rose-50 text-rose-700 rounded-md hover:bg-rose-100 font-medium"
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
