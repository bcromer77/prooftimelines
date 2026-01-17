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

  // 4) Load evidence (ledger order)
  const evidence = await db
    .collection("evidence")
    .find({ caseId, userId })
    .project({
      fileName: 1,
      mimeType: 1,
      size: 1,
      sha256: 1,
      capturedAt: 1,
      eventIds: 1,
      ledger: 1,
      storageKey: 1,
      createdAt: 1,
    })
    .sort({ "ledger.sequenceNumber": 1, createdAt: 1, _id: 1 })
    .toArray();

  // 5) Extract ledger chain explicitly (deterministic)
  const ledger = evidence.map((e: any) => ({
    sequenceNumber: e.ledger?.sequenceNumber ?? null,
    hash: e.ledger?.hash ?? null,
    previousHash: e.ledger?.previousHash ?? null,
    evidenceId: e._id.toString(),
    capturedAt: e.capturedAt ?? null,
  }));

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

    evidence: evidence.map((x: any) => ({
      _id: x._id.toString(),
      fileName: x.fileName ?? null,
      mimeType: x.mimeType ?? null,
      size: x.size ?? null,
      sha256: x.sha256,
      capturedAt: x.capturedAt ?? null,
      eventIds: (x.eventIds || []).map((id: any) =>
        id?.toString?.() ?? String(id)
      ),
      ledger: x.ledger ?? null,
      storageKey: x.storageKey ?? null,
    })),

    ledger,

    exportedAt: new Date().toISOString(),
  };

  // 7) Return JSON (no formatting tricks)
  return NextResponse.json(payload, {
    headers: {
      "Content-Type": "application/json",
    },
  });
}

