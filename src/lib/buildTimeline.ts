// src/lib/buildTimeline.ts (new)
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/db";

export async function buildTimeline(db: any, userId: ObjectId, caseId: ObjectId, caseIdRaw: string) {
  const c = await db.collection("cases").findOne(
    { _id: caseId, userId },
    { projection: { title: 1, createdAt: 1, updatedAt: 1 } }
  );

  if (!c) return null;

  const events = await db.collection("events")
    .find({ caseId, userId })
    .project({ title: 1, note: 1, date: 1, createdAt: 1, updatedAt: 1 })
    .sort({ date: 1, createdAt: 1, _id: 1 })
    .toArray();

  // IMPORTANT: use the SAME collection your upload route writes to.
  const evidence = await db.collection("evidence")
    .find({ caseId, userId })
    .project({ fileName: 1, mimeType: 1, size: 1, sha256: 1, capturedAt: 1, eventIds: 1, ledger: 1, storageKey: 1, url: 1, createdAt: 1 })
    .sort({ "ledger.sequenceNumber": 1, createdAt: 1, _id: 1 })
    .toArray();

  return {
    case: { _id: c._id.toString(), title: c.title, createdAt: c.createdAt, updatedAt: c.updatedAt },
    events: events.map((e: any) => ({
      _id: e._id.toString(),
      caseId: caseIdRaw,
      date: e.date,
      title: e.title ?? "",
      note: e.note ?? null,
      createdAt: e.createdAt,
      updatedAt: e.updatedAt,
    })),
    evidence: evidence.map((x: any) => ({
      _id: x._id.toString(),
      caseId: caseIdRaw,
      fileName: x.fileName ?? x.filename ?? null, // tolerate drift
      mimeType: x.mimeType ?? null,
      size: x.size ?? null,
      sha256: x.sha256 ?? null,
      capturedAt: x.capturedAt ?? null,
      ledger: x.ledger ?? null,
      eventIds: (x.eventIds || []).map((id: any) => id?.toString?.() ?? String(id)),
      storageKey: x.storageKey ?? null,
      url: x.url ?? null,
    })),
  };
}

