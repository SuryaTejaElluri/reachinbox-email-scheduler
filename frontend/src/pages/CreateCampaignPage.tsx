import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { campaignService } from "../services/campaignService";
import { RecipientInput } from "../components/RecipientInput";
import { SchedulePreview } from "../components/SchedulePreview";
import {
  ArrowLeft,
  Send,
  Sliders,
  Eye,
  Edit3,
  AlertTriangle,
  Loader2,
} from "lucide-react";

export const CreateCampaignPage: React.FC = () => {
  const navigate = useNavigate();

  // Helper: default start time to 2 minutes from now formatted for datetime-local input
  const getDefaultStartTime = (minutesFromNow = 2) => {
    const d = new Date(Date.now() + minutesFromNow * 60 * 1000);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  };

  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [recipients, setRecipients] = useState<string[]>([]);
  const [startTime, setStartTime] = useState(getDefaultStartTime(2));
  const [delaySeconds, setDelaySeconds] = useState<number>(5);
  const [hourlyLimit, setHourlyLimit] = useState<number>(100);
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const applyPresetTime = (minutes: number) => {
    setStartTime(getDefaultStartTime(minutes));
  };

  const setTomorrowMorning = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(9, 0, 0, 0);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    setStartTime(d.toISOString().slice(0, 16));
  };

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

      navigate(`/campaigns/${campaign.id}`);
    } catch (err: any) {
      console.error("Create campaign error:", err);
      setError(
        err.response?.data?.message || "Failed to create campaign. Please check inputs and database connection."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          to="/campaigns"
          className="p-2.5 text-slate-500 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Create Email Schedule
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Configure copy, recipient lists, delayed intervals, and token bucket rate limits.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-2xl text-xs text-rose-600 dark:text-rose-400 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-rose-400 hover:text-rose-600">
            &times;
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form fields main section */}
        <div className="lg:col-span-2 space-y-5 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-sm">
          {/* Subject */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span>Campaign Subject</span>
              <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Quick Question regarding Q3 Partnerships"
              className="w-full px-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />
          </div>

          {/* Body composer with Write / Preview Tabs */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Email Content <span className="text-rose-500">*</span>
              </label>

              <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-700 p-0.5 bg-slate-50 dark:bg-slate-800 text-[11px]">
                <button
                  type="button"
                  onClick={() => setActiveTab("write")}
                  className={`px-2.5 py-1 rounded-md font-bold transition-all flex items-center gap-1 ${
                    activeTab === "write"
                      ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-2xs"
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Write</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("preview")}
                  className={`px-2.5 py-1 rounded-md font-bold transition-all flex items-center gap-1 ${
                    activeTab === "preview"
                      ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-2xs"
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <Eye className="w-3 h-3" />
                  <span>Preview</span>
                </button>
              </div>
            </div>

            {activeTab === "write" ? (
              <textarea
                required
                rows={8}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write your email body here. HTML formatting or plain text is supported..."
                className="w-full p-4 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden font-sans leading-relaxed"
              />
            ) : (
              <div className="min-h-[190px] p-4 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-sans whitespace-pre-wrap">
                {body.trim() ? body : <span className="text-slate-400 italic">No content written yet.</span>}
              </div>
            )}
            <div className="flex justify-end text-[10px] text-slate-400 font-mono">
              {body.length} characters
            </div>
          </div>

          {/* Recipients Tag Input */}
          <RecipientInput recipients={recipients} onChange={setRecipients} />
        </div>

        {/* Sidebar: Scheduling parameters & Live Preview */}
        <div className="space-y-5">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-indigo-500" />
              <span>Queue Parameters</span>
            </h3>

            {/* Start Time */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>Start Time</span>
                <span className="text-indigo-600 dark:text-indigo-400 text-[10px] font-mono">ISO Local</span>
              </label>
              <input
                type="datetime-local"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />

              {/* Quick Presets */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => applyPresetTime(1)}
                  className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950 text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition-colors"
                >
                  +1 min
                </button>
                <button
                  type="button"
                  onClick={() => applyPresetTime(15)}
                  className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950 text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition-colors"
                >
                  +15 mins
                </button>
                <button
                  type="button"
                  onClick={() => applyPresetTime(60)}
                  className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950 text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition-colors"
                >
                  +1 hr
                </button>
                <button
                  type="button"
                  onClick={setTomorrowMorning}
                  className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950 text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition-colors"
                >
                  Tomorrow 9AM
                </button>
              </div>
            </div>

            {/* Delay Seconds */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                <span>Delay Between Sends</span>
                <span className="font-mono text-indigo-600 dark:text-indigo-400">{delaySeconds}s</span>
              </div>
              <input
                type="range"
                min="0"
                max="60"
                value={delaySeconds}
                onChange={(e) => setDelaySeconds(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <p className="text-[10px] text-slate-400">
                Seconds elapsed between each individual recipient dispatch.
              </p>
            </div>

            {/* Hourly Limit */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                <span>Hourly Throttle Limit</span>
                <span className="font-mono text-purple-600 dark:text-purple-400">{hourlyLimit}/hr</span>
              </div>
              <input
                type="range"
                min="10"
                max="500"
                step="10"
                value={hourlyLimit}
                onChange={(e) => setHourlyLimit(Number(e.target.value))}
                className="w-full accent-purple-600 cursor-pointer"
              />
              <p className="text-[10px] text-slate-400">
                Redis sliding-window hourly quota to prevent ESP throttling.
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
            className="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-2xl font-bold text-xs shadow-xl shadow-indigo-500/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Enqueuing into BullMQ Queue...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Launch & Schedule Campaign</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
