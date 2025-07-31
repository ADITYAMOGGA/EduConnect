import { useState, useEffect } from "react";
import { useLocation } from "wouter";
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
  const [, navigate] = useLocation();
  const [admin, setAdmin] = useState<any>(null);
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

  // ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURNS
  // Query for system statistics
  const { data: systemStats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/admin/stats'],
    queryFn: async () => {
      const response = await fetch('/api/admin/stats', { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch stats');
      return response.json();
    },
    enabled: !!admin
  });

  const { data: allUsers, isLoading: usersLoading } = useQuery({
    queryKey: ['/api/admin/users'],
    queryFn: async () => {
      const response = await fetch('/api/admin/users', { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch users');
      return response.json();
    },
    enabled: !!admin
  });

  const { data: systemHealth, isLoading: healthLoading } = useQuery({
    queryKey: ['/api/admin/health'],
    queryFn: async () => {
      const response = await fetch('/api/admin/health', { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch health');
      return response.json();
    },
    enabled: !!admin
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
  const toggleUserHoldMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to update user status');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: "Success",
        description: "User status updated successfully!"
      });
    }
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to delete user');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
      toast({
        title: "Success",
        description: "User deleted successfully!"
      });
    }
  });

  // useEffect comes AFTER all hooks
  useEffect(() => {
    // Get admin data from localStorage
    const adminData = localStorage.getItem("adminData");
    const userRole = localStorage.getItem("userRole");
    
    if (adminData && userRole === "admin") {
      setAdmin(JSON.parse(adminData));
    } else {
      // Redirect to admin login if not authenticated
      navigate("/admin/login");
    }
  }, [navigate]);

  // NOW we can have conditional returns after all hooks are called
  if (!admin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-red-600 mx-auto" />
          <p className="text-red-800">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    localStorage.removeItem("adminData");
    localStorage.removeItem("userRole");
    navigate("/admin/login");
    toast({ title: "Logged out successfully" });
  };

  const handleCreateUser = () => {
    if (!newUser.username || !newUser.password) {
      toast({
        title: "Error",
        description: "Username and password are required",
        variant: "destructive"
      });
      return;
    }
    createUserMutation.mutate(newUser);
  };

  const handleToggleUserHold = (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'hold' : 'active';
    toggleUserHoldMutation.mutate({ id: userId, status: newStatus });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-rose-100">
      {/* Header */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white/90 backdrop-blur-sm shadow-lg border-b border-red-200/50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-red-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                <Shield className="text-white text-xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                  ADMIN PANEL
                </h1>
                <p className="text-slate-600 text-sm">Platform Administration</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-3 bg-red-50 px-4 py-2 rounded-lg border border-red-200">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <UserCheck className="w-4 h-4 text-red-600" />
                </div>
                <div className="text-sm">
                  <p className="font-medium text-red-900">{admin?.name}</p>
                  <p className="text-red-600">{admin?.role}</p>
                </div>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="border-red-200 hover:bg-red-50 text-red-700"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-96 bg-white/80 backdrop-blur-sm border border-red-200/50">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="schools">Schools</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <h2 className="text-3xl font-bold text-slate-800 mb-6">System Overview</h2>
              
              {statsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[...Array(4)].map((_, i) => (
                    <Card key={i} className="bg-white/80 backdrop-blur-sm border-red-200/50">
                      <CardContent className="p-6">
                        <div className="animate-pulse">
                          <div className="h-4 bg-slate-200 rounded mb-2"></div>
                          <div className="h-8 bg-slate-200 rounded"></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                  >
                    <Card className="bg-white/80 backdrop-blur-sm border-red-200/50 hover:bg-white/90 transition-all duration-300">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-slate-600">Total Users</p>
                            <p className="text-3xl font-bold text-slate-800">{systemStats?.totalUsers || 0}</p>
                          </div>
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                            <Users className="w-6 h-6 text-white" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>

                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                  >
                    <Card className="bg-white/80 backdrop-blur-sm border-red-200/50 hover:bg-white/90 transition-all duration-300">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-slate-600">Schools</p>
                            <p className="text-3xl font-bold text-slate-800">{systemStats?.totalSchools || 0}</p>
                          </div>
                          <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                            <School className="w-6 h-6 text-white" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>

                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                  >
                    <Card className="bg-white/80 backdrop-blur-sm border-red-200/50 hover:bg-white/90 transition-all duration-300">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-slate-600">Students</p>
                            <p className="text-3xl font-bold text-slate-800">{systemStats?.totalStudents || 0}</p>
                          </div>
                          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <BookOpen className="w-6 h-6 text-white" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>

                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.4 }}
                  >
                    <Card className="bg-white/80 backdrop-blur-sm border-red-200/50 hover:bg-white/90 transition-all duration-300">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-slate-600">System Health</p>
                            <p className="text-lg font-semibold text-green-600 flex items-center">
                              <CheckCircle className="w-5 h-5 mr-1" />
                              {systemHealth?.status === 'operational' ? 'Operational' : 'Checking...'}
                            </p>
                          </div>
                          <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                            <Activity className="w-6 h-6 text-white" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>
              )}
            </motion.div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-slate-800">User Management</h2>
                <Button
                  onClick={() => setShowAddUser(true)}
                  className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Admin User
                </Button>
              </div>

              {usersLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <Card key={i} className="bg-white/80 backdrop-blur-sm border-red-200/50">
                      <CardContent className="p-6">
                        <div className="animate-pulse space-y-3">
                          <div className="h-4 bg-slate-200 rounded"></div>
                          <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                          <div className="h-8 bg-slate-200 rounded"></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {allUsers?.map((user: any, index: number) => (
                    <motion.div
                      key={user.id}
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                    >
                      <Card className="bg-white/80 backdrop-blur-sm border-red-200/50 hover:bg-white/90 transition-all duration-300">
                        <CardContent className="p-6">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center">
                                  <UserCheck className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                  <p className="font-semibold text-slate-800">{user.name || user.username}</p>
                                  <p className="text-sm text-slate-600">@{user.username}</p>
                                </div>
                              </div>
                              <Badge 
                                variant={user.status === 'active' ? 'default' : user.status === 'hold' ? 'destructive' : 'secondary'}
                                className={
                                  user.status === 'active' ? 'bg-green-100 text-green-800 hover:bg-green-200' :
                                  user.status === 'hold' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' :
                                  'bg-red-100 text-red-800 hover:bg-red-200'
                                }
                              >
                                {user.status}
                              </Badge>
                            </div>
                            
                            <div className="space-y-2 text-sm text-slate-600">
                              <p><span className="font-medium">Role:</span> {user.userType}</p>
                              {user.email && <p><span className="font-medium">Email:</span> {user.email}</p>}
                              {user.organization_id && <p><span className="font-medium">Org ID:</span> {user.organization_id}</p>}
                            </div>

                            <div className="flex items-center space-x-2 pt-4 border-t border-slate-200">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleToggleUserHold(user.id, user.status)}
                                disabled={toggleUserHoldMutation.isPending}
                                className="flex-1"
                              >
                                {user.status === 'active' ? 'Hold' : 'Activate'}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setEditingUser(user)}
                                className="px-3"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => deleteUserMutation.mutate(user.id)}
                                disabled={deleteUserMutation.isPending}
                                className="px-3 text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </TabsContent>

          {/* Schools Tab */}
          <TabsContent value="schools" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <h2 className="text-3xl font-bold text-slate-800 mb-6">School Management</h2>
              <Card className="bg-white/80 backdrop-blur-sm border-red-200/50">
                <CardContent className="p-8 text-center">
                  <School className="w-16 h-16 text-red-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-slate-800 mb-2">School Management</h3>
                  <p className="text-slate-600 mb-4">View and manage all schools in the platform</p>
                  <Button className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700">
                    View All Schools
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* System Tab */}
          <TabsContent value="system" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <h2 className="text-3xl font-bold text-slate-800 mb-6">System Information</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-white/80 backdrop-blur-sm border-red-200/50">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Database className="w-5 h-5 text-red-600" />
                      <span>Database Status</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Connection</span>
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Connected
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Last Check</span>
                        <span className="text-slate-800">{systemHealth?.timestamp ? new Date(systemHealth.timestamp).toLocaleTimeString() : 'N/A'}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/80 backdrop-blur-sm border-red-200/50">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <BarChart3 className="w-5 h-5 text-red-600" />
                      <span>Quick Stats</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Platform Admins</span>
                        <span className="font-semibold text-slate-800">{systemStats?.totalAdmins || 0}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">School Admins</span>
                        <span className="font-semibold text-slate-800">{systemStats?.totalOrgAdmins || 0}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Teachers</span>
                        <span className="font-semibold text-slate-800">{systemStats?.totalTeachers || 0}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add User Dialog */}
      <Dialog open={showAddUser} onOpenChange={setShowAddUser}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Admin User</DialogTitle>
            <DialogDescription>
              Add a new platform administrator with full system access.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={newUser.username}
                onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                placeholder="Enter username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                placeholder="Enter password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                placeholder="Enter email address"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={newUser.firstName}
                  onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                  placeholder="First name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={newUser.lastName}
                  onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                  placeholder="Last name"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddUser(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateUser}
              disabled={createUserMutation.isPending}
              className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700"
            >
              {createUserMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create User'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}