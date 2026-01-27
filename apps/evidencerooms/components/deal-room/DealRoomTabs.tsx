"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Archive, GitCompare, Users } from "lucide-react"

const tabs = [
  { name: "Archive", href: "/deal-room/archive", icon: Archive },
  { name: "Compare", href: "/deal-room/compare", icon: GitCompare },
  { name: "Committee", href: "/deal-room/committee", icon: Users },
]

export function DealRoomTabs() {
  const pathname = usePathname()

  return (
    <div className="flex items-center gap-1 rounded-lg bg-secondary/50 p-1">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href
        const Icon = tab.icon

        return (
          <Link
            key={tab.name}
            href={tab.href}
            className={cn(
              "flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all",
              isActive
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            {tab.name}
          </Link>
        )
      })}
    </div>
  )
}
