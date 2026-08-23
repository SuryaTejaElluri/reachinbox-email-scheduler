import React from "react";

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
      <div className="p-4 bg-gray-50 border border-dashed border-gray-300 rounded-lg text-center text-xs text-gray-500">
        Enter start time and add recipients to view the scheduling timeline preview.
      </div>
    );
  }

  const baseDate = new Date(startTime);
  if (isNaN(baseDate.getTime())) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600">
        Invalid start time date provided.
      </div>
    );
  }

  const previewItems: { index: number; time: Date }[] = [];
  const maxPreview = Math.min(recipientCount, 5);

  for (let i = 0; i < maxPreview; i++) {
    const itemTime = new Date(baseDate.getTime() + i * delaySeconds * 1000);
    previewItems.push({ index: i + 1, time: itemTime });
  }

  // Calculate estimated completion time considering delay and hourlyLimit
  const totalDelaySeconds = (recipientCount - 1) * delaySeconds;
  const estimatedEndDate = new Date(baseDate.getTime() + totalDelaySeconds * 1000);

  const durationMinutes = Math.ceil(totalDelaySeconds / 60);

  return (
    <div className="p-4 bg-slate-900 text-white rounded-xl shadow-md space-y-3">
      <div className="flex items-center justify-between border-b border-slate-700 pb-2">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
          Scheduling Preview
        </h4>
        <span className="text-xs text-slate-400 font-mono">
          {hourlyLimit} emails/hour cap
        </span>
      </div>

      <div className="space-y-1.5 font-mono text-xs">
        {previewItems.map((item) => (
          <div key={item.index} className="flex justify-between items-center text-slate-300">
            <span>Email {item.index}</span>
            <span className="text-slate-400">→</span>
            <span className="text-emerald-400">
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
            ... and {recipientCount - maxPreview} more email{recipientCount - maxPreview > 1 ? "s" : ""}
          </p>
        )}
      </div>

      <div className="pt-2 border-t border-slate-800 grid grid-cols-2 gap-2 text-xs">
        <div>
          <span className="text-slate-400 block text-[10px] uppercase">Est. Duration</span>
          <span className="font-semibold text-slate-200">
            {durationMinutes < 1 ? "< 1 min" : `~${durationMinutes} mins`}
          </span>
        </div>
        <div>
          <span className="text-slate-400 block text-[10px] uppercase">Est. Completion</span>
          <span className="font-semibold text-slate-200">
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
