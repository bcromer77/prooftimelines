// ProofLines DD Data Types

export type ExtractionStatus = "GREEN" | "ORANGE" | "RED"

export type FileType = "pdf" | "xlsx" | "docx" | "pptx" | "eml"

export type FileStatus = "Pending" | "Ingesting" | "Ingested" | "Error"

export interface Dossier {
  id: string
  name: string
  status: "Active" | "Earlier" | "Archived"
  createdAt: string
  updatedAt: string
  decision?: "GO" | "NO_GO" // Recorded decision for deal room
}

export interface UploadedFile {
  id: string
  dossierId: string
  name: string
  type: FileType
  status: FileStatus
  size: number
  uploadedAt: string
  createdAt?: string // File creation date (where available)
}

export interface Variable {
  id: string
  name: string
  category: "financial" | "capital" | "customer" | "market" | "deal"
  isCalculated: boolean
  searchQueries: string[]
  typicalLocations: string[]
  unitHints: string[]
}

export interface Candidate {
  id: string
  dossierId: string
  variableId: string
  value: number | string
  unit: string | null
  source: string
  location: string
  snippet: string
  extractionConfidence: number
  period: string | null
  extractedAt: string
}

export interface CoverageCell {
  variableId: string
  source: string
  status: ExtractionStatus
  candidates: Candidate[]
}
