import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { 
  Shield, 
  Users, 
  School,
  Database,
  Settings, 
  LogOut,
  BarChart3,
  UserCheck,
  BookOpen,
  FileText,
  Activity,
  Eye,
  Trash2,
  Edit,
  Plus,
  Download,
  Upload,
  Code,
  ChevronDown
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function AdminDashboard() {
  const { user, logoutMutation } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
        <Alert className="max-w-md border-red-200 bg-red-50">
          <Shield className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            Access Denied: Admin privileges required to view this page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // Query for system statistics
  const { data: systemStats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/admin/stats'],
    enabled: user?.role === 'admin'
  });

  const { data: allUsers, isLoading: usersLoading } = useQuery({
    queryKey: ['/api/admin/users'],
    enabled: user?.role === 'admin'
  });

  const { data: systemHealth, isLoading: healthLoading } = useQuery({
    queryKey: ['/api/admin/health'],
    enabled: user?.role === 'admin'
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-pink-50 dark:from-slate-900 dark:via-red-900 dark:to-pink-900">
      {/* Admin Header */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-lg border-b border-red-100 dark:border-red-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-red-600 to-pink-600 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                <Shield className="text-white text-xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                  ADMIN PANEL
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  MARKSHEET PRO Administrative Control
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Badge variant="destructive" className="bg-gradient-to-r from-red-500 to-pink-500 text-white font-medium animate-pulse">
                <Shield className="h-3 w-3 mr-1" />
                ADMINISTRATOR
              </Badge>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="flex items-center space-x-3 hover:bg-red-50 dark:hover:bg-red-900/50 p-3 rounded-lg transition-colors"
                  >
                    <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center">
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
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem className="flex items-center space-x-2">
                    <Settings className="h-4 w-4" />
                    <span>Admin Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => window.open('/support', '_blank')}
                    className="flex items-center space-x-2"
                  >
                    <Code className="h-4 w-4" />
                    <span>Developers</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={handleLogout}
                    className="flex items-center space-x-2 text-red-600 dark:text-red-400"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-white dark:bg-slate-800 shadow-lg rounded-xl p-1">
            <TabsTrigger 
              value="overview" 
              className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-pink-500 data-[state=active]:text-white"
            >
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger 
              value="users" 
              className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-pink-500 data-[state=active]:text-white"
            >
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Users</span>
            </TabsTrigger>
            <TabsTrigger 
              value="schools" 
              className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-pink-500 data-[state=active]:text-white"
            >
              <School className="h-4 w-4" />
              <span className="hidden sm:inline">Schools</span>
            </TabsTrigger>
            <TabsTrigger 
              value="database" 
              className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-pink-500 data-[state=active]:text-white"
            >
              <Database className="h-4 w-4" />
              <span className="hidden sm:inline">Database</span>
            </TabsTrigger>
            <TabsTrigger 
              value="analytics" 
              className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-pink-500 data-[state=active]:text-white"
            >
              <Activity className="h-4 w-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger 
              value="system" 
              className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-pink-500 data-[state=active]:text-white"
            >
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">System</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-blue-800">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-900">
                    {statsLoading ? "..." : (systemStats as any)?.totalUsers || 0}
                  </div>
                  <p className="text-xs text-blue-600">Active accounts</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-green-800">Total Schools</CardTitle>
                  <School className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-900">
                    {statsLoading ? "..." : (systemStats as any)?.totalSchools || 0}
                  </div>
                  <p className="text-xs text-green-600">Registered schools</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-yellow-800">Total Students</CardTitle>
                  <UserCheck className="h-4 w-4 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-900">
                    {statsLoading ? "..." : (systemStats as any)?.totalStudents || 0}
                  </div>
                  <p className="text-xs text-yellow-600">Across all schools</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-purple-800">Total Exams</CardTitle>
                  <FileText className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-900">
                    {statsLoading ? "..." : (systemStats as any)?.totalExams || 0}
                  </div>
                  <p className="text-xs text-purple-600">Created by teachers</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="h-5 w-5 text-red-600" />
                    <span>System Health</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {healthLoading ? (
                    <div className="animate-pulse space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span>Database Connection</span>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          Connected
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>API Status</span>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          Operational
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Storage Status</span>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          Healthy
                        </Badge>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-red-600" />
                    <span>User Management</span>
                  </span>
                  <Button size="sm" className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600">
                    <Plus className="h-4 w-4 mr-2" />
                    Add User
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-slate-500">
                  User management interface will be implemented here.
                  <br />
                  Features: View all users, edit roles, manage permissions, suspend accounts.
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schools" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <School className="h-5 w-5 text-red-600" />
                  <span>School Management</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-slate-500">
                  School management interface will be implemented here.
                  <br />
                  Features: View all schools, manage settings, monitor usage statistics.
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="database" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Database className="h-5 w-5 text-red-600" />
                  <span>Database Administration</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-slate-500">
                  Database administration tools will be implemented here.
                  <br />
                  Features: Backup management, data cleanup, performance monitoring.
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-red-600" />
                  <span>System Analytics</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-slate-500">
                  Analytics dashboard will be implemented here.
                  <br />
                  Features: Usage patterns, performance metrics, user activity logs.
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5 text-red-600" />
                  <span>System Configuration</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-slate-500">
                  System configuration panel will be implemented here.
                  <br />
                  Features: Global settings, feature flags, maintenance mode.
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}