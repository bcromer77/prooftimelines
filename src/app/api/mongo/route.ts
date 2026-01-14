import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";

export async function GET() {
  const client = await clientPromise;
  const admin = client.db().admin();
  const info = await admin.serverStatus();
  return NextResponse.json({
    ok: true,
    version: info.version,
  });
}

