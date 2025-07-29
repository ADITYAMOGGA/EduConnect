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
  School
} from "lucide-react";
import StudentManagement from "@/components/StudentManagement";
import MarksEntry from "@/components/MarksEntry";
import CertificateGenerator from "@/components/CertificateGenerator";
import SettingsComponent from "@/components/Settings";
import SubjectManagement from "@/components/SubjectManagement";

export default function Dashboard() {
  const { user, logoutMutation } = useAuth();

  if (!user) return null;

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-sky-50 page-enter">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-md shadow-xl border-b border-sky-200/50 animate-slide-in-left">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-12 h-12 gradient-ocean rounded-xl flex items-center justify-center mr-4 shadow-xl hover-glow animate-float">
                <GraduationCap className="text-white text-xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gradient animate-slide-in-right">
                  MARKSEET PRO
                </h1>
                <p className="text-sm text-muted-foreground animate-fade-in" style={{animationDelay: '200ms'}}>
                  {user.schoolName || 'School Management System'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4 animate-slide-in-right" style={{animationDelay: '300ms'}}>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 gradient-ocean rounded-full flex items-center justify-center hover-scale">
                  <School className="text-white text-sm" />
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground">@{user.username}</p>
                </div>
              </div>
              <Button
                onClick={handleLogout}
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground hover:bg-accent focus-ring transition-all duration-200"
                disabled={logoutMutation.isPending}
              >
                <LogOut className="h-4 w-4 mr-2" />
                {logoutMutation.isPending ? (
                  <div className="loading-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                ) : 'Logout'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="glass-card border-sky-200/30 animate-scale-in" style={{animationDelay: '400ms'}}>
          <Tabs defaultValue="students" className="w-full">
            <TabsList className="grid w-full grid-cols-5 gradient-ocean/10 backdrop-blur-sm border border-sky-200/50 animate-fade-in" style={{animationDelay: '600ms'}}>
              <TabsTrigger value="students" className="data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-md transition-all duration-300 hover-scale">
                <Users className="h-4 w-4 mr-2" />
                Students
              </TabsTrigger>
              <TabsTrigger value="subjects" className="data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-md transition-all duration-300 hover-scale">
                <BookOpen className="h-4 w-4 mr-2" />
                Subjects
              </TabsTrigger>
              <TabsTrigger value="marks" className="data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-md transition-all duration-300 hover-scale">
                <FileText className="h-4 w-4 mr-2" />
                Marks Entry
              </TabsTrigger>
              <TabsTrigger value="certificates" className="data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-md transition-all duration-300 hover-scale">
                <GraduationCap className="h-4 w-4 mr-2" />
                Certificates
              </TabsTrigger>
              <TabsTrigger value="settings" className="data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-md transition-all duration-300 hover-scale">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="students" className="space-y-4 animate-fade-in" style={{animationDelay: '800ms'}}>
              <StudentManagement />
            </TabsContent>
            
            <TabsContent value="subjects" className="space-y-4 animate-fade-in" style={{animationDelay: '800ms'}}>
              <SubjectManagement />
            </TabsContent>
            
            <TabsContent value="marks" className="space-y-4 animate-fade-in" style={{animationDelay: '800ms'}}>
              <MarksEntry />
            </TabsContent>
            
            <TabsContent value="certificates" className="space-y-4 animate-fade-in" style={{animationDelay: '800ms'}}>
              <CertificateGenerator />
            </TabsContent>
            
            <TabsContent value="settings" className="space-y-4 animate-fade-in" style={{animationDelay: '800ms'}}>
              <SettingsComponent />
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}