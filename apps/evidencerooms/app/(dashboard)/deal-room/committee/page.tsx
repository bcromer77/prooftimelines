"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { CommitteeControls } from "@/components/deal-room/CommitteeControls"
import { CommitteeTable } from "@/components/deal-room/CommitteeTable"
import { ExportButtons } from "@/components/deal-room/ExportButtons"
import { Button } from "@/components/ui/button"
import { MOCK_DOSSIERS } from "@/lib/mock-data"
import { sortDossiersByVariable, sortDossiersByDate } from "@/lib/deal-room/filtering"
import { GitCompare } from "lucide-react"

export default function CommitteePage() {
  // Filter and sort state
  const [decisionFilter, setDecisionFilter] = useState<"GO" | "NO_GO" | "ANY">("ANY")
  const [sortVariable, setSortVariable] = useState("updatedAt")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")

  // Selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  // Filter and sort dossiers
  const filteredDossiers = useMemo(() => {
    let result = MOCK_DOSSIERS.filter((d) => {
      if (decisionFilter === "ANY") return true
      return d.decision === decisionFilter
    })

    // Sort
    if (sortVariable === "updatedAt") {
      result = sortDossiersByDate(result, sortDirection)
    } else {
      result = sortDossiersByVariable(result, sortVariable, sortDirection)
    }

    return result
  }, [decisionFilter, sortVariable, sortDirection])

  return (
    <div className="space-y-4">
      {/* Controls row */}
      <div className="flex items-center justify-between">
        <CommitteeControls
          decisionFilter={decisionFilter}
          onDecisionFilterChange={setDecisionFilter}
          sortVariable={sortVariable}
          onSortVariableChange={setSortVariable}
          sortDirection={sortDirection}
          onSortDirectionChange={setSortDirection}
        />

        <div className="flex items-center gap-3">
          {selectedIds.length >= 2 && (
            <Link href={`/deal-room/compare?selected=${selectedIds.join(",")}`}>
              <Button variant="default" size="sm" className="gap-2">
                <GitCompare className="h-4 w-4" />
                Compare Selected
              </Button>
            </Link>
          )}
          <ExportButtons disabled={selectedIds.length === 0} />
        </div>
      </div>

      {/* Info row */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {filteredDossiers.length} deal{filteredDossiers.length !== 1 ? "s" : ""}
        </span>
        {selectedIds.length > 0 && (
          <span className="text-xs">
            {selectedIds.length}/5 selected
            <button
              onClick={() => setSelectedIds([])}
              className="ml-2 text-muted-foreground hover:text-foreground"
            >
              Clear
            </button>
          </span>
        )}
      </div>

      {/* Table */}
      <CommitteeTable
        dossiers={filteredDossiers}
        sortVariable={sortVariable}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
      />

      {/* Instructions */}
      <div className="rounded-lg border border-border bg-secondary/30 px-4 py-3 text-xs text-muted-foreground">
        <span className="font-medium text-foreground">Committee View:</span>{" "}
        Read-only access to historical screenings. Sort by any variable, filter by decision, and export comparison tables for committee meetings.
      </div>
    </div>
  )
}
