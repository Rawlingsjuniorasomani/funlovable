import { useState } from "react";
import { User, Mail, Lock, Bell, Save, Shield, Star, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuthContext } from "@/contexts/AuthContext";

export function StudentSettings() {
  const { toast } = useToast();
  const { user, updateUser } = useAuthContext();

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    school: user?.school || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    quizReminders: true,
    achievementAlerts: true,
    darkMode: false,
  });

  const handleProfileSave = () => {
    updateUser({ name: profileData.name, school: profileData.school });
    toast({ title: "Profile updated", description: "Your profile details have been saved successfully." });
  };

  const handlePasswordUpdate = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({ title: "Error", description: "New passwords do not match.", variant: "destructive" });
      return;
    }
    
    toast({ title: "Password updated", description: "Your password has been changed." });
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const togglePreference = (key: keyof typeof preferences) => {
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
    toast({ title: "Preference updated", description: "Your settings have been saved." });
  };

  return (
    <div className="container max-w-5xl mx-auto space-y-8 animate-fade-in pb-10">

      { }
      <div className="bg-gradient-to-r from-primary/10 via-purple-500/5 to-secondary/10 p-8 rounded-3xl border border-primary/10 flex flex-col md:flex-row items-center gap-6 shadow-sm">
        <div className="relative group">
          <Avatar className="w-24 h-24 md:w-32 md:h-32 border-4 border-background shadow-xl">
            <AvatarImage src={user?.avatar} />
            <AvatarFallback className="text-4xl bg-primary/20 text-primary">
              {user?.name?.charAt(0) || 'S'}
            </AvatarFallback>
          </Avatar>
          <Button size="icon" variant="secondary" className="absolute bottom-0 right-0 rounded-full shadow-lg h-10 w-10 opacity-0 group-hover:opacity-100 transition-opacity">
            <User className="w-4 h-4" />
          </Button>
        </div>

        <div className="text-center md:text-left space-y-2 flex-1">
          <h1 className="text-3xl font-display font-bold text-foreground">{user?.name}</h1>
          <p className="text-muted-foreground flex items-center justify-center md:justify-start gap-2">
            <Mail className="w-4 h-4" /> {user?.email}
          </p>
          <div className="flex flex-wrap gap-2 justify-center md:justify-start mt-3">
            <Badge variant="default" className="bg-gradient-to-r from-yellow-500 to-amber-600 border-0 shadow-sm flex gap-1 items-center px-3 py-1">
              <Trophy className="w-3 h-3 text-white" /> Level 5 Scholar
            </Badge>
            <Badge variant="outline" className="border-primary/20 bg-primary/5 text-primary">
              <Star className="w-3 h-3 mr-1" /> 2,450 XP
            </Badge>
            <Badge variant="secondary" className="capitalize">
              {user?.role || 'Student'} Account
            </Badge>
          </div>
        </div>
      </div>

      { }
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px] bg-muted/50 p-1 mb-8">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        { }
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your personal details and public profile information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="name"
                      value={profileData.name}
                      onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                      className="pl-10 h-11"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      value={profileData.email}
                      disabled
                      className="pl-10 h-11 bg-muted/50"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Contact support to change email.</p>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="school">School Name</Label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="school"
                      placeholder="My School Name"
                      value={profileData.school}
                      onChange={(e) => setProfileData(prev => ({ ...prev, school: e.target.value }))}
                      className="pl-10 h-11"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end border-t bg-muted/20 px-6 py-4">
              <Button onClick={handleProfileSave} size="lg" className="min-w-[140px]">
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        { }
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Choose how and when you want to be notified.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-0 divide-y">
              <div className="flex items-center justify-between py-4">
                <div className="space-y-0.5">
                  <Label className="text-base">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive daily summaries and important updates via email.</p>
                </div>
                <Switch
                  checked={preferences.emailNotifications}
                  onCheckedChange={() => togglePreference('emailNotifications')}
                />
              </div>
              <div className="flex items-center justify-between py-4">
                <div className="space-y-0.5">
                  <Label className="text-base">Quiz Reminders</Label>
                  <p className="text-sm text-muted-foreground">Get reminded 1 hour before a scheduled quiz/assignment.</p>
                </div>
                <Switch
                  checked={preferences.quizReminders}
                  onCheckedChange={() => togglePreference('quizReminders')}
                />
              </div>
              <div className="flex items-center justify-between py-4">
                <div className="space-y-0.5">
                  <Label className="text-base">Achievement Alerts</Label>
                  <p className="text-sm text-muted-foreground">Celebrate when you earn new badges or level up.</p>
                </div>
                <Switch
                  checked={preferences.achievementAlerts}
                  onCheckedChange={() => togglePreference('achievementAlerts')}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        { }
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Manage your password and account security.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input
                  id="current-password"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end border-t bg-muted/20 px-6 py-4">
              <Button onClick={handlePasswordUpdate} size="lg" variant="secondary">
                Update Password
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}
