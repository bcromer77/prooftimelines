"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ChevronDown, User, HelpCircle, LogOut, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

// Mock user for MVP - in production this would come from auth provider
const MOCK_USER = {
  name: "Bazil Cromer",
  email: "bazilcromer@evidencerooms.com",
  initials: "BC",
}

export function AccountMenu() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  const handleLogout = () => {
    // In production: signOut() from NextAuth or similar
    // For MVP: redirect to login page
    router.push("/login")
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 px-2 text-muted-foreground hover:bg-secondary hover:text-foreground"
          title="Account"
        >
          <Avatar className="h-7 w-7 border border-border">
            <AvatarFallback className="bg-secondary text-xs font-medium text-foreground">
              {MOCK_USER.initials}
            </AvatarFallback>
          </Avatar>
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {/* Identity */}
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium text-foreground">{MOCK_USER.name}</p>
            <p className="text-xs text-muted-foreground">{MOCK_USER.email}</p>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        {/* Workspace Context */}
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-xs text-muted-foreground">Current workspace</p>
            <p className="text-sm text-foreground">Evidence Rooms</p>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        {/* Account Actions */}
        <DropdownMenuItem asChild>
          <Link href="/account/profile" className="flex items-center gap-2 cursor-pointer">
            <User className="h-4 w-4" />
            <span>Profile</span>
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuItem asChild>
          <Link href="/account/notifications" className="flex items-center gap-2 cursor-pointer">
            <Bell className="h-4 w-4" />
            <span>Notifications</span>
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuItem asChild>
          <Link href="/help" className="flex items-center gap-2 cursor-pointer">
            <HelpCircle className="h-4 w-4" />
            <span>Help & Support</span>
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        {/* Session Control */}
        <DropdownMenuItem 
          onClick={handleLogout}
          className="text-destructive focus:text-destructive cursor-pointer"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
