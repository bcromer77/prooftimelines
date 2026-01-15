"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function cls(...x: (string | false | null | undefined)[]) {
  return x.filter(Boolean).join(" ");
}

function StepLink({
  href,
  label,
  active,
  disabled,
}: {
  href: string;
  label: string;
  active: boolean;
  disabled?: boolean;
}) {
  if (disabled) {
    return (
      <span
        className="text-sm rounded-md px-3 py-2 border border-slate-200 bg-white/50 opacity-50 cursor-not-allowed"
        title="not available yet"
      >
        {label}
      </span>
    );
  }

  return (
    <Link
      href={href}
      className={cls(
        "text-sm rounded-md px-3 py-2 border border-slate-200 bg-white/50 transition",
        active ? "bg-white" : "hover:bg-white/80"
      )}
    >
      {label}
    </Link>
  );
}

function ToolChip({ label, disabled }: { label: string; disabled?: boolean }) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={cls(
        "text-xs rounded-full px-3 py-1 border border-slate-200 bg-white/50 transition",
        "hover:bg-white/80",
        disabled && "opacity-50 cursor-not-allowed"
      )}
      title={disabled ? "not available yet" : undefined}
    >
      {label}
    </button>
  );
}

export default function AppNav() {
  const pathname = usePathname() || "";

  // /cases/[caseId]/...
  const caseMatch = pathname.match(/^\/cases\/([^/]+)/);
  const caseId = caseMatch?.[1] || null;

  const onIngest = pathname === "/cases";
  const onChronology = caseId && pathname === `/cases/${caseId}`;
  const onExport = caseId && pathname.startsWith(`/cases/${caseId}/export`);

  const exportHref = caseId ? `/cases/${caseId}/export` : "/cases";
  const showTools = Boolean(caseId);

  return (
    <header className="sticky top-0 z-20 bg-white/80 backdrop-blur border-b border-slate-200">
      {/* Row 1 */}
      <div className="mx-auto max-w-6xl px-6 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="font-semibold text-slate-900">
            ProofTimeline
          </Link>
          <span className="text-xs text-slate-600 hidden sm:inline">
            calm chronology for unstructured reality
          </span>
        </div>

        <nav className="flex items-center gap-2">
          <StepLink href="/cases" label="dossiers" active={Boolean(onIngest)} />
          <span className="text-xs text-slate-400">→</span>
          <StepLink
            href={caseId ? `/cases/${caseId}` : "/cases"}
            label="chronology"
            active={Boolean(onChronology)}
            disabled={!caseId}
          />
          <span className="text-xs text-slate-400">→</span>
          <StepLink
            href={exportHref}
            label="export"
            active={Boolean(onExport)}
            disabled={!caseId}
          />
        </nav>
      </div>

      {/* Row 2 */}
      {showTools ? (
        <div className="border-t border-slate-200 bg-white/60">
          <div className="mx-auto max-w-6xl px-6 py-2 flex items-center justify-between gap-4">
            <div className="text-xs text-slate-600">
              dossier{" "}
              <span className="font-mono text-slate-700">
                {caseId?.slice(0, 8)}…
              </span>
            </div>

            <div className="flex items-center gap-2">
              <ToolChip label="calendar" />
              <ToolChip label="search" />
              <ToolChip label="range" />
              <ToolChip label="markers" />
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}

