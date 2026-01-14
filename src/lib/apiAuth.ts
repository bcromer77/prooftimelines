// src/lib/apiAuth.ts
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

type RequireUserIdResult =
  | { ok: true; uid: string }
  | { ok: false; response: ReturnType<typeof NextResponse.json> };

/**
 * Auth gate for API routes.
 *
 * Development:
 *  - Accepts x-dev-userid header (preferred for curl testing)
 *  - Falls back to DEV_USER_ID from .env.local
 *
 * Production:
 *  - Always rejects (until real NextAuth/Auth.js wiring is enabled)
 *
 * IMPORTANT: We validate ObjectId format to prevent invalid IDs entering the system.
 */
export async function requireUserId(req?: Request): Promise<RequireUserIdResult> {
  const isDev = process.env.NODE_ENV === "development";

  if (isDev) {
    // 1) Curl-friendly override
    const headerUid = req?.headers?.get("x-dev-userid")?.trim();
    if (headerUid) {
      if (!ObjectId.isValid(headerUid)) {
        return {
          ok: false,
          response: NextResponse.json(
            { error: "DEV_AUTH_INVALID_USER", received: headerUid, hint: "x-dev-userid must be a valid ObjectId" },
            { status: 401 }
          ),
        };
      }
      return { ok: true, uid: headerUid };
    }

    // 2) Env fallback
    const envUid = process.env.DEV_USER_ID?.trim();
    if (!envUid) {
      return {
        ok: false,
        response: NextResponse.json(
          {
            error: "DEV_AUTH_NOT_CONFIGURED",
            hint: "Set DEV_USER_ID in .env.local or pass x-dev-userid header",
          },
          { status: 401 }
        ),
      };
    }

    if (!ObjectId.isValid(envUid)) {
      return {
        ok: false,
        response: NextResponse.json(
          { error: "DEV_AUTH_INVALID_USER", received: envUid, hint: "DEV_USER_ID must be a valid ObjectId" },
          { status: 401 }
        ),
      };
    }

    return { ok: true, uid: envUid };
  }

  // Production: strict deny until proper auth is wired.
  return {
    ok: false,
    response: NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 }),
  };
}

