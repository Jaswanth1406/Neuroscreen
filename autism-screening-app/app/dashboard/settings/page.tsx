"use client"

import { useState, useEffect } from "react"
import { useSession } from "@/lib/auth-client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Settings, User, Bell, Shield, Palette, CheckCircle2 } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"

interface NotificationSettings {
  therapyReminders: boolean
  progressUpdates: boolean
  tipsResources: boolean
  browserNotifications: boolean
}

export default function SettingsPage() {
  const { data: session } = useSession()
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    therapyReminders: true,
    progressUpdates: true,
    tipsResources: false,
    browserNotifications: false,
  })
  const [browserPermission, setBrowserPermission] = useState<NotificationPermission>("default")
  const [saved, setSaved] = useState(false)

  // Load settings from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("notificationSettings")
    if (saved) {
      try {
        setNotificationSettings(JSON.parse(saved))
      } catch {}
    }
    // Check browser notification permission
    if ("Notification" in window) {
      setBrowserPermission(Notification.permission)
    }
  }, [])

  // Save settings to localStorage
  const saveSettings = (newSettings: NotificationSettings) => {
    setNotificationSettings(newSettings)
    localStorage.setItem("notificationSettings", JSON.stringify(newSettings))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  // Request browser notification permission
  const requestBrowserPermission = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission()
      setBrowserPermission(permission)
      if (permission === "granted") {
        saveSettings({ ...notificationSettings, browserNotifications: true })
        // Show a test notification
        new Notification("NeuroScreen Notifications Enabled! 🎉", {
          body: "You'll now receive alerts for pending therapy tasks.",
          icon: "/icon.png"
        })
      }
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-gray-500 to-gray-600 shadow-lg">
            <Settings className="h-6 w-6 text-white" />
          </div>
          Settings
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your account and preferences
        </p>
      </div>

      {/* Profile Section */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Profile
          </CardTitle>
          <CardDescription>
            Your personal information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-6">
            <Avatar className="h-20 w-20 ring-4 ring-offset-4 ring-primary/20">
              <AvatarImage src={session?.user?.image || ""} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-2xl">
                {session?.user?.name?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-semibold">{session?.user?.name || "User"}</h3>
              <p className="text-muted-foreground">{session?.user?.email}</p>
              <Badge className="mt-2" variant="secondary">
                Free Plan
              </Badge>
            </div>
          </div>

          <Separator />

          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                defaultValue={session?.user?.name || ""}
                placeholder="Your name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                defaultValue={session?.user?.email || ""}
                disabled
              />
              <p className="text-xs text-muted-foreground">
                Email cannot be changed
              </p>
            </div>
          </div>

          <Button className="mt-4">Save Changes</Button>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Notifications
            {saved && (
              <Badge variant="secondary" className="ml-auto bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                <CheckCircle2 className="h-3 w-3 mr-1" /> Saved
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Manage how you receive updates
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Browser Notifications */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Browser Notifications</p>
              <p className="text-sm text-muted-foreground">
                {browserPermission === "granted" 
                  ? "Enabled - You'll receive desktop alerts" 
                  : browserPermission === "denied"
                  ? "Blocked - Enable in browser settings"
                  : "Get desktop alerts for important updates"}
              </p>
            </div>
            {browserPermission === "granted" ? (
              <Switch 
                checked={notificationSettings.browserNotifications}
                onCheckedChange={(checked) => saveSettings({ ...notificationSettings, browserNotifications: checked })}
              />
            ) : browserPermission === "denied" ? (
              <Badge variant="secondary" className="text-amber-600">Blocked</Badge>
            ) : (
              <Button size="sm" variant="outline" onClick={requestBrowserPermission}>
                Enable
              </Button>
            )}
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Therapy Reminders</p>
              <p className="text-sm text-muted-foreground">
                Get notified about pending therapy tasks (after 24 hours)
              </p>
            </div>
            <Switch 
              checked={notificationSettings.therapyReminders}
              onCheckedChange={(checked) => saveSettings({ ...notificationSettings, therapyReminders: checked })}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Progress Updates</p>
              <p className="text-sm text-muted-foreground">
                Weekly summary of your progress
              </p>
            </div>
            <Switch 
              checked={notificationSettings.progressUpdates}
              onCheckedChange={(checked) => saveSettings({ ...notificationSettings, progressUpdates: checked })}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Tips & Resources</p>
              <p className="text-sm text-muted-foreground">
                Helpful content about autism support
              </p>
            </div>
            <Switch 
              checked={notificationSettings.tipsResources}
              onCheckedChange={(checked) => saveSettings({ ...notificationSettings, tipsResources: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Privacy */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Privacy & Security
          </CardTitle>
          <CardDescription>
            Manage your data and security settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Data Sharing</p>
              <p className="text-sm text-muted-foreground">
                Allow anonymous data for research
              </p>
            </div>
            <Switch />
          </div>
          <Separator />
          <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
            <h4 className="font-medium text-red-800 dark:text-red-200">
              Danger Zone
            </h4>
            <p className="text-sm text-red-700 dark:text-red-300 mt-1">
              Deleting your account will remove all your data permanently.
            </p>
            <Button variant="destructive" size="sm" className="mt-3">
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
