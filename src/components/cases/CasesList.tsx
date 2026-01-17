"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createCase, listCases } from "@/lib/api";
import type { Case } from "@/lib/types";

function cls(...x: Array<string | false | null | undefined>) {
  return x.filter(Boolean).join(" ");
}

function parseTime(v: unknown) {
  if (!v) return 0;
  const t = new Date(String(v)).getTime();
  return Number.isFinite(t) ? t : 0;
}

function shortId(id?: string) {
  if (!id) return "";
  return id.slice(0, 8) + "…";
}

export default function CasesList() {
  const router = useRouter();

  const [items, setItems] = useState<Case[]>([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showEarlier, setShowEarlier] = useState(false);
  const [query, setQuery] = useState("");

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const cases = await listCases(); // Case[]
      setItems(cases);
    } catch (e: any) {
      setError(e?.message || "Failed to load Dossiers");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  const sorted = useMemo(() => {
    return [...items].sort((a, b) => {
      const timeA = parseTime(a.updatedAt || a.createdAt);
      const timeB = parseTime(b.updatedAt || b.createdAt);
      return timeB - timeA;
    });
  }, [items]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sorted;

    return sorted.filter((d) => {
      const id = String(d._id || "").toLowerCase();
      const t = String(d.title || "").toLowerCase();
      return t.includes(q) || id.includes(q);
    });
  }, [sorted, query]);

  const now = Date.now();
  const ACTIVE_WINDOW_DAYS = 30;
  const activeCutoff = now - ACTIVE_WINDOW_DAYS * 24 * 60 * 60 * 1000;

  const { active, earlier } = useMemo(() => {
    const a: Case[] = [];
    const e: Case[] = [];

    for (const d of filtered) {
      const t = parseTime(d.updatedAt || d.createdAt);
      if (t >= activeCutoff) a.push(d);
      else e.push(d);
    }

    return { active: a, earlier: e };
  }, [filtered, activeCutoff]);

  async function onCreate() {
    const name = title.trim();
    if (!name || busy) return;

    setBusy(true);
    setError(null);

    const tempId = `temp-${Date.now()}`;
    const optimistic: any = {
      _id: tempId,
      title: name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      __optimistic: true,
    };

    setItems((prev) => [optimistic, ...prev]);
    setTitle("");

    try {
      const res = await createCase({ title: name }); // { caseId }
      const newId = res.caseId;

      setItems((prev) =>
        prev.map((d: any) =>
          d._id === tempId ? { ...d, _id: newId, __optimistic: false } : d
        )
      );

      router.push(`/cases/${newId}`);
      router.refresh();
    } catch (e: any) {
      setItems((prev) => prev.filter((d: any) => d._id !== tempId));
      setTitle(name);
      setError(e?.message || "Could not create Dossier");
    } finally {
      setBusy(false);
    }
  }

  const canCreate = Boolean(title.trim()) && !busy;

  return (
    <div className="relative">
      {/* Optional vertical timeline cue */}
      <div className="absolute left-0 top-0 h-full w-px bg-gradient-to-b from-slate-200/60 via-slate-200/30 to-transparent" />

      <div className="space-y-6">
        <div className="rounded-md border border-slate-200 bg-white/50 p-4 space-y-3">
          <div className="space-y-1">
            <div className="text-sm font-medium text-slate-900">New Dossier</div>
            <div className="text-xs text-slate-600">
              Creates a new timeline. You can rename it later.
            </div>
          </div>

          <div className="flex gap-2">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") onCreate();
              }}
              placeholder="Dossier title (e.g. Employment dispute)"
              className="w-full rounded-md border border-slate-200 bg-white/70 px-3 py-2 text-sm outline-none focus:border-slate-300 focus:bg-white"
              disabled={busy}
            />
            <button
              onClick={onCreate}
              disabled={!canCreate}
              className="rounded-md border border-slate-200 bg-white/70 px-3 py-2 text-sm hover:bg-white disabled:opacity-50"
            >
              {busy ? "creating…" : "create"}
            </button>
          </div>

          {error && (
            <div className="text-sm text-slate-700 rounded-md border border-slate-200 bg-white/70 p-3">
              {error}
            </div>
          )}
        </div>

        {/* Section plane wrapper for main content */}
        <div className="relative rounded-lg border border-slate-200 bg-white/70 backdrop-blur-sm p-6 space-y-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search Dossiers…"
                className="w-full md:w-80 rounded-md border border-slate-200 bg-white/60 px-3 py-2 text-sm outline-none focus:border-slate-300 focus:bg-white"
              />
              <div className="text-xs text-slate-500">{filtered.length} total</div>
            </div>

            {earlier.length > 0 && (
              <button
                type="button"
                onClick={() => setShowEarlier((v) => !v)}
                className="text-sm rounded-md border border-slate-200 bg-white/60 px-3 py-2 hover:bg-white"
              >
                {showEarlier ? "hide earlier" : `show earlier (${earlier.length})`}
              </button>
            )}
          </div>

          {loading ? (
            <div className="text-sm text-slate-600">Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="rounded-md border border-slate-200 bg-white/50 p-6 text-sm text-slate-600">
              No Dossiers yet.
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="text-xs font-medium text-slate-600">
                  Active Dossiers
                </div>

                <div className="grid gap-3">
                  {active.map((d: any) => {
                    const id = d._id;
                    const label = d.title?.trim() || "Untitled Dossier";
                    const optimistic = Boolean(d.__optimistic);
                    const clickable = !String(id).startsWith("temp-");

                    return (
                      <Link
                        key={String(id)}
                        href={clickable ? `/cases/${id}` : "#"}
                        onClick={(e) => {
                          if (!clickable) e.preventDefault();
                        }}
                        className={cls(
                          "relative rounded-md border border-slate-200 bg-white/50 p-4 transition hover:bg-white/80",
                          optimistic && "opacity-80"
                        )}
                      >
                        <div className="absolute left-0 top-0 h-full w-[2px] bg-slate-200/60" />

                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="font-medium text-slate-900 truncate">
                              {label}
                            </div>
                            <div className="mt-1 text-xs text-slate-500 font-mono">
                              {shortId(String(id))}
                            </div>
                          </div>

                          {optimistic ? (
                            <div className="text-xs text-slate-500">
                              just created…
                            </div>
                          ) : null}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {showEarlier && earlier.length > 0 ? (
                <div className="space-y-2">
                  <div className="text-xs font-medium text-slate-600">
                    Earlier Dossiers
                  </div>

                  <div className="grid gap-3">
                    {earlier.map((d) => {
                      const id = d._id;
                      const label = d.title?.trim() || "Untitled Dossier";

                      return (
                        <Link
                          key={String(id)}
                          href={`/cases/${id}`}
                          className="relative rounded-md border border-slate-200 bg-white/40 p-4 transition hover:bg-white/70"
                        >
                          <div className="absolute left-0 top-0 h-full w-[2px] bg-slate-100" />

                          <div className="font-medium text-slate-900 truncate">
                            {label}
                          </div>
                          <div className="mt-1 text-xs text-slate-500 font-mono">
                            {shortId(String(id))}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
