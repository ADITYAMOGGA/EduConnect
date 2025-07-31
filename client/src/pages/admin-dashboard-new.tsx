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

  // Query for system statistics - MOVED BEFORE useEffect
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-rose-100">
      {/* Header */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white/80 backdrop-blur-md border-b border-red-100 shadow-lg"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="flex items-center space-x-3"
              >
                <div className="h-10 w-10 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                    MARKSHEET PRO Admin
                  </h1>
                  <p className="text-sm text-gray-600">Platform Administration</p>
                </div>
              </motion.div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{admin.name}</p>
                <p className="text-xs text-gray-500">{admin.email}</p>
              </div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  size="sm"
                  className="border-red-200 text-red-600 hover:bg-red-50"
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
                          className={`p-3 rounded-full bg-gradient-to-r ${stat.color}`}
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.5 }}
                        >
                          <stat.icon className="h-6 w-6 text-white" />
                        </motion.div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="h-5 w-5 text-red-500" />
                    <span>System Overview</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span className="text-sm font-medium">System Status</span>
                      </div>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">Operational</Badge>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Database className="h-5 w-5 text-blue-500" />
                        <span className="text-sm font-medium">Database</span>
                      </div>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">Connected</Badge>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <School className="h-5 w-5 text-purple-500" />
                        <span className="text-sm font-medium">Platform Version</span>
                      </div>
                      <Badge variant="secondary" className="bg-purple-100 text-purple-800">v2.0.0</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* User Management Tab */}
          <TabsContent value="users" className="space-y-6">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="flex justify-between items-center"
            >
              <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
              <Button
                onClick={() => setShowAddUser(true)}
                className="bg-gradient-to-r from-red-500 to-pink-500 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Admin User
              </Button>
            </motion.div>

            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-6">
                  {usersLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-red-500" />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {allUsers && allUsers.length > 0 ? (
                        allUsers.map((user: any, index: number) => (
                          <motion.div
                            key={user.id}
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: index * 0.1, duration: 0.3 }}
                            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                          >
                            <div className="flex items-center space-x-4">
                              <div className="h-10 w-10 bg-gradient-to-r from-red-400 to-pink-400 rounded-full flex items-center justify-center text-white font-semibold">
                                {user.name ? user.name.charAt(0).toUpperCase() : user.username.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{user.name || user.username}</p>
                                <p className="text-sm text-gray-500">{user.email}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge 
                                variant={user.status === 'active' ? 'secondary' : user.status === 'hold' ? 'outline' : 'destructive'}
                                className={
                                  user.status === 'active' ? 'bg-green-100 text-green-800' :
                                  user.status === 'hold' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }
                              >
                                {user.status}
                              </Badge>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => toggleUserHoldMutation.mutate({ 
                                  id: user.id, 
                                  status: user.status === 'active' ? 'hold' : 'active' 
                                })}
                              >
                                {user.status === 'active' ? 'Hold' : 'Activate'}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingUser(user)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => deleteUserMutation.mutate(user.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </motion.div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          No users found
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Schools Tab */}
          <TabsContent value="schools" className="space-y-6">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>School Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <School className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">School management features coming soon...</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Database Tab */}
          <TabsContent value="database" className="space-y-6">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Database Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Database className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Database management tools coming soon...</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>System Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Settings className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">System settings coming soon...</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add User Dialog */}
      <Dialog open={showAddUser} onOpenChange={setShowAddUser}>
        <DialogContent className="bg-white/95 backdrop-blur-sm">
          <DialogHeader>
            <DialogTitle>Add New Admin User</DialogTitle>
            <DialogDescription>
              Create a new administrator account for the platform.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                  placeholder="Enter username"
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  placeholder="Enter password"
                />
              </div>
            </div>
            
            <div>
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
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={newUser.firstName}
                  onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                  placeholder="Enter first name"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={newUser.lastName}
                  onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                  placeholder="Enter last name"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="role">Role</Label>
              <Select
                value={newUser.role}
                onValueChange={(value) => setNewUser({ ...newUser, role: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAddUser(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => createUserMutation.mutate(newUser)}
              disabled={createUserMutation.isPending}
              className="bg-gradient-to-r from-red-500 to-pink-500 text-white"
            >
              {createUserMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
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