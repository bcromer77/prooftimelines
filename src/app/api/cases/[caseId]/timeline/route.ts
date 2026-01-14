// src/app/api/cases/[caseId]/timeline/route.ts
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

import { getDb } from "@/lib/db";
import { requireUserId } from "@/lib/apiAuth";

function oid(id: string) {
  return ObjectId.isValid(id) ? new ObjectId(id) : null;
}

function parseISO(value: string | null) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export async function GET(
  req: Request,
  { params }: { params: { caseId: string } }
) {
  // 1) Auth
  const auth = await requireUserId();
  if (!auth.ok) {
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }

  // 2) Validate caseId
  const caseId = oid(params.caseId);
  if (!caseId) {
    return NextResponse.json({ error: "INVALID_CASE_ID" }, { status: 400 });
  }

  // 3) Parse optional date range (validate ISO)
  const { searchParams } = new URL(req.url);
  const fromRaw = searchParams.get("from");
  const toRaw = searchParams.get("to");

  const from = parseISO(fromRaw);
  const to = parseISO(toRaw);

  if (fromRaw && !from) {
    return NextResponse.json({ error: "INVALID_FROM" }, { status: 400 });
  }
  if (toRaw && !to) {
    return NextResponse.json({ error: "INVALID_TO" }, { status: 400 });
  }
  if (from && to && from.getTime() > to.getTime()) {
    return NextResponse.json({ error: "INVALID_RANGE" }, { status: 400 });
  }

  // 4) DB + ownership enforcement
  const db = await getDb();
  const userId = new ObjectId(auth.uid);

  const caseDoc = await db.collection("cases").findOne({ _id: caseId, userId });
  if (!caseDoc) {
    return NextResponse.json({ error: "CASE_NOT_FOUND" }, { status: 404 });
  }

  // 5) Query
  const match: Record<string, any> = { userId, caseId };

  if (from || to) {
    match.occurredAt = {};
    if (from) match.occurredAt.$gte = from;
    if (to) match.occurredAt.$lte = to;
  }

  const items = await db
    .collection("events")
    .find(match)
    .sort({ occurredAt: 1, createdAt: 1, _id: 1 }) // ✅ deterministic
    .limit(5000)
    .toArray();

  // 6) Response (ISO serialize dates)
  return NextResponse.json({
    timeline: items.map((e: any) => ({
      id: e._id.toString(),
      occurredAt: e.occurredAt?.toISOString?.() ?? e.occurredAt,
      title: e.title ?? "",
      note: e.note ?? null,
      sourceType: e.sourceType ?? null,
      sourceRef: e.sourceRef ?? null,
    })),
  });
}

