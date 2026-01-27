import type {
  TimelineResponse,
  Case,
  Event,
  ListCasesResponse,
  CreateCaseResponse,
} from "./types";

const BASE = process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "") || "";

/** Dev header helper (safe for JSON + FormData) */
export function devHeaders(extra?: HeadersInit): HeadersInit {
  const h: Record<string, string> = { ...((extra as any) || {}) };
  const dev = process.env.NEXT_PUBLIC_DEV_USERID;
  if (dev) h["x-dev-userid"] = dev;
  return h;
}

/** JSON headers (adds content-type) */
function jsonHeaders(extra?: HeadersInit): HeadersInit {
  return devHeaders({
    "Content-Type": "application/json",
    ...((extra as any) || {}),
  });
}

async function asJson<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${res.status}: ${text || res.statusText}`);
  }
  return (await res.json()) as T;
}

/** Dossiers list (server returns { cases: [...] }) */
export async function listCases(): Promise<Case[]> {
  const res = await fetch(`${BASE}/api/cases`, {
    method: "GET",
    headers: jsonHeaders(),
    cache: "no-store",
  });

  const data = await asJson<ListCasesResponse>(res);

  return (data.cases || [])
    .map((c) => ({
      _id: c._id || (c as any).id || "",
      title: c.title,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    }))
    .filter((c) => Boolean(c._id));
}

/** Create Dossier (server returns { caseId }) */
export async function createCase(payload: { title: string }): Promise<CreateCaseResponse> {
  const res = await fetch(`${BASE}/api/cases`, {
    method: "POST",
    headers: jsonHeaders(),
    body: JSON.stringify(payload),
  });
  return asJson<CreateCaseResponse>(res);
}

export async function getTimeline(caseId: string): Promise<TimelineResponse> {
  const res = await fetch(`${BASE}/api/cases/${caseId}/timeline`, {
    method: "GET",
    headers: jsonHeaders(),
    cache: "no-store",
  });
  return asJson<TimelineResponse>(res);
}

export async function createEvent(
  caseId: string,
  payload: { date: string; title: string; note?: string }
): Promise<Event> {
  const res = await fetch(`${BASE}/api/cases/${caseId}/events`, {
    method: "POST",
    headers: jsonHeaders(),
    body: JSON.stringify(payload),
  });

  const out = await asJson<{ eventId: string }>(res);

  return {
    _id: out.eventId,
    caseId,
    date: payload.date,
    title: payload.title,
    note: payload.note ?? null,
  };
}

