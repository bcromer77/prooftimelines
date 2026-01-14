import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/db";
import { requireUserId } from "@/lib/apiAuth";

function oid(id: string) {
  return ObjectId.isValid(id) ? new ObjectId(id) : null;
}

export async function GET(req: Request, { params }: { params: { caseId: string } }) {
  const auth = await requireUserId();
  if (!auth.ok) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });

  const caseId = oid(params.caseId);
  if (!caseId) return NextResponse.json({ error: "INVALID_CASE_ID" }, { status: 400 });

  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from"); // ISO
  const to = searchParams.get("to");     // ISO

  const db = await getDb();
  const userId = new ObjectId(auth.uid);

  const match: any = { userId, caseId };
  if (from || to) {
    match.occurredAt = {};
    if (from) match.occurredAt.$gte = new Date(from);
    if (to) match.occurredAt.$lte = new Date(to);
  }

  const items = await db
    .collection("events")
    .find(match)
    .sort({ occurredAt: 1, createdAt: 1 })
    .limit(5000)
    .toArray();

  return NextResponse.json({
    timeline: items.map((e: any) => ({
      id: e._id.toString(),
      occurredAt: e.occurredAt,
      title: e.title,
      note: e.note,
      sourceType: e.sourceType,
      sourceRef: e.sourceRef,
    })),
  });
}

