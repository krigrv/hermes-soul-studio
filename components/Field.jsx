"use client";

export function Field({ label, value, onChange, placeholder, textarea = false, type = "text" }) {
  const base =
    "w-full rounded-2xl border bg-white text-neutral-900 placeholder:text-neutral-400 border-neutral-200 dark:bg-neutral-950 dark:text-neutral-100 dark:border-neutral-800 dark:placeholder:text-neutral-600 px-4 py-3 text-sm outline-none transition focus:border-amber-500 dark:focus:border-amber-500";
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">{label}</span>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={4}
          className={base}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={base}
        />
      )}
    </label>
  );
}
