"use client";

import type { EvidenceItem, Event } from "@/lib/types";
import EvidenceUploader from "./EvidenceUploader";

function fmtDate(d: string) {
  // display as yyyy-mm-dd (facts, calm)
  try {
    return new Date(d).toISOString().slice(0, 10);
  } catch {
    return d;
  }
}

function shortHash(x?: string, head = 10, tail = 6) {
  if (!x) return "";
  if (x.length <= head + tail + 1) return x;
  return `${x.slice(0, head)}…${x.slice(-tail)}`;
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
    <section className="rounded-md border border-slate-200 bg-white/50 p-4 space-y-3">
      <header className="flex items-start justify-between gap-4">
        <div className="min-w-0 space-y-1">
          <div className="text-sm font-medium text-slate-900">
            {fmtDate(event.date)}
          </div>

          <div className="text-sm text-slate-800 break-words">
            {event.title}
          </div>

          {event.note ? (
            <div className="text-sm text-slate-600 break-words">
              {event.note}
            </div>
          ) : null}
        </div>

        {/* quiet action: attach evidence */}
        <div className="shrink-0">
          <EvidenceUploader caseId={caseId} eventId={event._id} onUploaded={onChanged} />
        </div>
      </header>

      <div className="space-y-2">
        <div className="text-xs text-slate-600">
          evidence{" "}
          <span className="text-slate-500">({evidence.length})</span>
        </div>

        {evidence.length === 0 ? (
          <div className="rounded-md border border-slate-200 bg-white/40 p-3 text-sm text-slate-600">
            no evidence attached yet.
          </div>
        ) : (
          <div className="grid gap-2">
            {evidence.map((item) => {
              const seq = item.ledger?.sequenceNumber;
              return (
                <div
                  key={String(item._id)}
                  className="rounded-md border border-slate-200 bg-white/60 p-3"
                >
                  <div className="text-sm text-slate-900">
                    {item.fileName || "untitled file"}
                  </div>

                  {/* metadata: quiet, optional */}
                  <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500 font-mono">
                    {item.capturedAt ? (
                      <span>captured {fmtDate(item.capturedAt)}</span>
                    ) : null}

                    {typeof seq === "number" ? (
                      <span>ledger #{seq}</span>
                    ) : null}

                    {item.sha256 ? (
                      <span>sha {shortHash(item.sha256)}</span>
                    ) : null}

                    {item.ledger?.hash ? (
                      <span>hash {shortHash(item.ledger.hash)}</span>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

