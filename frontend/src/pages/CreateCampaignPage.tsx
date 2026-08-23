import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { campaignService } from "../services/campaignService";
import { RecipientInput } from "../components/RecipientInput";
import { SchedulePreview } from "../components/SchedulePreview";

export const CreateCampaignPage: React.FC = () => {
  const navigate = useNavigate();

  // Helper: default start time to 2 minutes from now formatted for datetime-local input
  const getDefaultStartTime = () => {
    const d = new Date(Date.now() + 2 * 60 * 1000);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  };

  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [recipients, setRecipients] = useState<string[]>([]);
  const [startTime, setStartTime] = useState(getDefaultStartTime());
  const [delaySeconds, setDelaySeconds] = useState<number>(30);
  const [hourlyLimit, setHourlyLimit] = useState<number>(50);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!subject.trim()) {
      setError("Campaign subject is required");
      return;
    }

    if (!body.trim()) {
      setError("Email body content is required");
      return;
    }

    if (recipients.length === 0) {
      setError("At least one recipient email is required");
      return;
    }

    if (!startTime) {
      setError("Start time is required");
      return;
    }

    if (delaySeconds < 0) {
      setError("Delay seconds must be a non-negative number");
      return;
    }

    if (hourlyLimit <= 0) {
      setError("Hourly limit must be greater than 0");
      return;
    }

    try {
      setIsSubmitting(true);
      const campaign = await campaignService.createCampaign({
        subject,
        body,
        startTime: new Date(startTime).toISOString(),
        delaySeconds: Number(delaySeconds),
        hourlyLimit: Number(hourlyLimit),
        recipients,
      });

      // Redirect to created campaign details
      navigate(`/campaigns/${campaign.id}`);
    } catch (err: any) {
      console.error("Create campaign error:", err);
      setError(
        err.response?.data?.message || "Failed to create campaign. Please check inputs."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          to="/campaigns"
          className="p-2 text-gray-500 hover:text-gray-900 bg-white border border-gray-200 rounded-lg transition-colors"
        >
          ← Back
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Create Email Campaign</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Configure email content, recipient list, delay intervals, and hourly sending limits.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 flex items-center justify-between">
          <span>⚠️ {error}</span>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">
            &times;
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form fields main section */}
        <div className="lg:col-span-2 space-y-5 bg-white border border-gray-200 rounded-2xl p-6 shadow-xs">
          {/* Subject */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">
              Campaign Subject <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Welcome to ReachInbox!"
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />
          </div>

          {/* Body composer */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="block text-sm font-medium text-gray-700">
                Email Content <span className="text-red-500">*</span>
              </label>
              <span className="text-xs text-gray-400 font-mono">
                {body.length} characters
              </span>
            </div>
            <textarea
              required
              rows={6}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write your email body here..."
              className="w-full p-3.5 text-sm bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden font-sans"
            />
          </div>

          {/* Recipients Tag Input */}
          <RecipientInput
            recipients={recipients}
            onChange={setRecipients}
          />
        </div>

        {/* Sidebar: Scheduling parameters & Live Preview */}
        <div className="space-y-5">
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs space-y-4">
            <h3 className="font-bold text-gray-900 text-sm border-b border-gray-100 pb-2">
              Scheduling Options
            </h3>

            {/* Start Time */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-gray-700">
                Start Time
              </label>
              <input
                type="datetime-local"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>

            {/* Delay Seconds */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-gray-700">
                Delay Between Emails (seconds)
              </label>
              <input
                type="number"
                min={0}
                required
                value={delaySeconds}
                onChange={(e) => setDelaySeconds(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
              <p className="text-[10px] text-gray-400">
                Interval added between consecutive email dispatches.
              </p>
            </div>

            {/* Hourly Limit */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-gray-700">
                Hourly Sending Limit
              </label>
              <input
                type="number"
                min={1}
                required
                value={hourlyLimit}
                onChange={(e) => setHourlyLimit(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
              <p className="text-[10px] text-gray-400">
                Maximum emails sent per hour for this campaign.
              </p>
            </div>
          </div>

          {/* Live Timetable Preview */}
          <SchedulePreview
            startTime={startTime}
            delaySeconds={delaySeconds}
            recipientCount={recipients.length}
            hourlyLimit={hourlyLimit}
          />

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm shadow-md transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Scheduling Campaign...
              </>
            ) : (
              "🚀 Launch & Schedule Campaign"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
