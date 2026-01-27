"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function getCaseIdFromPath(pathname: string) {
  // matches /cases/:id and /cases/:id/export
  const m = pathname.match(/^\/cases\/([^\/]+)(?:\/|$)/);
  return m?.[1] ?? null;
}

function cls(...x: Array<string | false | null | undefined>) {
  return x.filter(Boolean).join(" ");
}

export default function AppNav() {
  const pathname = usePathname();
  const caseId = getCaseIdFromPath(pathname);

  const dossiersHref = "/cases";
  const chronologyHref = caseId ? `/cases/${caseId}` : "/cases";
  const exportHref = caseId ? `/cases/${caseId}/export` : "/cases";

  const onCases = pathname === "/cases" || pathname.startsWith("/cases?");
  const onChronology =
    caseId && (pathname === `/cases/${caseId}` || pathname.startsWith(`/cases/${caseId}?`));
  const onExport = caseId && pathname.startsWith(`/cases/${caseId}/export`);

  const pill =
    "rounded-md border border-slate-200 bg-white/60 px-3 py-2 text-sm text-slate-700 hover:bg-white";
  const active =
    "bg-white border-slate-300 text-slate-900";

  const disabled =
    "opacity-50 pointer-events-none";

  return (
    <div className="flex items-center gap-2">
      <Link className={cls(pill, onCases && active)} href={dossiersHref}>
        dossiers
      </Link>

      <span className="text-slate-400">→</span>

      <Link
        className={cls(pill, onChronology && active, !caseId && disabled)}
        href={chronologyHref}
        aria-disabled={!caseId}
      >
        chronology
      </Link>

      <span className="text-slate-400">→</span>

      <Link
        className={cls(pill, onExport && active, !caseId && disabled)}
        href={exportHref}
        aria-disabled={!caseId}
      >
        export
      </Link>
    </div>
  );
}

