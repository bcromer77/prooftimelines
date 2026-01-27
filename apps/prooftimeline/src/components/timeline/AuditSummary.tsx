"use client";

import type { EvidenceItem, Event } from "@/lib/types";

function minMaxEventDates(events: Event[]) {
  const dates = events
    .map((e) => e.date)
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));

  return {
    start: dates[0] || null,
    end: dates[dates.length - 1] || null,
  };
}

function fmt(d: string | null) {
  if (!d) return "—";
  try {
    return d.slice(0, 10);
  } catch {
    return d;
  }
}

export default function AuditSummary({
  events,
  evidence,
}: {
  events: Event[];
  evidence: EvidenceItem[];
}) {
  const { start, end } = minMaxEventDates(events);

  return (
    <section className="rounded-md border border-slate-200 bg-white/50 p-4">
      <div className="grid gap-3 md:grid-cols-4 text-sm">
        <div className="space-y-1">
          <div className="text-xs text-slate-500">events</div>
          <div className="text-lg font-medium text-slate-900">
            {events.length}
          </div>
        </div>

        <div className="space-y-1">
          <div className="text-xs text-slate-500">evidence items</div>
          <div className="text-lg font-medium text-slate-900">
            {evidence.length}
          </div>
        </div>

        <div className="space-y-1">
          <div className="text-xs text-slate-500">event time range</div>
          <div className="text-sm text-slate-800 font-mono">
            {fmt(start)} → {fmt(end)}
          </div>
        </div>

        <div className="space-y-1">
          <div className="text-xs text-slate-500">alignment</div>
          <div className="text-xs text-slate-600">
            gaps appear as empty time between events.
          </div>
        </div>
      </div>
    </section>
  );
}

