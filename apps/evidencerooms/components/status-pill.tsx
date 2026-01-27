"use client"

import { cn } from "@/lib/utils"
import type { ExtractionStatus } from "@/lib/types"

interface StatusPillProps {
  status: ExtractionStatus
  showLabel?: boolean
  size?: "sm" | "md"
  className?: string
}

const statusConfig: Record<ExtractionStatus, { 
  label: string
  bgClass: string
  textClass: string
  dotClass: string
}> = {
  GREEN: {
    label: "GREEN",
    bgClass: "bg-status-green/20",
    textClass: "text-status-green",
    dotClass: "bg-status-green",
  },
  ORANGE: {
    label: "ORANGE",
    bgClass: "bg-status-orange/20",
    textClass: "text-status-orange",
    dotClass: "bg-status-orange",
  },
  RED: {
    label: "RED",
    bgClass: "bg-status-red/20",
    textClass: "text-status-red",
    dotClass: "bg-status-red",
  },
}

export function StatusPill({ status, showLabel = true, size = "md", className }: StatusPillProps) {
  const config = statusConfig[status]

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium transition-all duration-200 hover:scale-105 cursor-pointer",
        config.bgClass,
        config.textClass,
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs",
        className
      )}
    >
      <span className={cn(
        "rounded-full",
        config.dotClass,
        size === "sm" ? "h-1.5 w-1.5" : "h-2 w-2"
      )} />
      {showLabel && config.label}
    </span>
  )
}
