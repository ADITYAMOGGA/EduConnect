import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Plus, GraduationCap, Edit2, Trash2, Loader2, Search, Filter, UserCheck, UserX, Phone, Mail } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";

interface Teacher {
  id: string;
  name: string;
  username: string;
  email: string;
  phone: string;
  qualification: string;
  experience_years: number;
  employee_id: string;
  status: string;
  created_at: string;
}

export default function TeacherManagementEnhanced() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showStatusConfirm, setShowStatusConfirm] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState<Teacher | null>(null);
  const [teacherToToggle, setTeacherToToggle] = useState<Teacher | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    phone: "",
    qualification: "",
    experience_years: 0,
    employee_id: "",
    password: "",
    status: "active"
  });

  const { data: teachers = [], isLoading } = useQuery<Teacher[]>({
    queryKey: ["/api/org/teachers"],
  });

  // Filter teachers based on search and status
  const filteredTeachers = teachers.filter((teacher: Teacher) => {
    const matchesSearch = searchTerm === "" || 
      teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.employee_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || teacher.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return apiRequest("POST", "/api/org/teachers", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/org/teachers"] });
      handleCloseDialog();
      toast({
        title: "Teacher created",
        description: "New teacher has been added successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create teacher",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<typeof formData>) => {
      return apiRequest("PATCH", `/api/org/teachers/${editingTeacher?.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/org/teachers"] });
      handleCloseDialog();
      toast({
        title: "Teacher updated",
        description: "Teacher information has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update teacher",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/org/teachers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/org/teachers"] });
      toast({
        title: "Teacher deleted",
        description: "Teacher has been removed successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete teacher",
        variant: "destructive",
      });
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return apiRequest("PATCH", `/api/org/teachers/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/org/teachers"] });
      toast({
        title: "Status updated",
        description: "Teacher status has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update teacher status",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTeacher) {
      // Remove password from update if it's empty
      const updateData = { ...formData };
      if (!updateData.password) {
        delete updateData.password;
      }
      updateMutation.mutate(updateData);
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEditTeacher = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setFormData({
      name: teacher.name,
      username: teacher.username,
      email: teacher.email,
      phone: teacher.phone,
      qualification: teacher.qualification,
      experience_years: teacher.experience_years,
      employee_id: teacher.employee_id,
      password: "", // Don't populate password for security
      status: teacher.status
    });
    setIsDialogOpen(true);
  };

  const handleDeleteTeacher = (teacher: Teacher) => {
    setTeacherToDelete(teacher);
    setShowDeleteConfirm(true);
  };

  const handleToggleStatus = (teacher: Teacher) => {
    setTeacherToToggle(teacher);
    setShowStatusConfirm(true);
  };

  const confirmDeleteTeacher = () => {
    if (teacherToDelete) {
      deleteMutation.mutate(teacherToDelete.id);
      setShowDeleteConfirm(false);
      setTeacherToDelete(null);
    }
  };

  const confirmToggleStatus = () => {
    if (teacherToToggle) {
      const newStatus = teacherToToggle.status === "active" ? "suspended" : "active";
      toggleStatusMutation.mutate({ id: teacherToToggle.id, status: newStatus });
      setShowStatusConfirm(false);
      setTeacherToToggle(null);
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingTeacher(null);
    setFormData({
      name: "",
      username: "",
      email: "",
      phone: "",
      qualification: "",
      experience_years: 0,
      employee_id: "",
      password: "",
      status: "active"
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case "suspended":
        return <Badge className="bg-red-100 text-red-800">Suspended</Badge>;
      case "inactive":
        return <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Teacher Management</h2>
          <p className="text-gray-600">Manage teaching staff and their information</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Teacher
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search teachers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center">
              <Badge variant="secondary">
                {filteredTeachers.length} of {teachers.length} teachers
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Teacher List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Teachers ({filteredTeachers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-600">Loading teachers...</span>
            </div>
          ) : filteredTeachers.length === 0 ? (
            <div className="text-center py-8">
              <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Teachers Found</h3>
              <p className="text-gray-500">
                {teachers.length === 0 
                  ? "Add your first teacher to get started"
                  : "No teachers match your current filters"
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Teacher</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Qualification</TableHead>
                    <TableHead>Experience</TableHead>
                    <TableHead>Employee ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTeachers.map((teacher) => (
                    <TableRow key={teacher.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{teacher.name}</p>
                          <p className="text-sm text-gray-500">@{teacher.username}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-3 w-3" />
                            {teacher.email}
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-3 w-3" />
                            {teacher.phone || 'N/A'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{teacher.qualification}</TableCell>
                      <TableCell>{teacher.experience_years} years</TableCell>
                      <TableCell>
                        <Badge variant="outline">{teacher.employee_id}</Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(teacher.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditTeacher(teacher)}
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleStatus(teacher)}
                            className={teacher.status === "active" ? "text-orange-600 hover:text-orange-700 hover:bg-orange-50" : "text-green-600 hover:text-green-700 hover:bg-green-50"}
                          >
                            {teacher.status === "active" ? <UserX className="h-3 w-3" /> : <UserCheck className="h-3 w-3" />}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteTeacher(teacher)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Teacher Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingTeacher ? "Edit Teacher" : "Add New Teacher"}
            </DialogTitle>
            <DialogDescription>
              {editingTeacher ? "Update teacher information" : "Create a new teacher account"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., John Doe"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="e.g., john.doe"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john.doe@school.edu"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="qualification">Qualification</Label>
                <Input
                  id="qualification"
                  value={formData.qualification}
                  onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                  placeholder="e.g., M.Sc. Mathematics"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience_years">Experience (Years)</Label>
                <Input
                  id="experience_years"
                  type="number"
                  value={formData.experience_years}
                  onChange={(e) => setFormData({ ...formData, experience_years: parseInt(e.target.value) || 0 })}
                  min="0"
                  max="50"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="employee_id">Employee ID</Label>
                <Input
                  id="employee_id"
                  value={formData.employee_id}
                  onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                  placeholder="e.g., EMP001"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">
                {editingTeacher ? "New Password (leave blank to keep current)" : "Password"}
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Enter password"
                required={!editingTeacher}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {editingTeacher ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  editingTeacher ? "Update Teacher" : "Create Teacher"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Delete Teacher"
        description={`Are you sure you want to delete "${teacherToDelete?.name}"? This will remove their account and all associated data. This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDeleteTeacher}
        variant="destructive"
      />

      {/* Status Toggle Confirmation Dialog */}
      <ConfirmationDialog
        open={showStatusConfirm}
        onOpenChange={setShowStatusConfirm}
        title={`${teacherToToggle?.status === "active" ? "Suspend" : "Activate"} Teacher`}
        description={`Are you sure you want to ${teacherToToggle?.status === "active" ? "suspend" : "activate"} "${teacherToToggle?.name}"? ${teacherToToggle?.status === "active" ? "They will lose access to the system." : "They will regain access to the system."}`}
        confirmText={teacherToToggle?.status === "active" ? "Suspend" : "Activate"}
        cancelText="Cancel"
        onConfirm={confirmToggleStatus}
        variant={teacherToToggle?.status === "active" ? "destructive" : "default"}
      />
    </div>
  );
}