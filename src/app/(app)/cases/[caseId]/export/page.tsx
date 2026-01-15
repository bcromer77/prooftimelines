export default function ExportPage({ params }: { params: { caseId: string } }) {
  return (
    <div className="mx-auto max-w-6xl p-6 space-y-3">
      <h1 className="text-2xl font-semibold">Export</h1>
      <p className="text-sm text-muted-foreground">
        Export packs are not implemented yet. This page will provide a neutral, ordered JSON export
        of case metadata, events, evidence references, and the hash chain.
      </p>
      <div className="rounded-md border p-4 text-sm">
        CaseId: <span className="font-mono">{params.caseId}</span>
      </div>
    </div>
  );
}

