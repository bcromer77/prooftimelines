"use client";

function filename(caseId: string) {
  const date = new Date().toISOString().slice(0, 10);
  return `prooftimeline_${caseId}_${date}.json`;
}

export default function ExportClient({ caseId }: { caseId: string }) {
  return (
    <div className="p-4">
      <button
        type="button"
        onClick={async () => {
          let url: string | null = null;

          try {
            const res = await fetch(`/api/cases/${caseId}/export`, { method: "GET" });

            if (!res.ok) {
              const text = await res.text().catch(() => "");
              try {
                const data = text ? JSON.parse(text) : null;
                alert(data?.error ? String(data.error) : text || `export failed (${res.status})`);
              } catch {
                alert(text || `export failed (${res.status})`);
              }
              return;
            }

            const blob = await res.blob();
            url = URL.createObjectURL(blob);

            const a = document.createElement("a");
            a.href = url;
            a.download = filename(caseId);
            document.body.appendChild(a);
            a.click();
            a.remove();
          } finally {
            if (url) URL.revokeObjectURL(url);
          }
        }}
        className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm hover:bg-slate-50"
      >
        Download
      </button>
    </div>
  );
}

