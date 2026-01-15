"use client";

import { useEffect, useMemo, useState } from "react";
import { createEvent, getTimeline } from "@/lib/api";
import type { EvidenceItem, TimelineResponse } from "@/lib/types";
import AuditSummary from "./AuditSummary";
import EventCard from "./EventCard";
import TimelineControls, { type TimelineViewMode } from "./TimelineControls";
import SignalPanel from "./SignalPanel";

/**
 * chronology view — design contract (do not drift)
 *
 * ordering rules (non-negotiable)
 * - timeline ordering = event.date
 * - evidence ordering = ledger.sequenceNumber
 * - capture time is displayed but never used as factual time.
 */

function safeTime(d?: string) {
  if (!d) return 0;
  const t = new Date(d).getTime();
  return Number.isFinite(t) ? t : 0;
}

export default function TimelineView({ caseId }: { caseId: string }) {
  const [data, setData] = useState<TimelineResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // controls (UX spine)
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<TimelineViewMode>("events");
  const [signalsEnabled, setSignalsEnabled] = useState(false);

  // new event form
  const [date, setDate] = useState(""); // yyyy-mm-dd
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const res = await getTimeline(caseId);
      setData(res);
    } catch (e: any) {
      setError(e?.message || "could not load chronology");
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseId]);

  const eventsSorted = useMemo(() => {
    const events = data?.events || [];
    return [...events].sort((a, b) => safeTime(a.date) - safeTime(b.date));
  }, [data]);

  const evidenceByEvent = useMemo(() => {
    const map = new Map<string, EvidenceItem[]>();
    const evidence = data?.evidence || [];

    // pre-seed: events with no evidence still get an empty list
    for (const ev of eventsSorted) map.set(ev._id, []);

    for (const item of evidence) {
      const ids = item.eventIds || [];
      for (const id of ids) {
        if (!map.has(id)) map.set(id, []);
        map.get(id)!.push(item);
      }
    }

    // Evidence ordering = ledger.sequenceNumber (immutable)
    for (const [k, list] of map.entries()) {
      list.sort(
        (a, b) =>
          (a.ledger?.sequenceNumber ?? 0) - (b.ledger?.sequenceNumber ?? 0)
      );
      map.set(k, list);
    }

    return map;
  }, [data, eventsSorted]);

  // light filter (UX-only, honest): matches event fields + evidence filename/hash
  const filteredEvents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return eventsSorted;

    return eventsSorted.filter((ev) => {
      const inEvent =
        (ev.title || "").toLowerCase().includes(q) ||
        (ev.note || "").toLowerCase().includes(q) ||
        (ev.date || "").toLowerCase().includes(q);

      const evEvidence = evidenceByEvent.get(ev._id) || [];
      const inEvidence = evEvidence.some((it) => {
        const file = (it.fileName || "").toLowerCase();
        const hash = (it.sha256 || "").toLowerCase();
        const captured = (it.capturedAt || "").toLowerCase();
        return file.includes(q) || hash.includes(q) || captured.includes(q);
      });

      return inEvent || inEvidence;
    });
  }, [eventsSorted, evidenceByEvent, searchQuery]);

  async function onCreateEvent() {
    if (!date || !title.trim()) return;

    setBusy(true);
    setError(null);

    try {
      // pin to noon UTC to avoid date drift
      const iso = new Date(`${date}T12:00:00.000Z`).toISOString();

      await createEvent(caseId, {
        date: iso,
        title: title.trim(),
        note: note.trim() || undefined,
      });

      setDate("");
      setTitle("");
      setNote("");
      await refresh();
    } catch (e: any) {
      setError(e?.message || "could not create event");
    } finally {
      setBusy(false);
    }
  }

  const canCreate = Boolean(date && title.trim() && !busy);
  const controlsDisabled = loading || !data;

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-md border border-slate-200 bg-white/60 p-3 text-sm text-slate-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-sm text-slate-600">loading…</div>
      ) : !data ? (
        <div className="rounded-md border border-slate-200 bg-white/50 p-6 text-sm text-slate-600">
          we couldn't load the chronology. try refreshing.
        </div>
      ) : (
        <>
          <AuditSummary events={data.events} evidence={data.evidence} />

          <div className={controlsDisabled ? "opacity-60 pointer-events-none" : ""}>
            <TimelineControls
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              viewMode={viewMode}
              onViewChange={setViewMode}
              signalsEnabled={signalsEnabled}
              onToggleSignals={() => setSignalsEnabled((v) => !v)}
              rangeLabel="all time"
            />
          </div>

          <SignalPanel enabled={signalsEnabled} count={0} />

          <div className="text-xs text-slate-500">
            showing {filteredEvents.length} of {eventsSorted.length} events
            {viewMode !== "events" ? (
              <span className="ml-2">· view: {viewMode} (wiring next)</span>
            ) : null}
          </div>

          <div className="rounded-md border border-slate-200 bg-white/50 p-4 space-y-3">
            <div className="text-sm font-medium text-slate-900">add event</div>

            <div className="grid gap-2 md:grid-cols-3">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="rounded-md border border-slate-200 bg-white/60 px-3 py-2 text-sm outline-none focus:border-slate-300 focus:bg-white"
              />
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="neutral title"
                className="rounded-md border border-slate-200 bg-white/60 px-3 py-2 text-sm outline-none focus:border-slate-300 focus:bg-white"
              />
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="optional note"
                className="rounded-md border border-slate-200 bg-white/60 px-3 py-2 text-sm outline-none focus:border-slate-300 focus:bg-white"
              />
            </div>

            <button
              onClick={onCreateEvent}
              disabled={!canCreate}
              className="rounded-md border border-slate-200 bg-white/60 px-3 py-2 text-sm hover:bg-white/80 disabled:opacity-50"
            >
              {busy ? "creating…" : "create event"}
            </button>
          </div>

          <div className="space-y-3">
            {filteredEvents.length === 0 ? (
              <div className="rounded-md border border-slate-200 bg-white/50 p-6 text-sm text-slate-600">
                {eventsSorted.length === 0
                  ? "no events yet. add the first dated event to start the chronology."
                  : "nothing matches your filter. clear it to see the full timeline."}
              </div>
            ) : (
              filteredEvents.map((ev) => (
                <EventCard
                  key={String(ev._id)}
                  caseId={caseId}
                  event={ev}
                  evidence={evidenceByEvent.get(ev._id) || []}
                  onChanged={refresh}
                />
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}

