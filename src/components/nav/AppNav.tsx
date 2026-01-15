"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Small utility to join class names safely
 */
function cls(...x: (string | false | null | undefined)[]) {
  return x.filter(Boolean).join(" ");
}

/**
 * Progress-spine link (Ingest → Chronology → Export)
 */
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
        className="text-sm rounded-md px-3 py-2 border opacity-50 cursor-not-allowed"
        title="Not available yet"
      >
        {label}
      </span>
    );
  }

  return (
    <Link
      href={href}
      className={cls(
        "text-sm rounded-md px-3 py-2 border transition",
        active ? "bg-muted/50" : "hover:bg-muted/30"
      )}
    >
      {label}
    </Link>
  );
}

/**
 * Context tool chip (Calendar, Search, Range, Markers)
 * These are UI affordances only at this stage.
 */
function ToolChip({
  label,
  disabled,
}: {
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={cls(
        "text-xs rounded-full px-3 py-1 border transition",
        "hover:bg-muted/30",
        disabled && "opacity-50 cursor-not-allowed"
      )}
      title={disabled ? "Not available yet" : undefined}
    >
      {label}
    </button>
  );
}

export default function AppNav() {
  const pathname = usePathname() || "";

  // Match /cases/[caseId]/...
  const caseMatch = pathname.match(/^\/cases\/([^/]+)/);
  const caseId = caseMatch?.[1] || null;

  const onIngest = pathname === "/cases";
  const onChronology = Boolean(caseId && pathname === `/cases/${caseId}`);
  const onExport = Boolean(caseId && pathname.startsWith(`/cases/${caseId}/export`));

  const exportHref = caseId ? `/cases/${caseId}/export` : "/cases";
  const showTools = Boolean(caseId);

  return (
    <header className="sticky top-0 z-20 bg-background/80 backdrop-blur border-b">
      {/* Row 1 — Brand + Progress Spine */}
      <div className="mx-auto max-w-6xl px-6 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="font-semibold">
            ProofTimeline
          </Link>
          <span className="text-xs text-muted-foreground hidden sm:inline">
            Private. Calm. Chronological.
          </span>
        </div>

        <nav className="flex items-center gap-2">
          <StepLink
            href="/cases"
            label="Ingest"
            active={onIngest}
          />
          <span className="text-xs text-muted-foreground">→</span>
          <StepLink
            href={caseId ? `/cases/${caseId}` : "/cases"}
            label="Chronology"
            active={onChronology}
            disabled={!caseId}
          />
          <span className="text-xs text-muted-foreground">→</span>
          <StepLink
            href={exportHref}
            label="Export"
            active={onExport}
            disabled={!caseId}
          />
        </nav>
      </div>

      {/* Row 2 — Case Context + Tools (REM-style) */}
      {showTools ? (
        <div className="border-t bg-background/60">
          <div className="mx-auto max-w-6xl px-6 py-2 flex items-center justify-between gap-4">
            <div className="text-xs text-muted-foreground">
              Case:{" "}
              <span className="font-mono">
                {caseId?.slice(0, 8)}…
              </span>
            </div>

            <div className="flex items-center gap-2">
              <ToolChip label="Calendar" />
              <ToolChip label="Search" />
              <ToolChip label="Range" />
              <ToolChip label="Markers" />
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}

