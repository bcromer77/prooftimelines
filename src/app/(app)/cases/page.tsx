import CasesList from "@/components/cases/CasesList";

export default function CasesPage() {
  return (
    <div className="mx-auto max-w-5xl p-6 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Cases</h1>
        <p className="text-sm text-muted-foreground">
          A case is a bounded timeline. No cross-case access.
        </p>
      </div>

      <CasesList />
    </div>
  );
}

