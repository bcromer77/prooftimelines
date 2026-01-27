// src/lib/apiAuth.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; // wherever your NextAuth config is exported

export async function requireUserId(req: Request): Promise<
  | { ok: true; uid: string }
  | { ok: false; response: NextResponse }
> {
  // DEV HEADER (local only)
  if (process.env.NODE_ENV === "development") {
    const dev = req.headers.get("x-dev-userid");
    if (dev) return { ok: true, uid: dev };
  }

  // PROD: session auth
  const session = await getServerSession(authOptions);
  const uid = (session as any)?.user?.id; // ensure you set this in NextAuth callbacks

  if (!uid) {
    return {
      ok: false,
      response: NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 }),
    };
  }

  return { ok: true, uid: uid as string };
}

