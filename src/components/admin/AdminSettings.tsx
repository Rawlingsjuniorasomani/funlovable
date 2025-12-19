import { useState, useEffect } from "react";
import { Save, Globe, Palette, Bell, Shield, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { API_URL } from "@/config/api";

export function AdminSettings() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    platformName: "EduLearn",
    supportEmail: "support@edulearn.com",
    contactPhone: "+1 (555) 123-4567",
    logoUrl: "",
    primaryColor: "#6366f1",
    emailNotifications: true,
    newRegistrationAlerts: true,
    paymentAlerts: true,
    twoFactorAuth: false,
    teacherApproval: true
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      // Assuming a generic apiRequest helper exists or we use fetch with auth
      // Auth via HTTP-only cookies/session (no localStorage token)
      // For consistency with codebase, we should use a configured API helper if available,
      // but `adminAPI` or similar might not have `getSettings`.

      const res = await fetch(`${API_URL}/settings`, {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        if (data && Object.keys(data).length > 0) {
          setSettings(prev => ({ ...prev, ...data }));
        }
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
      // Silent error or toast?
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      // Auth via HTTP-only cookies/session (no localStorage token)
      const res = await fetch(`${API_URL}/settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(settings)
      });

      if (!res.ok) throw new Error('Failed to save');

      toast({ title: "Settings Saved", description: "Your changes have been saved successfully." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to save settings.", variant: "destructive" });
    }
  };

  const handleChange = (key: keyof typeof settings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (loading) return <div className="p-8">Loading settings...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Platform Settings</h1>
          <p className="text-muted-foreground">Configure system-wide settings</p>
        </div>
        <Button onClick={handleSave}><Save className="w-4 h-4 mr-2" /> Save Changes</Button>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Globe className="w-5 h-5" /> General Settings</CardTitle>
            <CardDescription>Basic platform configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label>Platform Name</Label>
              <Input
                value={settings.platformName}
                onChange={(e) => handleChange('platformName', e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label>Support Email</Label>
              <Input
                type="email"
                value={settings.supportEmail}
                onChange={(e) => handleChange('supportEmail', e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label>Contact Phone</Label>
              <Input
                value={settings.contactPhone}
                onChange={(e) => handleChange('contactPhone', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Palette className="w-5 h-5" /> Branding</CardTitle>
            <CardDescription>Customize the look and feel</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label>Logo URL</Label>
              <Input
                placeholder="https://..."
                value={settings.logoUrl}
                onChange={(e) => handleChange('logoUrl', e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label>Primary Color</Label>
              <Input
                type="color"
                value={settings.primaryColor}
                onChange={(e) => handleChange('primaryColor', e.target.value)}
                className="w-20 h-10"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Bell className="w-5 h-5" /> Notifications</CardTitle>
            <CardDescription>Email and notification preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-muted-foreground">Send email notifications to users</p>
              </div>
              <Switch
                checked={settings.emailNotifications}
                onCheckedChange={(c) => handleChange('emailNotifications', c)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">New Registration Alerts</p>
                <p className="text-sm text-muted-foreground">Get notified when new users register</p>
              </div>
              <Switch
                checked={settings.newRegistrationAlerts}
                onCheckedChange={(c) => handleChange('newRegistrationAlerts', c)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Payment Alerts</p>
                <p className="text-sm text-muted-foreground">Get notified about payment events</p>
              </div>
              <Switch
                checked={settings.paymentAlerts}
                onCheckedChange={(c) => handleChange('paymentAlerts', c)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Shield className="w-5 h-5" /> Security</CardTitle>
            <CardDescription>Security and access control settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Two-Factor Authentication</p>
                <p className="text-sm text-muted-foreground">Require 2FA for admin accounts</p>
              </div>
              <Switch
                checked={settings.twoFactorAuth}
                onCheckedChange={(c) => handleChange('twoFactorAuth', c)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Teacher Approval Required</p>
                <p className="text-sm text-muted-foreground">Manually approve new teacher accounts</p>
              </div>
              <Switch
                checked={settings.teacherApproval}
                onCheckedChange={(c) => handleChange('teacherApproval', c)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Database className="w-5 h-5" /> Data Management</CardTitle>
            <CardDescription>Backup and data export options</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline">Export All Data</Button>
            <Button variant="outline">Create Backup</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
