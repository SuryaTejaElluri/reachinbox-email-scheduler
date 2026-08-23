import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import type { Campaign, ScheduledEmail } from "../types";
import { campaignService } from "../services/campaignService";
import { CampaignStatusBadge } from "../components/CampaignStatusBadge";
import { CampaignStats } from "../components/CampaignStats";
import { EmailTable } from "../components/EmailTable";
import { DeleteCampaignDialog } from "../components/DeleteCampaignDialog";

export const CampaignDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [emails, setEmails] = useState<ScheduledEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Deletion modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchCampaignData = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const campaignData = await campaignService.getCampaign(id);
      setCampaign(campaignData);

      const emailList = await campaignService.getCampaignEmails(id);
      setEmails(emailList);
    } catch (err: any) {
      console.error("Fetch campaign error:", err);
      setError(
        err.response?.data?.message || "Failed to load campaign details."
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCampaignData();
  }, [fetchCampaignData]);

  const handleDeleteConfirm = async () => {
    if (!id) return;
    try {
      setIsDeleting(true);
      await campaignService.deleteCampaign(id);
      navigate("/campaigns");
    } catch (err: any) {
      console.error("Delete campaign error:", err);
      alert(err.response?.data?.message || "Failed to delete campaign.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleStatusChange = async (newStatus: "SCHEDULED" | "COMPLETED" | "FAILED") => {
    if (!id) return;
    try {
      const updated = await campaignService.updateCampaignStatus(id, newStatus);
      setCampaign(updated);
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update campaign status.");
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse" />
        <div className="h-32 bg-gray-100 rounded-2xl animate-pulse" />
        <div className="h-64 bg-gray-100 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="max-w-2xl mx-auto p-12 bg-white border border-gray-200 rounded-2xl text-center space-y-4 shadow-xs">
        <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto">
          ⚠️
        </div>
        <h3 className="text-lg font-bold text-gray-900">Campaign Not Found</h3>
        <p className="text-xs text-gray-500">{error || "The requested campaign could not be found."}</p>
        <Link
          to="/campaigns"
          className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700"
        >
          Back to Campaigns
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link to="/campaigns" className="text-xs font-medium text-indigo-600 hover:underline">
              Campaigns
            </Link>
            <span className="text-xs text-gray-400">/</span>
            <span className="text-xs text-gray-500">Details</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{campaign.subject}</h1>
            <CampaignStatusBadge status={campaign.status} />
          </div>
        </div>

        {/* Actions bar */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchCampaignData}
            className="px-3 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-2xs flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>

          <Link
            to={`/campaigns/${campaign.id}/edit`}
            className="px-3.5 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-2xs"
          >
            Edit
          </Link>

          <button
            onClick={() => setShowDeleteModal(true)}
            className="px-3.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Campaign Details Info Card */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex justify-between items-start border-b border-gray-100 pb-3">
          <h3 className="font-bold text-gray-900 text-sm">Campaign Information</h3>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-500">Manual Status Control:</span>
            <select
              value={campaign.status}
              onChange={(e) => handleStatusChange(e.target.value as any)}
              className="px-2 py-1 bg-gray-50 border border-gray-300 rounded-md text-xs font-medium focus:ring-1 focus:ring-indigo-500"
            >
              <option value="SCHEDULED">SCHEDULED</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="FAILED">FAILED</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-gray-400 block text-[10px] uppercase font-semibold">Start Time</span>
            <span className="font-medium text-gray-900">
              {new Date(campaign.startTime).toLocaleString([], { dateStyle: "medium", timeStyle: "medium" })}
            </span>
          </div>

          <div>
            <span className="text-gray-400 block text-[10px] uppercase font-semibold">Delay Between Dispatches</span>
            <span className="font-medium text-gray-900">{campaign.delaySeconds} seconds</span>
          </div>

          <div>
            <span className="text-gray-400 block text-[10px] uppercase font-semibold">Hourly Rate Limit</span>
            <span className="font-medium text-gray-900">{campaign.hourlyLimit} emails / hour</span>
          </div>

          <div>
            <span className="text-gray-400 block text-[10px] uppercase font-semibold">Created At</span>
            <span className="font-medium text-gray-900">
              {new Date(campaign.createdAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}
            </span>
          </div>
        </div>

        <div className="pt-2 border-t border-gray-100">
          <span className="text-gray-400 block text-[10px] uppercase font-semibold mb-1">Email Body Content</span>
          <div className="p-3 bg-gray-50 rounded-lg text-xs text-gray-700 whitespace-pre-wrap font-sans">
            {campaign.body}
          </div>
        </div>
      </div>

      {/* Campaign Stats Component */}
      <CampaignStats emails={emails} />

      {/* Email Table Component */}
      <EmailTable emails={emails} onRefresh={fetchCampaignData} />

      {/* Delete Modal */}
      <DeleteCampaignDialog
        isOpen={showDeleteModal}
        campaignSubject={campaign.subject}
        isDeleting={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  );
};
