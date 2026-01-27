"use client";

import TimelineView from "@/components/timeline/TimelineView";

export default function CaseClient({ caseId }: { caseId: string }) {
  return (
    <div className="min-h-screen">
      <TimelineView caseId={caseId} />
    </div>
  );
}
