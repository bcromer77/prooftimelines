import type { TimelineResponse, Case, Event } from "./types";

const BASE =
  process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "") || "";

function headers(extra?: HeadersInit) {
  const h: Record<string, string> = {
    "Content-Type": "application/json",
    ...((extra as any) || {}),
  };

  // Dev auth support (matches your existing x-dev-userid approach)
  // Set NEXT_PUBLIC_DEV_USERID in .env.local for local UI calls
  const dev = process.env.NEXT_PUBLIC_DEV_USERID;
  if (dev) h["x-dev-userid"] = dev;

  return h;
}

async function asJson<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${res.status}: ${text || res.statusText}`);
  }
  return (await res.json()) as T;
}

export async function listCases(): Promise<Case[]> {
  const res = await fetch(`${BASE}/api/cases`, {
    method: "GET",
    headers: headers(),
    cache: "no-store",
  });
  return asJson<Case[]>(res);
}

export async function createCase(payload: { title: string }): Promise<Case> {
  const res = await fetch(`${BASE}/api/cases`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(payload),
  });
  return asJson<Case>(res);
}

export async function getTimeline(caseId: string): Promise<TimelineResponse> {
  const res = await fetch(`${BASE}/api/cases/${caseId}/timeline`, {
    method: "GET",
    headers: headers(),
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
    headers: headers(),
    body: JSON.stringify(payload),
  });
  return asJson<Event>(res);
}

