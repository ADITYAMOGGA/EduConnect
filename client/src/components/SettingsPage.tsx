import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { 
  User, 
  Moon, 
  Sun, 
  Trash2, 
  Save, 
  ArrowLeft,
  Settings,
  Bell,
  Globe,
  Shield,
  Zap,
  Sparkles,
  Crown,
  Rocket
} from "lucide-react";
import { z } from "zod";
import { motion } from "framer-motion";

const profileSchema = z.object({
  username: z.string().min(1, "Username is required"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  schoolName: z.string().min(1, "School name is required"),
});

type ProfileData = z.infer<typeof profileSchema>;

interface SettingsPageProps {
  onBack: () => void;
}

export default function SettingsPage({ onBack }: SettingsPageProps) {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [notifications, setNotifications] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);
  const [aiAssistant, setAiAssistant] = useState(false);

  const form = useForm<ProfileData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: user?.username || "",
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      schoolName: user?.schoolName || "",
    },
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileData) => {
      const response = await apiRequest('PATCH', '/api/user', data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  // Delete account mutation (placeholder)
  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      // This would need backend implementation
      await new Promise(resolve => setTimeout(resolve, 2000));
      throw new Error("Account deletion not implemented yet");
    },
    onSuccess: () => {
      toast({
        title: "Account Deleted",
        description: "Your account has been permanently deleted",
      });
      logoutMutation.mutate();
    },
    onError: () => {
      toast({
        title: "Demo Feature",
        description: "Account deletion is not available in demo mode",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProfileData) => {
    updateProfileMutation.mutate(data);
  };

  const handleDeleteAccount = () => {
    deleteAccountMutation.mutate();
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 dark:from-slate-900 dark:via-purple-900 dark:to-indigo-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center space-x-4">
            <Button
              onClick={onBack}
              variant="ghost"
              size="sm"
              className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Settings
              </h1>
              <p className="text-slate-600 dark:text-slate-300">Manage your account and preferences</p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Settings */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2"
          >
            <Card className="shadow-xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-slate-900 dark:text-slate-100">
                  <User className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  <span>Profile Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Enter first name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Enter last name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Enter username" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="schoolName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>School Name</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Enter school name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      disabled={updateProfileMutation.isPending}
                      className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Settings */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Appearance Settings */}
            <Card className="shadow-xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-slate-900 dark:text-slate-100">
                  <Settings className="h-5 w-5 text-indigo-400" />
                  <span>Appearance</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-900 dark:text-slate-100">Theme Settings</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Appearance preferences coming soon</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Demo Features */}
            <Card className="shadow-xl bg-white/90 backdrop-blur-sm border-orange-200">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Sparkles className="h-5 w-5 text-orange-600" />
                  <span>Demo Features</span>
                  <Badge variant="outline" className="text-orange-600 border-orange-600">
                    DEMO
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium flex items-center space-x-2">
                      <Bell className="h-4 w-4" />
                      <span>Smart Notifications</span>
                    </p>
                    <p className="text-sm text-gray-500">AI-powered alerts</p>
                  </div>
                  <Switch
                    checked={notifications}
                    onCheckedChange={setNotifications}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium flex items-center space-x-2">
                      <Zap className="h-4 w-4" />
                      <span>Auto-Save</span>
                    </p>
                    <p className="text-sm text-gray-500">Real-time sync</p>
                  </div>
                  <Switch
                    checked={autoSave}
                    onCheckedChange={setAutoSave}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium flex items-center space-x-2">
                      <Globe className="h-4 w-4" />
                      <span>Analytics</span>
                    </p>
                    <p className="text-sm text-gray-500">Performance insights</p>
                  </div>
                  <Switch
                    checked={analyticsEnabled}
                    onCheckedChange={setAnalyticsEnabled}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium flex items-center space-x-2">
                      <Crown className="h-4 w-4" />
                      <span>AI Assistant</span>
                    </p>
                    <p className="text-sm text-gray-500">Smart suggestions</p>
                  </div>
                  <Switch
                    checked={aiAssistant}
                    onCheckedChange={setAiAssistant}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Security */}
            <Card className="shadow-xl bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-red-600" />
                  <span>Security</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      className="w-full"
                      disabled={deleteAccountMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {deleteAccountMutation.isPending ? "Deleting..." : "Delete Account"}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your account
                        and remove all your data from our servers, including:
                        <br /><br />
                        • All student records
                        <br />
                        • All exam data and marks
                        <br />
                        • All generated certificates
                        <br />
                        • Your school information
                        <br /><br />
                        <strong>Note:</strong> This is a demo feature and won't actually delete your account.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteAccount}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Delete Account
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Demo Features Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          <Card className="bg-gradient-to-r from-orange-100 to-yellow-100 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full flex items-center justify-center">
                  <Rocket className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-orange-800">Demo Features Available</h3>
                  <p className="text-orange-700">
                    Explore premium features with demo tags. These features showcase potential functionality 
                    but are not fully implemented in this demo version.
                  </p>
                </div>
                <Badge variant="outline" className="text-orange-600 border-orange-600 px-3 py-1">
                  DEMO
                </Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}