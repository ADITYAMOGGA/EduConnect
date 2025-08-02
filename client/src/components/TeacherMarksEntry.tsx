import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Calculator, 
  Save, 
  Edit3, 
  Check, 
  X, 
  TrendingUp,
  FileSpreadsheet,
  Loader2,
  AlertCircle,
  Award,
  Users,
  BookOpen,
  Target,
  CheckCircle2,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Plus,
  Minus
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTeacherAuth } from "@/hooks/useTeacherAuth";

interface Student {
  id: string;
  name: string;
  rollNo: string;
  admissionNo: string;
  classLevel: string;
  fatherName: string;
  motherName: string;
  phone: string;
}

interface Subject {
  id: string;
  name: string;
  code: string;
  maxMarks: number;
  passingMarks: number;
}

interface Exam {
  id: string;
  name: string;
  examType: string;
  examDate: string;
  totalMarks: number;
  passingMarks: number;
  status: string;
  classLevel: string;
}

interface Mark {
  id?: string;
  studentId: string;
  examId: string;
  subjectId: string;
  marksObtained: number;
  maxMarks: number;
  grade?: string;
  status: string;
}

interface CellPosition {
  row: number;
  col: number;
}

interface MarksGrid {
  [studentId: string]: {
    [subjectId: string]: number;
  };
}

