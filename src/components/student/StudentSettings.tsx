import { useState } from "react";
import { User, Mail, Lock, Bell, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useAuthContext } from "@/contexts/AuthContext";

export function StudentSettings() {
  const { toast } = useToast();
  const { user, updateUser } = useAuthContext();
  
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    quizReminders: true,
    achievementAlerts: true,
  });

  const handleProfileSave = () => {
    updateUser({ name: profileData.name });
    toast({ title: "Profile updated", description: "Your profile has been saved." });
  };

  const togglePreference = (key: keyof typeof preferences) => {
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
    toast({ title: "Preference updated" });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>

      {/* Profile Section */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-primary" />
          Profile Information
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="name"
                value={profileData.name}
                onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                className="pl-10"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                value={profileData.email}
                disabled
                className="pl-10 bg-muted"
              />
            </div>
            <p className="text-xs text-muted-foreground">Email cannot be changed</p>
          </div>
        </div>
        <Button onClick={handleProfileSave} className="mt-4">
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </div>

      {/* Notification Preferences */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5 text-tertiary" />
          Notification Preferences
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
            <div>
              <p className="font-medium">Email Notifications</p>
              <p className="text-sm text-muted-foreground">Receive updates via email</p>
            </div>
            <Switch
              checked={preferences.emailNotifications}
              onCheckedChange={() => togglePreference('emailNotifications')}
            />
          </div>
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
            <div>
              <p className="font-medium">Quiz Reminders</p>
              <p className="text-sm text-muted-foreground">Get reminded about upcoming quizzes</p>
            </div>
            <Switch
              checked={preferences.quizReminders}
              onCheckedChange={() => togglePreference('quizReminders')}
            />
          </div>
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
            <div>
              <p className="font-medium">Achievement Alerts</p>
              <p className="text-sm text-muted-foreground">Get notified when you earn badges</p>
            </div>
            <Switch
              checked={preferences.achievementAlerts}
              onCheckedChange={() => togglePreference('achievementAlerts')}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
