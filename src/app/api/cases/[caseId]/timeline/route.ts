// src/app/api/cases/[caseId]/timeline/route.ts

import { NextResponse, type NextRequest } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/db";
import { requireUserId } from "@/lib/apiAuth";

function toObjectId(id: string) {
  return ObjectId.isValid(id) ? new ObjectId(id) : null;
}

type RouteContext = { params: Promise<{ caseId: string }> };

export async function GET(req: NextRequest, { params }: RouteContext) {
  const { caseId: caseIdRaw } = await params;

  // 1) Auth
  const auth = await requireUserId(req);
  if (!auth.ok) return auth.response;

  // 2) Validate caseId
  const caseId = toObjectId(caseIdRaw);
  if (!caseId) {
    return NextResponse.json(
      { error: "INVALID_CASE_ID", received: String(caseIdRaw) },
      { status: 400 }
    );
  }

  // 3) DB + ownership
  const db = await getDb();
  const userId = new ObjectId(auth.uid);

  const c = await db.collection("cases").findOne(
    { _id: caseId, userId },
    { projection: { title: 1, createdAt: 1, updatedAt: 1 } }
  );

  if (!c) {
    return NextResponse.json(
      { error: "CASE_NOT_FOUND", caseId: caseId.toString() },
      { status: 404 }
    );
  }

  // 4) Events (truth axis ordering)
  // IMPORTANT: event ordering = real-world date (event time), then createdAt, then _id for stability
  const events = await db
    .collection("events")
    .find({ caseId, userId })
    .project({ title: 1, note: 1, date: 1, createdAt: 1, updatedAt: 1 })
    .sort({ date: 1, createdAt: 1, _id: 1 })
    .limit(5000)
    .toArray();

  /**
   * 5) Evidence items (uploaded) + ledger (immutable ordering)
   *
   * Upload route writes:
   * - evidence_items: { _id, userId, caseId, eventId?, storageRef, sha256, byteLength, mimeType, filename, capturedAt, ... }
   * - ledger: { caseId, userId, prevHash, hash, sequenceNumber, evidenceId, evidenceSha256, capturedAt, ... }
   */
  const evidenceItems = await db
    .collection("evidence_items")
    .find({ caseId, userId })
    .project({
      // ✅ link to event
      eventId: 1,

      // ✅ UI fields
      filename: 1,
      mimeType: 1,
      byteLength: 1,
      sha256: 1,
      capturedAt: 1,
      storageRef: 1,

      // quiet metadata
      createdAt: 1,
      updatedAt: 1,
      ingestionStatus: 1,
      extractionVersion: 1,
    })
    .sort({ createdAt: 1, _id: 1 })
    .limit(10000)
    .toArray();

  // ledger join
  const evidenceIds = evidenceItems.map((x: any) => x._id);

  const ledgerRows =
    evidenceIds.length > 0
      ? await db
          .collection("ledger")
          .find({ caseId, userId, evidenceId: { $in: evidenceIds } })
          .project({
            evidenceId: 1,
            sequenceNumber: 1,
            prevHash: 1,
            hash: 1,
            capturedAt: 1,
            createdAt: 1,
          })
          .sort({ sequenceNumber: 1, createdAt: 1, _id: 1 })
          .toArray()
      : [];

  const ledgerByEvidenceId = new Map<string, any>();
  for (const row of ledgerRows as any[]) {
    if (row?.evidenceId) ledgerByEvidenceId.set(row.evidenceId.toString(), row);
  }

  // 6) Response: match TimelineResponse shape your UI expects
  return NextResponse.json({
    case: {
      _id: c._id.toString(),
      title: c.title ?? "",
      createdAt: c.createdAt ?? null,
      updatedAt: c.updatedAt ?? null,
    },
    events: events.map((e: any) => ({
      _id: e._id.toString(),
      caseId: caseIdRaw,
      date: e.date,
      title: e.title ?? "",
      note: e.note ?? null,
      createdAt: e.createdAt ?? null,
      updatedAt: e.updatedAt ?? null,
    })),
    evidence: evidenceItems.map((x: any) => {
      const ledger = ledgerByEvidenceId.get(x._id.toString());

      return {
        _id: x._id.toString(),
        caseId: caseIdRaw,

        // ✅ UI-friendly naming (what TimelineView / EventCard usually expect)
        fileName: x.filename ?? null,
        mimeType: x.mimeType ?? null,
        size: x.byteLength ?? null,
        sha256: x.sha256 ?? null,
        capturedAt: x.capturedAt ?? null,

        // ✅ critical link for “evidence under events”
        eventIds: x.eventId ? [x.eventId.toString()] : [],

        // ✅ immutable sequence context (never factual time)
        ledger: ledger
          ? {
              sequenceNumber: ledger.sequenceNumber ?? null,
              prevHash: ledger.prevHash ?? null,
              hash: ledger.hash ?? null,
              capturedAt: ledger.capturedAt ?? null,
            }
          : null,

        // storage pointer
        storageRef: x.storageRef ?? null,

        // quiet metadata
        ingestionStatus: x.ingestionStatus ?? null,
        extractionVersion: x.extractionVersion ?? null,
      };
    }),
  });
}

