"use client";

import { AlertTriangle, CheckCircle2, Info } from "lucide-react";

const TONE = {
  error: { Icon: AlertTriangle, color: "text-red-700 dark:text-red-300", bg: "bg-red-500/10", border: "border-red-500/30" },
  warn: { Icon: AlertTriangle, color: "text-amber-700 dark:text-amber-300", bg: "bg-amber-500/10", border: "border-amber-500/30" },
  info: { Icon: Info, color: "text-sky-700 dark:text-sky-300", bg: "bg-sky-500/10", border: "border-sky-500/30" },
};

export function ValidationPanel({ issues }) {
  if (!issues.length) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-700 dark:text-emerald-200">
        <CheckCircle2 size={18} />
        <span>No warnings. The setup looks consistent.</span>
      </div>
    );
  }
  return (
    <ul className="space-y-2">
      {issues.map((issue) => {
        const tone = TONE[issue.level] || TONE.info;
        const { Icon } = tone;
        return (
          <li
            key={issue.id}
            className={`flex items-start gap-3 rounded-2xl border ${tone.border} ${tone.bg} p-3 text-sm ${tone.color}`}
          >
            <Icon size={16} className="mt-0.5 shrink-0" />
            <span>{issue.message}</span>
          </li>
        );
      })}
    </ul>
  );
}
