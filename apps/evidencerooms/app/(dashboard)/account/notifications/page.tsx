import { Card } from "@/components/ui/card"
import { Bell } from "lucide-react"

export default function NotificationsPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Notifications</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your notification preferences
        </p>
      </div>

      <Card className="border-border bg-card p-8">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
            <Bell className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-sm font-medium text-foreground">No notifications configured</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Notification settings will be available in a future release.
          </p>
        </div>
      </Card>
    </div>
  )
}
