"use client";

import React from "react";
import { devHeaders } from "@/lib/api";

type Props = {
  caseId: string;
  eventId?: string;
  onUploaded?: () => void | Promise<void>;
};

function plural(n: number, s: string) {
  return n === 1 ? s : `${s}s`;
}

export default function EvidenceUploader({ caseId, eventId, onUploaded }: Props) {
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [info, setInfo] = React.useState<string | null>(null);

  const openPicker = () => {
    setError(null);
    setInfo(null);
    inputRef.current?.click();
  };

  const uploadOne = async (file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    if (eventId) fd.append("eventId", eventId);

    const res = await fetch(`/api/cases/${caseId}/evidence`, {
      method: "POST",
      body: fd,
      // ✅ do NOT set content-type for FormData
      // ✅ but DO pass dev auth header
      headers: devHeaders(),
    });

    if (!res.ok) {
      let msg = `upload failed (${res.status})`;
      try {
        const data = await res.json();
        if (data?.error) msg = String(data.error);
      } catch {
        const text = await res.text().catch(() => "");
        if (text) msg = text;
      }
      throw new Error(msg);
    }
  };

  const onPickFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setBusy(true);
    setError(null);
    setInfo(null);

    try {
      // sequential keeps ledger order clean + predictable
      for (const f of files) {
        await uploadOne(f);
      }

      setInfo(`uploaded ${files.length} ${plural(files.length, "file")}`);
      await onUploaded?.();

      // auto-clear info after a moment
      setTimeout(() => setInfo(null), 2200);
    } catch (err: any) {
      setError(err?.message || "couldn't upload. try again.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="flex items-center gap-2">
      <input
        ref={inputRef}
        type="file"
        multiple
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

      {info ? <span className="text-xs text-slate-500">{info}</span> : null}
      {error ? <span className="text-xs text-slate-500">{error}</span> : null}
    </div>
  );
}

