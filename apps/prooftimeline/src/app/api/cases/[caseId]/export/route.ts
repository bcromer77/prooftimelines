// src/app/api/cases/[caseId]/export/route.ts

import { NextResponse, type NextRequest } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/db";
import { requireUserId } from "@/lib/apiAuth";

/**
 * Helpers
 */
function toObjectId(id: string) {
  return ObjectId.isValid(id) ? new ObjectId(id) : null;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ caseId: string }> }
) {
  const { caseId: caseIdRaw } = await params;

  // 1) Auth (same contract as rest of API)
  const auth = await requireUserId(req);
  if (!auth.ok) return auth.response;

  const caseId = toObjectId(caseIdRaw);
  if (!caseId) {
    return NextResponse.json(
      { error: "INVALID_CASE_ID" },
      { status: 400 }
    );
  }

  const db = await getDb();
  const userId = new ObjectId(auth.uid);

  // 2) Load case
  const c = await db.collection("cases").findOne(
    { _id: caseId, userId },
    { projection: { title: 1, createdAt: 1, updatedAt: 1 } }
  );

  if (!c) {
    return NextResponse.json(
      { error: "CASE_NOT_FOUND" },
      { status: 404 }
    );
  }

  // 3) Load events (truth axis ordering)
  const events = await db
    .collection("events")
    .find({ caseId, userId })
    .project({
      title: 1,
      note: 1,
      date: 1,
      createdAt: 1,
      updatedAt: 1,
    })
    .sort({ date: 1, createdAt: 1, _id: 1 })
    .toArray();

  // 4) Load evidence (ledger order) — ✅ FIXED: was "evidence", now "evidence_items"
  const evidence = await db
    .collection("evidence_items")
    .find({ caseId, userId })
    .project({
      filename: 1,
      mimeType: 1,
      byteLength: 1,
      sha256: 1,
      capturedAt: 1,
      eventId: 1,
      storageRef: 1,
      createdAt: 1,
    })
    .sort({ createdAt: 1, _id: 1 })
    .toArray();

  // 5) Load ledger chain explicitly (deterministic)
  const evidenceIds = evidence.map((e: any) => e._id);
  const ledgerRows = await db
    .collection("ledger")
    .find({ evidenceId: { $in: evidenceIds } })
    .project({
      sequenceNumber: 1,
      hash: 1,
      prevHash: 1,
      evidenceId: 1,
      capturedAt: 1,
    })
    .sort({ sequenceNumber: 1 })
    .toArray();

  const ledgerMap = new Map(
    ledgerRows.map((r: any) => [r.evidenceId.toString(), r])
  );

  // 6) Build export payload (boring on purpose)
  const payload = {
    case: {
      _id: c._id.toString(),
      title: c.title,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    },

    events: events.map((e: any) => ({
      _id: e._id.toString(),
      date: e.date,
      title: e.title ?? "",
      note: e.note ?? null,
      createdAt: e.createdAt,
      updatedAt: e.updatedAt,
    })),

    evidence: evidence.map((x: any) => {
      const ledger = ledgerMap.get(x._id.toString());
      return {
        _id: x._id.toString(),
        filename: x.filename ?? null,
        mimeType: x.mimeType ?? null,
        byteLength: x.byteLength ?? null,
        sha256: x.sha256,
        capturedAt: x.capturedAt ?? null,
        eventId: x.eventId?.toString() ?? null,
        ledger: ledger
          ? {
              sequenceNumber: ledger.sequenceNumber,
              hash: ledger.hash,
              prevHash: ledger.prevHash,
            }
          : null,
        storageRef: x.storageRef ?? null,
      };
    }),

    ledger: ledgerRows.map((r: any) => ({
      sequenceNumber: r.sequenceNumber,
      hash: r.hash,
      prevHash: r.prevHash,
      evidenceId: r.evidenceId.toString(),
      capturedAt: r.capturedAt,
    })),

    exportedAt: new Date().toISOString(),
  };

  // 7) Return JSON (no formatting tricks)
  return NextResponse.json(payload, {
    headers: {
      "Content-Type": "application/json",
    },
  });
}
