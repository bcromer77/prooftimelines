"use client";

export default function SignalPanel({
  enabled,
  count,
}: {
  enabled: boolean;
  count?: number;
}) {
  if (!enabled) return null;

  const n = typeof count === "number" ? count : 0;

  return (
    <section className="rounded-md border border-slate-200 bg-white/50 p-4 space-y-2">
      <div className="text-sm font-medium text-slate-900">
        signals
        <span className="ml-2 text-xs font-normal text-slate-500">
          (assistive)
        </span>
      </div>

      <div className="text-sm text-slate-700">
        signals help you notice absence, overlap, or pattern breaks over time. they
        are prompts for review, not conclusions.
      </div>

      {n === 0 ? (
        <div className="mt-2 rounded-md border border-slate-200 bg-white/40 p-3 text-sm text-slate-600">
          no signals yet. you can add a marker on an event, or enable automated
          signals later.
        </div>
      ) : (
        <div className="text-sm text-slate-700">
          {n} signal{n === 1 ? "" : "s"} available. (wiring next)
        </div>
      )}
    </section>
  );
}

