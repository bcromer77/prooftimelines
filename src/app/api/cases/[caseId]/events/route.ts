// src/app/api/cases/[caseId]/events/route.ts
import { NextResponse, type NextRequest } from "next/server";
import { ObjectId } from "mongodb";

import { getDb } from "@/lib/db";
import { requireUserId } from "@/lib/apiAuth";
import { EventCreateSchema } from "@/lib/validators";

type RouteContext = { params: Promise<{ caseId: string }> };

function toObjectId(id: string) {
  return ObjectId.isValid(id) ? new ObjectId(id) : null;
}

function parseISO(value: unknown) {
  if (typeof value !== "string") return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export async function POST(req: NextRequest, { params }: RouteContext) {
  const { caseId: caseIdParam } = await params;

  // 1) Auth
  const auth = await requireUserId(req);
  if (!auth.ok) return auth.response;

  // 2) Validate caseId
  const caseId = toObjectId(caseIdParam);
  if (!caseId) {
    return NextResponse.json({ error: "INVALID_CASE_ID" }, { status: 400 });
  }

  // 3) Parse + validate body
  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });
  }

  const parsed = EventCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "INVALID_INPUT", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  // 4) Convert occurredAt safely
  const occurredAt = parseISO(parsed.data.occurredAt);
  if (!occurredAt) {
    return NextResponse.json({ error: "INVALID_OCCURRED_AT" }, { status: 400 });
  }

  // 5) DB + ownership
  const db = await getDb();
  const userId = new ObjectId(auth.uid);

  const caseDoc = await db.collection("cases").findOne({ _id: caseId, userId });
  if (!caseDoc) {
    return NextResponse.json({ error: "CASE_NOT_FOUND" }, { status: 404 });
  }

  // 6) Insert
  const now = new Date();

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

  await db
    .collection("cases")
    .updateOne({ _id: caseId, userId }, { $set: { updatedAt: now } });

  return NextResponse.json(
    { eventId: result.insertedId.toString() },
    { status: 201 }
  );
}

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

  const events = await db
    .collection("events")
    .find({ userId, caseId })
    .sort({ occurredAt: 1, createdAt: 1, _id: 1 })
    .limit(2000)
    .toArray();

  return NextResponse.json({
    events: events.map((e: any) => ({
      id: e._id.toString(),
      occurredAt: e.occurredAt?.toISOString?.() ?? e.occurredAt,
      title: e.title ?? "",
      note: e.note ?? null,
      sourceType: e.sourceType ?? null,
      sourceRef: e.sourceRef ?? null,
    })),
  });
}
