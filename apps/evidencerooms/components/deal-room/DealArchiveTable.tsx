"use client"

import type { Dossier } from "@/lib/types"
import { getKeyVariableValues, getLastUpdatedAt } from "@/lib/deal-room/selectors"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { ExternalLink } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface DealArchiveTableProps {
  dossiers: Dossier[]
  selectedIds: string[]
  onSelectionChange: (ids: string[]) => void
}

export function DealArchiveTable({
  dossiers,
  selectedIds,
  onSelectionChange,
}: DealArchiveTableProps) {
  const toggleSelection = (id: string) => {
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter((s) => s !== id))
    } else if (selectedIds.length < 5) {
      onSelectionChange([...selectedIds, id])
    }
  }

  const toggleAll = () => {
    if (selectedIds.length === dossiers.length) {
      onSelectionChange([])
    } else {
      onSelectionChange(dossiers.slice(0, 5).map((d) => d.id))
    }
  }

  if (dossiers.length === 0) {
    return (
      <div className="flex h-48 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-secondary/20 text-muted-foreground">
        <p className="text-sm">No deals match your filters</p>
        <p className="mt-1 text-xs opacity-70">Try adjusting your filter criteria</p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border bg-secondary/30">
            <th className="w-12 p-3 text-left">
              <Checkbox
                checked={selectedIds.length === dossiers.length && dossiers.length > 0}
                onCheckedChange={toggleAll}
              />
            </th>
            <th className="p-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Deal
            </th>
            <th className="p-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Decision
            </th>
            <th className="p-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Revenue (N-1)
            </th>
            <th className="p-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              EBITDA (N-1)
            </th>
            <th className="p-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Net Debt/EBITDA
            </th>
            <th className="p-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Last Updated
            </th>
            <th className="w-12 p-3" />
          </tr>
        </thead>
        <tbody>
          {dossiers.map((dossier, index) => {
            const keyValues = getKeyVariableValues(dossier.id)
            const lastUpdated = getLastUpdatedAt(dossier.id)
            const isSelected = selectedIds.includes(dossier.id)
            const isDisabled = !isSelected && selectedIds.length >= 5

            return (
              <tr
                key={dossier.id}
                className={cn(
                  "border-b border-border/50 transition-colors",
                  isSelected ? "bg-accent/5" : "hover:bg-secondary/20",
                  isDisabled && "opacity-50"
                )}
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <td className="p-3">
                  <Checkbox
                    checked={isSelected}
                    disabled={isDisabled}
                    onCheckedChange={() => toggleSelection(dossier.id)}
                  />
                </td>
                <td className="p-3">
                  <div className="flex flex-col">
                    <span className="font-medium text-foreground">{dossier.name}</span>
                    <span className="text-xs text-muted-foreground capitalize">
                      {dossier.status.toLowerCase()}
                    </span>
                  </div>
                </td>
                <td className="p-3">
                  {dossier.decision ? (
                    <span
                      className={cn(
                        "rounded px-2 py-1 text-xs font-medium",
                        dossier.decision === "GO"
                          ? "bg-status-green/20 text-status-green"
                          : "bg-status-red/20 text-status-red"
                      )}
                    >
                      {dossier.decision === "GO" ? "GO" : "NO GO"}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </td>
                <td className="p-3 text-right font-mono text-sm text-foreground">
                  {keyValues.revenue}
                </td>
                <td className="p-3 text-right font-mono text-sm text-foreground">
                  {keyValues.ebitda}
                </td>
                <td className="p-3 text-right font-mono text-sm text-foreground">
                  {keyValues.netDebtToEbitda}
                </td>
                <td className="p-3 text-right text-xs text-muted-foreground">
                  {lastUpdated
                    ? new Date(lastUpdated).toLocaleDateString()
                    : "—"}
                </td>
                <td className="p-3">
                  <Link href={`/variables?dealId=${dossier.id}`}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      title="Open screening"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </Link>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
