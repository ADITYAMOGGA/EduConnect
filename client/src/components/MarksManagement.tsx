import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Search, 
  Edit, 
  Save, 
  X,
  FileText,
  Users,
  BookOpen,
  TrendingUp,
  Download,
  Filter,
  GraduationCap,
  Award,
  BarChart3,
  Plus
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useOrgAuth } from "@/hooks/useOrgAuth";
import { useTeacherAuth } from "@/hooks/useTeacherAuth";

interface Exam {
  id: string;
  name: string;
  classLevel: string;
  examType: string;
  totalMarks: number;
  academicYear: string;
  status: string;
}

interface Student {
  id: string;
  name: string;
  admissionNo: string;
  classLevel: string;
  section: string;
  rollNo: string;
}

interface Subject {
  id: string;
  name: string;
  code: string;
  classLevel: string;
  maxMarks: number;
}

interface Mark {
  id: string;
  studentId: string;
  examId: string;
  subjectId: string;
  subjectName: string;
  marksObtained: number;
  maxMarks: number;
  grade?: string;
  remarks?: string;
  status: string;
  student?: Student;
  subject?: Subject;
}

interface MarksEditData {
  studentId: string;
  marksObtained: number;
  remarks?: string;
}

export default function MarksManagement() {
  const [selectedExam, setSelectedExam] = useState<string>("");
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [editingMarks, setEditingMarks] = useState<{[key: string]: MarksEditData}>({});
  const [showBulkEntry, setShowBulkEntry] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { orgId, isAuthenticated } = useOrgAuth();

  // Fetch exams
  const { data: exams = [] } = useQuery<Exam[]>({
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

  // Fetch students for selected class
  const { data: students = [] } = useQuery<Student[]>({
    queryKey: ['/api/org/students', orgId, selectedClass],
    queryFn: async () => {
      const response = await fetch(`/api/org/students?orgId=${orgId}&class=${selectedClass}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch students');
      return response.json();
    },
    enabled: !!orgId && !!selectedClass && isAuthenticated,
  });

  // Fetch subjects for selected class
  const { data: subjects = [] } = useQuery<Subject[]>({
    queryKey: ['/api/org/subjects', orgId, selectedClass],
    queryFn: async () => {
      const response = await fetch(`/api/org/subjects?orgId=${orgId}&class=${selectedClass}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch subjects');
      return response.json();
    },
    enabled: !!orgId && !!selectedClass && isAuthenticated,
  });

  // Fetch marks for selected exam and subject
  const { data: marks = [], isLoading: marksLoading } = useQuery<Mark[]>({
    queryKey: ['/api/org/marks', orgId, selectedExam, selectedSubject],
    queryFn: async () => {
      const response = await fetch(`/api/org/marks?orgId=${orgId}&examId=${selectedExam}&subjectId=${selectedSubject}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch marks');
      return response.json();
    },
    enabled: !!orgId && !!selectedExam && !!selectedSubject && isAuthenticated,
  });

  // Update marks mutation
  const updateMarksMutation = useMutation({
    mutationFn: async (marksData: MarksEditData[]) => {
      const response = await fetch(`/api/org/marks/bulk-update?orgId=${orgId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          examId: selectedExam,
          subjectId: selectedSubject,
          marks: marksData
        }),
      });
      if (!response.ok) throw new Error('Failed to update marks');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/org/marks'] });
      setEditingMarks({});
      toast({
        title: "Success",
        description: "Marks updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update marks",
        variant: "destructive",
      });
    },
  });

  // Create marks for students who don't have marks yet
  const createMarksMutation = useMutation({
    mutationFn: async () => {
      const studentsWithoutMarks = students.filter(student => 
        !marks.some(mark => mark.studentId === student.id)
      );

      if (studentsWithoutMarks.length === 0) {
        throw new Error("All students already have marks for this exam and subject");
      }

      const response = await fetch(`/api/org/marks/bulk-create?orgId=${orgId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          examId: selectedExam,
          subjectId: selectedSubject,
          studentIds: studentsWithoutMarks.map(s => s.id)
        }),
      });
      if (!response.ok) throw new Error('Failed to create marks');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/org/marks'] });
      toast({
        title: "Success",
        description: "Mark entries created for all students",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create marks",
        variant: "destructive",
      });
    },
  });

  const handleMarkEdit = (studentId: string, field: 'marksObtained' | 'remarks', value: string | number) => {
    setEditingMarks(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        studentId,
        [field]: field === 'marksObtained' ? Number(value) : value
      }
    }));
  };

  const handleSaveMarks = () => {
    const marksToUpdate = Object.values(editingMarks).filter(mark => 
      mark.marksObtained !== undefined && mark.marksObtained >= 0
    );

    if (marksToUpdate.length === 0) {
      toast({
        title: "No Changes",
        description: "No marks to update",
        variant: "destructive",
      });
      return;
    }

    updateMarksMutation.mutate(marksToUpdate);
  };

  const handleCreateMarksForAllStudents = () => {
    createMarksMutation.mutate();
  };

  const getGrade = (marksObtained: number, maxMarks: number) => {
    const percentage = (marksObtained / maxMarks) * 100;
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B+';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C+';
    if (percentage >= 40) return 'C';
    if (percentage >= 35) return 'D';
    return 'F';
  };

  // Get unique classes from exams
  const availableClasses = Array.from(new Set(exams.map(e => e.classLevel))).sort();

  // Filter marks based on search
  const filteredMarks = marks.filter(mark => 
    searchTerm === "" || 
    mark.student?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mark.student?.admissionNo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate statistics
  const totalStudents = students.length;
  const studentsWithMarks = marks.length;
  const averageMarks = marks.length > 0 ? marks.reduce((sum, mark) => sum + mark.marksObtained, 0) / marks.length : 0;
  const maxMarksInSubject = subjects.find(s => s.id === selectedSubject)?.maxMarks || 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Marks Management</h2>
          <p className="text-gray-600">View and manage student marks by exam and subject</p>
        </div>
      </div>

      {/* Selection Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Select Exam and Subject
          </CardTitle>
          <CardDescription>Choose exam, class, and subject to view and manage marks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="exam">Exam *</Label>
              <Select value={selectedExam} onValueChange={setSelectedExam}>
                <SelectTrigger>
                  <SelectValue placeholder="Select exam" />
                </SelectTrigger>
                <SelectContent>
                  {exams.map(exam => (
                    <SelectItem key={exam.id} value={exam.id}>
                      {exam.name} - Class {exam.classLevel}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="class">Class *</Label>
              <Select 
                value={selectedClass} 
                onValueChange={(value) => {
                  setSelectedClass(value);
                  setSelectedSubject(""); // Reset subject when class changes
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {availableClasses.map(cls => (
                    <SelectItem key={cls} value={cls}>Class {cls}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="subject">Subject *</Label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map(subject => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name} ({subject.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards - Only show when exam and subject are selected */}
      {selectedExam && selectedSubject && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Total Students</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold">{totalStudents}</div>
                <Users className="w-8 h-8 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Marks Entered</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold">{studentsWithMarks}</div>
                <GraduationCap className="w-8 h-8 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Average Marks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold">{averageMarks.toFixed(1)}</div>
                <BarChart3 className="w-8 h-8 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Max Marks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold">{maxMarksInSubject}</div>
                <Award className="w-8 h-8 opacity-80" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Marks Table */}
      {selectedExam && selectedSubject && (
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle>Student Marks</CardTitle>
                <CardDescription>
                  Exam: {exams.find(e => e.id === selectedExam)?.name} | 
                  Subject: {subjects.find(s => s.id === selectedSubject)?.name}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                {studentsWithMarks < totalStudents && (
                  <Button 
                    variant="outline" 
                    onClick={handleCreateMarksForAllStudents}
                    disabled={createMarksMutation.isPending}
                  >
                    Create Marks for All Students
                  </Button>
                )}
                {Object.keys(editingMarks).length > 0 && (
                  <Button 
                    onClick={handleSaveMarks}
                    disabled={updateMarksMutation.isPending}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Search */}
            <div className="mb-4">
              <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {marksLoading ? (
              <div className="text-center py-8">Loading marks...</div>
            ) : filteredMarks.length === 0 && students.length > 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Marks Found</h3>
                <p className="text-gray-600 mb-4">
                  No marks have been entered for this exam and subject yet.
                </p>
                <Button onClick={handleCreateMarksForAllStudents}>
                  Create Marks for All Students
                </Button>
              </div>
            ) : filteredMarks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Select exam, class, and subject to view marks.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Admission No</TableHead>
                    <TableHead>Roll No</TableHead>
                    <TableHead>Marks Obtained</TableHead>
                    <TableHead>Max Marks</TableHead>
                    <TableHead>Percentage</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Remarks</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMarks.map((mark) => {
                    const isEditing = editingMarks[mark.studentId];
                    const currentMarks = isEditing?.marksObtained ?? mark.marksObtained;
                    const percentage = (currentMarks / mark.maxMarks) * 100;
                    const grade = getGrade(currentMarks, mark.maxMarks);

                    return (
                      <TableRow key={mark.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{mark.student?.name}</p>
                            <p className="text-sm text-gray-500">Class {mark.student?.classLevel}-{mark.student?.section}</p>
                          </div>
                        </TableCell>
                        <TableCell>{mark.student?.admissionNo}</TableCell>
                        <TableCell>{mark.student?.rollNo || '-'}</TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            max={mark.maxMarks}
                            value={currentMarks}
                            onChange={(e) => handleMarkEdit(mark.studentId, 'marksObtained', e.target.value)}
                            className="w-20"
                          />
                        </TableCell>
                        <TableCell>{mark.maxMarks}</TableCell>
                        <TableCell>
                          <span className={`font-medium ${percentage >= 60 ? 'text-green-600' : percentage >= 35 ? 'text-yellow-600' : 'text-red-600'}`}>
                            {percentage.toFixed(1)}%
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={grade === 'F' ? 'destructive' : grade.startsWith('A') ? 'default' : 'secondary'}
                          >
                            {grade}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Input
                            placeholder="Add remarks..."
                            value={isEditing?.remarks ?? mark.remarks ?? ''}
                            onChange={(e) => handleMarkEdit(mark.studentId, 'remarks', e.target.value)}
                            className="w-32"
                          />
                        </TableCell>
                        <TableCell>
                          <Badge variant={mark.status === 'verified' ? 'default' : 'secondary'}>
                            {mark.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}