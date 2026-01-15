"use client";

import { useEffect, useMemo, useState } from "react";
import { createEvent, getTimeline } from "@/lib/api";
import type { EvidenceItem, Event, TimelineResponse } from "@/lib/types";
import EventCard from "./EventCard";
import AuditSummary from "./AuditSummary";

export default function TimelineView({ caseId }: { caseId: string }) {
  const [data, setData] = useState<TimelineResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // new event form
  const [date, setDate] = useState("");
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
      setError(e.message || "Failed to load timeline");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, [caseId]);

  const eventsSorted = useMemo(() => {
    const events = data?.events || [];
    // Timeline ordering = Event.date (truth axis)
    return [...events].sort((a, b) => a.date.localeCompare(b.date));
  }, [data]);

  const evidenceByEvent = useMemo(() => {
    const map = new Map<string, EvidenceItem[]>();
    const evidence = data?.evidence || [];

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
      list.sort((a, b) => (a.ledger?.sequenceNumber ?? 0) - (b.ledger?.sequenceNumber ?? 0));
      map.set(k, list);
    }

    return map;
  }, [data, eventsSorted]);

  async function onCreateEvent() {
    if (!date || !title.trim()) return;
    setBusy(true);
    setError(null);
    try {
      // date should be an ISO date string; accept yyyy-mm-dd from input and convert to ISO
      const iso = new Date(date).toISOString();
      await createEvent(caseId, { date: iso, title: title.trim(), note: note.trim() || undefined });
      setDate("");
      setTitle("");
      setNote("");
      await refresh();
    } catch (e: any) {
      setError(e.message || "Failed to create event");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Timeline</h1>
        <p className="text-sm text-muted-foreground">
          Events are ordered by <span className="font-medium">Event Time</span>. Evidence is ordered by{" "}
          <span className="font-medium">Ledger sequence</span>.
        </p>
      </div>

      {error && <div className="rounded-md border p-3 text-sm">{error}</div>}

      {loading ? (
        <div className="text-sm text-muted-foreground">Loading…</div>
      ) : !data ? (
        <div className="rounded-md border p-6 text-sm text-muted-foreground">
          No data.
        </div>
      ) : (
        <>
          <AuditSummary events={data.events} evidence={data.evidence} />

          <div className="rounded-md border p-4 space-y-3">
            <div className="text-sm font-medium">Add Event</div>
            <div className="grid gap-2 md:grid-cols-3">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="rounded-md border px-3 py-2 text-sm"
              />
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Neutral title"
                className="rounded-md border px-3 py-2 text-sm"
              />
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Optional note"
                className="rounded-md border px-3 py-2 text-sm"
              />
            </div>
            <button
              onClick={onCreateEvent}
              disabled={busy}
              className="rounded-md border px-3 py-2 text-sm"
            >
              Create Event
            </button>
          </div>

          <div className="space-y-3">
            {eventsSorted.length === 0 ? (
              <div className="rounded-md border p-6 text-sm text-muted-foreground">
                No events yet.
              </div>
            ) : (
              eventsSorted.map((ev) => (
                <EventCard
                  key={ev._id}
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

