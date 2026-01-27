"use client"

import type { Dossier } from "@/lib/types"
import { getPrimaryValue, formatValue, getLastUpdatedAt } from "@/lib/deal-room/selectors"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"

interface CommitteeTableProps {
  dossiers: Dossier[]
  sortVariable: string
  selectedIds: string[]
  onSelectionChange: (ids: string[]) => void
}

export function CommitteeTable({
  dossiers,
  sortVariable,
  selectedIds,
  onSelectionChange,
}: CommitteeTableProps) {
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
      </div>
    )
  }

  // Get sort variable display name
  const getSortValueDisplay = (dossierId: string) => {
    if (sortVariable === "updatedAt") {
      const lastUpdated = getLastUpdatedAt(dossierId)
      return lastUpdated ? new Date(lastUpdated).toLocaleDateString() : "—"
    }

    const { value, unit } = getPrimaryValue(dossierId, sortVariable)
    return formatValue(value, unit)
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
            <th className="p-3 text-right text-xs font-semibold uppercase tracking-wider text-accent">
              {sortVariable === "updatedAt" ? "Last Updated" : "Sort Value"}
            </th>
            <th className="p-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Last Updated
            </th>
          </tr>
        </thead>
        <tbody>
          {dossiers.map((dossier, index) => {
            const isSelected = selectedIds.includes(dossier.id)
            const isDisabled = !isSelected && selectedIds.length >= 5
            const lastUpdated = getLastUpdatedAt(dossier.id)

            return (
              <tr
                key={dossier.id}
                className={cn(
                  "border-b border-border/50 transition-colors",
                  isSelected ? "bg-accent/5" : "hover:bg-secondary/20",
                  isDisabled && "opacity-50"
                )}
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
                <td className="p-3 text-right font-mono text-sm font-medium text-accent">
                  {getSortValueDisplay(dossier.id)}
                </td>
                <td className="p-3 text-right text-xs text-muted-foreground">
                  {lastUpdated
                    ? new Date(lastUpdated).toLocaleDateString()
                    : "—"}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
