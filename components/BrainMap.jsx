"use client";

export function BrainMap({ workspaces }) {
  return (
    <div className="rounded-3xl border border-neutral-800 bg-black/40 p-4">
      <div className="mx-auto mb-4 w-fit rounded-2xl border border-orange-500/40 bg-orange-500/10 px-4 py-3 text-center text-sm font-bold text-orange-200">
        Core Brain
      </div>
      <div className="mx-auto mb-4 h-7 w-px bg-neutral-700" />
      <div className="mx-auto mb-4 w-fit rounded-2xl border border-neutral-700 bg-neutral-900 px-4 py-3 text-center text-sm font-bold text-neutral-100">
        Workspace Router
      </div>
      <div className="mx-auto mb-4 h-7 w-px bg-neutral-700" />
      <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
        {workspaces.map((w) => (
          <div key={w.id} className="rounded-2xl border border-neutral-800 bg-neutral-950 p-3">
            <p className="text-sm font-semibold text-white">{w.name}</p>
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
