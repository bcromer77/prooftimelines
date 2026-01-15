// src/app/(app)/cases/[caseId]/export/page.tsx

import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{ caseId: string }>;
};

export default async function ExportPage({ params }: PageProps) {
  const { caseId } = await params;

  if (!caseId || typeof caseId !== "string") {
    notFound();
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold">export</h1>
      <p className="text-sm text-muted-foreground mt-2">
        export pack is coming soon.
      </p>

      <div className="mt-6 text-sm">
        dossier id: <span className="font-mono">{caseId}</span>
      </div>
    </div>
  );
}

