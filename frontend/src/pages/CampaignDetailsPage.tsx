import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import type { Campaign, ScheduledEmail } from "../types";
import { campaignService } from "../services/campaignService";
import { CampaignStatusBadge } from "../components/CampaignStatusBadge";
import { CampaignStats } from "../components/CampaignStats";
import { EmailTable } from "../components/EmailTable";
import { DeleteCampaignDialog } from "../components/DeleteCampaignDialog";
import {
  RefreshCw,
  Edit3,
  Trash2,
  FileText,
  AlertTriangle,
} from "lucide-react";

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
      <div className="max-w-6xl mx-auto space-y-6 pb-12">
        <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
        <div className="h-36 bg-slate-100 dark:bg-slate-800/60 rounded-3xl animate-pulse" />
        <div className="h-64 bg-slate-100 dark:bg-slate-800/60 rounded-3xl animate-pulse" />
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="max-w-2xl mx-auto p-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl text-center space-y-4 shadow-sm">
        <div className="w-14 h-14 bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 rounded-2xl flex items-center justify-center mx-auto">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Campaign Not Found</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">{error || "The requested campaign could not be found."}</p>
        <Link
          to="/campaigns"
          className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
        >
          Back to Campaigns
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs">
            <Link to="/campaigns" className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
              Campaigns
            </Link>
            <span className="text-slate-400">/</span>
            <span className="text-slate-500 dark:text-slate-400 font-medium">Details</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {campaign.subject}
            </h1>
            <CampaignStatusBadge status={campaign.status} />
          </div>
        </div>

        {/* Actions bar */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchCampaignData}
            className="px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-750 transition-all shadow-2xs flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5 text-indigo-500" />
            <span>Refresh</span>
          </button>

          <Link
            to={`/campaigns/${campaign.id}/edit`}
            className="px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-750 transition-all shadow-2xs flex items-center gap-1.5"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit</span>
          </Link>

          <button
            onClick={() => setShowDeleteModal(true)}
            className="px-3.5 py-2 text-xs font-bold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-xl hover:bg-rose-100 transition-colors flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Campaign Details Info Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-500" />
            <span>Campaign Parameters</span>
          </h3>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-semibold">Status Override:</span>
            <select
              value={campaign.status}
              onChange={(e) => handleStatusChange(e.target.value as any)}
              className="px-2.5 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-indigo-500"
            >
              <option value="SCHEDULED">SCHEDULED</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="FAILED">FAILED</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Start Time</span>
            <span className="font-bold font-mono text-slate-900 dark:text-white">
              {new Date(campaign.startTime).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}
            </span>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Delay Interval</span>
            <span className="font-bold font-mono text-slate-900 dark:text-white">{campaign.delaySeconds} seconds</span>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Rate Limit</span>
            <span className="font-bold font-mono text-slate-900 dark:text-white">{campaign.hourlyLimit} emails / hr</span>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Created On</span>
            <span className="font-bold font-mono text-slate-900 dark:text-white">
              {new Date(campaign.createdAt).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}
            </span>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          <span className="text-slate-400 block text-[10px] uppercase font-bold mb-2">Message Body Preview</span>
          <div className="p-4 bg-slate-50 dark:bg-slate-850 rounded-2xl text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap font-sans leading-relaxed border border-slate-100 dark:border-slate-800">
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
