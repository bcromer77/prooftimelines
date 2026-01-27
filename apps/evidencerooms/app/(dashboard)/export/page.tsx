"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { 
  FileSpreadsheet, 
  FileText, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  FileDown,
  Sparkles,
  ArrowRight,
  Briefcase
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

export default function ExportPage() {
  const [includeEvidence, setIncludeEvidence] = useState(true)
  const [includeConflicts, setIncludeConflicts] = useState(true)
  const [includeSnippets, setIncludeSnippets] = useState(false)
  const [exportFormat, setExportFormat] = useState<"xlsx" | "pdf" | null>(null)
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = (format: "xlsx" | "pdf") => {
    setExportFormat(format)
    setIsExporting(true)
    setTimeout(() => {
      setIsExporting(false)
      setExportFormat(null)
    }, 2000)
  }

  return (
    <div className="mx-auto max-w-3xl">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="mb-2 text-2xl font-semibold tracking-tight text-foreground">
          Export
        </h1>
        <p className="text-sm text-muted-foreground">
          Generate audit-ready proof packs for your due diligence.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Export summary card */}
        <Card className="border-border bg-card overflow-hidden">
          <div className="border-b border-border bg-secondary/30 px-6 py-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Export Summary
            </span>
          </div>
          <div className="grid grid-cols-4 divide-x divide-border">
            <div className="p-6 text-center">
              <div className="text-3xl font-semibold text-foreground">15</div>
              <div className="mt-1 text-xs text-muted-foreground">Variables</div>
            </div>
            <div className="p-6 text-center">
              <div className="text-3xl font-semibold text-status-green">11</div>
              <div className="mt-1 text-xs text-muted-foreground">Extracted</div>
            </div>
            <div className="p-6 text-center">
              <div className="flex items-center justify-center gap-2">
                <div className="text-3xl font-semibold text-status-orange">2</div>
                <AlertTriangle className="h-5 w-5 text-status-orange" />
              </div>
              <div className="mt-1 text-xs text-muted-foreground">Conflicts</div>
            </div>
            <div className="p-6 text-center">
              <div className="text-3xl font-semibold text-foreground">5</div>
              <div className="mt-1 text-xs text-muted-foreground">Documents</div>
            </div>
          </div>
        </Card>

        {/* Export options card */}
        <Card className="border-border bg-card p-6">
          <h2 className="mb-6 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Export Options
          </h2>

          <div className="space-y-4">
            <div 
              className={cn(
                "flex items-start gap-4 rounded-lg border p-4 transition-all cursor-pointer",
                includeEvidence 
                  ? "border-accent/30 bg-accent/5" 
                  : "border-border hover:border-border/80"
              )}
              onClick={() => setIncludeEvidence(!includeEvidence)}
            >
              <Checkbox
                id="evidence"
                checked={includeEvidence}
                onCheckedChange={(checked) => setIncludeEvidence(checked as boolean)}
                className="mt-0.5"
              />
              <div className="flex-1">
                <Label htmlFor="evidence" className="text-foreground font-medium cursor-pointer">
                  Include source evidence
                </Label>
                <p className="mt-1 text-xs text-muted-foreground">
                  Document locations, page numbers, and cell references for each extraction
                </p>
              </div>
            </div>

            <div 
              className={cn(
                "flex items-start gap-4 rounded-lg border p-4 transition-all cursor-pointer",
                includeConflicts 
                  ? "border-status-orange/30 bg-status-orange/5" 
                  : "border-border hover:border-border/80"
              )}
              onClick={() => setIncludeConflicts(!includeConflicts)}
            >
              <Checkbox
                id="conflicts"
                checked={includeConflicts}
                onCheckedChange={(checked) => setIncludeConflicts(checked as boolean)}
                className="mt-0.5"
              />
              <div className="flex-1">
                <Label htmlFor="conflicts" className="text-foreground font-medium cursor-pointer">
                  Highlight conflicts
                </Label>
                <p className="mt-1 text-xs text-muted-foreground">
                  Mark variables with conflicting values across documents in orange
                </p>
              </div>
            </div>

            <div 
              className={cn(
                "flex items-start gap-4 rounded-lg border p-4 transition-all cursor-pointer",
                includeSnippets 
                  ? "border-accent/30 bg-accent/5" 
                  : "border-border hover:border-border/80"
              )}
              onClick={() => setIncludeSnippets(!includeSnippets)}
            >
              <Checkbox
                id="snippets"
                checked={includeSnippets}
                onCheckedChange={(checked) => setIncludeSnippets(checked as boolean)}
                className="mt-0.5"
              />
              <div className="flex-1">
                <Label htmlFor="snippets" className="text-foreground font-medium cursor-pointer">
                  Include text snippets
                </Label>
                <p className="mt-1 text-xs text-muted-foreground">
                  Add extracted text snippets providing context for each value
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Export buttons */}
        <div className="grid grid-cols-2 gap-4">
          <Card 
            className={cn(
              "group cursor-pointer border-border bg-card p-6 transition-all hover:border-status-green/50",
              exportFormat === "xlsx" && isExporting && "border-status-green"
            )}
            onClick={() => handleExport("xlsx")}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-status-green/20">
                  <FileSpreadsheet className="h-6 w-6 text-status-green" />
                </div>
                <div>
                  <div className="font-semibold text-foreground">Export XLSX</div>
                  <div className="text-xs text-muted-foreground">Excel spreadsheet</div>
                </div>
              </div>
              {exportFormat === "xlsx" && isExporting ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-status-green border-t-transparent" />
              ) : (
                <ArrowRight className="h-5 w-5 text-muted-foreground opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-1" />
              )}
            </div>
          </Card>

          <Card 
            className={cn(
              "group cursor-pointer border-border bg-card p-6 transition-all hover:border-status-red/50",
              exportFormat === "pdf" && isExporting && "border-status-red"
            )}
            onClick={() => handleExport("pdf")}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-status-red/20">
                  <FileText className="h-6 w-6 text-status-red" />
                </div>
                <div>
                  <div className="font-semibold text-foreground">Export PDF</div>
                  <div className="text-xs text-muted-foreground">Formatted report</div>
                </div>
              </div>
              {exportFormat === "pdf" && isExporting ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-status-red border-t-transparent" />
              ) : (
                <ArrowRight className="h-5 w-5 text-muted-foreground opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-1" />
              )}
            </div>
          </Card>
        </div>

        {/* Deal Room CTA */}
        <Card className="border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/20">
                <Briefcase className="h-6 w-6 text-accent" />
              </div>
              <div>
                <div className="font-semibold text-foreground">Deal Room</div>
                <div className="text-xs text-muted-foreground">Compare deals and access historical screenings</div>
              </div>
            </div>
            <Link href="/deal-room">
              <Button variant="outline" className="gap-2 bg-transparent">
                Open Deal Room
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </Card>

        {/* Pro tip */}
        <div className="flex items-start gap-3 rounded-lg border border-accent/20 bg-accent/5 p-4">
          <Sparkles className="h-5 w-5 text-accent mt-0.5" />
          <div>
            <div className="text-sm font-medium text-foreground">Pro tip</div>
            <p className="mt-1 text-xs text-muted-foreground">
              XLSX exports include formulas for easy analysis. PDF exports are optimized for printing and sharing with stakeholders.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
