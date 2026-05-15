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
      <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-3">
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
                    ? "border-orange-500 bg-orange-500/15 text-orange-100"
                    : "border-neutral-800 bg-neutral-900/60 text-neutral-300 hover:border-neutral-600"
                }`}
              >
                {option}
              </button>
            );
          })}
          {extras.map((extra) => (
            <span
              key={extra}
              className="inline-flex items-center gap-1 rounded-full border border-purple-500/40 bg-purple-500/10 px-3 py-1.5 text-xs font-semibold text-purple-100"
            >
              {extra}
              <button
                type="button"
                onClick={() => removeExtra(extra)}
                aria-label={`Remove ${extra}`}
                className="rounded-full text-purple-300 hover:text-white"
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
            className="min-w-0 flex-1 rounded-xl border border-neutral-800 bg-black px-3 py-2 text-xs text-neutral-100 outline-none transition focus:border-orange-500"
          />
          <button
            type="button"
            onClick={addCustom}
            className="inline-flex items-center gap-1 rounded-xl border border-neutral-700 px-3 py-2 text-xs font-semibold text-neutral-200 transition hover:border-orange-500 hover:text-orange-300"
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
        How much can go wrong if the AI acts without checking first?
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
                  ? "border-orange-500 bg-orange-500/10"
                  : "border-neutral-800 bg-neutral-900/60 hover:border-neutral-600"
              }`}
            >
              <p className="text-sm font-semibold text-white">{opt.value}</p>
              <p className="mt-1 text-xs leading-5 text-neutral-400">{opt.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
