"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { MOCK_VARIABLES } from "@/lib/mock-data"
import { ArrowUpDown } from "lucide-react"

interface CommitteeControlsProps {
  decisionFilter: "GO" | "NO_GO" | "ANY"
  onDecisionFilterChange: (value: "GO" | "NO_GO" | "ANY") => void
  sortVariable: string
  onSortVariableChange: (value: string) => void
  sortDirection: "asc" | "desc"
  onSortDirectionChange: (value: "asc" | "desc") => void
}

export function CommitteeControls({
  decisionFilter,
  onDecisionFilterChange,
  sortVariable,
  onSortVariableChange,
  sortDirection,
  onSortDirectionChange,
}: CommitteeControlsProps) {
  return (
    <div className="flex items-center gap-4 rounded-lg border border-border bg-card p-4">
      {/* Decision filter */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-muted-foreground">Decision:</span>
        <Select value={decisionFilter} onValueChange={onDecisionFilterChange}>
          <SelectTrigger className="w-28">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ANY">Any</SelectItem>
            <SelectItem value="GO">GO</SelectItem>
            <SelectItem value="NO_GO">NO GO</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="h-6 w-px bg-border" />

      {/* Sort by variable */}
      <div className="flex items-center gap-2">
        <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
        <span className="text-xs font-medium text-muted-foreground">Sort by:</span>
        <Select value={sortVariable} onValueChange={onSortVariableChange}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="updatedAt">Last Updated</SelectItem>
            {MOCK_VARIABLES.map((v) => (
              <SelectItem key={v.id} value={v.id}>
                {v.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Sort direction */}
        <Select value={sortDirection} onValueChange={onSortDirectionChange}>
          <SelectTrigger className="w-24">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="desc">Desc</SelectItem>
            <SelectItem value="asc">Asc</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
