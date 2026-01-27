import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mail, ExternalLink, Upload, FileSearch, Link2, FileDown } from "lucide-react"

export default function HelpPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Help & Support</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Learn how Evidence Rooms works and get support
        </p>
      </div>

      {/* How it works */}
      <Card className="border-border bg-card p-6 mb-6">
        <h2 className="text-sm font-semibold text-foreground mb-4">How Evidence Rooms Works</h2>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-secondary">
              <Upload className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Upload documents</p>
              <p className="text-xs text-muted-foreground">
                Upload CIMs, financial models, audited accounts, and data room materials in PDF, XLSX, PPTX, DOCX, or EML format.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-secondary">
              <FileSearch className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Extract 15 variables</p>
              <p className="text-xs text-muted-foreground">
                Automatically extract key financial metrics: revenue, EBITDA, margins, debt, customer concentration, and more.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-secondary">
              <Link2 className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Trace every value to a source</p>
              <p className="text-xs text-muted-foreground">
                Every extracted value links back to the exact document, page, and snippet where it was found.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-secondary">
              <FileDown className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Export factual screening</p>
              <p className="text-xs text-muted-foreground">
                Generate XLSX or PDF reports with full evidence trails for your investment committee.
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Contact Support */}
      <Card className="border-border bg-card p-6">
        <h2 className="text-sm font-semibold text-foreground mb-4">Contact Support</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Need help with your account or have questions about Evidence Rooms? Our support team is here to help.
        </p>
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" className="gap-2 bg-transparent">
            <a href="mailto:support@evidencerooms.com">
              <Mail className="h-4 w-4" />
              Email Support
            </a>
          </Button>
          <Button asChild variant="ghost" className="gap-2 text-muted-foreground">
            <a href="https://evidencerooms.com/docs" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
              Documentation
            </a>
          </Button>
        </div>
      </Card>
    </div>
  )
}
