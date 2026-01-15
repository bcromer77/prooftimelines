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
  const { caseId: caseIdParam } = await params;

  // 1) Auth
  const auth = await requireUserId(req);
  if (!auth.ok) return auth.response;

  // 2) Validate caseId
  const caseId = toObjectId(caseIdParam);
  if (!caseId) {
    return NextResponse.json({ error: "INVALID_CASE_ID" }, { status: 400 });
  }

  // 3) DB + ownership
  const db = await getDb();
  const userId = new ObjectId(auth.uid);

  const caseDoc = await db.collection("cases").findOne({ _id: caseId, userId });
  if (!caseDoc) {
    return NextResponse.json({ error: "CASE_NOT_FOUND" }, { status: 404 });
  }

  // 4) Query timeline (keep your existing query/sort/limit if different)
  const events = await db
    .collection("events")
    .find({ userId, caseId })
    .sort({ occurredAt: 1, createdAt: 1, _id: 1 })
    .limit(2000)
    .toArray();

  // 5) Response
  return NextResponse.json({
    timeline: events.map((e: any) => ({
      id: e._id.toString(),
      occurredAt: e.occurredAt?.toISOString?.() ?? e.occurredAt,
      title: e.title ?? "",
      note: e.note ?? null,
      sourceType: e.sourceType ?? null,
      sourceRef: e.sourceRef ?? null,
    })),
  });
}
