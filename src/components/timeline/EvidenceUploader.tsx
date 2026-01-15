"use client";

import { useState } from "react";

function devHeaders(): Record<string, string> {
  const h: Record<string, string> = {};
  const dev = process.env.NEXT_PUBLIC_DEV_USERID;
  if (dev) h["x-dev-userid"] = dev;
  return h;
}

export default function EvidenceUploader({
  caseId,
  eventId,
  onUploaded,
}: {
  caseId: string;
  eventId: string;
  onUploaded: () => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function upload(file: File) {
    setBusy(true);
    setErr(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("eventIds", JSON.stringify([eventId])); // aligns with “linked to one or more events”

      const res = await fetch(`/api/cases/${caseId}/evidence`, {
        method: "POST",
        headers: devHeaders(), // don't set content-type for FormData
        body: fd,
      });

      if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(t || `Upload failed (${res.status})`);
      }

      await onUploaded();
    } catch (e: any) {
      setErr(e.message || "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2 text-right">
      <label className="inline-flex items-center gap-2 cursor-pointer">
        <input
          type="file"
          className="hidden"
          disabled={busy}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) upload(f);
            e.currentTarget.value = "";
          }}
        />
        <span className="rounded-md border px-3 py-2 text-sm">
          {busy ? "Uploading…" : "Upload Evidence"}
        </span>
      </label>

      {err && <div className="text-xs text-muted-foreground">{err}</div>}
    </div>
  );
}

