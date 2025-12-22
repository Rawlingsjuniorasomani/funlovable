import { useState } from "react";
import { User, Mail, Phone, Lock, Bell, Palette, Shield, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useAuthContext } from "@/contexts/AuthContext";

export function ParentSettings() {
  const { toast } = useToast();
  const { user, updateUser } = useAuthContext();
  
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    smsNotifications: false,
    weeklyReports: true,
    darkMode: false,
  });

  const handleProfileSave = () => {
    updateUser({ name: profileData.name, phone: profileData.phone });
    toast({ title: "Profile updated", description: "Your profile has been saved successfully." });
  };

  const togglePreference = (key: keyof typeof preferences) => {
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
    toast({ title: "Preference updated", description: "Your settings have been saved." });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>

      { }
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
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="phone"
                type="tel"
                value={profileData.phone}
                onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                className="pl-10"
                placeholder="For SMS notifications"
              />
            </div>
          </div>
        </div>
        <Button onClick={handleProfileSave} className="mt-4">
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </div>

      { }
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
              <p className="font-medium">SMS Notifications</p>
              <p className="text-sm text-muted-foreground">Receive urgent alerts via SMS</p>
            </div>
            <Switch
              checked={preferences.smsNotifications}
              onCheckedChange={() => togglePreference('smsNotifications')}
            />
          </div>
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
            <div>
              <p className="font-medium">Weekly Progress Reports</p>
              <p className="text-sm text-muted-foreground">Get a summary every Monday</p>
            </div>
            <Switch
              checked={preferences.weeklyReports}
              onCheckedChange={() => togglePreference('weeklyReports')}
            />
          </div>
        </div>
      </div>

      { }
      <div className="bg-card rounded-xl border border-border p-6">
        <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-secondary" />
          Security
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
            <div>
              <p className="font-medium">Change Password</p>
              <p className="text-sm text-muted-foreground">Update your account password</p>
            </div>
            <Button variant="outline">
              <Lock className="w-4 h-4 mr-2" />
              Change
            </Button>
          </div>
        </div>
      </div>

      { }
      <div className="bg-gradient-to-r from-primary/10 via-tertiary/10 to-secondary/10 rounded-xl border border-primary/20 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display font-semibold">Subscription Status</h3>
            <p className="text-muted-foreground">
              Plan: <span className="font-medium text-foreground">
                {user?.subscription?.plan === 'family' ? 'Family Plan' : 'Single Child'}
              </span>
            </p>
            <p className="text-sm text-muted-foreground">
              Status: <span className="text-secondary font-medium">
                {user?.subscription?.status === 'active' ? 'Active' : 'Pending'}
              </span>
            </p>
          </div>
          <Button variant="outline">Manage Subscription</Button>
        </div>
      </div>
    </div>
  );
}
