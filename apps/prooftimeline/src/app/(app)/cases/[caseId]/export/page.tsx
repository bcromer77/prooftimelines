// src/app/(app)/cases/[caseId]/export/page.tsx

import { notFound } from "next/navigation";
import ExportClient from "./ExportClient";

type PageProps = {
  params: Promise<{ caseId: string }>;
};

export default async function ExportPage({ params }: PageProps) {
  const { caseId } = await params;

  if (!caseId || typeof caseId !== "string") notFound();

  return <ExportClient caseId={caseId} />;
}

