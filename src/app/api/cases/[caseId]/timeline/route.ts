import { NextResponse, type NextRequest } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/db";
import { requireUserId } from "@/lib/apiAuth";

type RouteContext = { params: Promise<{ caseId: string }> };

export async function GET(req: NextRequest, { params }: RouteContext) {
  const { caseId: caseIdParam } = await params;

  const auth = await requireUserId(req);
  if (!auth.ok) return auth.response;

  const caseId = ObjectId.isValid(caseIdParam) ? new ObjectId(caseIdParam) : null;
  if (!caseId) {
    return NextResponse.json({ error: "INVALID_CASE_ID" }, { status: 400 });
  }

  const db = await getDb();
  const userId = new ObjectId(auth.uid);

  const caseDoc = await db.collection("cases").findOne({ _id: caseId, userId });
  if (!caseDoc) {
    return NextResponse.json({ error: "CASE_NOT_FOUND" }, { status: 404 });
  }

  const events = await db
    .collection("events")
    .find({ userId, caseId })
    .sort({ occurredAt: 1, createdAt: 1 })
    .toArray();

  return NextResponse.json({
    timeline: events.map((e: any) => ({
      id: e._id.toString(),
      occurredAt: e.occurredAt,
      title: e.title,
      note: e.note,
      sourceType: e.sourceType,
      sourceRef: e.sourceRef,
    })),
  });
}
