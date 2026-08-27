import React from "react";
import { Clock, ArrowRight } from "lucide-react";

interface Props {
  startTime: string;
  delaySeconds: number;
  recipientCount: number;
  hourlyLimit: number;
}

export const SchedulePreview: React.FC<Props> = ({
  startTime,
  delaySeconds,
  recipientCount,
  hourlyLimit,
}) => {
  if (!startTime || recipientCount === 0) {
    return (
      <div className="p-6 bg-slate-50 dark:bg-slate-850 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl text-center text-xs text-slate-500 dark:text-slate-400 space-y-1">
        <Clock className="w-5 h-5 mx-auto text-slate-400 opacity-60" />
        <p className="font-semibold">Timeline Simulation</p>
        <p className="text-[11px]">Select a start time and add recipients to see real-time calculated dispatch offsets.</p>
      </div>
    );
  }

  const baseDate = new Date(startTime);
  if (isNaN(baseDate.getTime())) {
    return (
      <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-2xl text-xs text-rose-600 dark:text-rose-400">
        Invalid start time date format provided.
      </div>
    );
  }

  const previewItems: { index: number; time: Date }[] = [];
  const maxPreview = Math.min(recipientCount, 5);

  for (let i = 0; i < maxPreview; i++) {
    const itemTime = new Date(baseDate.getTime() + i * delaySeconds * 1000);
    previewItems.push({ index: i + 1, time: itemTime });
  }

  const totalDelaySeconds = (recipientCount - 1) * delaySeconds;
  const estimatedEndDate = new Date(baseDate.getTime() + totalDelaySeconds * 1000);
  const durationMinutes = Math.ceil(totalDelaySeconds / 60);

  return (
    <div className="p-5 bg-slate-900 dark:bg-slate-950 text-white rounded-3xl border border-slate-800 shadow-xl space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-indigo-400" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-300">
            Dispatch Queue Simulation
          </h4>
        </div>
        <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-slate-800 text-indigo-300 border border-slate-700">
          {hourlyLimit}/hr cap
        </span>
      </div>

      <div className="space-y-2 font-mono text-xs">
        {previewItems.map((item) => (
          <div
            key={item.index}
            className="flex justify-between items-center p-2 rounded-xl bg-slate-800/60 border border-slate-800 text-slate-300"
          >
            <span className="text-slate-400 font-bold text-[11px]">Email #{item.index}</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-emerald-400 font-semibold">
              {item.time.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </span>
          </div>
        ))}

        {recipientCount > maxPreview && (
          <p className="text-slate-500 text-[11px] pt-1 italic text-center">
            ... and {recipientCount - maxPreview} more queued email{recipientCount - maxPreview > 1 ? "s" : ""}
          </p>
        )}
      </div>

      <div className="pt-2 border-t border-slate-800 grid grid-cols-2 gap-3 text-xs">
        <div className="p-2.5 rounded-xl bg-slate-800/40">
          <span className="text-slate-400 block text-[10px] uppercase font-bold">Est. Duration</span>
          <span className="font-bold text-slate-100 font-mono">
            {durationMinutes < 1 ? "< 1 min" : `~${durationMinutes} mins`}
          </span>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-800/40">
          <span className="text-slate-400 block text-[10px] uppercase font-bold">Completion Time</span>
          <span className="font-bold text-slate-100 font-mono">
            {estimatedEndDate.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      </div>
    </div>
  );
};
