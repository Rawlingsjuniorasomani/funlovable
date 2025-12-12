import { Save, Globe, Palette, Bell, Shield, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

export function AdminSettings() {
  const { toast } = useToast();

  const handleSave = () => {
    toast({ title: "Settings Saved", description: "Your changes have been saved successfully." });
  };

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
              <Input defaultValue="EduLearn" />
            </div>
            <div className="grid gap-2">
              <Label>Support Email</Label>
              <Input type="email" defaultValue="support@edulearn.com" />
            </div>
            <div className="grid gap-2">
              <Label>Contact Phone</Label>
              <Input defaultValue="+1 (555) 123-4567" />
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
              <Input placeholder="https://..." />
            </div>
            <div className="grid gap-2">
              <Label>Primary Color</Label>
              <Input type="color" defaultValue="#6366f1" className="w-20 h-10" />
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
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">New Registration Alerts</p>
                <p className="text-sm text-muted-foreground">Get notified when new users register</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Payment Alerts</p>
                <p className="text-sm text-muted-foreground">Get notified about payment events</p>
              </div>
              <Switch defaultChecked />
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
              <Switch />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Teacher Approval Required</p>
                <p className="text-sm text-muted-foreground">Manually approve new teacher accounts</p>
              </div>
              <Switch defaultChecked />
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
