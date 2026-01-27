"use client"

import { Suspense, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { CompareTable } from "@/components/deal-room/CompareTable"
import { ExportButtons } from "@/components/deal-room/ExportButtons"
import { Button } from "@/components/ui/button"
import { MOCK_DOSSIERS } from "@/lib/mock-data"
import { Archive, AlertCircle } from "lucide-react"

function CompareContent() {
  const searchParams = useSearchParams()
  const selectedParam = searchParams.get("selected")
  const selectedIds = selectedParam ? selectedParam.split(",") : []

  const selectedDossiers = useMemo(() => {
    return MOCK_DOSSIERS.filter((d) => selectedIds.includes(d.id))
  }, [selectedIds])

  // Empty state
  if (selectedDossiers.length < 2) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-secondary/20">
        <AlertCircle className="mb-3 h-10 w-10 text-muted-foreground opacity-50" />
        <h3 className="text-lg font-medium text-foreground">
          Select at least 2 deals to compare
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Go to Archive to select deals for comparison
        </p>
        <Link href="/deal-room/archive" className="mt-4">
          <Button variant="outline" className="gap-2 bg-transparent">
            <Archive className="h-4 w-4" />
            Select deals in Archive
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header with export buttons */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-sm text-muted-foreground">
            Comparing {selectedDossiers.length} deal{selectedDossiers.length !== 1 ? "s" : ""}
          </span>
          <div className="flex items-center gap-2 mt-1">
            {selectedDossiers.map((d, i) => (
              <span key={d.id}>
                <span className="text-sm font-medium text-foreground">{d.name}</span>
                {i < selectedDossiers.length - 1 && (
                  <span className="text-muted-foreground"> vs </span>
                )}
              </span>
            ))}
          </div>
        </div>
        <ExportButtons />
      </div>

      {/* Comparison table */}
      <CompareTable dossiers={selectedDossiers} />

      {/* Legend */}
      <div className="flex items-center gap-6 rounded-lg border border-border bg-secondary/30 px-4 py-3 text-xs text-muted-foreground">
        <span className="font-medium text-foreground">Legend:</span>
        <div className="flex items-center gap-2">
          <span className="rounded bg-status-orange/20 px-1.5 py-0.5 text-status-orange">
            Multiple
          </span>
          <span>Multiple sources with different values</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded bg-secondary px-1.5 py-0.5 text-muted-foreground">
            Unit differs
          </span>
          <span>Unit differs from canonical definition</span>
        </div>
      </div>
    </div>
  )
}

export default function ComparePage() {
  return (
    <Suspense fallback={null}>
      <CompareContent />
    </Suspense>
  )
}
