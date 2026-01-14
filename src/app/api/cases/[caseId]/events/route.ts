// src/app/api/cases/[caseId]/events/route.ts
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/db";
import { requireUserId } from "@/lib/apiAuth";
import { EventCreateSchema } from "@/lib/validators";

function toObjectId(id: string) {
  if (!ObjectId.isValid(id)) return null;
  return new ObjectId(id);
}

export async function POST(
  req: Request,
  { params }: { params: { caseId: string } }
) {
  const auth = await requireUserId();
  if (!auth.ok) return auth.response;

  const caseId = toObjectId(params.caseId);
  if (!caseId) return NextResponse.json({ error: "INVALID_CASE_ID" }, { status: 400 });

  const body = await req.json().catch(() => null);
  const parsed = EventCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "INVALID_INPUT", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const db = await getDb("prooftimeline");
  const userId = new ObjectId(auth.userId);

  const caseDoc = await db.collection("cases").findOne({ _id: caseId, userId });
  if (!caseDoc) return NextResponse.json({ error: "CASE_NOT_FOUND" }, { status: 404 });

  const now = new Date();
  const occurredAt = new Date(parsed.data.occurredAt);

  const eventDoc = {
    userId,
    caseId,
    occurredAt,
    title: parsed.data.title,
    note: parsed.data.note ?? null,
    sourceType: parsed.data.sourceType,
    sourceRef: parsed.data.sourceRef ?? null,
    createdAt: now,
    updatedAt: now,
  };

  const result = await db.collection("events").insertOne(eventDoc);

  await db.collection("cases").updateOne(
    { _id: caseId, userId },
    { $set: { updatedAt: now } }
  );

  return NextResponse.json({ eventId: result.insertedId.toString() }, { status: 201 });
}

export async function GET(
  req: Request,
  { params }: { params: { caseId: string } }
) {
  const auth = await requireUserId();
  if (!auth.ok) return auth.response;

  const caseId = toObjectId(params.caseId);
  if (!caseId) return NextResponse.json({ error: "INVALID_CASE_ID" }, { status: 400 });

  const db = await getDb("prooftimeline");
  const userId = new ObjectId(auth.userId);

  const caseDoc = await db.collection("cases").findOne({ _id: caseId, userId });
  if (!caseDoc) return NextResponse.json({ error: "CASE_NOT_FOUND" }, { status: 404 });

  const events = await db
    .collection("events")
    .find({ userId, caseId })
    .sort({ occurredAt: 1 })
    .limit(2000)
    .toArray();

  return NextResponse.json({
    events: events.map((e: any) => ({
      id: e._id.toString(),
      occurredAt: e.occurredAt?.toISOString?.() ?? e.occurredAt,
      title: e.title,
      note: e.note,
      sourceType: e.sourceType,
      sourceRef: e.sourceRef,
    })),
  });
}

