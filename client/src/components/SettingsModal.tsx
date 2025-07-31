import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, User, Palette, Shield, Save, Moon, Sun } from "lucide-react";

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Get user data from localStorage
  const orgAdminData = JSON.parse(localStorage.getItem("orgAdminData") || "{}");
  const orgData = JSON.parse(localStorage.getItem("organizationData") || "{}");
  
  const [activeTab, setActiveTab] = useState("profile");
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || 
             (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  const [profileData, setProfileData] = useState({
    name: orgAdminData.name || "",
    email: orgAdminData.email || "",
    phone: orgAdminData.phone || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [schoolData, setSchoolData] = useState({
    name: orgData.name || "",
    address: orgData.address || "",
    phone: orgData.phone || "",
    email: orgData.email || "",
    website: orgData.website || "",
    board_affiliation: orgData.board_affiliation || "",
  });

  // Apply theme changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const root = window.document.documentElement;
      if (darkMode) {
        root.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        root.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
    }
  }, [darkMode]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch(`/api/org/profile/${orgAdminData.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update profile');
      return response.json();
    },
    onSuccess: (updatedData) => {
      // Update localStorage
      localStorage.setItem("orgAdminData", JSON.stringify({ ...orgAdminData, ...updatedData }));
      toast({ title: "Profile updated successfully!" });
      setProfileData(prev => ({ ...prev, currentPassword: "", newPassword: "", confirmPassword: "" }));
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  const updateSchoolMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch(`/api/org/organization/${orgData.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update school information');
      return response.json();
    },
    onSuccess: (updatedData) => {
      // Update localStorage
      localStorage.setItem("organizationData", JSON.stringify({ ...orgData, ...updatedData }));
      toast({ title: "School information updated successfully!" });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update school information",
        variant: "destructive",
      });
    },
  });

  const handleProfileUpdate = () => {
    const updates: any = {
      name: profileData.name,
      email: profileData.email,
      phone: profileData.phone,
    };

    // Add password update if new password is provided
    if (profileData.newPassword) {
      if (profileData.newPassword !== profileData.confirmPassword) {
        toast({
          title: "Password mismatch",
          description: "New password and confirm password don't match",
          variant: "destructive",
        });
        return;
      }
      if (profileData.newPassword.length < 6) {
        toast({
          title: "Password too short",
          description: "Password must be at least 6 characters long",
          variant: "destructive",
        });
        return;
      }
      updates.currentPassword = profileData.currentPassword;
      updates.newPassword = profileData.newPassword;
    }

    updateProfileMutation.mutate(updates);
  };

  const handleSchoolUpdate = () => {
    updateSchoolMutation.mutate(schoolData);
  };

  const updateField = (section: 'profile' | 'school', field: string, value: string) => {
    if (section === 'profile') {
      setProfileData(prev => ({ ...prev, [field]: value }));
    } else {
      setSchoolData(prev => ({ ...prev, [field]: value }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Manage your profile, school information, and preferences.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile" className="flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span>Profile</span>
            </TabsTrigger>
            <TabsTrigger value="school" className="flex items-center space-x-2">
              <Shield className="w-4 h-4" />
              <span>School</span>
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex items-center space-x-2">
              <Palette className="w-4 h-4" />
              <span>Appearance</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Settings */}
          <TabsContent value="profile" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={profileData.name}
                      onChange={(e) => updateField('profile', 'name', e.target.value)}
                      placeholder="Enter your full name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => updateField('profile', 'email', e.target.value)}
                      placeholder="Enter your email"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={profileData.phone}
                      onChange={(e) => updateField('profile', 'phone', e.target.value)}
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>
                
                <Button 
                  onClick={handleProfileUpdate}
                  disabled={updateProfileMutation.isPending}
                  className="w-full md:w-auto"
                >
                  {updateProfileMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Update Profile
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Change Password</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={profileData.currentPassword}
                    onChange={(e) => updateField('profile', 'currentPassword', e.target.value)}
                    placeholder="Enter current password"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={profileData.newPassword}
                      onChange={(e) => updateField('profile', 'newPassword', e.target.value)}
                      placeholder="Enter new password"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={profileData.confirmPassword}
                      onChange={(e) => updateField('profile', 'confirmPassword', e.target.value)}
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* School Settings */}
          <TabsContent value="school" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">School Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="schoolName">School Name</Label>
                  <Input
                    id="schoolName"
                    value={schoolData.name}
                    onChange={(e) => updateField('school', 'name', e.target.value)}
                    placeholder="Enter school name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={schoolData.address}
                    onChange={(e) => updateField('school', 'address', e.target.value)}
                    placeholder="Enter complete address"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="schoolPhone">Phone</Label>
                    <Input
                      id="schoolPhone"
                      value={schoolData.phone}
                      onChange={(e) => updateField('school', 'phone', e.target.value)}
                      placeholder="School phone number"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="schoolEmail">Email</Label>
                    <Input
                      id="schoolEmail"
                      type="email"
                      value={schoolData.email}
                      onChange={(e) => updateField('school', 'email', e.target.value)}
                      placeholder="School email address"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={schoolData.website}
                      onChange={(e) => updateField('school', 'website', e.target.value)}
                      placeholder="School website URL"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="board">Board Affiliation</Label>
                    <Input
                      id="board"
                      value={schoolData.board_affiliation}
                      onChange={(e) => updateField('school', 'board_affiliation', e.target.value)}
                      placeholder="e.g., CBSE, ICSE, State Board"
                    />
                  </div>
                </div>
                
                <Button 
                  onClick={handleSchoolUpdate}
                  disabled={updateSchoolMutation.isPending}
                  className="w-full md:w-auto"
                >
                  {updateSchoolMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Update School Info
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appearance Settings */}
          <TabsContent value="appearance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Theme Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {darkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                    <div>
                      <Label htmlFor="darkMode" className="text-base font-medium">
                        Dark Mode
                      </Label>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Switch between light and dark themes
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="darkMode"
                    checked={darkMode}
                    onCheckedChange={setDarkMode}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}