// src/app/api/health/route.ts
import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";

export async function GET() {
  try {
    const client = await clientPromise;
    // lightweight ping
    await client.db("admin").command({ ping: 1 });
    return NextResponse.json({ ok: true, mongo: true });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, mongo: false, error: e?.message ?? "MONGO_ERROR" },
      { status: 500 }
    );
  }
}

