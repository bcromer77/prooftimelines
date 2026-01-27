import type { Candidate, Dossier, Variable } from "@/lib/types"
import {
  MOCK_CANDIDATES,
  MOCK_DOSSIERS,
  MOCK_FILES,
  MOCK_VARIABLES,
  computeStatus,
} from "@/lib/mock-data"

/**
 * Get the primary value for a variable in a dossier
 * - If GREEN: return candidate with highest confidence
 * - If ORANGE: return best candidate value with "Multiple" indicator
 * - If no candidates: return null
 */
export function getPrimaryValue(
  dossierId: string,
  variableId: string,
  candidates: Candidate[] = MOCK_CANDIDATES
): { value: number | string | null; unit: string | null; hasMultiple: boolean; candidates: Candidate[] } {
  const varCandidates = candidates.filter(
    (c) => c.dossierId === dossierId && c.variableId === variableId
  )

  if (varCandidates.length === 0) {
    return { value: null, unit: null, hasMultiple: false, candidates: [] }
  }

  const status = computeStatus(varCandidates)
  const bestCandidate = varCandidates.reduce((best, current) =>
    current.extractionConfidence > best.extractionConfidence ? current : best
  )

  return {
    value: bestCandidate.value,
    unit: bestCandidate.unit,
    hasMultiple: status === "ORANGE" && varCandidates.length > 1,
    candidates: varCandidates,
  }
}

/**
 * Format a numeric value for display (e.g., 45200000 -> "45.2m")
 */
export function formatValue(value: number | string | null, unit: string | null): string {
  if (value === null) return "Not Found"
  if (typeof value === "string") return value

  // Format large numbers
  if (Math.abs(value) >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(1)}bn`
  }
  if (Math.abs(value) >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}m`
  }
  if (Math.abs(value) >= 1_000) {
    return `${(value / 1_000).toFixed(1)}k`
  }

  // For percentages or small numbers
  if (unit === "%" || unit === "FTE") {
    return value.toString()
  }

  return value.toFixed(1)
}

/**
 * Get the last updated date for a dossier (max uploadedAt across files OR dossier updatedAt)
 */
export function getLastUpdatedAt(dossierId: string): string {
  const dossierFiles = MOCK_FILES.filter((f) => f.dossierId === dossierId)
  
  if (dossierFiles.length === 0) {
    const dossier = getDossierById(dossierId)
    return dossier?.updatedAt || ""
  }

  const maxUploadedAt = dossierFiles.reduce((max, file) => {
    const fileDate = new Date(file.uploadedAt).getTime()
    return fileDate > max ? fileDate : max
  }, 0)

  return new Date(maxUploadedAt).toISOString()
}

/**
 * Calculate completeness percentage (# GREEN variables / 15)
 */
export function getCompletenessPct(dossierId: string): number {
  let greenCount = 0
  for (const variable of MOCK_VARIABLES) {
    const candidates = MOCK_CANDIDATES.filter(
      (c) => c.dossierId === dossierId && c.variableId === variable.id
    )
    if (computeStatus(candidates) === "GREEN") {
      greenCount++
    }
  }
  return Math.round((greenCount / MOCK_VARIABLES.length) * 100)
}

/**
 * Get key variable values for a dossier (Revenue, EBITDA, Net Debt/EBITDA)
 */
export function getKeyVariableValues(dossierId: string): {
  revenue: string
  ebitda: string
  netDebtToEbitda: string
} {
  const revenueData = getPrimaryValue(dossierId, "revenue-n1")
  const ebitdaData = getPrimaryValue(dossierId, "ebitda-n1")
  const netDebtData = getPrimaryValue(dossierId, "net-debt")

  const revenue = formatValue(revenueData.value, revenueData.unit)
  const ebitda = formatValue(ebitdaData.value, ebitdaData.unit)

  // Calculate Net Debt / EBITDA ratio
  let netDebtToEbitda = "Not Found"
  if (
    typeof netDebtData.value === "number" &&
    typeof ebitdaData.value === "number" &&
    ebitdaData.value !== 0
  ) {
    const ratio = netDebtData.value / ebitdaData.value
    netDebtToEbitda = `${ratio.toFixed(1)}x`
  }

  return { revenue, ebitda, netDebtToEbitda }
}

/**
 * Get dossier by ID
 */
export function getDossierById(dossierId: string): Dossier | undefined {
  return MOCK_DOSSIERS.find((d: Dossier) => d.id === dossierId)
}

/**
 * Get variable by ID
 */
export function getVariableById(variableId: string): Variable | undefined {
  return MOCK_VARIABLES.find((v) => v.id === variableId)
}

/**
 * Get canonical unit for a variable
 */
export function getCanonicalUnit(variableId: string): string {
  const variable = getVariableById(variableId)
  if (!variable) return ""
  // Return first unit hint as canonical
  return variable.unitHints[0] || ""
}
