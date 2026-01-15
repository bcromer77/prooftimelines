"use client";

import React from "react";
import { devHeaders } from "@/lib/api";

type Props = {
  caseId: string;
  eventId?: string;
  onUploaded?: () => void | Promise<void>;
};

export default function EvidenceUploader({ caseId, eventId, onUploaded }: Props) {
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const openPicker = () => {
    setError(null);
    inputRef.current?.click();
  };

  const onPickFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;

    setBusy(true);
    setError(null);

    try {
      const fd = new FormData();
      fd.append("file", file);
      if (eventId) fd.append("eventId", eventId);

      const res = await fetch(`/api/cases/${caseId}/evidence`, {
        method: "POST",
        body: fd,

        // ✅ IMPORTANT:
        // - do NOT set Content-Type for FormData (browser adds boundary)
        // - DO include dev auth header so ownership matches other API calls
        headers: devHeaders(),
      });

      if (!res.ok) {
        let msg = `upload failed (${res.status})`;
        try {
          const data = await res.json();
          msg = data?.error ? String(data.error) : msg;
        } catch {
          const text = await res.text().catch(() => "");
          if (text) msg = text;
        }
        throw new Error(msg);
      }

      // ✅ refresh AFTER upload completes
      await onUploaded?.();
    } catch (err: any) {
      setError(err?.message || "couldn't upload. try again.");
    } finally {
      setBusy(false);
      // ✅ reset so selecting the same file again triggers onChange
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="flex items-center gap-2">
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={onPickFile}
      />

      <button
        type="button"
        onClick={openPicker}
        disabled={busy}
        className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-60"
      >
        {busy ? "uploading…" : "attach evidence"}
      </button>

      {error ? <span className="text-xs text-slate-500">{error}</span> : null}
    </div>
  );
}

