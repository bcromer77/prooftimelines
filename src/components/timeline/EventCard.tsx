"use client";

import type { EvidenceItem, Event } from "@/lib/types";
import EvidenceUploader from "./EvidenceUploader";

function fmt(d: string) {
  try {
    return new Date(d).toISOString().slice(0, 10);
  } catch {
    return d;
  }
}

export default function EventCard({
  caseId,
  event,
  evidence,
  onChanged,
}: {
  caseId: string;
  event: Event;
  evidence: EvidenceItem[];
  onChanged: () => Promise<void>;
}) {
  return (
    <div className="rounded-md border p-4 space-y-3">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="text-sm text-muted-foreground">Event Time</div>
          <div className="font-medium">{fmt(event.date)}</div>
          <div className="text-sm">{event.title}</div>
          {event.note ? (
            <div className="text-sm text-muted-foreground">{event.note}</div>
          ) : null}
        </div>

        <EvidenceUploader
          caseId={caseId}
          eventId={event._id}
          onUploaded={onChanged}
        />
      </div>

      <div className="space-y-2">
        <div className="text-sm font-medium">Evidence</div>
        {evidence.length === 0 ? (
          <div className="text-sm text-muted-foreground">None linked.</div>
        ) : (
          <div className="grid gap-2">
            {evidence.map((e) => (
              <div key={e._id} className="rounded-md border p-3 text-sm space-y-1">
                <div className="font-medium">{e.fileName}</div>
                <div className="text-xs text-muted-foreground">
                  SHA-256: {e.sha256}
                </div>
                <div className="text-xs text-muted-foreground">
                  Capture Time: {e.capturedAt}
                </div>
                <div className="text-xs text-muted-foreground">
                  Ledger: #{e.ledger?.sequenceNumber} (hash: {e.ledger?.hash})
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

