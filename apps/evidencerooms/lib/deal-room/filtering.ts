import type { Dossier } from "@/lib/types"
import { getPrimaryValue } from "./selectors"

export type FilterOperator = ">" | "<" | "="

export interface FilterRule {
  id: string
  variableId: string
  operator: FilterOperator
  threshold: number
}

export interface DecisionFilter {
  value: "GO" | "NO_GO" | "ANY"
}

/**
 * Apply a single numeric filter rule to a dossier
 */
function applyFilterRule(dossierId: string, rule: FilterRule): boolean {
  const { value } = getPrimaryValue(dossierId, rule.variableId)
  
  // If value not found, doesn't match
  if (value === null || typeof value !== "number") {
    return false
  }

  switch (rule.operator) {
    case ">":
      return value > rule.threshold
    case "<":
      return value < rule.threshold
    case "=":
      // Allow small tolerance for floating point
      return Math.abs(value - rule.threshold) < 0.01
    default:
      return false
  }
}

/**
 * Apply decision filter to a dossier
 */
function applyDecisionFilter(dossier: Dossier, filter: DecisionFilter): boolean {
  if (filter.value === "ANY") return true
  if (!dossier.decision) return false
  return dossier.decision === filter.value
}

/**
 * Filter dossiers by a set of filter rules and decision filter
 */
export function filterDossiers(
  dossiers: Dossier[],
  rules: FilterRule[],
  decisionFilter: DecisionFilter
): Dossier[] {
  return dossiers.filter((dossier) => {
    // Check decision filter
    if (!applyDecisionFilter(dossier, decisionFilter)) {
      return false
    }

    // Check all numeric filter rules (AND logic)
    for (const rule of rules) {
      if (!applyFilterRule(dossier.id, rule)) {
        return false
      }
    }

    return true
  })
}

/**
 * Sort dossiers by a variable value
 */
export function sortDossiersByVariable(
  dossiers: Dossier[],
  variableId: string,
  direction: "asc" | "desc"
): Dossier[] {
  return [...dossiers].sort((a, b) => {
    const aValue = getPrimaryValue(a.id, variableId).value
    const bValue = getPrimaryValue(b.id, variableId).value

    // Handle null values (put them at the end)
    if (aValue === null && bValue === null) return 0
    if (aValue === null) return 1
    if (bValue === null) return -1

    // Compare numeric values
    const aNum = typeof aValue === "number" ? aValue : 0
    const bNum = typeof bValue === "number" ? bValue : 0

    return direction === "asc" ? aNum - bNum : bNum - aNum
  })
}

/**
 * Sort dossiers by last updated date
 */
export function sortDossiersByDate(
  dossiers: Dossier[],
  direction: "asc" | "desc"
): Dossier[] {
  return [...dossiers].sort((a, b) => {
    const aDate = new Date(a.updatedAt).getTime()
    const bDate = new Date(b.updatedAt).getTime()
    return direction === "asc" ? aDate - bDate : bDate - aDate
  })
}
