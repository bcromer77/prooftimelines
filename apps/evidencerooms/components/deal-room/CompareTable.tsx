"use client"

import { useState } from "react"
import type { Dossier, Variable, Candidate } from "@/lib/types"
import { MOCK_VARIABLES } from "@/lib/mock-data"
import { getPrimaryValue, formatValue, getCanonicalUnit, getVariableById } from "@/lib/deal-room/selectors"
import { CandidateSidePanel } from "./CandidateSidePanel"
import { cn } from "@/lib/utils"

interface CompareTableProps {
  dossiers: Dossier[]
}

export function CompareTable({ dossiers }: CompareTableProps) {
  const [selectedCell, setSelectedCell] = useState<{
    variable: Variable
    candidates: Candidate[]
  } | null>(null)

  const handleCellClick = (variableId: string, dossierId: string) => {
    const variable = getVariableById(variableId)
    if (!variable) return

    const { candidates } = getPrimaryValue(dossierId, variableId)
    if (candidates.length > 0) {
      setSelectedCell({ variable, candidates })
    }
  }

  return (
    <>
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-secondary/30">
              <th className="sticky left-0 z-10 min-w-[200px] bg-secondary/30 p-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Variable
              </th>
              {dossiers.map((dossier) => (
                <th
                  key={dossier.id}
                  className="min-w-[140px] p-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  <div className="flex flex-col items-center gap-1">
                    <span>{dossier.name}</span>
                    {dossier.decision && (
                      <span
                        className={cn(
                          "rounded px-1.5 py-0.5 text-[10px]",
                          dossier.decision === "GO"
                            ? "bg-status-green/20 text-status-green"
                            : "bg-status-red/20 text-status-red"
                        )}
                      >
                        {dossier.decision === "GO" ? "GO" : "NO GO"}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MOCK_VARIABLES.map((variable, index) => {
              const canonicalUnit = getCanonicalUnit(variable.id)

              return (
                <tr
                  key={variable.id}
                  className={cn(
                    "border-b border-border/50 transition-colors hover:bg-secondary/10",
                    index % 2 === 0 ? "bg-card" : "bg-card/50"
                  )}
                >
                  <td className="sticky left-0 z-10 bg-inherit p-3">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-foreground">
                        {variable.name}
                      </span>
                      {canonicalUnit && (
                        <span className="text-xs text-muted-foreground">
                          Unit: {canonicalUnit}
                        </span>
                      )}
                    </div>
                  </td>
                  {dossiers.map((dossier) => {
                    const { value, unit, hasMultiple, candidates } = getPrimaryValue(
                      dossier.id,
                      variable.id
                    )
                    const unitDiffers = unit && canonicalUnit && unit !== canonicalUnit

                    return (
                      <td key={dossier.id} className="p-3 text-center">
                        {value === null ? (
                          <span className="text-sm text-muted-foreground">Not Found</span>
                        ) : (
                          <button
                            onClick={() => handleCellClick(variable.id, dossier.id)}
                            className="group inline-flex flex-col items-center gap-0.5 transition-colors hover:text-accent"
                            disabled={candidates.length === 0}
                          >
                            <span className="font-mono text-sm font-medium text-foreground group-hover:text-accent">
                              {formatValue(value, unit)}
                              {unit && (
                                <span className="ml-1 text-muted-foreground">
                                  {unit}
                                </span>
                              )}
                            </span>
                            <div className="flex items-center gap-1">
                              {hasMultiple && (
                                <span className="rounded bg-status-orange/20 px-1 py-0.5 text-[9px] text-status-orange">
                                  Multiple
                                </span>
                              )}
                              {unitDiffers && (
                                <span className="rounded bg-secondary px-1 py-0.5 text-[9px] text-muted-foreground">
                                  Unit differs
                                </span>
                              )}
                            </div>
                          </button>
                        )}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Side panel for candidate details */}
      {selectedCell && (
        <CandidateSidePanel
          variable={selectedCell.variable}
          candidates={selectedCell.candidates}
          onClose={() => setSelectedCell(null)}
        />
      )}
    </>
  )
}
