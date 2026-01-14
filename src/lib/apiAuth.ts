// src/lib/apiAuth.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function requireUserId() {
  const session = await auth();

  const uid =
    // @ts-expect-error session.user.id added in callback
    session?.user?.id || null;

  if (!uid) {
    return {
      ok: false as const,
      userId: null,
      response: NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 }),
    };
  }

  return { ok: true as const, userId: uid, response: null };
}

