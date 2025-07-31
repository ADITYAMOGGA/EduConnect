import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { 
  GraduationCap, 
  Users, 
  BookOpen, 
  FileText, 
  Settings, 
  LogOut,
  School,
  HelpCircle,
  Code,
  ChevronDown,
  Shield
} from "lucide-react";
import StudentManagement from "@/components/StudentManagement";
import MarksEntry from "@/components/MarksEntry";
import CertificateGenerator from "@/components/CertificateGenerator";
import SettingsComponent from "@/components/Settings";
import SettingsPage from "@/components/SettingsPage";
import ExamSubjectManagement from "@/components/ExamSubjectManagement";
import AnalyticsDashboard from "@/components/AnalyticsDashboard";
import AdminDashboard from "@/components/AdminDashboard";
import { AIChatButton } from '@/components/AIChat';
import { BulkProgressCards } from "@/components/BulkProgressCards";

export default function Dashboard() {
  const { user, logoutMutation } = useAuth();
  const [activeTab, setActiveTab] = useState("students");
  const [showFullPageSettings, setShowFullPageSettings] = useState(false);

  const [showBulkProgressCards, setShowBulkProgressCards] = useState(false);

  if (!user) return null;

  // Redirect admin users to admin dashboard
  if (user.role === 'admin') {
    window.location.href = '/admin';
    return null;
  }

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handleTabChange = (tab: string) => {
    if (tab === "settings") {
      setShowFullPageSettings(true);
    } else {
      setActiveTab(tab);
      setShowFullPageSettings(false);
    }
  };

  const handleBackFromSettings = () => {
    setShowFullPageSettings(false);
    setActiveTab("students");
  };

  // Show full-page settings if enabled
  if (showFullPageSettings) {
    return <SettingsPage onBack={handleBackFromSettings} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 dark:from-slate-900 dark:via-purple-900 dark:to-indigo-900">
      {/* Header */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-lg border-b border-purple-100 dark:border-purple-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                <GraduationCap className="text-white text-xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  MARKSHEET PRO
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  {user.schoolName || 'School Management System'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {user?.role === 'admin' && (
                <div className="flex items-center px-3 py-1 bg-gradient-to-r from-red-500 to-pink-500 rounded-full text-white text-sm font-medium shadow-lg animate-pulse">
                  <Shield className="h-4 w-4 mr-2" />
                  ADMIN ACCESS
                </div>
              )}
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="flex items-center space-x-3 hover:bg-purple-50 dark:hover:bg-purple-900/50 p-3 rounded-lg transition-colors"
                  >
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center">
                      <School className="text-white text-sm" />
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">@{user.username}</p>
                    </div>
                    <ChevronDown className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-white dark:bg-slate-800 shadow-lg border border-gray-200 dark:border-slate-700">
                  <DropdownMenuItem 
                    onClick={() => setShowFullPageSettings(true)}
                    className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
                  >
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => window.open('/support', '_blank')}
                    className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
                  >
                    <Code className="h-4 w-4" />
                    <span>Devs</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => window.open('/support', '_blank')}
                    className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
                  >
                    <HelpCircle className="h-4 w-4" />
                    <span>Support</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={handleLogout}
                    disabled={logoutMutation.isPending}
                    className="flex items-center space-x-2 cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-xl border-purple-200 dark:border-purple-700">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className={`grid w-full ${user?.role === 'admin' ? 'grid-cols-7' : 'grid-cols-6'} bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-800 dark:to-indigo-800`}>
              {user?.role === 'admin' && (
                <TabsTrigger value="admin" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-red-700 dark:data-[state=active]:text-red-300 text-slate-600 dark:text-slate-300">
                  <Shield className="h-4 w-4 mr-2" />
                  Admin
                </TabsTrigger>
              )}
              <TabsTrigger value="students" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-purple-700 dark:data-[state=active]:text-purple-300 text-slate-600 dark:text-slate-300">
                <Users className="h-4 w-4 mr-2" />
                Students
              </TabsTrigger>
              <TabsTrigger value="subjects" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-blue-700 dark:data-[state=active]:text-blue-300 text-slate-600 dark:text-slate-300">
                <BookOpen className="h-4 w-4 mr-2" />
                Subject Management
              </TabsTrigger>
              <TabsTrigger value="analytics" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-emerald-700 dark:data-[state=active]:text-emerald-300 text-slate-600 dark:text-slate-300">
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Analytics
              </TabsTrigger>
              <TabsTrigger value="marks" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-indigo-700 dark:data-[state=active]:text-indigo-300 text-slate-600 dark:text-slate-300">
                <FileText className="h-4 w-4 mr-2" />
                Marks Entry
              </TabsTrigger>
              <TabsTrigger value="certificates" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-pink-700 dark:data-[state=active]:text-pink-300 text-slate-600 dark:text-slate-300">
                <GraduationCap className="h-4 w-4 mr-2" />
                Progress Cards
              </TabsTrigger>
              <TabsTrigger value="settings" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-slate-700 dark:data-[state=active]:text-slate-300 text-slate-600 dark:text-slate-300">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </TabsTrigger>
            </TabsList>
            
            {user?.role === 'admin' && (
              <TabsContent value="admin" className="space-y-4">
                <AdminDashboard />
              </TabsContent>
            )}
            
            <TabsContent value="students" className="space-y-4">
              <StudentManagement />
            </TabsContent>
            
            <TabsContent value="subjects" className="space-y-4">
              <ExamSubjectManagement />
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <AnalyticsDashboard />
            </TabsContent>
            
            <TabsContent value="marks" className="space-y-4">
              <MarksEntry />
            </TabsContent>
            
            <TabsContent value="certificates" className="space-y-4">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-slate-700">Progress Cards</h3>
                  <Button
                    onClick={() => setShowBulkProgressCards(true)}
                    variant="outline"
                    className="border-purple-200 text-purple-600 hover:bg-purple-50"
                  >
                    Generate Bulk Cards
                  </Button>
                </div>
                <CertificateGenerator />
              </div>
            </TabsContent>
            
            <TabsContent value="settings" className="space-y-4">
              <SettingsComponent />
            </TabsContent>
          </Tabs>
        </Card>
      </div>
      
      {/* AI Chat Button */}
      <AIChatButton />

      {/* Bulk Export Modal */}
      {showBulkProgressCards && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <BulkProgressCards onClose={() => setShowBulkProgressCards(false)} />
          </div>
        </div>
      )}
    </div>
  );
}