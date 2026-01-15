"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createCase, listCases } from "@/lib/api";
import type { Case } from "@/lib/types";

export default function CasesList() {
  const [items, setItems] = useState<Case[]>([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const data = await listCases();
      setItems(Array.isArray(data) ? data : (data as any).cases || []);
    } catch (e: any) {
      setError(e.message || "Failed to load cases");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  const sorted = useMemo(() => {
    return [...items].sort((a, b) => {
      const ta = a.updatedAt || a.createdAt || "";
      const tb = b.updatedAt || b.createdAt || "";
      return tb.localeCompare(ta);
    });
  }, [items]);

  async function onCreate() {
    if (!title.trim()) return;
    setBusy(true);
    setError(null);
    try {
      await createCase({ title: title.trim() });
      setTitle("");
      await refresh();
    } catch (e: any) {
      setError(e.message || "Failed to create case");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="New case title (e.g. Employment Dispute)"
          className="w-full rounded-md border px-3 py-2 text-sm"
        />
        <button
          onClick={onCreate}
          disabled={busy}
          className="rounded-md border px-3 py-2 text-sm"
        >
          Create
        </button>
      </div>

      {error && (
        <div className="rounded-md border p-3 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-sm text-muted-foreground">Loading…</div>
      ) : sorted.length === 0 ? (
        <div className="rounded-md border p-6 text-sm text-muted-foreground">
          No cases yet.
        </div>
      ) : (
        <div className="grid gap-3">
          {sorted.map((c) => {
            const label = c.title || c.name || c._id;
            return (
              <Link
                key={c._id}
                href={`/cases/${c._id}`}
                className="rounded-md border p-4 hover:bg-muted/30 transition"
              >
                <div className="font-medium">{label}</div>
                <div className="text-xs text-muted-foreground">
                  {c._id}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

