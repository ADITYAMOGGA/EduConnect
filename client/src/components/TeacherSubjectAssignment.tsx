import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Plus, 
  Search, 
  Trash2, 
  UserPlus, 
  BookOpen, 
  Users,
  Filter,
  Calendar,
  GraduationCap
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useOrgAuth } from "@/hooks/useOrgAuth";
import type { Teacher, Subject, TeacherSubject } from "@shared/schema";

interface TeacherSubjectWithDetails extends TeacherSubject {
  teacher?: Teacher;
  subject?: Subject;
}

export default function TeacherSubjectAssignment() {
  const [selectedTeacher, setSelectedTeacher] = useState<string>("");
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [academicYear, setAcademicYear] = useState<string>("2024-25");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [filterClass, setFilterClass] = useState<string>("all");
  const [filterTeacher, setFilterTeacher] = useState<string>("all");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { orgId, isAuthenticated } = useOrgAuth();

  // Fetch teachers
  const { data: teachers = [], isLoading: teachersLoading } = useQuery<Teacher[]>({
    queryKey: ['/api/org/teachers', orgId],
    queryFn: async () => {
      const response = await fetch(`/api/org/teachers?orgId=${orgId}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch teachers');
      return response.json();
    },
    enabled: !!orgId && isAuthenticated,
  });

  // Fetch subjects (filtered by selected class if specified)
  const { data: subjects = [], isLoading: subjectsLoading } = useQuery<Subject[]>({
    queryKey: ['/api/org/subjects', orgId, selectedClass],
    queryFn: async () => {
      const url = selectedClass 
        ? `/api/org/subjects?orgId=${orgId}&class=${selectedClass}`
        : `/api/org/subjects?orgId=${orgId}`;
      
      const response = await fetch(url, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch subjects');
      return response.json();
    },
    enabled: !!orgId && isAuthenticated,
  });

  // Fetch teacher-subject assignments
  const { data: assignments = [], isLoading: assignmentsLoading } = useQuery<TeacherSubjectWithDetails[]>({
    queryKey: ['/api/org/teacher-subjects', orgId],
    queryFn: async () => {
      const response = await fetch(`/api/org/teacher-subjects?orgId=${orgId}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch assignments');
      return response.json();
    },
    enabled: !!orgId && isAuthenticated,
  });

  // Create assignment mutation
  const createAssignmentMutation = useMutation({
    mutationFn: async (assignmentData: any) => {
      const response = await fetch(`/api/org/teacher-subjects?orgId=${orgId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(assignmentData),
      });
      if (!response.ok) throw new Error('Failed to create assignment');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/org/teacher-subjects'] });
      toast({
        title: "Success",
        description: "Teacher assigned to subject successfully",
      });
      setShowAssignModal(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to assign teacher to subject",
        variant: "destructive",
      });
    },
  });

  // Delete assignment mutation
  const deleteAssignmentMutation = useMutation({
    mutationFn: async (assignmentId: string) => {
      const response = await fetch(`/api/org/teacher-subjects/${assignmentId}?orgId=${orgId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to delete assignment');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/org/teacher-subjects'] });
      toast({
        title: "Success",
        description: "Assignment removed successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove assignment",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setSelectedTeacher("");
    setSelectedSubject("");
    setSelectedClass("");
  };

  const handleAssignTeacher = () => {
    if (!selectedTeacher || !selectedSubject || !selectedClass) {
      toast({
        title: "Error",
        description: "Please select teacher, subject, and class",
        variant: "destructive",
      });
      return;
    }

    createAssignmentMutation.mutate({
      teacherId: selectedTeacher,
      subjectId: selectedSubject,
      classLevel: selectedClass,
      academicYear,
    });
  };

  // Filter assignments
  const filteredAssignments = assignments.filter((assignment) => {
    const matchesClass = filterClass === "all" || assignment.classLevel === filterClass;
    const matchesTeacher = filterTeacher === "all" || assignment.teacherId === filterTeacher;
    const matchesSearch = searchTerm === "" || 
      assignment.teacher?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.subject?.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesClass && matchesTeacher && matchesSearch;
  });

  // Get unique classes from assignments
  const availableClasses = Array.from(new Set(assignments.map(a => a.classLevel))).sort();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Teacher-Subject Assignment</h2>
          <p className="text-gray-600">Assign teachers to subjects for different classes</p>
        </div>
        <Button onClick={() => setShowAssignModal(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Assign Teacher
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Total Teachers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">{teachers.length}</div>
              <GraduationCap className="w-8 h-8 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Total Subjects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">{subjects.length}</div>
              <BookOpen className="w-8 h-8 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Active Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">{assignments.length}</div>
              <Users className="w-8 h-8 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Academic Year</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{academicYear}</div>
              <Calendar className="w-8 h-8 opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter Assignments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="search"
                  placeholder="Search by teacher or subject name..."
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
              <Label htmlFor="filterTeacher">Filter by Teacher</Label>
              <Select value={filterTeacher} onValueChange={setFilterTeacher}>
                <SelectTrigger>
                  <SelectValue placeholder="All teachers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Teachers</SelectItem>
                  {teachers.map(teacher => (
                    <SelectItem key={teacher.id} value={teacher.id}>
                      {teacher.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assignments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Current Assignments</CardTitle>
          <CardDescription>
            {filteredAssignments.length} assignment{filteredAssignments.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {assignmentsLoading ? (
            <div className="text-center py-8">Loading assignments...</div>
          ) : filteredAssignments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No assignments found. Start by assigning teachers to subjects.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Teacher</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Academic Year</TableHead>
                  <TableHead>Assigned Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssignments.map((assignment) => (
                  <TableRow key={assignment.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <GraduationCap className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">{assignment.teacher?.name}</p>
                          <p className="text-sm text-gray-500">{assignment.teacher?.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-purple-600" />
                        <div>
                          <p className="font-medium">{assignment.subject?.name}</p>
                          <p className="text-sm text-gray-500">Code: {assignment.subject?.code}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">Class {assignment.classLevel}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{assignment.academicYear}</Badge>
                    </TableCell>
                    <TableCell>
                      {assignment.createdAt ? new Date(assignment.createdAt).toLocaleDateString() : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteAssignmentMutation.mutate(assignment.id)}
                        disabled={deleteAssignmentMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Assignment Modal */}
      <Dialog open={showAssignModal} onOpenChange={setShowAssignModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Teacher to Subject</DialogTitle>
            <DialogDescription>
              Select a teacher, subject, and class to create a new assignment
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="teacher">Teacher *</Label>
              <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
                <SelectTrigger>
                  <SelectValue placeholder="Select teacher" />
                </SelectTrigger>
                <SelectContent>
                  {teachers.map(teacher => (
                    <SelectItem key={teacher.id} value={teacher.id}>
                      {teacher.name} ({teacher.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="subject">Subject *</Label>
              <Select 
                value={selectedSubject} 
                onValueChange={setSelectedSubject}
                disabled={!selectedClass}
              >
                <SelectTrigger>
                  <SelectValue placeholder={!selectedClass ? "Select class first" : "Choose a subject"} />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map(subject => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name} ({subject.code}) - Class {subject.class_level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedClass && subjects.length === 0 && (
                <p className="text-sm text-gray-500 mt-1">
                  No subjects found for Class {selectedClass}. Create subjects first.
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="class">Class *</Label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Class 1</SelectItem>
                  <SelectItem value="2">Class 2</SelectItem>
                  <SelectItem value="3">Class 3</SelectItem>
                  <SelectItem value="4">Class 4</SelectItem>
                  <SelectItem value="5">Class 5</SelectItem>
                  <SelectItem value="6">Class 6</SelectItem>
                  <SelectItem value="7">Class 7</SelectItem>
                  <SelectItem value="8">Class 8</SelectItem>
                  <SelectItem value="9">Class 9</SelectItem>
                  <SelectItem value="10">Class 10</SelectItem>
                  <SelectItem value="11">Class 11</SelectItem>
                  <SelectItem value="12">Class 12</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="academicYear">Academic Year</Label>
              <Select value={academicYear} onValueChange={setAcademicYear}>
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

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAssignModal(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAssignTeacher}
              disabled={createAssignmentMutation.isPending}
            >
              {createAssignmentMutation.isPending ? "Assigning..." : "Assign Teacher"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}