import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Calendar, 
  Clock,
  FileText,
  Users,
  CheckCircle,
  AlertCircle,
  BookOpen,
  Bell,
  School
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useOrgAuth } from "@/hooks/useOrgAuth";

interface Exam {
  id: string;
  orgId: string;
  name: string;
  description?: string;
  classLevel: string;
  examType: string;
  examDate?: string;
  totalMarks: number;
  passingMarks: number;
  duration: number;
  academicYear: string;
  status: string;
  instructions?: string;
  createdAt: string;
  updatedAt: string;
}

interface ExamFormData {
  name: string;
  description: string;
  classLevels: string[];
  examType: string;
  examDate: string;
  duration: number;
  academicYear: string;
  instructions: string;
  notifyTeachers: boolean;
}

export default function ExamManagement() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterClass, setFilterClass] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const [formData, setFormData] = useState<ExamFormData>({
    name: "",
    description: "",
    classLevels: [],
    examType: "Term Exam",
    examDate: "",
    duration: 180,
    academicYear: "2024-25",
    instructions: "",
    notifyTeachers: true,
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { orgId, isAuthenticated } = useOrgAuth();

  // Fetch exams
  const { data: exams = [], isLoading } = useQuery<Exam[]>({
    queryKey: ['/api/org/exams', orgId],
    queryFn: async () => {
      const response = await fetch(`/api/org/exams?orgId=${orgId}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch exams');
      return response.json();
    },
    enabled: !!orgId && isAuthenticated,
  });

  // Create exam mutation
  const createExamMutation = useMutation({
    mutationFn: async (examData: ExamFormData) => {
      const response = await fetch(`/api/org/exams?orgId=${orgId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ...examData, orgId }),
      });
      if (!response.ok) throw new Error('Failed to create exam');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/org/exams'] });
      queryClient.invalidateQueries({ queryKey: ['/api/org/stats'] });
      toast({
        title: "Success",
        description: "Exam created successfully",
      });
      setShowCreateModal(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create exam",
        variant: "destructive",
      });
    },
  });

  // Update exam mutation
  const updateExamMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ExamFormData> }) => {
      const response = await fetch(`/api/org/exams/${id}?orgId=${orgId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update exam');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/org/exams'] });
      toast({
        title: "Success",
        description: "Exam updated successfully",
      });
      setShowEditModal(false);
      setEditingExam(null);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update exam",
        variant: "destructive",
      });
    },
  });

  // Delete exam mutation
  const deleteExamMutation = useMutation({
    mutationFn: async (examId: string) => {
      const response = await fetch(`/api/org/exams/${examId}?orgId=${orgId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to delete exam');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/org/exams'] });
      queryClient.invalidateQueries({ queryKey: ['/api/org/stats'] });
      toast({
        title: "Success",
        description: "Exam deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete exam",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      classLevels: [],
      examType: "Term Exam",
      examDate: "",
      duration: 180,
      academicYear: "2024-25",
      instructions: "",
      notifyTeachers: true,
    });
  };

  const handleCreateExam = () => {
    if (!formData.name || formData.classLevels.length === 0) {
      toast({
        title: "Error",
        description: "Please fill in all required fields and select at least one class",
        variant: "destructive",
      });
      return;
    }
    createExamMutation.mutate(formData);
  };

  const handleEditExam = (exam: Exam) => {
    setEditingExam(exam);
    setFormData({
      name: exam.name,
      description: exam.description || "",
      classLevels: [exam.classLevel], // Convert single class to array for editing
      examType: exam.examType,
      examDate: exam.examDate ? new Date(exam.examDate).toISOString().split('T')[0] : "",
      duration: exam.duration,
      academicYear: exam.academicYear,
      instructions: exam.instructions || "",
      notifyTeachers: false, // Don't notify on edit
    });
    setShowEditModal(true);
  };

  const handleUpdateExam = () => {
    if (!editingExam) return;
    updateExamMutation.mutate({ id: editingExam.id, data: formData });
  };

  // Filter exams
  const filteredExams = exams.filter((exam) => {
    const matchesSearch = searchTerm === "" || 
      exam.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = filterClass === "all" || exam.classLevel === filterClass;
    const matchesStatus = filterStatus === "all" || exam.status === filterStatus;
    
    return matchesSearch && matchesClass && matchesStatus;
  });

  // Get unique classes and statuses
  const availableClasses = Array.from(new Set(exams.map(e => e.classLevel))).sort();
  const availableStatuses = Array.from(new Set(exams.map(e => e.status)));

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Badge variant="outline" className="text-blue-600 border-blue-600">Scheduled</Badge>;
      case 'ongoing':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600">Ongoing</Badge>;
      case 'completed':
        return <Badge variant="outline" className="text-green-600 border-green-600">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="text-red-600 border-red-600">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Exam Management</h2>
          <p className="text-gray-600">Create and manage school examinations</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Exam
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Total Exams</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">{exams.length}</div>
              <FileText className="w-8 h-8 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Scheduled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">{exams.filter(e => e.status === 'scheduled').length}</div>
              <Calendar className="w-8 h-8 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Ongoing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">{exams.filter(e => e.status === 'ongoing').length}</div>
              <Clock className="w-8 h-8 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">{exams.filter(e => e.status === 'completed').length}</div>
              <CheckCircle className="w-8 h-8 opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Exams</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="search"
                  placeholder="Search exams..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="filterClass">Filter by Class</Label>
              <Select value={filterClass} onValueChange={setFilterClass}>
                <SelectTrigger>
                  <SelectValue placeholder="All classes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {availableClasses.map(cls => (
                    <SelectItem key={cls} value={cls}>Class {cls}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="filterStatus">Filter by Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {availableStatuses.map(status => (
                    <SelectItem key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Exams Table */}
      <Card>
        <CardHeader>
          <CardTitle>Examinations</CardTitle>
          <CardDescription>
            {filteredExams.length} exam{filteredExams.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading exams...</div>
          ) : filteredExams.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No exams found. Start by creating your first exam.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Exam Name</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Total Marks</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExams.map((exam) => (
                  <TableRow key={exam.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{exam.name}</p>
                        {exam.description && (
                          <p className="text-sm text-gray-500">{exam.description}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">Class {exam.classLevel}</Badge>
                    </TableCell>
                    <TableCell>{exam.examType}</TableCell>
                    <TableCell>
                      {exam.examDate ? new Date(exam.examDate).toLocaleDateString() : '-'}
                    </TableCell>
                    <TableCell>{exam.duration} min</TableCell>
                    <TableCell>{exam.totalMarks}</TableCell>
                    <TableCell>{getStatusBadge(exam.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditExam(exam)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteExamMutation.mutate(exam.id)}
                          disabled={deleteExamMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create Exam Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Exam</DialogTitle>
            <DialogDescription>
              Add a new examination for your organization
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Exam Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Mid Term Exam"
                required
              />
            </div>
            <div className="md:col-span-2">
              <Label className="text-base font-medium">Select Classes *</Label>
              <p className="text-sm text-gray-600 mb-3">Choose which classes this exam will be conducted for</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 p-4 bg-gray-50 rounded-lg border">
                {["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"].map((classLevel) => {
                  const isSelected = formData.classLevels.includes(classLevel);
                  return (
                    <div key={classLevel} className="flex items-center space-x-2">
                      <Checkbox
                        id={`class-${classLevel}`}
                        checked={isSelected}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFormData({
                              ...formData,
                              classLevels: [...formData.classLevels, classLevel]
                            });
                          } else {
                            setFormData({
                              ...formData,
                              classLevels: formData.classLevels.filter(c => c !== classLevel)
                            });
                          }
                        }}
                      />
                      <Label
                        htmlFor={`class-${classLevel}`}
                        className={`text-sm cursor-pointer ${
                          isSelected ? 'font-medium text-blue-700' : 'text-gray-700'
                        }`}
                      >
                        Class {classLevel}
                      </Label>
                    </div>
                  );
                })}
              </div>
              {formData.classLevels.length > 0 && (
                <div className="mt-2 flex items-center space-x-2">
                  <School className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-blue-600 font-medium">
                    {formData.classLevels.length} class{formData.classLevels.length !== 1 ? 'es' : ''} selected
                  </span>
                </div>
              )}
            </div>
            <div>
              <Label htmlFor="examType">Exam Type</Label>
              <Select value={formData.examType} onValueChange={(value) => setFormData({ ...formData, examType: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select exam type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Unit Test">Unit Test</SelectItem>
                  <SelectItem value="Mid Term">Mid Term</SelectItem>
                  <SelectItem value="Final Term">Final Term</SelectItem>
                  <SelectItem value="Annual Exam">Annual Exam</SelectItem>
                  <SelectItem value="Monthly Test">Monthly Test</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="examDate">Exam Date</Label>
              <Input
                id="examDate"
                type="date"
                value={formData.examDate}
                onChange={(e) => setFormData({ ...formData, examDate: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 180 })}
                min="1"
              />
            </div>
            <div>
              <Label htmlFor="academicYear">Academic Year</Label>
              <Select value={formData.academicYear} onValueChange={(value) => setFormData({ ...formData, academicYear: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select academic year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2023-24">2023-24</SelectItem>
                  <SelectItem value="2024-25">2024-25</SelectItem>
                  <SelectItem value="2025-26">2025-26</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of the exam"
              rows={2}
            />
          </div>

          <div>
            <Label htmlFor="instructions">Instructions</Label>
            <Textarea
              id="instructions"
              value={formData.instructions}
              onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
              placeholder="Special instructions for students and teachers"
              rows={3}
            />
          </div>

          {/* Teacher Notification Section */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center space-x-3">
              <Checkbox
                id="notifyTeachers"
                checked={formData.notifyTeachers}
                onCheckedChange={(checked) => setFormData({ ...formData, notifyTeachers: !!checked })}
              />
              <div className="flex items-center space-x-2">
                <Bell className="h-4 w-4 text-blue-600" />
                <Label htmlFor="notifyTeachers" className="text-sm font-medium text-blue-800 cursor-pointer">
                  Notify Teachers
                </Label>
              </div>
            </div>
            <p className="text-xs text-blue-600 mt-2 ml-7">
              Automatically notify teachers of the selected classes about this new exam
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateExam}
              disabled={createExamMutation.isPending}
            >
              {createExamMutation.isPending ? "Creating..." : "Create Exam"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Exam Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Exam</DialogTitle>
            <DialogDescription>
              Update exam details
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="editName">Exam Name *</Label>
              <Input
                id="editName"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Mid Term Exam"
                required
              />
            </div>
            <div className="md:col-span-2">
              <Label className="text-base font-medium">Select Classes *</Label>
              <p className="text-sm text-gray-600 mb-3">Choose which classes this exam will be conducted for</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 p-4 bg-gray-50 rounded-lg border">
                {["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"].map((classLevel) => {
                  const isSelected = formData.classLevels.includes(classLevel);
                  return (
                    <div key={classLevel} className="flex items-center space-x-2">
                      <Checkbox
                        id={`edit-class-${classLevel}`}
                        checked={isSelected}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFormData({
                              ...formData,
                              classLevels: [...formData.classLevels, classLevel]
                            });
                          } else {
                            setFormData({
                              ...formData,
                              classLevels: formData.classLevels.filter(c => c !== classLevel)
                            });
                          }
                        }}
                      />
                      <Label
                        htmlFor={`edit-class-${classLevel}`}
                        className={`text-sm cursor-pointer ${
                          isSelected ? 'font-medium text-blue-700' : 'text-gray-700'
                        }`}
                      >
                        Class {classLevel}
                      </Label>
                    </div>
                  );
                })}
              </div>
              {formData.classLevels.length > 0 && (
                <div className="mt-2 flex items-center space-x-2">
                  <School className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-blue-600 font-medium">
                    {formData.classLevels.length} class{formData.classLevels.length !== 1 ? 'es' : ''} selected
                  </span>
                </div>
              )}
            </div>
            <div>
              <Label htmlFor="editExamType">Exam Type</Label>
              <Select value={formData.examType} onValueChange={(value) => setFormData({ ...formData, examType: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select exam type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Unit Test">Unit Test</SelectItem>
                  <SelectItem value="Mid Term">Mid Term</SelectItem>
                  <SelectItem value="Final Term">Final Term</SelectItem>
                  <SelectItem value="Annual Exam">Annual Exam</SelectItem>
                  <SelectItem value="Monthly Test">Monthly Test</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="editExamDate">Exam Date</Label>
              <Input
                id="editExamDate"
                type="date"
                value={formData.examDate}
                onChange={(e) => setFormData({ ...formData, examDate: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="editDuration">Duration (minutes)</Label>
              <Input
                id="editDuration"
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 180 })}
                min="1"
              />
            </div>
            <div>
              <Label htmlFor="editAcademicYear">Academic Year</Label>
              <Select value={formData.academicYear} onValueChange={(value) => setFormData({ ...formData, academicYear: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select academic year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2023-24">2023-24</SelectItem>
                  <SelectItem value="2024-25">2024-25</SelectItem>
                  <SelectItem value="2025-26">2025-26</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="editDescription">Description</Label>
            <Textarea
              id="editDescription"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of the exam"
              rows={2}
            />
          </div>

          <div>
            <Label htmlFor="editInstructions">Instructions</Label>
            <Textarea
              id="editInstructions"
              value={formData.instructions}
              onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
              placeholder="Special instructions for students and teachers"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateExam}
              disabled={updateExamMutation.isPending}
            >
              {updateExamMutation.isPending ? "Updating..." : "Update Exam"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}