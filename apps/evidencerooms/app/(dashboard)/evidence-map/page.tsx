"use client"

import React from "react"
import { useState, useMemo, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { MOCK_VARIABLES, MOCK_CANDIDATES, MOCK_FILES, computeStatus } from "@/lib/mock-data"
import { Card } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StatusPill } from "@/components/status-pill"
import { cn } from "@/lib/utils"
import { FileText, FileSpreadsheet, Presentation, Mail, ExternalLink, Eye, Grid3X3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import type { ExtractionStatus } from "@/lib/types"

function EvidenceMapContent() {
  const searchParams = useSearchParams()
  const variableIdParam = searchParams.get("variable")

  const [selectedVariableId, setSelectedVariableId] = useState(
    variableIdParam || "ebitda-n1"
  )
  const [selectedDocType, setSelectedDocType] = useState<string>("pdf")
  const [selectedSource, setSelectedSource] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<"detail" | "matrix">("detail")

  // Compute status for all variables
  const variablesWithStatus = useMemo(() => {
    return MOCK_VARIABLES.map((variable) => {
      const candidates = MOCK_CANDIDATES.filter((c) => c.variableId === variable.id)
      return {
        ...variable,
        status: computeStatus(candidates),
        candidateCount: candidates.length,
      }
    })
  }, [])

  const selectedVariable = variablesWithStatus.find((v) => v.id === selectedVariableId)

  const candidates = useMemo(() => {
    return MOCK_CANDIDATES.filter((c) => c.variableId === selectedVariableId)
  }, [selectedVariableId])

  const fileForSource = (sourceName: string | undefined) =>
    MOCK_FILES.find((f) => f.name === sourceName)

  const selectedCandidate = selectedSource
    ? candidates.find((c) => c.id === selectedSource)
    : null

  const selectedFile = selectedCandidate ? fileForSource(selectedCandidate.source) : null

  // Coverage matrix data
  const coverageMatrix = useMemo(() => {
    const matrix: Record<string, Record<string, { status: ExtractionStatus; count: number }>> = {}
    for (const variable of variablesWithStatus.slice(0, 5)) {
      matrix[variable.id] = {}
      for (const file of MOCK_FILES) {
        const fileCandidates = MOCK_CANDIDATES.filter(
          (c) => c.variableId === variable.id && c.source === file.name
        )
        if (fileCandidates.length === 0) {
          matrix[variable.id][file.name] = { status: "RED", count: 0 }
        } else {
          const allCandidates = MOCK_CANDIDATES.filter((c) => c.variableId === variable.id)
          matrix[variable.id][file.name] = {
            status: computeStatus(allCandidates),
            count: fileCandidates.length,
          }
        }
      }
    }
    return matrix
  }, [variablesWithStatus])

  const formatValue = (value: number | string) => {
    if (typeof value === "number") {
      const millions = value / 1_000_000
      if (millions >= 1) return `€${millions.toFixed(1)}m`
      return `${value}`
    }
    return String(value)
  }

  const docTypeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
    pdf: FileText,
    xlsx: FileSpreadsheet,
    pptx: Presentation,
    eml: Mail,
  }

  return (
    <div className="mx-auto max-w-7xl">
      {/* Page header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="mb-1 text-2xl font-semibold tracking-tight text-foreground">
            Evidence Map
          </h1>
          <p className="text-sm text-muted-foreground">
            Source comparison and extraction provenance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode("detail")}
            className={cn(viewMode === "detail" && "bg-secondary")}
          >
            Detail
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode("matrix")}
            className={cn("gap-1", viewMode === "matrix" && "bg-secondary")}
          >
            <Grid3X3 className="h-3.5 w-3.5" />
            Matrix
          </Button>
        </div>
      </div>

      {/* Variable selector - AT TOP */}
      <Card className="mb-6 border-border bg-card p-4">
        <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Select Variable
        </div>
        <div className="flex flex-wrap gap-2">
          {variablesWithStatus.slice(0, 8).map((variable, index) => (
            <button
              key={variable.id}
              type="button"
              onClick={() => {
                setSelectedVariableId(variable.id)
                setSelectedSource(null)
              }}
              className={cn(
                "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-all duration-200 animate-fade-in",
                selectedVariableId === variable.id
                  ? "border-accent bg-accent/10 text-foreground"
                  : "border-border bg-card text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
              style={{ animationDelay: `${index * 30}ms` }}
            >
              <StatusPill status={variable.status} size="xs" />
              <span>{variable.name.split("(")[0].trim()}</span>
            </button>
          ))}
        </div>
      </Card>

      {viewMode === "matrix" ? (
        /* Coverage Matrix View */
        <Card className="border-border bg-card overflow-hidden">
          <div className="border-b border-border px-4 py-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Variable × Document Matrix
            </span>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="w-56 bg-secondary/50 font-semibold text-foreground">
                    Variable
                  </TableHead>
                  {MOCK_FILES.map((file) => (
                    <TableHead
                      key={file.id}
                      className="bg-secondary/50 text-center font-medium text-muted-foreground"
                    >
                      <span className="text-xs">{file.name}</span>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {variablesWithStatus.slice(0, 5).map((variable, index) => (
                  <TableRow
                    key={variable.id}
                    className={cn(
                      "border-border hover:bg-secondary/30 animate-fade-in cursor-pointer",
                      selectedVariableId === variable.id && "bg-secondary/20"
                    )}
                    style={{ animationDelay: `${index * 50}ms` }}
                    onClick={() => {
                      setSelectedVariableId(variable.id)
                      setViewMode("detail")
                    }}
                  >
                    <TableCell className="font-medium text-foreground">
                      <div className="flex items-center gap-2">
                        <StatusPill status={variable.status} size="xs" />
                        <span>{variable.name.split("(")[0].trim()}</span>
                      </div>
                    </TableCell>
                    {MOCK_FILES.map((file) => {
                      const cell = coverageMatrix[variable.id]?.[file.name]
                      const hasData = cell && cell.count > 0
                      return (
                        <TableCell key={file.id} className="text-center">
                          {hasData ? (
                            <StatusPill status={cell.status} size="xs" />
                          ) : (
                            <span className="text-xs text-muted-foreground/40">—</span>
                          )}
                        </TableCell>
                      )
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {/* Legend */}
          <div className="border-t border-border px-4 py-3 flex items-center justify-center gap-6">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <StatusPill status="GREEN" size="xs" />
              <span>Consistent</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <StatusPill status="ORANGE" size="xs" />
              <span>Differing values</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <StatusPill status="RED" size="xs" />
              <span>Missing</span>
            </div>
          </div>
        </Card>
      ) : (
        /* Detail View */
        <Card className="border-border bg-card overflow-hidden">
          {/* Variable header with status color */}
          <div className={cn(
            "flex items-center justify-between px-6 py-4 border-b",
            selectedVariable?.status === "GREEN" && "border-status-green/30 bg-status-green/5",
            selectedVariable?.status === "ORANGE" && "border-status-orange/30 bg-status-orange/5",
            selectedVariable?.status === "RED" && "border-status-red/30 bg-status-red/5"
          )}>
            <div className="flex items-center gap-3">
              <StatusPill status={selectedVariable?.status || "RED"} size="sm" />
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  {selectedVariable?.name || "Unknown Variable"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {candidates.length} source{candidates.length !== 1 ? "s" : ""} found
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-2">
            {/* Left: Sources table */}
            <div>
              <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Extracted Values
              </div>
              <div className="rounded-lg border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="bg-secondary/50 font-semibold text-foreground">Source</TableHead>
                      <TableHead className="bg-secondary/50 font-semibold text-foreground">Location</TableHead>
                      <TableHead className="bg-secondary/50 font-semibold text-foreground">Value</TableHead>
                      <TableHead className="bg-secondary/50 w-10" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {candidates.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                          No extractions found for this variable
                        </TableCell>
                      </TableRow>
                    ) : (
                      candidates.map((candidate, index) => (
                        <TableRow
                          key={candidate.id}
                          className={cn(
                            "border-border cursor-pointer transition-all duration-200 animate-fade-in",
                            selectedSource === candidate.id
                              ? "bg-accent/10"
                              : "hover:bg-secondary/50"
                          )}
                          style={{ animationDelay: `${index * 50}ms` }}
                          onClick={() => {
                          setSelectedSource(candidate.id)
                          const f = fileForSource(candidate.source)
                          if (f?.type) setSelectedDocType(f.type)
                        }}
                        >
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="flex h-7 w-7 items-center justify-center rounded bg-secondary">
                                <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                              </div>
                              <span className="font-medium text-foreground">{candidate.source}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <code className="rounded bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
                              {candidate.location}
                            </code>
                          </TableCell>
                          <TableCell>
                            <span className="font-mono font-semibold text-foreground">
                              {formatValue(candidate.value)}
                              {candidate.unit && <span className="ml-1 text-muted-foreground">{candidate.unit}</span>}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground">
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Snippet preview */}
              {selectedCandidate && (
                <div className="mt-4 animate-fade-in">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Extracted Snippet
                  </span>
                  <div className="mt-2 rounded-lg border border-border bg-secondary/30 p-4">
                    <p className="text-sm text-foreground italic">
                      "{selectedCandidate.snippet}"
                    </p>
                    <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        Source: <span className="font-medium text-foreground">{selectedCandidate.source}</span>
                      </span>
                      <Link
                        href={`/uploads?file=${encodeURIComponent(selectedCandidate.source)}`}
                        className="text-muted-foreground hover:text-accent transition-colors"
                      >
                        Open source ↗
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right: Document viewer */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Document Preview
                </span>
                <Button variant="ghost" size="sm" className="gap-1 text-xs text-muted-foreground hover:text-foreground">
                  <ExternalLink className="h-3 w-3" />
                  Open
                </Button>
              </div>
              <Tabs
                value={selectedDocType}
                onValueChange={setSelectedDocType}
                className="w-full"
              >
                <TabsList className="w-full justify-start border-b border-border bg-transparent p-0">
                  {["pdf", "xlsx", "pptx", "eml"].map((type) => {
                    const Icon = docTypeIcons[type]
                    return (
                      <TabsTrigger
                        key={type}
                        value={type}
                        className="gap-1.5 rounded-none border-b-2 border-transparent px-4 py-2 text-muted-foreground data-[state=active]:border-accent data-[state=active]:bg-transparent data-[state=active]:text-foreground"
                      >
                        <Icon className="h-3.5 w-3.5" />
                        {type.toUpperCase()}
                      </TabsTrigger>
                    )
                  })}
                </TabsList>

                <TabsContent value={selectedDocType} className="mt-4">
                  <div className="rounded-lg border border-border bg-secondary/20 p-4">
                    {!selectedCandidate ? (
                      <div className="flex h-56 flex-col items-center justify-center text-muted-foreground">
                        <FileText className="mb-3 h-10 w-10 opacity-30" />
                        <span className="text-sm">Select a source row to preview</span>
                        <span className="mt-1 text-xs opacity-60">We'll show location + snippet + doc metadata</span>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="text-sm font-medium text-foreground">{selectedCandidate.source}</div>
                            <div className="mt-1 text-xs text-muted-foreground">
                              Location: <code className="rounded bg-secondary px-2 py-0.5">{selectedCandidate.location}</code>
                            </div>
                            {selectedFile?.uploadedAt && (
                              <div className="mt-1 text-xs text-muted-foreground">
                                Uploaded: {new Date(selectedFile.uploadedAt).toLocaleDateString()}
                                {selectedFile.createdAt ? ` · Created: ${new Date(selectedFile.createdAt).toLocaleDateString()}` : ""}
                              </div>
                            )}
                          </div>
                          <Link
                            href={`/uploads?file=${encodeURIComponent(selectedCandidate.source)}`}
                            className="text-xs text-muted-foreground hover:text-accent transition-colors"
                          >
                            Open ↗
                          </Link>
                        </div>
                        <div className="rounded-md border border-border bg-background/40 p-3">
                          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Highlight
                          </div>
                          <p className="mt-2 text-sm text-foreground italic">
                            "{selectedCandidate.snippet}"
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}

export default function EvidenceMapPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-64 items-center justify-center">
          <div className="flex items-center gap-3 text-muted-foreground">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
            <span>Loading evidence...</span>
          </div>
        </div>
      }
    >
      <EvidenceMapContent />
    </Suspense>
  )
}
