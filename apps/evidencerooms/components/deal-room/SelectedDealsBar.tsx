"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { X, GitCompare } from "lucide-react"
import { MOCK_DOSSIERS } from "@/lib/mock-data"

interface SelectedDealsBarProps {
  selectedIds: string[]
  onRemove: (id: string) => void
  onClear: () => void
}

export function SelectedDealsBar({ selectedIds, onRemove, onClear }: SelectedDealsBarProps) {
  if (selectedIds.length === 0) return null

  const selectedDossiers = MOCK_DOSSIERS.filter((d) => selectedIds.includes(d.id))

  return (
    <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 animate-fade-in">
      <div className="flex items-center gap-4 rounded-xl border border-border bg-card/95 px-4 py-3 shadow-2xl backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">
            {selectedIds.length} deal{selectedIds.length !== 1 ? "s" : ""} selected
          </span>
          <div className="flex items-center gap-1">
            {selectedDossiers.slice(0, 3).map((dossier) => (
              <div
                key={dossier.id}
                className="flex items-center gap-1 rounded-md bg-secondary px-2 py-1"
              >
                <span className="text-xs text-foreground">{dossier.name}</span>
                <button
                  onClick={() => onRemove(dossier.id)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            {selectedDossiers.length > 3 && (
              <span className="text-xs text-muted-foreground">
                +{selectedDossiers.length - 3} more
              </span>
            )}
          </div>
        </div>

        <div className="h-6 w-px bg-border" />

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="text-muted-foreground hover:text-foreground"
          >
            Clear
          </Button>
          <Link href={`/deal-room/compare?selected=${selectedIds.join(",")}`}>
            <Button
              size="sm"
              disabled={selectedIds.length < 2}
              className="gap-2"
            >
              <GitCompare className="h-4 w-4" />
              Compare
              {selectedIds.length < 2 && (
                <span className="text-xs opacity-70">(min 2)</span>
              )}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
