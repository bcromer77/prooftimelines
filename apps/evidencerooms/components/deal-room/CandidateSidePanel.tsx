"use client"

import type { Candidate, Variable } from "@/lib/types"
import { formatValue } from "@/lib/deal-room/selectors"
import { X, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface CandidateSidePanelProps {
  variable: Variable | null
  candidates: Candidate[]
  onClose: () => void
}

export function CandidateSidePanel({ variable, candidates, onClose }: CandidateSidePanelProps) {
  if (!variable || candidates.length === 0) return null

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-96 animate-slide-in border-l border-border bg-card shadow-xl">
      <div className="flex h-14 items-center justify-between border-b border-border px-4">
        <div>
          <h3 className="font-semibold text-foreground">{variable.name}</h3>
          <p className="text-xs text-muted-foreground">{candidates.length} source{candidates.length !== 1 ? "s" : ""}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="overflow-y-auto p-4" style={{ height: "calc(100% - 56px)" }}>
        <div className="space-y-3">
          {candidates
            .sort((a, b) => b.extractionConfidence - a.extractionConfidence)
            .map((candidate) => (
              <div
                key={candidate.id}
                className="rounded-lg border border-border bg-secondary/30 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">
                      {candidate.source}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-foreground">
                      {formatValue(candidate.value, candidate.unit)}
                      {candidate.unit && (
                        <span className="ml-1 text-sm text-muted-foreground">
                          {candidate.unit}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-3 text-xs text-muted-foreground">
                  <div className="flex items-center justify-between">
                    <span>Location</span>
                    <code className="rounded bg-secondary px-2 py-0.5">
                      {candidate.location}
                    </code>
                  </div>
                </div>

                {candidate.snippet && (
                  <div className="mt-3 rounded-md border border-border/50 bg-background/30 p-2">
                    <p className="text-xs text-muted-foreground italic">
                      "{candidate.snippet}"
                    </p>
                  </div>
                )}

                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Confidence</span>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-16 overflow-hidden rounded-full bg-secondary">
                      <div
                        className={cn(
                          "h-full rounded-full",
                          candidate.extractionConfidence >= 0.9
                            ? "bg-status-green"
                            : candidate.extractionConfidence >= 0.7
                              ? "bg-status-orange"
                              : "bg-status-red"
                        )}
                        style={{ width: `${candidate.extractionConfidence * 100}%` }}
                      />
                    </div>
                    <span className="text-muted-foreground">
                      {Math.round(candidate.extractionConfidence * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}
