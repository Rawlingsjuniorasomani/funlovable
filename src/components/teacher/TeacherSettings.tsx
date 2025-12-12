import { useState } from "react";
import { User, Bell, Lock, Palette, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useAuthContext } from "@/contexts/AuthContext";

export function TeacherSettings() {
  const { user } = useAuthContext();
  const [isSaving, setIsSaving] = useState(false);

  // Split name into first and last name for display, fallback to empty strings
  const nameParts = user?.name ? user.name.split(' ') : ['', ''];
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    toast.success("Settings saved successfully!");
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-display font-bold text-foreground">Settings</h2>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid grid-cols-4 lg:w-[500px]">
          <TabsTrigger value="profile" className="gap-2">
            <User className="w-4 h-4" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="w-4 h-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Lock className="w-4 h-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
          <TabsTrigger value="preferences" className="gap-2">
            <Palette className="w-4 h-4" />
            <span className="hidden sm:inline">Preferences</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="font-semibold text-foreground mb-4">Personal Information</h3>
            <div className="grid gap-4">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-r from-tertiary to-quaternary flex items-center justify-center text-3xl font-bold text-primary-foreground">
                  {firstName.charAt(0) || 'T'}
                </div>
                <div>
                  <Button variant="outline" size="sm">Change Photo</Button>
                  <p className="text-xs text-muted-foreground mt-1">JPG, PNG or GIF. Max 2MB</p>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>First Name</Label>
                  <Input defaultValue={firstName} />
                </div>
                <div className="grid gap-2">
                  <Label>Last Name</Label>
                  <Input defaultValue={lastName} />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Email Address</Label>
                <Input type="email" defaultValue={user?.email || ''} readOnly className="bg-muted" />
              </div>
              <div className="grid gap-2">
                <Label>Phone Number</Label>
                <Input type="tel" defaultValue={user?.phone || ''} placeholder="+233 XX XXX XXXX" />
              </div>
              <div className="grid gap-2">
                <Label>Bio</Label>
                <Textarea
                  placeholder="Tell students about yourself..."
                  defaultValue=""
                />
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="font-semibold text-foreground mb-4">Teaching Details</h3>
            <div className="grid gap-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Employee ID</Label>
                  <Input defaultValue="" placeholder="e.g. TCH-2024-001" />
                </div>
                <div className="grid gap-2">
                  <Label>Department</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="science">Science & Mathematics</SelectItem>
                      <SelectItem value="languages">Languages</SelectItem>
                      <SelectItem value="humanities">Humanities</SelectItem>
                      <SelectItem value="arts">Creative Arts</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Subjects Taught</Label>
                <Input defaultValue="" placeholder="e.g. Mathematics, Science" />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="font-semibold text-foreground mb-4">Email Notifications</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>New Submissions</Label>
                  <p className="text-sm text-muted-foreground">Get notified when students submit assignments</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Quiz Completions</Label>
                  <p className="text-sm text-muted-foreground">Receive alerts when students complete quizzes</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Parent Messages</Label>
                  <p className="text-sm text-muted-foreground">Get notified of new messages from parents</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Weekly Reports</Label>
                  <p className="text-sm text-muted-foreground">Receive weekly summary of class performance</p>
                </div>
                <Switch />
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="font-semibold text-foreground mb-4">Push Notifications</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Live Class Reminders</Label>
                  <p className="text-sm text-muted-foreground">Remind before scheduled live classes</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Student Questions</Label>
                  <p className="text-sm text-muted-foreground">Alert when students ask questions</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="font-semibold text-foreground mb-4">Change Password</h3>
            <div className="grid gap-4 max-w-md">
              <div className="grid gap-2">
                <Label>Current Password</Label>
                <Input type="password" />
              </div>
              <div className="grid gap-2">
                <Label>New Password</Label>
                <Input type="password" />
              </div>
              <div className="grid gap-2">
                <Label>Confirm New Password</Label>
                <Input type="password" />
              </div>
              <Button className="w-fit">Update Password</Button>
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="font-semibold text-foreground mb-4">Two-Factor Authentication</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-foreground">Enable 2FA</p>
                <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
              </div>
              <Switch />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="font-semibold text-foreground mb-4">Display Preferences</h3>
            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">Use dark theme</p>
                </div>
                <Switch />
              </div>
              <div className="grid gap-2">
                <Label>Language</Label>
                <Select defaultValue="en">
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="tw">Twi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Timezone</Label>
                <Select defaultValue="gmt">
                  <SelectTrigger className="w-[250px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gmt">GMT (Ghana Time)</SelectItem>
                    <SelectItem value="utc">UTC</SelectItem>
                    <SelectItem value="wat">WAT (West Africa Time)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving} className="gap-2">
          <Save className="w-4 h-4" />
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