export default function TeacherMarksEntry() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { teacher, organization, subjects: teacherSubjects } = useTeacherAuth();
  
  // State for selections
  const [selectedExam, setSelectedExam] = useState<string>("");
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  
  // Excel-like grid state
  const [marksGrid, setMarksGrid] = useState<MarksGrid>({});
  const [activeCell, setActiveCell] = useState<CellPosition | null>(null);
  const [editingCell, setEditingCell] = useState<CellPosition | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [saving, setSaving] = useState<Set<string>>(new Set());
  
  // Refs for keyboard navigation
  const gridRef = useRef<HTMLDivElement>(null);
  const cellRefs = useRef<Map<string, HTMLInputElement>>(new Map());
  
  // Get teacher's assigned classes
  const teacherClasses = useMemo(() => {
    if (!teacherSubjects) return [];
    const classes = new Set(teacherSubjects.map((ts: any) => ts.class_level));
    return Array.from(classes).sort();
  }, [teacherSubjects]);

  // Get subjects for selected class
  const availableSubjects = useMemo(() => {
    if (!teacherSubjects || !selectedClass) return [];
    return teacherSubjects
      .filter((ts: any) => ts.class_level === selectedClass)
      .map((ts: any) => ts.subjects)
      .filter(Boolean);
  }, [teacherSubjects, selectedClass]);

  // Fetch exams for selected class
  const { data: exams = [], isLoading: examsLoading } = useQuery<Exam[]>({
    queryKey: ['/api/teacher/exams', selectedClass],
    queryFn: async () => {
      const response = await fetch(`/api/teacher/exams?classLevel=${selectedClass}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch exams');
      return response.json();
    },
    enabled: !!teacher && !!selectedClass,
  });

  // Fetch students for selected class
  const { data: students = [], isLoading: studentsLoading } = useQuery<Student[]>({
    queryKey: ['/api/teacher/students', selectedClass],
    queryFn: async () => {
      const response = await fetch(`/api/teacher/students?classLevel=${selectedClass}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch students');
      return response.json();
    },
    enabled: !!teacher && !!selectedClass,
  });

  // Fetch existing marks
  const { data: existingMarks = [], isLoading: marksLoading } = useQuery<Mark[]>({
    queryKey: ['/api/teacher/marks', selectedExam, selectedSubject],
    queryFn: async () => {
      const response = await fetch(`/api/teacher/marks?examId=${selectedExam}&subjectId=${selectedSubject}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch marks');
      return response.json();
    },
    enabled: !!teacher && !!selectedExam && !!selectedSubject,
  });

  // Get selected subject details
  const selectedSubjectData = useMemo(() => {
    return availableSubjects.find(s => s.id === selectedSubject);
  }, [availableSubjects, selectedSubject]);

  // Get selected exam details
  const selectedExamData = useMemo(() => {
    return exams.find(e => e.id === selectedExam);
  }, [exams, selectedExam]);

  // Initialize marks grid when data changes
  useEffect(() => {
    if (students.length > 0 && selectedSubject && selectedExam) {
      const newGrid: MarksGrid = {};
      students.forEach(student => {
        newGrid[student.id] = {};
        const existingMark = existingMarks.find(m => m.studentId === student.id);
        newGrid[student.id][selectedSubject] = existingMark?.marksObtained || 0;
      });
      setMarksGrid(newGrid);
    }
  }, [students, selectedSubject, selectedExam, existingMarks]);

  // Calculate statistics
  const statistics = useMemo(() => {
    if (!selectedSubjectData || !selectedExamData || students.length === 0) {
      return { 
        totalStudents: 0, 
        averageMarks: 0, 
        passCount: 0, 
        failCount: 0, 
        highestMarks: 0,
        lowestMarks: 0,
        maxPossibleMarks: 0,
        passingMarks: 0
      };
    }

    const maxMarks = selectedSubjectData.maxMarks || selectedExamData.totalMarks;
    const passingMarks = selectedSubjectData.passingMarks || selectedExamData.passingMarks;
    
    const allMarks = students.map(student => marksGrid[student.id]?.[selectedSubject] || 0);
    const validMarks = allMarks.filter(mark => mark > 0);
    
    const average = validMarks.length > 0 ? validMarks.reduce((sum, mark) => sum + mark, 0) / validMarks.length : 0;
    const passCount = allMarks.filter(mark => mark >= passingMarks).length;
    const failCount = validMarks.filter(mark => mark < passingMarks).length;
    const highest = validMarks.length > 0 ? Math.max(...validMarks) : 0;
    const lowest = validMarks.length > 0 ? Math.min(...validMarks) : 0;

    return {
      totalStudents: students.length,
      averageMarks: Math.round(average * 10) / 10,
      passCount,
      failCount,
      highestMarks: highest,
      lowestMarks: lowest,
      maxPossibleMarks: maxMarks,
      passingMarks
    };
  }, [students, marksGrid, selectedSubject, selectedSubjectData, selectedExamData]);

  // Calculate grade
  const getGrade = useCallback((marks: number, maxMarks: number) => {
    const percentage = (marks / maxMarks) * 100;
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B+';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C+';
    if (percentage >= 40) return 'C';
    if (percentage >= 35) return 'D';
    return 'F';
  }, []);

  // Save marks mutation
  const saveMarksMutation = useMutation({
    mutationFn: async ({ studentId, marks }: { studentId: string; marks: number }) => {
      const response = await fetch('/api/teacher/marks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          studentId,
          examId: selectedExam,
          subjectId: selectedSubject,
          marksObtained: marks,
          maxMarks: statistics.maxPossibleMarks
        }),
      });
      if (!response.ok) throw new Error('Failed to save marks');
      return response.json();
    },
    onMutate: ({ studentId }) => {
      setSaving(prev => new Set(prev).add(studentId));
    },
    onSuccess: (_, { studentId }) => {
      setSaving(prev => {
        const newSet = new Set(prev);
        newSet.delete(studentId);
        return newSet;
      });
      queryClient.invalidateQueries({ queryKey: ['/api/teacher/marks'] });
      toast({ title: "Marks saved successfully" });
    },
    onError: (error: any, { studentId }) => {
      setSaving(prev => {
        const newSet = new Set(prev);
        newSet.delete(studentId);
        return newSet;
      });
      toast({
        title: "Failed to save marks",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle cell navigation with keyboard
  const handleKeyDown = useCallback((e: React.KeyboardEvent, row: number, col: number) => {
    if (!students.length) return;

    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        if (row > 0) {
          setActiveCell({ row: row - 1, col });
          setEditingCell(null);
        }
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (row < students.length - 1) {
          setActiveCell({ row: row + 1, col });
          setEditingCell(null);
        }
        break;
      case 'ArrowLeft':
        e.preventDefault();
        if (col > 0) {
          setActiveCell({ row, col: col - 1 });
          setEditingCell(null);
        }
        break;
      case 'ArrowRight':
        e.preventDefault();
        setActiveCell({ row, col: col + 1 });
        setEditingCell(null);
        break;
      case 'Enter':
        e.preventDefault();
        if (editingCell) {
          // Save and move to next row
          handleSaveCell(row, col);
          if (row < students.length - 1) {
            setActiveCell({ row: row + 1, col });
          }
        } else {
          // Start editing
          setEditingCell({ row, col });
          setEditValue(String(marksGrid[students[row].id]?.[selectedSubject] || 0));
        }
        break;
      case 'Escape':
        e.preventDefault();
        setEditingCell(null);
        setEditValue("");
        break;
      case 'Tab':
        e.preventDefault();
        if (col < 2) { // Assuming 3 columns: marks, percentage, grade
          setActiveCell({ row, col: col + 1 });
        } else if (row < students.length - 1) {
          setActiveCell({ row: row + 1, col: 0 });
        }
        setEditingCell(null);
        break;
    }
  }, [students, marksGrid, selectedSubject, editingCell]);

  // Handle cell click
  const handleCellClick = useCallback((row: number, col: number) => {
    setActiveCell({ row, col });
    if (col === 0) { // Only marks column is editable
      setEditingCell({ row, col });
      setEditValue(String(marksGrid[students[row].id]?.[selectedSubject] || 0));
    }
  }, [students, marksGrid, selectedSubject]);

  // Handle marks change
  const handleMarksChange = useCallback((value: string, row: number) => {
    const marks = Math.max(0, Math.min(statistics.maxPossibleMarks, parseInt(value) || 0));
    setEditValue(String(marks));
    
    // Update grid immediately for visual feedback
    const studentId = students[row].id;
    setMarksGrid(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [selectedSubject]: marks
      }
    }));
  }, [students, selectedSubject, statistics.maxPossibleMarks]);

  // Save cell value
  const handleSaveCell = useCallback((row: number, col: number) => {
    if (col !== 0) return; // Only marks column is editable
    
    const studentId = students[row].id;
    const marks = parseInt(editValue) || 0;
    
    if (marks >= 0 && marks <= statistics.maxPossibleMarks) {
      saveMarksMutation.mutate({ studentId, marks });
    }
    
    setEditingCell(null);
    setEditValue("");
  }, [students, editValue, statistics.maxPossibleMarks, saveMarksMutation]);

  // Focus active cell
  useEffect(() => {
    if (activeCell && !editingCell) {
      const cellKey = `${activeCell.row}-${activeCell.col}`;
      const cellRef = cellRefs.current.get(cellKey);
      if (cellRef) {
        cellRef.focus();
      }
    }
  }, [activeCell, editingCell]);

  if (!teacher) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>You must be logged in as a teacher to access marks entry.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
            <FileSpreadsheet className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Excel-Style Marks Entry</h2>
            <p className="text-gray-600">Professional marks management with keyboard navigation</p>
          </div>
        </div>
      </motion.div>

      {/* Selection Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-green-800">
              <BookOpen className="h-5 w-5" />
              <span>Select Class, Exam & Subject</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="class-select" className="text-green-700 font-medium">Class</Label>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger id="class-select" className="bg-white border-green-200 focus:border-green-400">
                    <SelectValue placeholder="Select your class" />
                  </SelectTrigger>
                  <SelectContent>
                    {teacherClasses.map((className) => (
                      <SelectItem key={className} value={className}>
                        Class {className}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="exam-select" className="text-green-700 font-medium">Exam</Label>
                <Select value={selectedExam} onValueChange={setSelectedExam} disabled={!selectedClass}>
                  <SelectTrigger id="exam-select" className="bg-white border-green-200 focus:border-green-400">
                    <SelectValue placeholder="Select an exam" />
                  </SelectTrigger>
                  <SelectContent>
                    {exams.map((exam) => (
                      <SelectItem key={exam.id} value={exam.id}>
                        {exam.name} ({exam.examType})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject-select" className="text-green-700 font-medium">Subject</Label>
                <Select value={selectedSubject} onValueChange={setSelectedSubject} disabled={!selectedClass}>
                  <SelectTrigger id="subject-select" className="bg-white border-green-200 focus:border-green-400">
                    <SelectValue placeholder="Select a subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSubjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id}>
                        {subject.name} ({subject.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {selectedClass && selectedExam && selectedSubject && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ duration: 0.3 }}
                className="mt-4 pt-4 border-t border-green-200"
              >
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center space-x-2 text-green-700">
                    <Users className="h-4 w-4" />
                    <span className="font-medium">{statistics.totalStudents} Students</span>
                  </div>
                  <div className="flex items-center space-x-2 text-green-700">
                    <Target className="h-4 w-4" />
                    <span className="font-medium">Max: {statistics.maxPossibleMarks} marks</span>
                  </div>
                  <div className="flex items-center space-x-2 text-green-700">
                    <Award className="h-4 w-4" />
                    <span className="font-medium">Pass: {statistics.passingMarks} marks</span>
                  </div>
                  <div className="flex items-center space-x-2 text-green-700">
                    <Calculator className="h-4 w-4" />
                    <span className="font-medium">Avg: {statistics.averageMarks}</span>
                  </div>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Statistics Cards */}
      {selectedClass && selectedExam && selectedSubject && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Pass Count</p>
                    <p className="text-2xl font-bold">{statistics.passCount}</p>
                  </div>
                  <CheckCircle2 className="h-8 w-8 opacity-80" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Fail Count</p>
                    <p className="text-2xl font-bold">{statistics.failCount}</p>
                  </div>
                  <X className="h-8 w-8 opacity-80" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Highest</p>
                    <p className="text-2xl font-bold">{statistics.highestMarks}</p>
                  </div>
                  <ArrowUp className="h-8 w-8 opacity-80" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Lowest</p>
                    <p className="text-2xl font-bold">{statistics.lowestMarks}</p>
                  </div>
                  <ArrowDown className="h-8 w-8 opacity-80" />
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      )}

      {/* Excel-like Marks Grid */}
      {selectedClass && selectedExam && selectedSubject && students.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="shadow-xl border-0">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <FileSpreadsheet className="h-5 w-5 text-green-600" />
                  <span>Marks Entry Grid</span>
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    {selectedExamData?.name} - {selectedSubjectData?.name}
                  </Badge>
                  <Badge variant="outline" className="border-green-200 text-green-700">
                    Class {selectedClass}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <div 
                  ref={gridRef}
                  className="min-w-full"
                  tabIndex={0}
                >
                  {/* Header Row */}
                  <div className="grid grid-cols-7 bg-gradient-to-r from-green-50 to-emerald-50 border-b-2 border-green-200 font-semibold text-green-800">
                    <div className="p-3 border-r border-green-200 min-w-[200px]">Student Name</div>
                    <div className="p-3 border-r border-green-200 min-w-[100px]">Roll No.</div>
                    <div className="p-3 border-r border-green-200 min-w-[120px] text-center">
                      Marks Obtained
                      <div className="text-xs text-green-600 font-normal">
                        (Max: {statistics.maxPossibleMarks})
                      </div>
                    </div>
                    <div className="p-3 border-r border-green-200 min-w-[100px] text-center">Percentage</div>
                    <div className="p-3 border-r border-green-200 min-w-[80px] text-center">Grade</div>
                    <div className="p-3 border-r border-green-200 min-w-[80px] text-center">Status</div>
                    <div className="p-3 min-w-[100px] text-center">Actions</div>
                  </div>

                  {/* Data Rows */}
                  <AnimatePresence>
                    {students.map((student, rowIndex) => {
                      const marks = marksGrid[student.id]?.[selectedSubject] || 0;
                      const percentage = statistics.maxPossibleMarks > 0 ? (marks / statistics.maxPossibleMarks) * 100 : 0;
                      const grade = getGrade(marks, statistics.maxPossibleMarks);
                      const isPassing = marks >= statistics.passingMarks;
                      const isActive = activeCell?.row === rowIndex;
                      const isSaving = saving.has(student.id);

                      return (
                        <motion.div
                          key={student.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2, delay: rowIndex * 0.02 }}
                          className={`grid grid-cols-7 border-b border-gray-200 hover:bg-green-50/50 transition-colors ${
                            isActive ? 'bg-green-100 ring-2 ring-green-300' : ''
                          }`}
                        >
                          {/* Student Name */}
                          <div className="p-3 border-r border-gray-200 font-medium">
                            <div>{student.name}</div>
                            <div className="text-xs text-gray-500">{student.admissionNo}</div>
                          </div>

                          {/* Roll Number */}
                          <div className="p-3 border-r border-gray-200 text-center">
                            {student.rollNo || '-'}
                          </div>

                          {/* Marks Input */}
                          <div className="p-1 border-r border-gray-200">
                            {editingCell?.row === rowIndex && editingCell?.col === 0 ? (
                              <Input
                                ref={(el) => {
                                  if (el) cellRefs.current.set(`${rowIndex}-0`, el);
                                }}
                                type="number"
                                min="0"
                                max={statistics.maxPossibleMarks}
                                value={editValue}
                                onChange={(e) => handleMarksChange(e.target.value, rowIndex)}
                                onKeyDown={(e) => handleKeyDown(e, rowIndex, 0)}
                                onBlur={() => handleSaveCell(rowIndex, 0)}
                                className="text-center border-green-300 focus:border-green-500"
                                autoFocus
                              />
                            ) : (
                              <div
                                ref={(el) => {
                                  if (el) cellRefs.current.set(`${rowIndex}-0`, el as any);
                                }}
                                className={`p-2 text-center cursor-pointer hover:bg-green-100 rounded transition-colors ${
                                  activeCell?.row === rowIndex && activeCell?.col === 0 ? 'bg-green-200' : ''
                                }`}
                                onClick={() => handleCellClick(rowIndex, 0)}
                                onKeyDown={(e) => handleKeyDown(e, rowIndex, 0)}
                                tabIndex={0}
                              >
                                {isSaving ? (
                                  <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                                ) : (
                                  <span className={`font-medium ${marks > 0 ? 'text-gray-900' : 'text-gray-400'}`}>
                                    {marks}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Percentage */}
                          <div 
                            ref={(el) => {
                              if (el) cellRefs.current.set(`${rowIndex}-1`, el as any);
                            }}
                            className={`p-3 border-r border-gray-200 text-center cursor-pointer ${
                              activeCell?.row === rowIndex && activeCell?.col === 1 ? 'bg-green-100' : ''
                            }`}
                            onClick={() => handleCellClick(rowIndex, 1)}
                            onKeyDown={(e) => handleKeyDown(e, rowIndex, 1)}
                            tabIndex={0}
                          >
                            <span className={`font-medium ${
                              percentage >= 60 ? 'text-green-600' : 
                              percentage >= 35 ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                              {percentage.toFixed(1)}%
                            </span>
                          </div>

                          {/* Grade */}
                          <div 
                            ref={(el) => {
                              if (el) cellRefs.current.set(`${rowIndex}-2`, el as any);
                            }}
                            className={`p-3 border-r border-gray-200 text-center cursor-pointer ${
                              activeCell?.row === rowIndex && activeCell?.col === 2 ? 'bg-green-100' : ''
                            }`}
                            onClick={() => handleCellClick(rowIndex, 2)}
                            onKeyDown={(e) => handleKeyDown(e, rowIndex, 2)}
                            tabIndex={0}
                          >
                            <Badge 
                              variant={grade === 'F' ? 'destructive' : grade.startsWith('A') ? 'default' : 'secondary'}
                              className="font-medium"
                            >
                              {grade}
                            </Badge>
                          </div>

                          {/* Status */}
                          <div className="p-3 border-r border-gray-200 text-center">
                            <Badge variant={isPassing ? 'default' : 'destructive'} className="text-xs">
                              {isPassing ? 'PASS' : 'FAIL'}
                            </Badge>
                          </div>

                          {/* Actions */}
                          <div className="p-3 text-center">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleCellClick(rowIndex, 0)}
                              className="h-6 w-6 p-0 hover:bg-green-100"
                            >
                              <Edit3 className="h-3 w-3" />
                            </Button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </div>

              {/* Keyboard shortcuts info */}
              <div className="p-4 bg-gray-50 border-t">
                <div className="text-xs text-gray-600 space-y-1">
                  <p className="font-medium">Keyboard Shortcuts:</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <span><kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">↑↓←→</kbd> Navigate</span>
                    <span><kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">Enter</kbd> Edit/Save</span>
                    <span><kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">Tab</kbd> Next cell</span>
                    <span><kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">Esc</kbd> Cancel</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Empty state */}
      {(!selectedClass || !selectedExam || !selectedSubject) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="border-2 border-dashed border-gray-300">
            <CardContent className="text-center py-12">
              <FileSpreadsheet className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Select Class, Exam & Subject</h3>
              <p className="text-gray-500">
                Choose a class, exam, and subject from the dropdowns above to start entering marks
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {selectedClass && selectedExam && selectedSubject && students.length === 0 && !studentsLoading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No students found for the selected class. Please check with your school administrator.
            </AlertDescription>
          </Alert>
        </motion.div>
      )}
    </div>
  );
}