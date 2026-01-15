"use client";

function cls(...x: (string | false | null | undefined)[]) {
  return x.filter(Boolean).join(" ");
}

export type TimelineViewMode = "baseline" | "events" | "sequence";

export default function TimelineControls({
  searchQuery,
  onSearchChange,
  viewMode,
  onViewChange,
  signalsEnabled,
  onToggleSignals,
  rangeLabel,
}: {
  searchQuery: string;
  onSearchChange: (v: string) => void;

  viewMode: TimelineViewMode;
  onViewChange: (v: TimelineViewMode) => void;

  signalsEnabled: boolean;
  onToggleSignals: () => void;

  // UX-only placeholder readout for now (we’ll wire real dates tomorrow)
  rangeLabel?: string;
}) {
  return (
    <section className="rounded-md border border-slate-200 bg-white/50 p-3">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        {/* left: search */}
        <div className="flex items-center gap-2 w-full md:max-w-md">
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="filter events or evidence…"
            className={cls(
              "h-9 w-full rounded-md px-3 text-sm outline-none",
              "border border-slate-200 bg-white/60 text-slate-800 placeholder:text-slate-500",
              "focus:border-slate-300 focus:bg-white"
            )}
          />
          {searchQuery ? (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className={cls(
                "h-9 px-3 rounded-md text-sm transition",
                "border border-slate-200 bg-white/60 text-slate-700 hover:bg-white/80"
              )}
              title="clear filter"
            >
              clear
            </button>
          ) : null}
        </div>

        {/* right: lenses */}
        <div className="flex flex-wrap items-center gap-2 justify-start md:justify-end">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">view</span>

            <Pill
              active={viewMode === "baseline"}
              onClick={() => onViewChange("baseline")}
              label="baseline"
              title="scope and context (wire fully later)"
            />
            <Pill
              active={viewMode === "events"}
              onClick={() => onViewChange("events")}
              label="events"
              title="full dated chronology"
            />
            <Pill
              active={viewMode === "sequence"}
              onClick={() => onViewChange("sequence")}
              label="sequence"
              title="grouping and phases (wire later)"
            />
          </div>

          <Divider />

          <Pill
            active={signalsEnabled}
            onClick={onToggleSignals}
            label="signals"
            title="assistive prompts: absence, overlap, pattern breaks"
          />

          <Pill
            active={false}
            onClick={() => {}}
            label={rangeLabel ? `range: ${rangeLabel}` : "range"}
            title="limit the visible time window (wire tomorrow)"
            disabled
          />

          <Pill
            active={false}
            onClick={() => {}}
            label="calendar"
            title="jump to a date (wire tomorrow)"
            disabled
          />
        </div>
      </div>
    </section>
  );
}

function Divider() {
  return <span className="h-5 w-px bg-slate-200 mx-1" aria-hidden="true" />;
}

function Pill({
  label,
  active,
  onClick,
  disabled,
  title,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  disabled?: boolean;
  title?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cls(
        "h-9 px-3 rounded-full text-sm transition border",
        "border-slate-200 bg-white/60 text-slate-700 hover:bg-white/80",
        active && "border-slate-300 bg-white text-slate-900",
        disabled && "opacity-50 cursor-not-allowed hover:bg-white/60"
      )}
    >
      {label}
    </button>
  );
}

