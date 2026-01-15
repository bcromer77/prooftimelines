import TimelineView from "@/components/timeline/TimelineView";

export default async function CaseTimelinePage({
  params,
}: {
  params: { caseId: string };
}) {
  return (
    <div className="mx-auto max-w-6xl p-6 space-y-6">
      <TimelineView caseId={params.caseId} />
    </div>
  );
}

