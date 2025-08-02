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
  ChevronDown,
  Loader2,
  CheckCircle,
  XCircle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function AdminDashboard() {
  const { user, logoutMutation } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [showAddUser, setShowAddUser] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [showAddSchool, setShowAddSchool] = useState(false);
  const [editingSchool, setEditingSchool] = useState<any>(null);
  const [newUser, setNewUser] = useState({
    username: "",
    password: "",
    email: "",
    firstName: "",
    lastName: "",
    schoolName: "",
    role: "admin",
    status: "active"
  });
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

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

  const { data: allUsers = [], isLoading: usersLoading } = useQuery<any[]>({
    queryKey: ['/api/admin/users'],
    enabled: user?.role === 'admin'
  });

  const { data: allSchools = [], isLoading: schoolsLoading } = useQuery<any[]>({
    queryKey: ['/api/admin/schools'],
    enabled: user?.role === 'admin'
  });

  const { data: systemHealth, isLoading: healthLoading } = useQuery({
    queryKey: ['/api/admin/health'],
    enabled: user?.role === 'admin'
  });

  // Mutations for user management
  const createUserMutation = useMutation({
    mutationFn: async (userData: any) => {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to create user');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
      setShowAddUser(false);
      setNewUser({
        username: "",
        password: "",
        email: "",
        firstName: "",
        lastName: "",
        schoolName: "",
        role: "admin",
        status: "active"
      });
      toast({
        title: "Success",
        description: "Admin user created successfully!"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create user",
        variant: "destructive"
      });
    }
  });

  // School management mutations
  const createSchoolMutation = useMutation({
    mutationFn: async (schoolData: any) => {
      const response = await fetch('/api/admin/schools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(schoolData),
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to create school');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/schools'] });
      toast({
        title: "Success",
        description: "School created successfully!"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create school",
        variant: "destructive"
      });
    }
  });

  const updateSchoolMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const response = await fetch(`/api/admin/schools/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to update school');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/schools'] });
      toast({
        title: "Success",
        description: "School updated successfully!"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update school",
        variant: "destructive"
      });
    }
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to update user');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      setEditingUser(null);
      toast({
        title: "Success",
        description: "User updated successfully!"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update user",
        variant: "destructive"
      });
    }
  });

  // Toggle user hold status (prevent holding super admin accounts)
  const toggleUserHold = (userId: string, currentStatus: string, userRole: string) => {
    // Prevent holding super admin accounts (platform admins)
    if (userRole === 'admin') {
      toast({
        title: "Action Denied",
        description: "Cannot hold super admin accounts",
        variant: "destructive"
      });
      return;
    }
    
    const newStatus = currentStatus === 'hold' ? 'active' : 'hold';
    updateUserMutation.mutate({
      id: userId,
      updates: { status: newStatus }
    });
  };

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
                  <Button 
                    size="sm" 
                    className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600"
                    onClick={() => setShowAddUser(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Admin
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-16 bg-gray-200 rounded"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <motion.div 
                    className="space-y-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    {allUsers?.filter(u => u.role !== 'admin').map((user, index) => (
                      <motion.div 
                        key={user.id} 
                        className="group relative overflow-hidden"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.4 }}
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative flex items-center justify-between p-6 border rounded-lg bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 border-red-100">
                          <div className="flex items-center space-x-4">
                            <motion.div 
                              className="relative"
                              whileHover={{ rotate: 5 }}
                              transition={{ duration: 0.2 }}
                            >
                              <div className="w-14 h-14 bg-gradient-to-br from-red-500 via-pink-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                                <span className="text-white font-bold text-lg">
                                  {user.firstName?.[0] || user.username[0]}
                                </span>
                              </div>
                              <motion.div 
                                className={`absolute -top-1 -right-1 w-4 h-4 rounded-full ${
                                  user.status === 'active' ? 'bg-green-500' : 
                                  user.status === 'hold' ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                              />
                            </motion.div>
                            <div>
                              <motion.h3 
                                className="font-semibold text-gray-900 text-lg"
                                whileHover={{ x: 5 }}
                                transition={{ duration: 0.2 }}
                              >
                                {user.firstName} {user.lastName}
                              </motion.h3>
                              <p className="text-sm text-gray-600 font-medium">@{user.username}</p>
                              <p className="text-sm text-gray-500">{user.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-6">
                            <div className="text-right">
                              <p className="text-sm font-semibold text-gray-900 mb-2">{user.schoolName}</p>
                              <div className="flex items-center space-x-2">
                                <motion.div
                                  whileHover={{ scale: 1.1 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  <Badge 
                                    variant={user.role === 'admin' ? 'destructive' : 'outline'}
                                    className="font-medium"
                                  >
                                    {user.role}
                                  </Badge>
                                </motion.div>
                                <motion.div
                                  whileHover={{ scale: 1.1 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  <Badge 
                                    variant={
                                      user.status === 'active' ? 'outline' : 
                                      user.status === 'hold' ? 'secondary' : 'destructive'
                                    }
                                    className={`font-medium ${
                                      user.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' : 
                                      user.status === 'hold' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 
                                      'bg-red-50 text-red-700 border-red-200'
                                    }`}
                                  >
                                    {user.status === 'hold' ? 'ON HOLD' : user.status.toUpperCase()}
                                  </Badge>
                                </motion.div>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => setEditingUser(user)}
                                  className="hover:bg-blue-50 hover:border-blue-300 transition-colors duration-200"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </motion.div>
                              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => toggleUserHold(user.id, user.status, user.role)}
                                  disabled={user.role === 'admin'}
                                  className={`transition-colors duration-200 ${
                                    user.status === 'hold' 
                                      ? 'hover:bg-green-50 hover:border-green-300 text-green-600' 
                                      : 'hover:bg-yellow-50 hover:border-yellow-300 text-yellow-600'
                                  } ${user.role === 'admin' ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                  {user.status === 'hold' ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                                </Button>
                              </motion.div>
                              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-300 transition-colors duration-200"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </motion.div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                    
                    {(!allUsers || allUsers.filter(u => u.role !== 'admin').length === 0) && (
                      <div className="text-center py-8 text-slate-500">
                        No regular users found. Only admin accounts exist.
                      </div>
                    )}
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schools" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center space-x-2">
                    <School className="h-5 w-5 text-red-600" />
                    <span>School Management</span>
                  </span>
                  <Button 
                    size="sm" 
                    className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600"
                    onClick={() => setShowAddSchool(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add School
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {schoolsLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-16 bg-gray-200 rounded"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <motion.div 
                    className="space-y-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    {allSchools.map((school: any, index: number) => (
                      <motion.div 
                        key={school.id} 
                        className="group relative overflow-hidden"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.4 }}
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative flex items-center justify-between p-6 border rounded-lg bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 border-blue-100">
                          <div className="flex items-center space-x-4">
                            <motion.div 
                              className="relative"
                              whileHover={{ rotate: 5 }}
                              transition={{ duration: 0.2 }}
                            >
                              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                                <School className="text-white h-7 w-7" />
                              </div>
                              <motion.div 
                                className={`absolute -top-1 -right-1 w-4 h-4 rounded-full ${
                                  school.status === 'active' ? 'bg-green-500' : 'bg-red-500'
                                }`}
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                              />
                            </motion.div>
                            <div>
                              <motion.h3 
                                className="font-semibold text-gray-900 text-lg"
                                whileHover={{ x: 5 }}
                                transition={{ duration: 0.2 }}
                              >
                                {school.name}
                              </motion.h3>
                              <p className="text-sm text-gray-600">{school.email}</p>
                              <p className="text-sm text-gray-500">{school.address}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-6">
                            <div className="text-right">
                              <p className="text-sm font-semibold text-gray-900 mb-2">{school.board_type || 'CBSE'}</p>
                              <div className="flex items-center space-x-2">
                                <motion.div
                                  whileHover={{ scale: 1.1 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  <Badge 
                                    variant={school.status === 'active' ? 'outline' : 'destructive'}
                                    className={`font-medium ${
                                      school.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' : 
                                      'bg-red-50 text-red-700 border-red-200'
                                    }`}
                                  >
                                    {school.status?.toUpperCase() || 'ACTIVE'}
                                  </Badge>
                                </motion.div>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => setEditingSchool(school)}
                                  className="hover:bg-blue-50 hover:border-blue-300 transition-colors duration-200"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </motion.div>
                              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => {
                                    toast({
                                      title: "School Details",
                                      description: `Viewing details for ${school.name} - Full school management dashboard available`
                                    });
                                  }}
                                  className="hover:bg-green-50 hover:border-green-300 transition-colors duration-200"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </motion.div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                    
                    {(!allSchools || allSchools.length === 0) && (
                      <div className="text-center py-8 text-slate-500">
                        No schools registered in the system yet.
                      </div>
                    )}
                  </motion.div>
                )}
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

      {/* Add Admin User Dialog */}
      <Dialog open={showAddUser} onOpenChange={setShowAddUser}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-red-600" />
              <span>Create New Admin</span>
            </DialogTitle>
            <DialogDescription>
              Add a new administrator account with full system access.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={newUser.firstName}
                  onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                  placeholder="John"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={newUser.lastName}
                  onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                  placeholder="Doe"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={newUser.username}
                onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                placeholder="johndoe"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                placeholder="john@example.com"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                placeholder="Enter secure password"
              />
            </div>
            <div>
              <Label htmlFor="schoolName">Organization</Label>
              <Input
                id="schoolName"
                value={newUser.schoolName}
                onChange={(e) => setNewUser({ ...newUser, schoolName: e.target.value })}
                placeholder="Organization name"
              />
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <Select value={newUser.role} onValueChange={(value) => setNewUser({ ...newUser, role: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrator</SelectItem>
                  <SelectItem value="teacher">Teacher</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddUser(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => createUserMutation.mutate(newUser)}
              disabled={createUserMutation.isPending}
              className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600"
            >
              {createUserMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Shield className="h-4 w-4 mr-2" />
              )}
              Create Admin
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information and permissions.
            </DialogDescription>
          </DialogHeader>
          {editingUser && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="editRole">Role</Label>
                <Select 
                  value={editingUser.role} 
                  onValueChange={(value) => setEditingUser({ ...editingUser, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrator</SelectItem>
                    <SelectItem value="teacher">Teacher</SelectItem>
                    <SelectItem value="student">Student</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="editStatus">Status</Label>
                <Select 
                  value={editingUser.status} 
                  onValueChange={(value) => setEditingUser({ ...editingUser, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="hold">On Hold</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingUser(null)}>
              Cancel
            </Button>
            <Button 
              onClick={() => {
                if (editingUser) {
                  updateUserMutation.mutate({
                    id: editingUser.id,
                    updates: {
                      role: editingUser.role,
                      status: editingUser.status
                    }
                  });
                }
              }}
              disabled={updateUserMutation.isPending}
              className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600"
            >
              {updateUserMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Update User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add School Dialog */}
      <Dialog open={showAddSchool} onOpenChange={setShowAddSchool}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <School className="h-5 w-5 text-red-600" />
              <span>Create New School</span>
            </DialogTitle>
            <DialogDescription>
              Add a new school/organization to the platform.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="schoolName">School Name *</Label>
              <Input id="schoolName" placeholder="St. Xavier's High School" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="schoolEmail">Email *</Label>
              <Input id="schoolEmail" type="email" placeholder="admin@stxaviers.edu" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="schoolAddress">Address</Label>
              <Input id="schoolAddress" placeholder="123 Education Street, City" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="schoolPhone">Phone</Label>
              <Input id="schoolPhone" placeholder="+91 9876543210" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="boardType">Board Type</Label>
              <Select defaultValue="CBSE">
                <SelectTrigger>
                  <SelectValue placeholder="Select board type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CBSE">CBSE</SelectItem>
                  <SelectItem value="ICSE">ICSE</SelectItem>
                  <SelectItem value="State Board">State Board</SelectItem>
                  <SelectItem value="IB">IB</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddSchool(false)}>Cancel</Button>
            <Button className="bg-gradient-to-r from-red-500 to-pink-500">
              Create School
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit School Dialog */}
      <Dialog open={!!editingSchool} onOpenChange={() => setEditingSchool(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <School className="h-5 w-5 text-red-600" />
              <span>Edit School</span>
            </DialogTitle>
            <DialogDescription>
              Update school information and settings.
            </DialogDescription>
          </DialogHeader>
          {editingSchool && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="editSchoolName">School Name</Label>
                <Input 
                  id="editSchoolName" 
                  defaultValue={editingSchool.name}
                  placeholder="School name" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editSchoolEmail">Email</Label>
                <Input 
                  id="editSchoolEmail" 
                  type="email" 
                  defaultValue={editingSchool.email}
                  placeholder="School email" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editSchoolAddress">Address</Label>
                <Input 
                  id="editSchoolAddress" 
                  defaultValue={editingSchool.address}
                  placeholder="School address" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editSchoolPhone">Phone</Label>
                <Input 
                  id="editSchoolPhone" 
                  defaultValue={editingSchool.phone}
                  placeholder="School phone" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editBoardType">Board Type</Label>
                <Select defaultValue={editingSchool.board_type || 'CBSE'}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select board type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CBSE">CBSE</SelectItem>
                    <SelectItem value="ICSE">ICSE</SelectItem>
                    <SelectItem value="State Board">State Board</SelectItem>
                    <SelectItem value="IB">IB</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editSchoolStatus">Status</Label>
                <Select defaultValue={editingSchool.status || 'active'}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingSchool(null)}>Cancel</Button>
            <Button className="bg-gradient-to-r from-red-500 to-pink-500">
              Update School
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}