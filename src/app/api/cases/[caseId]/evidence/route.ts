// src/app/api/cases/[caseId]/evidence/route.ts
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

import { getDb } from "@/lib/db";
import clientPromise from "@/lib/db";
import { requireUserId } from "@/lib/apiAuth";
import { putObject } from "@/lib/storage";
import { sha256Hex, computeLedgerHash } from "@/lib/ledger";

function toObjectId(id: string) {
  return ObjectId.isValid(id) ? new ObjectId(id) : null;
}

function extFromFilename(name: string) {
  const idx = name.lastIndexOf(".");
  if (idx === -1) return "bin";
  return name.slice(idx + 1).toLowerCase().slice(0, 10);
}

function errToJson(err: unknown) {
  if (err instanceof Error) {
    return {
      name: err.name,
      message: err.message,
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    };
  }
  return { message: String(err) };
}

export async function POST(
  req: Request,
  context: { params: Promise<{ caseId: string }> }
) {
  const { caseId: caseIdRaw } = await context.params;

  try {
    // ✅ IMPORTANT: pass req so dev header auth works
    const auth = await requireUserId(req);
    if (!auth.ok) return auth.response;

    const caseId = toObjectId(caseIdRaw);
    if (!caseId) {
      return NextResponse.json(
        { error: "INVALID_CASE_ID", received: String(caseIdRaw) },
        { status: 400 }
      );
    }

    const form = await req.formData().catch(() => null);
    if (!form) {
      return NextResponse.json({ error: "INVALID_FORMDATA" }, { status: 400 });
    }

    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "MISSING_FILE", receivedType: typeof file },
        { status: 400 }
      );
    }

    const buf = Buffer.from(await file.arrayBuffer());
    const sha256 = sha256Hex(buf);

    const db = await getDb();
    const userId = new ObjectId(auth.uid);

    // Verify case ownership
    const caseDoc = await db.collection("cases").findOne({ _id: caseId, userId });
    if (!caseDoc) {
      return NextResponse.json(
        { error: "CASE_NOT_FOUND", caseId: caseId.toString() },
        { status: 404 }
      );
    }

    // Deduplicate per case
    const dup = await db.collection("evidence_items").findOne({ userId, caseId, sha256 });
    if (dup) {
      return NextResponse.json(
        { error: "DUPLICATE_EVIDENCE", evidenceId: dup._id.toString() },
        { status: 409 }
      );
    }

    const capturedAt = new Date();
    const capturedAtIso = capturedAt.toISOString();

    // Determine storage key
    const ext = extFromFilename(file.name);
    const key = `evidence/${caseId.toString()}/${sha256}.${ext}`;

    // Load previous ledger entry for this case
    const prev = await db
      .collection("ledger")
      .findOne({ caseId, userId }, { sort: { sequenceNumber: -1 } });

    const prevHash = prev?.hash || "GENESIS";
    const sequenceNumber = (prev?.sequenceNumber || 0) + 1;

    const ledgerHash = computeLedgerHash({
      prevHash,
      evidenceSha256: sha256,
      capturedAtIso,
      userId: userId.toString(),
      caseId: caseId.toString(),
    });

    const evidenceId = new ObjectId();

    // Upload bytes first (so storageRef is valid)
    const { storageRef } = await putObject({
      key,
      body: buf,
      contentType: file.type || "application/octet-stream",
      metadata: {
        originalFilename: file.name,
        sha256,
        userId: userId.toString(),
        caseId: caseId.toString(),
      },
    });

    // Transaction
    const client = await clientPromise; // MongoClient
    const session = client.startSession();

    try {
      await session.withTransaction(async () => {
        await db.collection("evidence_items").insertOne(
          {
            _id: evidenceId,
            userId,
            caseId,
            storageRef,
            sha256,
            byteLength: buf.length,
            mimeType: file.type || null,
            filename: file.name,
            capturedAt,
            ingestionStatus: "PENDING",
            extractionVersion: "2.0.0",
            createdAt: capturedAt,
            updatedAt: capturedAt,
          },
          { session }
        );

        await db.collection("ledger").insertOne(
          {
            caseId,
            userId,
            prevHash,
            hash: ledgerHash,
            sequenceNumber,
            evidenceId,
            evidenceSha256: sha256,
            capturedAt,
            createdAt: capturedAt,
          },
          { session }
        );

        await db.collection("cases").updateOne(
          { _id: caseId, userId },
          { $set: { updatedAt: capturedAt } },
          { session }
        );
      });
    } finally {
      await session.endSession();
    }

    return NextResponse.json(
      {
        ok: true,
        evidenceId: evidenceId.toString(),
        sha256,
        capturedAt: capturedAtIso,
        ledger: { prevHash, hash: ledgerHash, sequenceNumber },
        storageRef,
        file: {
          name: file.name,
          type: file.type || null,
          bytes: buf.length,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[/api/cases/[caseId]/evidence] ERROR", err);
    return NextResponse.json(
      {
        error: "INTERNAL_SERVER_ERROR",
        details: errToJson(err),
        caseIdRaw: String(caseIdRaw),
      },
      { status: 500 }
    );
  }
}

