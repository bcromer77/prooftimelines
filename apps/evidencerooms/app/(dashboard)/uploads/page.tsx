"use client"

import React from "react"
import { useState, useCallback, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { MOCK_FILES } from "@/lib/mock-data"
import type { UploadedFile, FileType } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Upload,
  FileText,
  FileSpreadsheet,
  Presentation,
  Mail,
  CheckCircle2,
  Loader2,
  AlertCircle,
  ArrowRight,
  Sparkles,
} from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

const fileTypeIcons: Record<FileType, React.ComponentType<{ className?: string }>> = {
  pdf: FileText,
  xlsx: FileSpreadsheet,
  docx: FileText,
  pptx: Presentation,
  eml: Mail,
}

const fileTypeColors: Record<FileType, string> = {
  pdf: "text-red-400",
  xlsx: "text-green-400",
  docx: "text-blue-400",
  pptx: "text-orange-400",
  eml: "text-purple-400",
}

function UploadsContent() {
  const searchParams = useSearchParams()
  const highlightedFileName = searchParams.get("file")

  const isHighlighted = (name: string) =>
    highlightedFileName && decodeURIComponent(highlightedFileName) === name

  const [files, setFiles] = useState<UploadedFile[]>(MOCK_FILES)
  const [isDragging, setIsDragging] = useState(false)
  const [isExtracting, setIsExtracting] = useState(false)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const droppedFiles = Array.from(e.dataTransfer.files)
    const newFiles: UploadedFile[] = droppedFiles.map((file) => {
      const ext = file.name.split(".").pop()?.toLowerCase() as FileType
      return {
        id: String(Date.now()) + Math.random(),
        dossierId: "1",
        name: file.name,
        type: ext || "pdf",
        status: "Ingesting",
        size: file.size,
        uploadedAt: new Date().toISOString(),
      }
    })

    setFiles((prev) => [...prev, ...newFiles])

    setTimeout(() => {
      setFiles((prev) =>
        prev.map((f) =>
          newFiles.find((nf) => nf.id === f.id)
            ? { ...f, status: "Ingested" as const }
            : f
        )
      )
    }, 2000)
  }, [])

  const handleRunExtraction = () => {
    setIsExtracting(true)
    setTimeout(() => {
      setIsExtracting(false)
    }, 3000)
  }

  const allIngested = files.every((f) => f.status === "Ingested")
  const ingestingCount = files.filter((f) => f.status === "Ingesting").length

  return (
    <div className="mx-auto max-w-4xl">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="mb-2 text-2xl font-semibold tracking-tight text-foreground">
          Uploads
        </h1>
        <p className="text-sm text-muted-foreground">
          Upload documents to extract structured data for analysis
        </p>
      </div>

      {/* Stats row */}
      <div className="mb-6 grid grid-cols-4 gap-4">
        <Card className="border-border bg-card p-4">
          <div className="text-2xl font-semibold text-foreground">{files.length}</div>
          <div className="text-xs text-muted-foreground">Total Files</div>
        </Card>
        <Card className="border-border bg-card p-4">
          <div className="flex items-center gap-2">
            <div className="text-2xl font-semibold text-status-green">{files.filter(f => f.status === 'Ingested').length}</div>
            <CheckCircle2 className="h-4 w-4 text-status-green" />
          </div>
          <div className="text-xs text-muted-foreground">Ingested</div>
        </Card>
        <Card className="border-border bg-card p-4">
          <div className="flex items-center gap-2">
            <div className="text-2xl font-semibold text-accent">{ingestingCount}</div>
            {ingestingCount > 0 && <Loader2 className="h-4 w-4 text-accent animate-spin" />}
          </div>
          <div className="text-xs text-muted-foreground">Processing</div>
        </Card>
        <Card className="border-border bg-card p-4">
          <div className="text-2xl font-semibold text-status-red">{files.filter(f => f.status === 'Error').length}</div>
          <div className="text-xs text-muted-foreground">Errors</div>
        </Card>
      </div>

      {/* Drop Zone */}
      <Card
        className={cn(
          "mb-6 flex h-40 cursor-pointer flex-col items-center justify-center gap-3 border-2 border-dashed transition-all duration-300",
          isDragging
            ? "border-accent bg-accent/5 scale-[1.02]"
            : "border-border hover:border-accent/50 hover:bg-secondary/30"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className={cn(
          "flex h-12 w-12 items-center justify-center rounded-full transition-all duration-300",
          isDragging ? "bg-accent/20" : "bg-secondary"
        )}>
          <Upload className={cn(
            "h-6 w-6 transition-colors",
            isDragging ? "text-accent" : "text-muted-foreground"
          )} />
        </div>
        <div className="text-center">
          <span className={cn(
            "text-sm font-medium transition-colors",
            isDragging ? "text-accent" : "text-foreground"
          )}>
            Drop files here to upload
          </span>
          <p className="mt-1 text-xs text-muted-foreground">
            PDF, XLSX, PPTX, DOCX, EML supported
          </p>
        </div>
      </Card>

      {/* File List */}
      <Card className="border-border bg-card overflow-hidden">
        <div className="border-b border-border px-4 py-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Uploaded Documents
          </span>
        </div>
        <div className="divide-y divide-border">
          {files.map((file, index) => {
            const Icon = fileTypeIcons[file.type] || FileText
            const colorClass = fileTypeColors[file.type] || "text-muted-foreground"

            return (
              <div
                key={file.id}
                className={cn(
                  "group flex items-center justify-between p-4 transition-colors hover:bg-secondary/30 animate-fade-in",
                  isHighlighted(file.name) && "bg-accent/10 ring-1 ring-accent/30"
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary">
                    <Icon className={cn("h-4 w-4", colorClass)} />
                  </div>
                  <div>
                    <span className="font-medium text-foreground">{file.name}</span>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{(file.size / 1024).toFixed(1)} KB</span>
                      {file.uploadedAt && (
                        <>
                          <span className="text-muted-foreground/40">·</span>
                          <span>Uploaded {new Date(file.uploadedAt).toLocaleDateString()}</span>
                        </>
                      )}
                      {file.createdAt && (
                        <>
                          <span className="text-muted-foreground/40">·</span>
                          <span>Created {new Date(file.createdAt).toLocaleDateString()}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {file.status === "Ingested" && (
                    <Badge className="gap-1 border-0 bg-status-green/20 text-status-green hover:bg-status-green/20">
                      <CheckCircle2 className="h-3 w-3" />
                      Ingested
                    </Badge>
                  )}
                  {file.status === "Ingesting" && (
                    <Badge className="gap-1 border-0 bg-accent/20 text-accent hover:bg-accent/20">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Processing
                    </Badge>
                  )}
                  {file.status === "Error" && (
                    <Badge className="gap-1 border-0 bg-status-red/20 text-status-red hover:bg-status-red/20">
                      <AlertCircle className="h-3 w-3" />
                      Error
                    </Badge>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      {/* Run Extraction Button */}
      <div className="mt-8 flex flex-col items-center gap-4">
        <Button
          onClick={handleRunExtraction}
          disabled={!allIngested || isExtracting}
          size="lg"
          className={cn(
            "gap-2 px-8 transition-all",
            allIngested && !isExtracting
              ? "bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg shadow-accent/20"
              : "bg-secondary text-muted-foreground"
          )}
        >
          {isExtracting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Extracting Variables...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Run Extraction
            </>
          )}
        </Button>
        
        {allIngested && !isExtracting && (
          <Link 
            href="/evidence-map"
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-accent transition-colors"
          >
            View Evidence Map
            <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>
    </div>
  )
}

export default UploadsContent
