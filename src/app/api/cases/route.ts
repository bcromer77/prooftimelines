// src/app/api/cases/route.ts
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/db";
import { requireUserId } from "@/lib/apiAuth";
import { CreateCaseSchema } from "@/lib/validators";

export async function GET() {
  const authRes = await requireUserId();
  if (!authRes.ok) return authRes.response;

  const db = await getDb("prooftimeline");
  const userId = new ObjectId(authRes.userId);

  const cases = await db
    .collection("cases")
    .find({ userId })
    .sort({ updatedAt: -1 })
    .project({ title: 1, createdAt: 1, updatedAt: 1 })
    .toArray();

  return NextResponse.json({
    cases: cases.map((c: any) => ({
      id: c._id.toString(),
      title: c.title,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    })),
  });
}

export async function POST(req: Request) {
  const authRes = await requireUserId();
  if (!authRes.ok) return authRes.response;

  const body = await req.json().catch(() => ({}));
  const parsed = CreateCaseSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "VALIDATION_ERROR", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const db = await getDb("prooftimeline");
  const userId = new ObjectId(authRes.userId);

  const now = new Date();
  const doc = {
    userId,
    title: parsed.data.title,
    createdAt: now,
    updatedAt: now,
  };

  const result = await db.collection("cases").insertOne(doc);
  return NextResponse.json({ caseId: result.insertedId.toString() }, { status: 201 });
}

