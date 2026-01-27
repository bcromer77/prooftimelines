"use client"

import { Button } from "@/components/ui/button"
import { AccountMenu } from "@/components/account-menu"
import { FileDown, FileSpreadsheet, Command, Search } from "lucide-react"

export function AppHeader() {
  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-sidebar px-6">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-accent">
            <Command className="h-4 w-4 text-accent-foreground" />
          </div>
          <span className="text-sm font-semibold tracking-tight text-foreground">
            ProofLines DD
          </span>
        </div>
        
        {/* Breadcrumb / context */}
        <div className="hidden items-center gap-2 text-sm text-muted-foreground md:flex">
          <span className="text-border">/</span>
          <span>TargetCo</span>
          <span className="rounded bg-accent/20 px-1.5 py-0.5 text-xs font-medium text-accent">
            Active
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Search */}
        <Button
          variant="ghost"
          size="sm"
          className="hidden gap-2 text-muted-foreground hover:bg-secondary hover:text-foreground md:flex"
        >
          <Search className="h-4 w-4" />
          <span className="text-xs">Search</span>
          <kbd className="pointer-events-none ml-2 inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            <span className="text-xs">⌘</span>K
          </kbd>
        </Button>

        <div className="mx-2 hidden h-4 w-px bg-border md:block" />

        <Button
          variant="ghost"
          size="sm"
          className="gap-2 text-muted-foreground hover:bg-secondary hover:text-foreground"
        >
          <FileSpreadsheet className="h-4 w-4" />
          <span className="hidden text-xs md:inline">Export XLSX</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 text-muted-foreground hover:bg-secondary hover:text-foreground"
        >
          <FileDown className="h-4 w-4" />
          <span className="hidden text-xs md:inline">Export PDF</span>
        </Button>

        <div className="mx-2 hidden h-4 w-px bg-border md:block" />

        <AccountMenu />
      </div>
    </header>
  )
}
