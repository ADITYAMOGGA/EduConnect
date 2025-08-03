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
import { 
  Save,
  BookOpen,
  Users,
  Award,
  Calculator
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTeacherAuth } from "@/hooks/useTeacherAuth";

interface Student {
  id: string;
  name: string;
  admissionNo: string;
  rollNo: string;
  classLevel: string;
}

interface Exam {
  id: string;
  name: string;
  type: string;
  class_level: string;
  status: string;
}

interface TeacherClass {
  className: string;
  subjects: Array<{
    code: string;
    name: string;
  }>;
}

interface Mark {
  id?: string;
  studentId: string;
  examId: string;
  subjectName: string;
  marksObtained: number;
  maxMarks: number;
  grade?: string;
}

export default function TeacherMarksEntry() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { teacher, isAuthenticated } = useTeacherAuth();
  
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [selectedExam, setSelectedExam] = useState<string>("");
  const [maxMarks, setMaxMarks] = useState<number>(100);
  const [passingMarks, setPassingMarks] = useState<number>(35);
  const [marksData, setMarksData] = useState<{ [studentId: string]: number }>({});
  const [editingCell, setEditingCell] = useState<string | null>(null);

  // Fetch teacher's classes and subjects
  const { data: teacherClasses = [], isLoading: classesLoading } = useQuery<TeacherClass[]>({
    queryKey: ['/api/teacher/classes'],
    queryFn: async () => {
      const response = await fetch('/api/teacher/classes', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch classes');
      return response.json();
    },
    enabled: isAuthenticated,
  });

  // Fetch available exams for selected class
  const { data: exams = [] } = useQuery<Exam[]>({
    queryKey: ['/api/teacher/exams', selectedClass],
    queryFn: async () => {
      const response = await fetch('/api/teacher/exams', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch exams');
      const allExams = await response.json();
      return allExams.filter((exam: Exam) => exam.class_level === selectedClass);
    },
    enabled: !!selectedClass && isAuthenticated,
  });

  // Fetch students for selected class
  const { data: students = [] } = useQuery<Student[]>({
    queryKey: ['/api/teacher/students', selectedClass],
    queryFn: async () => {
      const response = await fetch('/api/teacher/students', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch students');
      const allStudents = await response.json();
      return allStudents.filter((student: Student) => student.classLevel === selectedClass);
    },
    enabled: !!selectedClass && isAuthenticated,
  });

  // Fetch existing marks for selected exam and subject
  const { data: existingMarks = [] } = useQuery<Mark[]>({
    queryKey: ['/api/teacher/marks', selectedExam, selectedSubject],
    queryFn: async () => {
      const response = await fetch('/api/teacher/marks', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch marks');
      const allMarks = await response.json();
      return allMarks.filter((mark: any) => 
        mark.exam_id === selectedExam && mark.subject_name === selectedSubject
      );
    },
    enabled: !!selectedExam && !!selectedSubject && isAuthenticated,
  });

  // Get available subjects for selected class
  const availableSubjects = teacherClasses
    .find(tc => tc.className === selectedClass)?.subjects || [];

  // Initialize marks data when existing marks are loaded
  useEffect(() => {
    const initialMarks: { [studentId: string]: number } = {};
    existingMarks.forEach(mark => {
      initialMarks[mark.studentId] = mark.marksObtained;
    });
    setMarksData(initialMarks);
  }, [existingMarks]);

  // Save marks mutation
  const saveMarksMutation = useMutation({
    mutationFn: async () => {
      const marksToSave = students.map(student => ({
        studentId: student.id,
        examId: selectedExam,
        subjectName: selectedSubject,
        marksObtained: marksData[student.id] || 0,
        maxMarks,
        grade: calculateGrade(marksData[student.id] || 0, maxMarks, passingMarks)
      }));

      const response = await fetch('/api/teacher/marks/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          marks: marksToSave,
          maxMarks,
          passingMarks
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save marks');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Marks saved successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/teacher/marks'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save marks",
        variant: "destructive",
      });
    },
  });

  const calculateGrade = (obtained: number, max: number, passing: number): string => {
    const percentage = (obtained / max) * 100;
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B+';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C';
    if (percentage >= passing) return 'D';
    return 'F';
  };

  const handleMarksChange = (studentId: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    if (numValue >= 0 && numValue <= maxMarks) {
      setMarksData(prev => ({
        ...prev,
        [studentId]: numValue
      }));
    }
  };

  const canSaveMarks = selectedClass && selectedSubject && selectedExam && students.length > 0;

  if (classesLoading) {
    return <div className="text-center py-8">Loading your classes...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Marks Entry</h2>
          <p className="text-muted-foreground">
            Enter marks for your assigned subjects and classes
          </p>
        </div>
      </div>

      {/* Filter Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Select Class, Subject & Exam
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="class">Class</Label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {teacherClasses.map(tc => (
                    <SelectItem key={tc.className} value={tc.className}>
                      Class {tc.className}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="subject">Subject</Label>
              <Select 
                value={selectedSubject} 
                onValueChange={setSelectedSubject}
                disabled={!selectedClass}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {availableSubjects.map(subject => (
                    <SelectItem key={subject.code} value={subject.name}>
                      {subject.name} ({subject.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="exam">Exam</Label>
              <Select 
                value={selectedExam} 
                onValueChange={setSelectedExam}
                disabled={!selectedClass}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select exam" />
                </SelectTrigger>
                <SelectContent>
                  {exams.map(exam => (
                    <SelectItem key={exam.id} value={exam.id}>
                      {exam.name} ({exam.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Marks Configuration */}
          {selectedSubject && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 p-4 bg-muted rounded-lg">
              <div>
                <Label htmlFor="maxMarks">Maximum Marks</Label>
                <Input
                  id="maxMarks"
                  type="number"
                  value={maxMarks}
                  onChange={(e) => setMaxMarks(parseInt(e.target.value) || 100)}
                  min="1"
                  max="1000"
                />
              </div>
              <div>
                <Label htmlFor="passingMarks">Passing Marks</Label>
                <Input
                  id="passingMarks"
                  type="number"
                  value={passingMarks}
                  onChange={(e) => setPassingMarks(parseInt(e.target.value) || 35)}
                  min="1"
                  max={maxMarks}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Excel-like Marks Entry Table */}
      {selectedClass && selectedSubject && selectedExam && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Student Marks Entry
            </CardTitle>
            <CardDescription>
              Class {selectedClass} - {selectedSubject} - {exams.find(e => e.id === selectedExam)?.name}
            </CardDescription>
            <div className="flex justify-between items-center">
              <Badge variant="outline">
                Total Students: {students.length}
              </Badge>
              <Button 
                onClick={() => saveMarksMutation.mutate()}
                disabled={!canSaveMarks || saveMarksMutation.isPending}
                className="ml-auto"
              >
                <Save className="h-4 w-4 mr-2" />
                {saveMarksMutation.isPending ? 'Saving...' : 'Save All Marks'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted">
                    <TableHead className="w-20">Roll No</TableHead>
                    <TableHead className="w-32">Admission No</TableHead>
                    <TableHead className="min-w-48">Student Name</TableHead>
                    <TableHead className="w-32 text-center">
                      Marks Obtained (/{maxMarks})
                    </TableHead>
                    <TableHead className="w-20 text-center">Grade</TableHead>
                    <TableHead className="w-24 text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => {
                    const obtainedMarks = marksData[student.id] || 0;
                    const grade = calculateGrade(obtainedMarks, maxMarks, passingMarks);
                    const isPassing = obtainedMarks >= passingMarks;

                    return (
                      <TableRow key={student.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">
                          {student.rollNo}
                        </TableCell>
                        <TableCell>{student.admissionNo}</TableCell>
                        <TableCell className="font-medium">
                          {student.name}
                        </TableCell>
                        <TableCell className="text-center">
                          <Input
                            type="number"
                            value={marksData[student.id] || ''}
                            onChange={(e) => handleMarksChange(student.id, e.target.value)}
                            className="w-full text-center border-2 focus:border-primary"
                            placeholder="0"
                            min="0"
                            max={maxMarks}
                            onFocus={() => setEditingCell(student.id)}
                            onBlur={() => setEditingCell(null)}
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant={grade === 'F' ? 'destructive' : 'default'}>
                            {grade}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant={isPassing ? 'default' : 'destructive'}>
                            {isPassing ? 'Pass' : 'Fail'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {students.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No students found for the selected class.
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      {!selectedClass && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Select a class, subject, and exam to start entering marks.</p>
              <p className="text-sm mt-2">
                You can only see classes and subjects assigned to you.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}