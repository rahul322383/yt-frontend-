import React from "react";

export default function ProgressLabelCard({ title, valueLabel, progress }) {
  return (
    <div className="bg-white shadow-md rounded-xl">
      <div className="p-4 space-y-2">
        {/* Title and Value Label */}
        <div className="flex items-center justify-between">
          <p className="font-medium text-sm text-muted-foreground">{title}</p>
          <span className="text-sm font-semibold text-foreground">{valueLabel}</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-blue-500 h-2.5 rounded-full"
            style={{ width: `${progress}%` }}
            aria-label={`${title} progress`}
          ></div>
        </div>
      </div>
    </div>
  );
}
