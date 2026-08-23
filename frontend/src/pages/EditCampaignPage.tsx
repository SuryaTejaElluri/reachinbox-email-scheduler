import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { campaignService } from "../services/campaignService";

export const EditCampaignPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [startTime, setStartTime] = useState("");
  const [delaySeconds, setDelaySeconds] = useState<number>(30);
  const [hourlyLimit, setHourlyLimit] = useState<number>(50);

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCampaign = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const campaign = await campaignService.getCampaign(id);
        setSubject(campaign.subject);
        setBody(campaign.body);

        if (campaign.startTime) {
          const d = new Date(campaign.startTime);
          d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
          setStartTime(d.toISOString().slice(0, 16));
        }

        setDelaySeconds(campaign.delaySeconds);
        setHourlyLimit(campaign.hourlyLimit);
      } catch (err: any) {
        console.error("Fetch campaign error:", err);
        setError(err.response?.data?.message || "Failed to load campaign.");
      } finally {
        setLoading(false);
      }
    };

    fetchCampaign();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setError(null);

    try {
      setIsSubmitting(true);
      await campaignService.updateCampaign(id, {
        subject,
        body,
        startTime: new Date(startTime).toISOString(),
        delaySeconds: Number(delaySeconds),
        hourlyLimit: Number(hourlyLimit),
      });

      navigate(`/campaigns/${id}`);
    } catch (err: any) {
      console.error("Update campaign error:", err);
      setError(
        err.response?.data?.message || "Failed to update campaign settings."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-8 space-y-4">
        <div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse" />
        <div className="h-64 bg-gray-100 rounded-2xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          to={id ? `/campaigns/${id}` : "/campaigns"}
          className="p-2 text-gray-500 hover:text-gray-900 bg-white border border-gray-200 rounded-lg transition-colors"
        >
          ← Back
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Edit Campaign</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Modify campaign subject, body, or timing constraints.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600">
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs space-y-5">
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-700">Subject</label>
          <input
            type="text"
            required
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-700">Body</label>
          <textarea
            required
            rows={5}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="w-full p-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-gray-700">Start Time</label>
            <input
              type="datetime-local"
              required
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-gray-700">Delay (seconds)</label>
            <input
              type="number"
              min={0}
              required
              value={delaySeconds}
              onChange={(e) => setDelaySeconds(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-gray-700">Hourly Limit</label>
            <input
              type="number"
              min={1}
              required
              value={hourlyLimit}
              onChange={(e) => setHourlyLimit(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
          <button
            type="button"
            onClick={() => navigate(id ? `/campaigns/${id}` : "/campaigns")}
            className="px-4 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs disabled:opacity-50"
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
};
