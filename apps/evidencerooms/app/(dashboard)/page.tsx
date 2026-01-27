"use client"

import { useState } from "react"
import { MOCK_DOSSIERS } from "@/lib/mock-data"
import type { Dossier } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Folder, ChevronRight, Clock, FileText } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

export default function DossiersPage() {
  const [dossiers, setDossiers] = useState<Dossier[]>(MOCK_DOSSIERS)
  const [newDossierName, setNewDossierName] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleCreateDossier = () => {
    if (!newDossierName.trim()) return

    const newDossier: Dossier = {
      id: String(Date.now()),
      name: newDossierName.trim(),
      status: "Active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    setDossiers([newDossier, ...dossiers])
    setNewDossierName("")
    setIsDialogOpen(false)
  }

  return (
    <div className="mx-auto max-w-4xl">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="mb-2 text-2xl font-semibold tracking-tight text-foreground">
          Dossiers
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage your due diligence projects and targets
        </p>
      </div>

      {/* Stats row */}
      <div className="mb-8 grid grid-cols-2 gap-4">
        <Card className="border-border bg-card p-4">
          <div className="text-2xl font-semibold text-foreground">{dossiers.length}</div>
          <div className="text-xs text-muted-foreground">Total Dossiers</div>
        </Card>
        <Card className="border-border bg-card p-4">
          <div className="text-2xl font-semibold text-status-green">{dossiers.filter(d => d.status === 'Active').length}</div>
          <div className="text-xs text-muted-foreground">Active</div>
        </Card>
      </div>

      {/* Dossier list */}
      <div className="space-y-3">
        {dossiers.map((dossier, index) => (
          <Link 
            key={dossier.id} 
            href={`/uploads?dossier=${dossier.id}`}
            className="block animate-fade-in"
            style={{ animationDelay: `${index * 75}ms` }}
          >
            <Card className="group cursor-pointer border-border bg-card p-4 transition-all duration-200 hover:border-accent/30 hover:bg-secondary/50">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                  <Folder className="h-5 w-5 text-muted-foreground group-hover:text-accent transition-colors" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-foreground">
                      {dossier.name}
                    </span>
                    <span className={cn(
                      "rounded px-2 py-0.5 text-xs font-medium",
                      dossier.status === "Active" 
                        ? "bg-status-green/20 text-status-green"
                        : "bg-secondary text-muted-foreground"
                    )}>
                      {dossier.status}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Updated {new Date(dossier.updatedAt).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      5 files
                    </span>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-1" />
              </div>
            </Card>
          </Link>
        ))}

        {/* New dossier button */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              variant="outline" 
              className="mt-4 w-full gap-2 border-dashed border-border bg-transparent text-muted-foreground hover:border-accent hover:bg-accent/10 hover:text-accent"
            >
              <Plus className="h-4 w-4" />
              New dossier
            </Button>
          </DialogTrigger>
          <DialogContent className="border-border bg-card">
            <DialogHeader>
              <DialogTitle className="text-foreground">Create New Dossier</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Enter a name for the new due diligence dossier.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Label htmlFor="name" className="text-sm text-muted-foreground">Dossier Name</Label>
              <Input
                id="name"
                value={newDossierName}
                onChange={(e) => setNewDossierName(e.target.value)}
                placeholder="e.g., TargetCo"
                className="mt-2 border-border bg-input text-foreground placeholder:text-muted-foreground focus:border-accent focus:ring-accent"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreateDossier()
                }}
              />
            </div>
            <DialogFooter>
              <Button
                variant="ghost"
                onClick={() => setIsDialogOpen(false)}
                className="text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateDossier}
                className="bg-accent text-accent-foreground hover:bg-accent/90"
              >
                Create Dossier
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
