import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

export default function AdminDashboard() {
  const { user, logoutMutation } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [showAddUser, setShowAddUser] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
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

  const { data: allUsers, isLoading: usersLoading } = useQuery({
    queryKey: ['/api/admin/users'],
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

  // Toggle user hold status
  const toggleUserHold = (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'hold' ? 'active' : 'hold';
    updateUserMutation.mutate({
      id: userId,
      updates: { status: newStatus }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-pink-50 dark:from-slate-900 dark:via-red-900 dark:to-pink-900">
      {/* Admin Header */}
      <motion.div 
        className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-lg border-b border-red-100 dark:border-red-800"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <motion.div 
                className="w-12 h-12 bg-gradient-to-r from-red-600 to-pink-600 rounded-xl flex items-center justify-center mr-4 shadow-lg"
                whileHover={{ rotate: 5, scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <Shield className="text-white text-xl" />
              </motion.div>
              <div>
                <motion.h1 
                  className="text-2xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  ADMIN PANEL
                </motion.h1>
                <motion.p 
                  className="text-sm text-slate-600 dark:text-slate-300"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  MARKSHEET PRO Administrative Control
                </motion.p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4, duration: 0.3 }}
              >
                <Badge variant="destructive" className="bg-gradient-to-r from-red-500 to-pink-500 text-white font-medium animate-pulse">
                  <Shield className="h-3 w-3 mr-1" />
                  ADMINISTRATOR
                </Badge>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleLogout}
                  className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Admin Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <TabsList className="grid w-full grid-cols-5 bg-white/80 backdrop-blur-sm border border-red-100 shadow-lg">
              <TabsTrigger value="overview" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-pink-500 data-[state=active]:text-white">
                <BarChart3 className="h-4 w-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="users" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-pink-500 data-[state=active]:text-white">
                <Users className="h-4 w-4 mr-2" />
                User Management
              </TabsTrigger>
              <TabsTrigger value="schools" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-pink-500 data-[state=active]:text-white">
                <School className="h-4 w-4 mr-2" />
                School Management
              </TabsTrigger>
              <TabsTrigger value="database" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-pink-500 data-[state=active]:text-white">
                <Database className="h-4 w-4 mr-2" />
                Database
              </TabsTrigger>
              <TabsTrigger value="settings" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-pink-500 data-[state=active]:text-white">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </TabsTrigger>
            </TabsList>
          </motion.div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {[
                { 
                  title: "Total Users", 
                  value: systemStats?.totalUsers || 0, 
                  icon: Users, 
                  color: "from-blue-500 to-blue-600",
                  delay: 0.1 
                },
                { 
                  title: "Total Schools", 
                  value: systemStats?.totalSchools || 0, 
                  icon: School, 
                  color: "from-green-500 to-green-600",
                  delay: 0.2 
                },
                { 
                  title: "Active Students", 
                  value: systemStats?.totalStudents || 0, 
                  icon: UserCheck, 
                  color: "from-purple-500 to-purple-600",
                  delay: 0.3 
                },
                { 
                  title: "Database Status", 
                  value: systemHealth?.database === 'connected' ? 'Connected' : 'Error', 
                  icon: Database, 
                  color: "from-red-500 to-red-600",
                  delay: 0.4 
                }
              ].map((stat, index) => (
                <motion.div
                  key={stat.title}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: stat.delay, duration: 0.5 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                >
                  <Card className="relative overflow-hidden border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                    <div className={`absolute inset-0 bg-gradient-to-r ${stat.color} opacity-10`}></div>
                    <CardContent className="relative p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                          <motion.p 
                            className="text-2xl font-bold text-gray-900"
                            initial={{ scale: 0.5 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: stat.delay + 0.2, duration: 0.3 }}
                          >
                            {statsLoading ? '...' : stat.value}
                          </motion.p>
                        </div>
                        <motion.div 
                          className={`p-3 rounded-full bg-gradient-to-r ${stat.color} shadow-lg`}
                          whileHover={{ rotate: 5 }}
                          transition={{ duration: 0.2 }}
                        >
                          <stat.icon className="h-6 w-6 text-white" />
                        </motion.div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </TabsContent>

          {/* User Management Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <motion.span 
                    className="flex items-center space-x-2"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Users className="h-5 w-5 text-red-600" />
                    <span>User Management</span>
                  </motion.span>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.3 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button 
                      size="sm" 
                      className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600"
                      onClick={() => setShowAddUser(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Admin
                    </Button>
                  </motion.div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <motion.div 
                        key={i} 
                        className="animate-pulse"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.1 }}
                      >
                        <div className="h-20 bg-gray-200 rounded-lg"></div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <motion.div 
                    className="space-y-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    {allUsers?.filter((u: any) => u.role !== 'admin').map((user: any, index: number) => (
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
                                  onClick={() => toggleUserHold(user.id, user.status)}
                                  className={`transition-colors duration-200 ${
                                    user.status === 'hold' 
                                      ? 'hover:bg-green-50 hover:border-green-300 text-green-600' 
                                      : 'hover:bg-yellow-50 hover:border-yellow-300 text-yellow-600'
                                  }`}
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
                    
                    {(!allUsers || allUsers.filter((u: any) => u.role !== 'admin').length === 0) && (
                      <motion.div 
                        className="text-center py-8 text-slate-500"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        No regular users found. Only admin accounts exist.
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* School Management Tab */}
          <TabsContent value="schools" className="space-y-6">
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <School className="h-5 w-5 text-red-600" />
                  <span>School Management</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <motion.div 
                        key={i} 
                        className="animate-pulse"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.1 }}
                      >
                        <div className="h-16 bg-gray-200 rounded-lg"></div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <motion.div 
                    className="space-y-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    {Array.from(new Set(allUsers?.map((u: any) => u.schoolName).filter(Boolean))).map((schoolName: any, index: number) => {
                      const schoolUsers = allUsers?.filter((u: any) => u.schoolName === schoolName) || [];
                      const activeUsers = schoolUsers.filter((u: any) => u.status === 'active').length;
                      const onHoldUsers = schoolUsers.filter((u: any) => u.status === 'hold').length;
                      const teachers = schoolUsers.filter((u: any) => u.role === 'teacher').length;
                      
                      return (
                        <motion.div 
                          key={index} 
                          className="group relative overflow-hidden"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.15, duration: 0.4 }}
                          whileHover={{ scale: 1.02 }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          <div className="relative flex items-center justify-between p-6 border rounded-lg bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 border-blue-100">
                            <div className="flex items-center space-x-4">
                              <motion.div 
                                className="relative"
                                whileHover={{ rotate: 10, scale: 1.1 }}
                                transition={{ duration: 0.3 }}
                              >
                                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                                  <School className="text-white h-8 w-8" />
                                </div>
                                <motion.div 
                                  className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
                                  animate={{ scale: [1, 1.2, 1] }}
                                  transition={{ duration: 2, repeat: Infinity }}
                                >
                                  <span className="text-white text-xs font-bold">{schoolUsers.length}</span>
                                </motion.div>
                              </motion.div>
                              <div>
                                <motion.h3 
                                  className="font-bold text-gray-900 text-xl"
                                  whileHover={{ x: 5 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  {schoolName}
                                </motion.h3>
                                <p className="text-sm text-gray-600 font-medium">
                                  {schoolUsers.length} user{schoolUsers.length !== 1 ? 's' : ''} registered
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-6">
                              <div className="grid grid-cols-3 gap-4 text-center">
                                <motion.div 
                                  className="bg-green-50 rounded-lg p-3 border border-green-200"
                                  whileHover={{ scale: 1.05 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  <p className="text-lg font-bold text-green-700">{activeUsers}</p>
                                  <p className="text-xs text-green-600">Active</p>
                                </motion.div>
                                <motion.div 
                                  className="bg-yellow-50 rounded-lg p-3 border border-yellow-200"
                                  whileHover={{ scale: 1.05 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  <p className="text-lg font-bold text-yellow-700">{onHoldUsers}</p>
                                  <p className="text-xs text-yellow-600">On Hold</p>
                                </motion.div>
                                <motion.div 
                                  className="bg-blue-50 rounded-lg p-3 border border-blue-200"
                                  whileHover={{ scale: 1.05 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  <p className="text-lg font-bold text-blue-700">{teachers}</p>
                                  <p className="text-xs text-blue-600">Teachers</p>
                                </motion.div>
                              </div>
                              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="hover:bg-blue-50 hover:border-blue-300 transition-colors duration-200"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </motion.div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                    
                    {(!allUsers || Array.from(new Set(allUsers?.map((u: any) => u.schoolName).filter(Boolean))).length === 0) && (
                      <motion.div 
                        className="text-center py-8 text-slate-500"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        No schools found with registered users.
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Database Tab */}
          <TabsContent value="database" className="space-y-6">
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Database className="h-5 w-5 text-red-600" />
                  <span>Database Administration</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <motion.div 
                  className="text-center py-8 text-slate-500"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  Database administration tools will be implemented here.
                  <br />
                  Features: Backup management, data cleanup, performance monitoring.
                </motion.div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5 text-red-600" />
                  <span>System Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <motion.div 
                  className="text-center py-8 text-slate-500"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  System settings and configuration options will be implemented here.
                  <br />
                  Features: Global settings, security policies, system maintenance.
                </motion.div>
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
    </div>
  );
}