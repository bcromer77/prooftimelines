"use client"

import { useState, useMemo, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { ArchiveFilters } from "@/components/deal-room/ArchiveFilters"
import { DealArchiveTable } from "@/components/deal-room/DealArchiveTable"
import { SelectedDealsBar } from "@/components/deal-room/SelectedDealsBar"
import { MOCK_DOSSIERS } from "@/lib/mock-data"
import { filterDossiers, type FilterRule, type DecisionFilter } from "@/lib/deal-room/filtering"

function ArchiveContent() {
  const searchParams = useSearchParams()
  const baseId = searchParams.get("base")

  // Selection state (max 5)
  const [selectedIds, setSelectedIds] = useState<string[]>(
    baseId ? [baseId] : []
  )

  // Filter state
  const [rules, setRules] = useState<FilterRule[]>([])
  const [decisionFilter, setDecisionFilter] = useState<DecisionFilter>({ value: "ANY" })

  // Filtered dossiers
  const filteredDossiers = useMemo(() => {
    return filterDossiers(MOCK_DOSSIERS, rules, decisionFilter)
  }, [rules, decisionFilter])

  const handleRemove = (id: string) => {
    setSelectedIds(selectedIds.filter((s) => s !== id))
  }

  const handleClear = () => {
    setSelectedIds([])
  }

  return (
    <>
      <div className="grid grid-cols-[280px_1fr] gap-6">
        {/* Filters sidebar */}
        <div>
          <ArchiveFilters
            rules={rules}
            onRulesChange={setRules}
            decisionFilter={decisionFilter}
            onDecisionFilterChange={setDecisionFilter}
          />
        </div>

        {/* Results table */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {filteredDossiers.length} deal{filteredDossiers.length !== 1 ? "s" : ""} found
            </span>
            {selectedIds.length > 0 && (
              <span className="text-xs text-muted-foreground">
                {selectedIds.length}/5 selected
              </span>
            )}
          </div>
          <DealArchiveTable
            dossiers={filteredDossiers}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
          />
        </div>
      </div>

      {/* Floating selection bar */}
      <SelectedDealsBar
        selectedIds={selectedIds}
        onRemove={handleRemove}
        onClear={handleClear}
      />
    </>
  )
}

export default function ArchivePage() {
  return (
    <Suspense fallback={null}>
      <ArchiveContent />
    </Suspense>
  )
}
