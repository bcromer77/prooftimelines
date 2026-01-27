"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  FileText,
  Upload,
  Grid3X3,
  Map,
  Download,
  Settings,
  HelpCircle,
  FolderKanban,
  ChevronRight,
  Sparkles,
  Briefcase,
} from "lucide-react"

interface NavItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
}

const mainNavItems: NavItem[] = [
  { name: "Dossiers", href: "/", icon: FolderKanban },
  { name: "Uploads", href: "/uploads", icon: Upload },
  { name: "Evidence Map", href: "/evidence-map", icon: Map },
  { name: "Variables", href: "/variables", icon: FileText, badge: "15" },
  { name: "Export", href: "/export", icon: Download },
  { name: "Deal Room", href: "/deal-room", icon: Briefcase },
]

const secondaryNavItems: NavItem[] = [
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "Help & Support", href: "/help", icon: HelpCircle },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex h-full w-56 flex-col border-r border-sidebar-border bg-sidebar">
      {/* Logo area */}
      <div className="flex h-14 items-center gap-2 border-b border-sidebar-border px-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-accent to-accent/70">
          <Sparkles className="h-4 w-4 text-accent-foreground" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-sidebar-primary">ProofLines</span>
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Due Diligence</span>
        </div>
      </div>

      {/* Main navigation */}
      <nav className="flex flex-1 flex-col gap-1 p-3">
        <div className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Workspace
        </div>
        {mainNavItems.map((item, index) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href))
          const Icon = item.icon

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-3 rounded-md px-2 py-1.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-accent" />
              )}
              <Icon className={cn("h-4 w-4 transition-colors", isActive ? "text-accent" : "text-muted-foreground group-hover:text-sidebar-foreground")} />
              <span className="flex-1">{item.name}</span>
              {item.badge && (
                <span className="rounded bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                  {item.badge}
                </span>
              )}
              <ChevronRight className={cn(
                "h-3 w-3 opacity-0 transition-all duration-200",
                isActive ? "opacity-50" : "group-hover:opacity-50"
              )} />
            </Link>
          )
        })}
      </nav>

      {/* Secondary navigation */}
      <div className="border-t border-sidebar-border p-3">
        <div className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          System
        </div>
        {secondaryNavItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-md px-2 py-1.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
              )}
            >
              <Icon className="h-4 w-4 text-muted-foreground group-hover:text-sidebar-foreground" />
              {item.name}
            </Link>
          )
        })}
      </div>

      {/* Version info */}
      <div className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-status-green animate-pulse-glow" />
          <span className="text-[10px] text-muted-foreground">System Online</span>
        </div>
      </div>
    </aside>
  )
}
