"use client";

export function Section({ icon: Icon, eyebrow, title, action, children }) {
  return (
    <section className="rounded-[2rem] border border-neutral-800 bg-neutral-950/70 p-5 shadow-2xl shadow-black/20 md:p-7">
      <div className="mb-6 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-3 text-orange-500">
            <Icon size={20} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-neutral-500">{eyebrow}</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-neutral-50">{title}</h2>
          </div>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      {children}
    </section>
  );
}
