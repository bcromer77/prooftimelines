"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { MOCK_VARIABLES, MOCK_CANDIDATES, computeStatus } from "@/lib/mock-data"
import { Card } from "@/components/ui/card"
import { StatusPill } from "@/components/status-pill"
import { Input } from "@/components/ui/input"
import { Search, ChevronRight, Filter, ExternalLink, FileText } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export default function VariablesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "GREEN" | "ORANGE" | "RED">("all")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  const variablesWithStatus = useMemo(() => {
    return MOCK_VARIABLES.map((variable) => {
      const candidates = MOCK_CANDIDATES.filter(
        (c) => c.variableId === variable.id
      )
      const status = computeStatus(candidates)
      const primaryCandidate = candidates[0]

      return {
        ...variable,
        status,
        candidates,
        primaryValue: primaryCandidate?.value,
        primaryUnit: primaryCandidate?.unit,
        primarySource: primaryCandidate?.source,
        primaryLocation: primaryCandidate?.location,
        primarySnippet: primaryCandidate?.snippet,
      }
    })
  }, [])

  const filteredVariables = useMemo(() => {
    return variablesWithStatus.filter((v) => {
      const matchesSearch = v.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesFilter = filterStatus === "all" || v.status === filterStatus
      const matchesCategory = selectedCategory === "all" || v.category === selectedCategory
      return matchesSearch && matchesFilter && matchesCategory
    })
  }, [variablesWithStatus, searchQuery, filterStatus, selectedCategory])

  const categories = ["all", "financial", "capital", "customer", "market", "deal"]

  const formatValue = (value: number | string | undefined, unit: string | null | undefined) => {
    if (value === undefined) return null
    if (typeof value === "number") {
      const millions = value / 1_000_000
      if (millions >= 1) {
        return `€${millions.toFixed(1)}m`
      }
      if (unit === "%") return `${value}%`
      return `${value}${unit ? ` ${unit}` : ""}`
    }
    return `${value}${unit ? ` ${unit}` : ""}`
  }

  return (
    <div className="mx-auto max-w-5xl">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="mb-1 text-2xl font-semibold tracking-tight text-foreground">
          Variables
        </h1>
        <p className="text-sm text-muted-foreground">
          15 predefined PE screening variables with extracted values
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search variables..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 border-border bg-card text-foreground placeholder:text-muted-foreground"
          />
        </div>
        <div className="flex items-center gap-1">
          {categories.map((cat) => (
            <Button
              key={cat}
              variant="ghost"
              size="sm"
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "text-xs capitalize",
                selectedCategory === cat
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {cat}
            </Button>
          ))}
        </div>
        <div className="flex items-center gap-1 border-l border-border pl-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setFilterStatus("all")}
            className={cn(
              "text-xs",
              filterStatus === "all" ? "bg-secondary" : ""
            )}
          >
            All
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setFilterStatus(filterStatus === "GREEN" ? "all" : "GREEN")}
            className={cn(filterStatus === "GREEN" && "ring-1 ring-status-green")}
          >
            <div className="h-2 w-2 rounded-full bg-status-green" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setFilterStatus(filterStatus === "ORANGE" ? "all" : "ORANGE")}
            className={cn(filterStatus === "ORANGE" && "ring-1 ring-status-orange")}
          >
            <div className="h-2 w-2 rounded-full bg-status-orange" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setFilterStatus(filterStatus === "RED" ? "all" : "RED")}
            className={cn(filterStatus === "RED" && "ring-1 ring-status-red")}
          >
            <div className="h-2 w-2 rounded-full bg-status-red" />
          </Button>
        </div>
      </div>

      {/* Variables list - value-first display */}
      <div className="space-y-2">
        {filteredVariables.map((variable, index) => {
          const formattedValue = formatValue(variable.primaryValue, variable.primaryUnit)
          const hasMultipleValues = variable.candidates.length > 1
          const valuesConflict = hasMultipleValues && variable.status === "ORANGE"

          return (
            <Card
              key={variable.id}
              className={cn(
                "group border-border bg-card overflow-hidden transition-all duration-200 hover:bg-secondary/30 animate-fade-in",
                variable.status === "ORANGE" && "border-l-2 border-l-status-orange"
              )}
              style={{ animationDelay: `${index * 30}ms` }}
            >
              <div className="p-4">
                {/* Top row: Variable name with value + status */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Variable name : Value */}
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="font-medium text-foreground">
                        {variable.name.split("(")[0].trim()}
                      </span>
                      {variable.name.includes("(") && (
                        <span className="text-sm text-muted-foreground">
                          ({variable.name.split("(")[1]}
                        </span>
                      )}
                      {formattedValue && (
                        <>
                          <span className="text-muted-foreground">:</span>
                          <span className={cn(
                            "font-mono text-lg font-semibold",
                            valuesConflict ? "text-status-orange" : "text-foreground"
                          )}>
                            {valuesConflict ? `${variable.candidates.length} values` : formattedValue}
                          </span>
                        </>
                      )}
                      {!formattedValue && variable.status === "RED" && (
                        <>
                          <span className="text-muted-foreground">:</span>
                          <span className="text-sm text-status-red">No data</span>
                        </>
                      )}
                    </div>

                    {/* Snippet - clickable */}
                    {variable.primarySnippet && (
                      <Link
                        href={`/evidence-map?variable=${variable.id}`}
                        className="mt-2 flex items-start gap-2 group/snippet"
                      >
                        <FileText className="mt-0.5 h-3 w-3 text-muted-foreground flex-shrink-0" />
                        <span className="text-sm text-muted-foreground group-hover/snippet:text-accent transition-colors line-clamp-1">
                          "{variable.primarySnippet}"
                        </span>
                        <span className="text-xs text-muted-foreground/60 flex-shrink-0">
                          — {variable.primarySource}, {variable.primaryLocation}
                        </span>
                        <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover/snippet:opacity-100 transition-opacity flex-shrink-0" />
                      </Link>
                    )}
                  </div>

                  {/* Status + navigate */}
                  <div className="flex items-center gap-3">
                    <StatusPill status={variable.status} size="sm" />
                    <Link href={`/evidence-map?variable=${variable.id}`}>
                      <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                    </Link>
                  </div>
                </div>

                {/* Category badge */}
                <div className="mt-3 flex items-center gap-2">
                  <span className="rounded bg-secondary px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                    {variable.category}
                  </span>
                  {variable.isCalculated && (
                    <span className="rounded bg-accent/10 px-2 py-0.5 text-[10px] uppercase tracking-wider text-accent">
                      Calculated
                    </span>
                  )}
                  {hasMultipleValues && (
                    <span className="text-[10px] text-muted-foreground">
                      {variable.candidates.length} sources
                    </span>
                  )}
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Results count */}
      <div className="mt-6 text-center text-xs text-muted-foreground">
        Showing {filteredVariables.length} of {variablesWithStatus.length} variables
      </div>
    </div>
  )
}
