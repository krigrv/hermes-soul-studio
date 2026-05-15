"use client";

import { useMemo, useState } from "react";
import { ArrowRight, ShieldAlert, ShieldCheck } from "lucide-react";
import { classifyExample, EXAMPLE_TASKS } from "../lib/behavior.js";

export function BehaviorPreview({ config }) {
  const [task, setTask] = useState(EXAMPLE_TASKS[0]);
  const result = useMemo(() => classifyExample(task, config), [task, config]);

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
          Example task
        </label>
        <input
          value={task}
          onChange={(e) => setTask(e.target.value)}
          placeholder="Type any task to see how the operator would route it"
          className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-amber-500 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100"
        />
        <div className="mt-2 flex flex-wrap gap-2">
          {EXAMPLE_TASKS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTask(t)}
              className="rounded-full border border-neutral-200 px-3 py-1 text-xs text-neutral-600 transition hover:border-amber-500 hover:text-amber-600 dark:border-neutral-800 dark:text-neutral-400 dark:hover:text-amber-300"
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-700 dark:border-neutral-800 dark:bg-black/40 dark:text-neutral-300">
        <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">When you ask</p>
        <p className="mt-1 italic text-neutral-800 dark:text-neutral-200">&ldquo;{task}&rdquo;</p>

        <div className="mt-4 flex items-center gap-2 text-xs text-neutral-500">
          <span>Workspace</span>
          <ArrowRight size={12} />
          <span className="font-semibold text-amber-600 dark:text-amber-300">{result.workspace}</span>
        </div>
        <p className="mt-1 font-mono text-xs text-neutral-500">{result.brainPath}</p>

        <div className="mt-3 flex items-center gap-2 text-xs text-neutral-500">
          <span>Engine</span>
          <ArrowRight size={12} />
          <span className="font-semibold text-neutral-900 dark:text-neutral-100">{result.engine}</span>
        </div>

        <div
          className={`mt-4 flex items-start gap-2 rounded-xl border p-3 text-xs ${
            result.needsApproval
              ? "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-200"
              : "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200"
          }`}
        >
          {result.needsApproval ? (
            <ShieldAlert size={14} className="mt-0.5 shrink-0" />
          ) : (
            <ShieldCheck size={14} className="mt-0.5 shrink-0" />
          )}
          <span>{result.nextStep}</span>
        </div>

        {!result.matched && (
          <p className="mt-3 text-xs text-neutral-500">
            (No keyword matched; defaulted to the first workspace.)
          </p>
        )}
      </div>
    </div>
  );
}
