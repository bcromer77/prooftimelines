"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Check } from "lucide-react"

export default function ProfilePage() {
  const [name, setName] = useState("Bazil Cromer")
  const [email] = useState("bazilcromer@evidencerooms.com")
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    // In production: API call to update user profile
    // For MVP: save to localStorage
    localStorage.setItem("prooflines_user_name", name)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your account settings
        </p>
      </div>

      <Card className="border-border bg-card p-6">
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-foreground">
              Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-input border-border"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-foreground">
              Email
            </Label>
            <Input
              id="email"
              value={email}
              disabled
              className="bg-muted border-border text-muted-foreground"
            />
            <p className="text-xs text-muted-foreground">
              Contact your administrator to change your email address.
            </p>
          </div>

          <div className="flex items-center gap-3 pt-4">
            <Button onClick={handleSave} className="gap-2">
              {saved && <Check className="h-4 w-4" />}
              {saved ? "Saved" : "Save changes"}
            </Button>
            {saved && (
              <span className="text-xs text-muted-foreground animate-fade-in">
                Saved locally for demo
              </span>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}
