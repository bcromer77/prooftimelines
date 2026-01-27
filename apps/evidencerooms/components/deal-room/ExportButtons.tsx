"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { FileSpreadsheet, FileText, Loader2 } from "lucide-react"

interface ExportButtonsProps {
  disabled?: boolean
}

export function ExportButtons({ disabled }: ExportButtonsProps) {
  const [isExportingXlsx, setIsExportingXlsx] = useState(false)
  const [isExportingPdf, setIsExportingPdf] = useState(false)

  const handleExportXlsx = () => {
    setIsExportingXlsx(true)
    // Simulate export
    setTimeout(() => {
      setIsExportingXlsx(false)
    }, 1500)
  }

  const handleExportPdf = () => {
    setIsExportingPdf(true)
    // Simulate export
    setTimeout(() => {
      setIsExportingPdf(false)
    }, 1500)
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleExportXlsx}
        disabled={disabled || isExportingXlsx}
        className="gap-2 bg-transparent"
      >
        {isExportingXlsx ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <FileSpreadsheet className="h-4 w-4" />
        )}
        Export Excel
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleExportPdf}
        disabled={disabled || isExportingPdf}
        className="gap-2 bg-transparent"
      >
        {isExportingPdf ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <FileText className="h-4 w-4" />
        )}
        Export PDF
      </Button>
    </div>
  )
}
