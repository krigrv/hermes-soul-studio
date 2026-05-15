"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { splitList } from "../lib/utils.js";

function normalize(item) {
  return String(item || "").trim().toLowerCase();
}

export function CheckboxGroup({ label, hint, options, value, onChange }) {
  const [draft, setDraft] = useState("");
  const items = splitList(value);
  const itemSet = new Set(items.map(normalize));
  const optionSet = new Set(options.map(normalize));
  const extras = items.filter((item) => !optionSet.has(normalize(item)));

  const toggle = (option) => {
    const has = itemSet.has(normalize(option));
    const next = has
      ? items.filter((item) => normalize(item) !== normalize(option))
      : [...items, option];
    onChange(next.join(", "));
  };

  const removeExtra = (extra) => {
    onChange(items.filter((item) => item !== extra).join(", "));
  };

  const addCustom = () => {
    const v = draft.trim();
    if (!v) return;
    if (itemSet.has(normalize(v))) {
      setDraft("");
      return;
    }
    onChange([...items, v].join(", "));
    setDraft("");
  };

  return (
    <div>
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">{label}</span>
      {hint && <p className="mb-3 text-xs leading-5 text-neutral-500">{hint}</p>}
      <div className="rounded-2xl border border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-950">
        <div className="flex flex-wrap gap-2">
          {options.map((option) => {
            const active = itemSet.has(normalize(option));
            return (
              <button
                key={option}
                type="button"
                onClick={() => toggle(option)}
                aria-pressed={active}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                  active
                    ? "border-amber-500 bg-amber-500/15 text-amber-700 dark:text-amber-100"
                    : "border-neutral-200 bg-neutral-50 text-neutral-700 hover:border-neutral-400 dark:border-neutral-800 dark:bg-neutral-900/60 dark:text-neutral-300 dark:hover:border-neutral-600"
                }`}
              >
                {option}
              </button>
            );
          })}
          {extras.map((extra) => (
            <span
              key={extra}
              className="inline-flex items-center gap-1 rounded-full border border-purple-500/40 bg-purple-500/10 px-3 py-1.5 text-xs font-semibold text-purple-700 dark:text-purple-100"
            >
              {extra}
              <button
                type="button"
                onClick={() => removeExtra(extra)}
                aria-label={`Remove ${extra}`}
                className="rounded-full text-purple-500 hover:text-purple-900 dark:text-purple-300 dark:hover:text-white"
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addCustom();
              }
            }}
            placeholder="Add your own…"
            className="min-w-0 flex-1 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-900 outline-none transition focus:border-amber-500 dark:border-neutral-800 dark:bg-black dark:text-neutral-100"
          />
          <button
            type="button"
            onClick={addCustom}
            className="inline-flex items-center gap-1 rounded-xl border border-neutral-200 px-3 py-2 text-xs font-semibold text-neutral-700 transition hover:border-amber-500 hover:text-amber-600 dark:border-neutral-700 dark:text-neutral-200 dark:hover:text-amber-300"
          >
            <Plus size={12} /> Add
          </button>
        </div>
      </div>
    </div>
  );
}

export function RiskRadio({ value, onChange, options }) {
  return (
    <div>
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">Risk level</span>
      <p className="mb-3 text-xs leading-5 text-neutral-500">
        How much can go wrong if Hermes acts without checking first?
      </p>
      <div className="grid gap-2 md:grid-cols-3">
        {options.map((opt) => {
          const active = String(value).toLowerCase() === opt.value.toLowerCase();
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              aria-pressed={active}
              className={`rounded-2xl border p-3 text-left transition ${
                active
                  ? "border-amber-500 bg-amber-500/10"
                  : "border-neutral-200 bg-white hover:border-neutral-400 dark:border-neutral-800 dark:bg-neutral-900/60 dark:hover:border-neutral-600"
              }`}
            >
              <p className="text-sm font-semibold text-neutral-900 dark:text-white">{opt.value}</p>
              <p className="mt-1 text-xs leading-5 text-neutral-500 dark:text-neutral-400">{opt.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
