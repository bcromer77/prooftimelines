// src/lib/apiAuth.ts
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";

export async function requireUserId() {
  const session = await getServerSession(authOptions);

  const uid = (session?.user as any)?.id || (session as any)?.userId;
  if (!uid) {
    return {
      ok: false as const,
      uid: null,
      response: NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 }),
    };
  }

  return { ok: true as const, uid };
}

