"use client";

import type { EvidenceItem, Event } from "@/lib/types";

function minmaxDates(events: Event[]) {
  const dates = events
    .map((e) => e.date)
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));
  return {
    min: dates[0] || null,
    max: dates[dates.length - 1] || null,
  };
}

export default function AuditSummary({
  events,
  evidence,
}: {
  events: Event[];
  evidence: EvidenceItem[];
}) {
  const { min, max } = minmaxDates(events);

  return (
    <div className="rounded-md border p-4 space-y-2">
      <div className="font-medium">Summary</div>
      <div className="grid gap-2 md:grid-cols-4 text-sm">
        <div className="rounded-md border p-3">
          <div className="text-muted-foreground text-xs">Events</div>
          <div className="text-lg font-semibold">{events.length}</div>
        </div>
        <div className="rounded-md border p-3">
          <div className="text-muted-foreground text-xs">Evidence items</div>
          <div className="text-lg font-semibold">{evidence.length}</div>
        </div>
        <div className="rounded-md border p-3">
          <div className="text-muted-foreground text-xs">Time range (Event Time)</div>
          <div className="text-xs">{min ? min.slice(0, 10) : "—"} → {max ? max.slice(0, 10) : "—"}</div>
        </div>
        <div className="rounded-md border p-3">
          <div className="text-muted-foreground text-xs">Gaps</div>
          <div className="text-xs text-muted-foreground">
            Visible as empty periods between events (no inference).
          </div>
        </div>
      </div>
    </div>
  );
}

