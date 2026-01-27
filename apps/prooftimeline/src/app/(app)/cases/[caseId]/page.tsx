// src/app/(app)/cases/[caseId]/page.tsx

import { notFound } from "next/navigation";
import CaseClient from "./CaseClient";

type PageProps = {
  params: Promise<{ caseId: string }>;
};

export default async function CasePage({ params }: PageProps) {
  const { caseId } = await params;

  if (!caseId || typeof caseId !== "string") {
    notFound();
  }

  return <CaseClient caseId={caseId} />;
}

