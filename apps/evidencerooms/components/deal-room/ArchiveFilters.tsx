"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, X, Trash2 } from "lucide-react"
import { MOCK_VARIABLES } from "@/lib/mock-data"
import type { FilterRule, FilterOperator, DecisionFilter } from "@/lib/deal-room/filtering"

interface ArchiveFiltersProps {
  rules: FilterRule[]
  onRulesChange: (rules: FilterRule[]) => void
  decisionFilter: DecisionFilter
  onDecisionFilterChange: (filter: DecisionFilter) => void
}

export function ArchiveFilters({
  rules,
  onRulesChange,
  decisionFilter,
  onDecisionFilterChange,
}: ArchiveFiltersProps) {
  const addRule = () => {
    const newRule: FilterRule = {
      id: crypto.randomUUID(),
      variableId: "revenue-n1",
      operator: ">",
      threshold: 0,
    }
    onRulesChange([...rules, newRule])
  }

  const updateRule = (id: string, updates: Partial<FilterRule>) => {
    onRulesChange(
      rules.map((rule) => (rule.id === id ? { ...rule, ...updates } : rule))
    )
  }

  const removeRule = (id: string) => {
    onRulesChange(rules.filter((rule) => rule.id !== id))
  }

  const clearAll = () => {
    onRulesChange([])
    onDecisionFilterChange({ value: "ANY" })
  }

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Filters
        </span>
        {(rules.length > 0 || decisionFilter.value !== "ANY") && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAll}
            className="h-7 text-xs text-muted-foreground hover:text-foreground"
          >
            <Trash2 className="mr-1 h-3 w-3" />
            Clear all
          </Button>
        )}
      </div>

      {/* Decision filter */}
      <div className="mb-4">
        <label className="mb-2 block text-xs text-muted-foreground">Decision</label>
        <Select
          value={decisionFilter.value}
          onValueChange={(value: "GO" | "NO_GO" | "ANY") =>
            onDecisionFilterChange({ value })
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ANY">Any</SelectItem>
            <SelectItem value="GO">GO</SelectItem>
            <SelectItem value="NO_GO">NO GO</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Numeric filter rules */}
      <div className="space-y-2">
        {rules.map((rule) => (
          <div key={rule.id} className="flex items-center gap-2">
            <Select
              value={rule.variableId}
              onValueChange={(value) => updateRule(rule.id, { variableId: value })}
            >
              <SelectTrigger className="flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MOCK_VARIABLES.map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    {v.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={rule.operator}
              onValueChange={(value: FilterOperator) =>
                updateRule(rule.id, { operator: value })
              }
            >
              <SelectTrigger className="w-16">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value=">">{">"}</SelectItem>
                <SelectItem value="<">{"<"}</SelectItem>
                <SelectItem value="=">=</SelectItem>
              </SelectContent>
            </Select>

            <Input
              type="number"
              value={rule.threshold}
              onChange={(e) =>
                updateRule(rule.id, { threshold: Number.parseFloat(e.target.value) || 0 })
              }
              className="w-28"
              placeholder="Value"
            />

            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeRule(rule.id)}
              className="h-9 w-9 text-muted-foreground hover:text-destructive"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={addRule}
        className="mt-3 w-full gap-2 bg-transparent"
      >
        <Plus className="h-4 w-4" />
        Add filter rule
      </Button>
    </div>
  )
}
