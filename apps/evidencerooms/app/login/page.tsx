"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Command } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()

  const handleLogin = () => {
    // In production: authenticate via NextAuth/WorkOS
    // For MVP: redirect to dashboard
    router.push("/")
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm border-border bg-card p-8">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent">
            <Command className="h-6 w-6 text-accent-foreground" />
          </div>
          <h1 className="mt-4 text-xl font-semibold text-foreground">ProofLines DD</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Evidence Rooms for Private Equity
          </p>

          <div className="mt-8 w-full">
            <Button onClick={handleLogin} className="w-full">
              Log in as Bazil Cromer
            </Button>
            <p className="mt-3 text-xs text-muted-foreground">
              Demo mode - no credentials required
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
