import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  GraduationCap, 
  Users, 
  BookOpen, 
  FileText, 
  Settings, 
  LogOut,
  School,
  HelpCircle
} from "lucide-react";
import StudentManagement from "@/components/StudentManagement";
import MarksEntry from "@/components/MarksEntry";
import CertificateGenerator from "@/components/CertificateGenerator";
import SettingsComponent from "@/components/Settings";
import ExamSubjectManagement from "@/components/ExamSubjectManagement";

export default function Dashboard() {
  const { user, logoutMutation } = useAuth();

  if (!user) return null;

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-purple-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                <GraduationCap className="text-white text-xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  MARKSEET PRO
                </h1>
                <p className="text-sm text-slate-600">
                  {user.schoolName || 'School Management System'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center">
                  <School className="text-white text-sm" />
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-700">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-slate-500">@{user.username}</p>
                </div>
              </div>
              <Button
                onClick={() => window.open('/support', '_blank')}
                variant="ghost"
                size="sm"
                className="text-slate-600 hover:text-slate-900 hover:bg-purple-100"
              >
                <HelpCircle className="h-4 w-4 mr-2" />
                Support
              </Button>
              <Button
                onClick={handleLogout}
                variant="ghost"
                size="sm"
                className="text-slate-600 hover:text-slate-900 hover:bg-purple-100"
                disabled={logoutMutation.isPending}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-purple-200">
          <Tabs defaultValue="students" className="w-full">
            <TabsList className="grid w-full grid-cols-5 bg-gradient-to-r from-purple-100 to-indigo-100">
              <TabsTrigger value="students" className="data-[state=active]:bg-white data-[state=active]:text-purple-700">
                <Users className="h-4 w-4 mr-2" />
                Students
              </TabsTrigger>
              <TabsTrigger value="subjects" className="data-[state=active]:bg-white data-[state=active]:text-blue-700">
                <BookOpen className="h-4 w-4 mr-2" />
                Subject Management
              </TabsTrigger>
              <TabsTrigger value="marks" className="data-[state=active]:bg-white data-[state=active]:text-indigo-700">
                <FileText className="h-4 w-4 mr-2" />
                Marks Entry
              </TabsTrigger>
              <TabsTrigger value="certificates" className="data-[state=active]:bg-white data-[state=active]:text-pink-700">
                <GraduationCap className="h-4 w-4 mr-2" />
                Certificates
              </TabsTrigger>
              <TabsTrigger value="settings" className="data-[state=active]:bg-white data-[state=active]:text-slate-700">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="students" className="space-y-4">
              <StudentManagement />
            </TabsContent>
            
            <TabsContent value="subjects" className="space-y-4">
              <ExamSubjectManagement />
            </TabsContent>
            
            <TabsContent value="marks" className="space-y-4">
              <MarksEntry />
            </TabsContent>
            
            <TabsContent value="certificates" className="space-y-4">
              <CertificateGenerator />
            </TabsContent>
            
            <TabsContent value="settings" className="space-y-4">
              <SettingsComponent />
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}