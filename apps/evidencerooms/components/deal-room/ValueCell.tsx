"use client"

import { cn } from "@/lib/utils"
import { formatValue, getPrimaryValue, getCanonicalUnit } from "@/lib/deal-room/selectors"

interface ValueCellProps {
  dossierId: string
  variableId: string
  onClick?: () => void
  className?: string
}

export function ValueCell({ dossierId, variableId, onClick, className }: ValueCellProps) {
  const { value, unit, hasMultiple, candidates } = getPrimaryValue(dossierId, variableId)
  const canonicalUnit = getCanonicalUnit(variableId)
  const unitDiffers = unit && canonicalUnit && unit !== canonicalUnit

  if (value === null) {
    return (
      <div className={cn("text-sm text-muted-foreground", className)}>
        Not Found
      </div>
    )
  }

  const displayValue = formatValue(value, unit)

  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className={cn(
        "text-left text-sm transition-colors",
        onClick && "hover:text-accent cursor-pointer",
        className
      )}
    >
      <span className="font-medium text-foreground">
        {displayValue}
        {unit && <span className="ml-1 text-muted-foreground">{unit}</span>}
      </span>
      {hasMultiple && (
        <span className="ml-2 rounded bg-status-orange/20 px-1.5 py-0.5 text-[10px] text-status-orange">
          Multiple
        </span>
      )}
      {unitDiffers && (
        <span className="ml-2 rounded bg-secondary px-1.5 py-0.5 text-[10px] text-muted-foreground">
          Unit differs
        </span>
      )}
    </button>
  )
}
