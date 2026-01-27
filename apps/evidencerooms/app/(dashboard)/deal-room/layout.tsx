"use client"

import React from "react"

import { DealRoomTabs } from "@/components/deal-room/DealRoomTabs"
import { Briefcase } from "lucide-react"

export default function DealRoomLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/20">
            <Briefcase className="h-5 w-5 text-accent" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              Deal Room
            </h1>
            <p className="text-xs text-muted-foreground">
              Compare deals and access historical screenings
            </p>
          </div>
        </div>
        <DealRoomTabs />
      </div>

      {/* Content */}
      <div>{children}</div>
    </div>
  )
}
