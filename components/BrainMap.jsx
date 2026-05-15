"use client";

export function BrainMap({ workspaces }) {
  return (
    <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-black/40">
      <div className="mx-auto mb-4 w-fit rounded-2xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-center text-sm font-bold text-amber-700 dark:text-amber-200">
        Core Brain
      </div>
      <div className="mx-auto mb-4 h-7 w-px bg-neutral-300 dark:bg-neutral-700" />
      <div className="mx-auto mb-4 w-fit rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-center text-sm font-bold text-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100">
        Workspace Router
      </div>
      <div className="mx-auto mb-4 h-7 w-px bg-neutral-300 dark:bg-neutral-700" />
      <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
        {workspaces.map((w) => (
          <div key={w.id} className="rounded-2xl border border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-950">
            <p className="text-sm font-semibold text-neutral-900 dark:text-white">{w.name}</p>
            <p className="mt-1 line-clamp-2 text-xs text-neutral-500">{w.purpose}</p>
          </div>
        ))}
        {workspaces.length === 0 && (
          <p className="col-span-full text-center text-sm text-neutral-500">
            No workspaces yet. Add one to see the router map.
          </p>
        )}
      </div>
    </div>
  );
}
