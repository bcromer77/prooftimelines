import CasesList from "@/components/cases/CasesList";

export default function CasesPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-10 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          Dossiers
        </h1>
        <p className="text-sm text-slate-600">
          a dossier is a bounded timeline. no cross-dossier access.
        </p>
      </div>

      <CasesList />
    </div>
  );
}

