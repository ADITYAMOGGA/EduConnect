import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Upload, Download, ExternalLink, Mail } from "lucide-react";
import { z } from "zod";
import type { User } from "@shared/schema";

const schoolInfoSchema = z.object({
  schoolName: z.string().min(1, "School name is required"),
  address: z.string().optional(),
  email: z.string().email("Invalid email address").optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SchoolInfoData = z.infer<typeof schoolInfoSchema>;
type PasswordData = z.infer<typeof passwordSchema>;

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const schoolForm = useForm<SchoolInfoData>({
    resolver: zodResolver(schoolInfoSchema),
    defaultValues: {
      schoolName: (user as User)?.schoolName || "",
      address: "",
      email: (user as User)?.email || "",
    },
  });

  const passwordForm = useForm<PasswordData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Update school info mutation
  const updateSchoolMutation = useMutation({
    mutationFn: async (data: SchoolInfoData) => {
      const response = await apiRequest('PATCH', '/api/user', {
        schoolName: data.schoolName,
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      toast({
        title: "Success",
        description: "School information updated successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update school information",
        variant: "destructive",
      });
    },
  });

  // Change password mutation (placeholder - would need backend implementation)
  const changePasswordMutation = useMutation({
    mutationFn: async (data: PasswordData) => {
      // This would need to be implemented in the backend
      throw new Error("Password change not implemented yet");
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Password changed successfully",
      });
      passwordForm.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Password change feature not implemented yet",
        variant: "destructive",
      });
    },
  });

  const onSchoolSubmit = (data: SchoolInfoData) => {
    updateSchoolMutation.mutate(data);
  };

  const onPasswordSubmit = (data: PasswordData) => {
    changePasswordMutation.mutate(data);
  };

  const handleImportData = () => {
    toast({
      title: "Import Data",
      description: "Data import feature would be implemented here",
    });
  };

  const handleExportData = () => {
    toast({
      title: "Export Data",
      description: "Data export feature would be implemented here",
    });
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Settings</h2>
        <p className="text-gray-600">Manage your account and school settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* School Settings */}
        <Card>
          <CardHeader>
            <CardTitle>School Information</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...schoolForm}>
              <form onSubmit={schoolForm.handleSubmit(onSchoolSubmit)} className="space-y-4">
                <FormField
                  control={schoolForm.control}
                  name="schoolName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>School Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={schoolForm.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>School Address</FormLabel>
                      <FormControl>
                        <Textarea 
                          rows={3} 
                          placeholder="Enter school address..." 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={schoolForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Email</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full bg-primary-500 hover:bg-primary-600"
                  disabled={updateSchoolMutation.isPending}
                >
                  {updateSchoolMutation.isPending ? 'Updating...' : 'Update School Info'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Account Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...passwordForm}>
              <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                <FormField
                  control={passwordForm.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={passwordForm.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={passwordForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm New Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full bg-warning-500 hover:bg-warning-600"
                  disabled={changePasswordMutation.isPending}
                >
                  {changePasswordMutation.isPending ? 'Changing...' : 'Change Password'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle>Data Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-800 mb-2">Re-import Students</h4>
              <p className="text-sm text-gray-600 mb-3">Upload a new CSV/XML file to update student records</p>
              <Button 
                onClick={handleImportData}
                className="bg-success-500 hover:bg-success-600"
              >
                <Upload className="w-4 h-4 mr-2" />
                Import Data
              </Button>
            </div>

            <div className="border border-red-200 rounded-lg p-4 bg-red-50">
              <h4 className="font-medium text-red-800 mb-2">Export Data</h4>
              <p className="text-sm text-red-600 mb-3">Download all your data as a backup</p>
              <Button 
                onClick={handleExportData}
                className="bg-red-500 hover:bg-red-600"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Support */}
        <Card>
          <CardHeader>
            <CardTitle>Support</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-800">Help Center</h4>
                <p className="text-sm text-gray-600">Get help with using the portal</p>
              </div>
              <button className="text-primary-500 hover:text-primary-600">
                <ExternalLink className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-800">Contact Support</h4>
                <p className="text-sm text-gray-600">Get in touch with our team</p>
              </div>
              <button className="text-primary-500 hover:text-primary-600">
                <Mail className="w-5 h-5" />
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
