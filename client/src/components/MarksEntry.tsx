import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Award, 
  Users, 
  Calculator, 
  Save, 
  Edit3, 
  Check, 
  X, 
  TrendingUp,
  FileSpreadsheet,
  Loader2,
  AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { apiRequest } from "@/lib/queryClient";

type Student = {
  id: string;
  name: string;
  admissionNumber: string;
  class: string;
  email?: string;
};

type Subject = {
  id: string;
  name: string;
  code: string;
  maxMarks?: number;
};

type Exam = {
  id: string;
  name: string;
  date: string;
  maxMarks: number;
};

type Mark = {
  id: string;
  studentId: string;
  examId: string;
  subject: string;
  marks: number;
  maxMarks: number;
  student?: Student;
};

type StudentMarksRow = {
  student: Student;
  marks: { [subject: string]: number };
  total: number;
  percentage: number;
  grade: string;
  isEditing: boolean;
};

export default function MarksEntry() {
  const [selectedExam, setSelectedExam] = useState<string>("");
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [editingRows, setEditingRows] = useState<Set<string>>(new Set());
  const [marksData, setMarksData] = useState<{ [studentId: string]: { [subject: string]: number } }>({});
  const [savingRows, setSavingRows] = useState<Set<string>>(new Set());
  const [bulkEditMode, setBulkEditMode] = useState<boolean>(false);
  const [bulkSaving, setBulkSaving] = useState<boolean>(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch data
  const { data: exams = [] } = useQuery<Exam[]>({
    queryKey: ['/api/exams'],
  });

  const { data: students = [] } = useQuery<Student[]>({
    queryKey: ['/api/students'],
  });

  const { data: allSubjects = [] } = useQuery<Subject[]>({
    queryKey: ['/api/subjects'],
  });

  const { data: existingMarks = [] } = useQuery<Mark[]>({
    queryKey: ['/api/marks', selectedExam],
    enabled: !!selectedExam,
  });

  // Filter data based on selections
  const selectedExamData = exams.find(e => e.id === selectedExam);
  
  const subjects = useMemo(() => {
    if (!selectedExam || !selectedExamData) return [];
    return allSubjects.filter(subject => 
      subject.code.includes(selectedExamData.name)
    );
  }, [selectedExam, selectedExamData, allSubjects]);

  const filteredStudents = useMemo(() => {
    if (!selectedClass) return students;
    return students.filter(student => student.class === selectedClass);
  }, [students, selectedClass]);

  const classes = useMemo(() => {
    const classSet = new Set(students.map(s => s.class));
    return Array.from(classSet).sort();
  }, [students]);

  // Initialize marks data when exam or students change
  useEffect(() => {
    if (selectedExam && filteredStudents.length > 0 && subjects.length > 0) {
      const newMarksData: { [studentId: string]: { [subject: string]: number } } = {};
      
      filteredStudents.forEach(student => {
        newMarksData[student.id] = {};
        subjects.forEach(subject => {
          const existingMark = existingMarks.find(
            mark => mark.studentId === student.id && mark.subject === subject.name
          );
          newMarksData[student.id][subject.name] = existingMark?.marks || 0;
        });
      });
      
      setMarksData(newMarksData);
    }
  }, [selectedExam, filteredStudents, subjects, existingMarks]);

  // Calculate student rows with totals and grades
  const studentRows: StudentMarksRow[] = useMemo(() => {
    return filteredStudents.map(student => {
      const studentMarks = marksData[student.id] || {};
      const total = Object.values(studentMarks).reduce((sum, mark) => sum + (mark || 0), 0);
      // Use default 100 marks per subject if maxMarks is not defined
      const maxTotal = subjects.reduce((sum, subject) => sum + (subject.maxMarks || 100), 0);
      const percentage = maxTotal > 0 ? (total / maxTotal) * 100 : 0;
      
      const getGrade = (percentage: number) => {
        if (percentage >= 90) return 'A+';
        if (percentage >= 80) return 'A';
        if (percentage >= 70) return 'B+';
        if (percentage >= 60) return 'B';
        if (percentage >= 50) return 'C';
        return 'F';
      };

      return {
        student,
        marks: studentMarks,
        total,
        percentage,
        grade: getGrade(percentage),
        isEditing: editingRows.has(student.id)
      };
    });
  }, [filteredStudents, marksData, subjects, editingRows]);

  // Save marks mutation
  const saveMarksMutation = useMutation({
    mutationFn: async ({ studentId, studentMarks }: { studentId: string; studentMarks: { [subject: string]: number } }) => {
      for (const [subjectName, marks] of Object.entries(studentMarks)) {
        const subject = subjects.find(s => s.name === subjectName);
        if (!subject) continue;

        const existingMark = existingMarks.find(
          mark => mark.studentId === studentId && mark.subject === subjectName
        );

        if (existingMark) {
          await apiRequest('PATCH', `/api/marks/${existingMark.id}`, {
            marks: marks,
            maxMarks: subject.maxMarks,
          });
        } else {
          await apiRequest('POST', '/api/marks', {
            studentId,
            examId: selectedExam,
            subject: subjectName,
            marks: marks,
            maxMarks: subject.maxMarks,
          });
        }
      }
    },
    onSuccess: (_, { studentId }) => {
      queryClient.invalidateQueries({ queryKey: ['/api/marks', selectedExam] });
      setEditingRows(prev => {
        const newSet = new Set(prev);
        newSet.delete(studentId);
        return newSet;
      });
      setSavingRows(prev => {
        const newSet = new Set(prev);
        newSet.delete(studentId);
        return newSet;
      });
      toast({
        title: "Success",
        description: "Marks saved successfully",
      });
    },
    onError: (error, { studentId }) => {
      setSavingRows(prev => {
        const newSet = new Set(prev);
        newSet.delete(studentId);
        return newSet;
      });
      toast({
        title: "Error",
        description: "Failed to save marks",
        variant: "destructive",
      });
    },
  });

  const handleEditRow = (studentId: string) => {
    setEditingRows(prev => new Set(prev).add(studentId));
  };

  const handleCancelEdit = (studentId: string) => {
    setEditingRows(prev => {
      const newSet = new Set(prev);
      newSet.delete(studentId);
      return newSet;
    });
    // Reset to original values
    const student = filteredStudents.find(s => s.id === studentId);
    if (student) {
      const resetMarks: { [subject: string]: number } = {};
      subjects.forEach(subject => {
        const existingMark = existingMarks.find(
          mark => mark.studentId === studentId && mark.subject === subject.name
        );
        resetMarks[subject.name] = existingMark?.marks || 0;
      });
      setMarksData(prev => ({
        ...prev,
        [studentId]: resetMarks
      }));
    }
  };

  const handleSaveRow = (studentId: string) => {
    setSavingRows(prev => new Set(prev).add(studentId));
    const studentMarks = marksData[studentId] || {};
    saveMarksMutation.mutate({ studentId, studentMarks });
  };

  const handleMarksChange = (studentId: string, subject: string, value: string) => {
    const subjectData = subjects.find(s => s.name === subject);
    const maxMarks = subjectData?.maxMarks || 100;
    const marks = Math.max(0, Math.min(maxMarks, parseInt(value) || 0));
    setMarksData(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [subject]: marks
      }
    }));
  };

  // Bulk edit functions
  const handleEditAll = () => {
    setBulkEditMode(true);
    const allStudentIds = new Set(filteredStudents.map(s => s.id));
    setEditingRows(allStudentIds);
  };

  const handleCancelAll = () => {
    setBulkEditMode(false);
    setEditingRows(new Set());
    // Reset all marks to original values
    const resetData: { [studentId: string]: { [subject: string]: number } } = {};
    filteredStudents.forEach(student => {
      resetData[student.id] = {};
      subjects.forEach(subject => {
        const existingMark = existingMarks.find(
          mark => mark.studentId === student.id && mark.subject === subject.name
        );
        resetData[student.id][subject.name] = existingMark?.marks || 0;
      });
    });
    setMarksData(resetData);
  };

  // Bulk save mutation
  const saveAllMarksMutation = useMutation({
    mutationFn: async () => {
      setBulkSaving(true);
      const promises = filteredStudents.map(async (student) => {
        const studentMarks = marksData[student.id] || {};
        for (const [subjectName, marks] of Object.entries(studentMarks)) {
          const subject = subjects.find(s => s.name === subjectName);
          if (!subject) continue;

          const existingMark = existingMarks.find(
            mark => mark.studentId === student.id && mark.subject === subjectName
          );

          if (existingMark) {
            await apiRequest('PATCH', `/api/marks/${existingMark.id}`, {
              marks: marks,
              maxMarks: subject.maxMarks || 100,
            });
          } else {
            await apiRequest('POST', '/api/marks', {
              studentId: student.id,
              examId: selectedExam,
              subject: subjectName,
              marks: marks,
              maxMarks: subject.maxMarks || 100,
            });
          }
        }
      });
      await Promise.all(promises);
    },
    onSuccess: () => {
      setBulkSaving(false);
      setBulkEditMode(false);
      setEditingRows(new Set());
      queryClient.invalidateQueries({ queryKey: ['/api/marks', selectedExam] });
      toast({
        title: "Success",
        description: `All marks saved successfully for ${filteredStudents.length} students`,
      });
    },
    onError: () => {
      setBulkSaving(false);
      toast({
        title: "Error",
        description: "Failed to save marks for all students",
        variant: "destructive",
      });
    },
  });

  const handleSaveAll = () => {
    saveAllMarksMutation.mutate();
  };

  const getBadgeVariant = (grade: string) => {
    switch (grade) {
      case 'A+': return 'default';
      case 'A': return 'secondary';
      case 'B+': return 'outline';
      case 'B': return 'outline';
      case 'C': return 'outline';
      default: return 'destructive';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-xl flex items-center justify-center">
            <FileSpreadsheet className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Marks Entry</h2>
            <p className="text-gray-600">Excel-like interface for efficient marks management</p>
          </div>
        </div>
      </motion.div>

      {/* Selection Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="bg-gradient-to-r from-indigo-50 to-cyan-50 border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Award className="h-5 w-5 text-indigo-600" />
              <span>Select Exam & Class</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="exam-select">Exam</Label>
                <Select value={selectedExam} onValueChange={setSelectedExam}>
                  <SelectTrigger id="exam-select" className="bg-white border-gray-200">
                    <SelectValue placeholder="Select an exam" />
                  </SelectTrigger>
                  <SelectContent>
                    {exams.map((exam) => (
                      <SelectItem key={exam.id} value={exam.id}>
                        {exam.name} - {new Date(exam.date).toLocaleDateString()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="class-select">Class</Label>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger id="class-select" className="bg-white border-gray-200">
                    <SelectValue placeholder="Select a class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((className) => (
                      <SelectItem key={className} value={className}>
                        Class {className}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {selectedExam && selectedClass && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ duration: 0.3 }}
                className="mt-4 pt-4 border-t border-gray-200"
              >
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span>{filteredStudents.length} Students</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Award className="h-4 w-4" />
                      <span>{subjects.length} Subjects</span>
                    </span>
                  </div>
                  <Badge variant="outline" className="bg-white">
                    Max Total: {subjects.reduce((sum, s) => sum + (s.maxMarks || 100), 0)} marks
                  </Badge>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Marks Entry Table */}
      {selectedExam && selectedClass && subjects.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="shadow-xl border-0">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Calculator className="h-5 w-5 text-indigo-600" />
                  <span>Marks Entry Sheet</span>
                </CardTitle>
                <div className="flex items-center space-x-3">
                  {/* Bulk Edit Controls */}
                  {!bulkEditMode ? (
                    <Button
                      onClick={handleEditAll}
                      className="bg-indigo-600 hover:bg-indigo-700"
                      size="sm"
                    >
                      <Edit3 className="h-4 w-4 mr-2" />
                      Edit All
                    </Button>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Button
                        onClick={handleSaveAll}
                        disabled={bulkSaving}
                        className="bg-green-600 hover:bg-green-700"
                        size="sm"
                      >
                        {bulkSaving ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4 mr-2" />
                        )}
                        Save All
                      </Button>
                      <Button
                        onClick={handleCancelAll}
                        variant="outline"
                        size="sm"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  )}
                  <Badge variant="secondary" className="bg-indigo-100 text-indigo-700">
                    {selectedExamData?.name} - Class {selectedClass}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table className="border-collapse border border-gray-300">
                  <TableHeader>
                    <TableRow className="bg-gray-50 border-b-2 border-gray-300">
                      <TableHead className="font-semibold text-gray-900 sticky left-0 bg-gray-50 z-10 min-w-[200px] border border-gray-300">
                        Student
                      </TableHead>
                      <TableHead className="font-semibold text-gray-900 sticky left-[200px] bg-gray-50 z-10 min-w-[120px] border border-gray-300">
                        Roll No.
                      </TableHead>
                      {subjects.map((subject) => (
                        <TableHead key={subject.id} className="text-center font-semibold text-gray-900 min-w-[120px] border border-gray-300">
                          <div>
                            <div>{subject.name}</div>
                            <div className="text-xs text-gray-500 font-normal">
                              (Max: {subject.maxMarks || 100})
                            </div>
                          </div>
                        </TableHead>
                      ))}
                      <TableHead className="text-center font-semibold text-gray-900 min-w-[80px] border border-gray-300">
                        Total
                      </TableHead>
                      <TableHead className="text-center font-semibold text-gray-900 min-w-[80px] border border-gray-300">
                        %
                      </TableHead>
                      <TableHead className="text-center font-semibold text-gray-900 min-w-[80px] border border-gray-300">
                        Grade
                      </TableHead>
                      <TableHead className="text-center font-semibold text-gray-900 min-w-[120px] border border-gray-300">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence>
                      {studentRows.map((row, index) => (
                        <motion.tr
                          key={row.student.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          className={`group hover:bg-gray-50 transition-colors border-b border-gray-300 ${
                            row.isEditing ? 'bg-blue-50 border-blue-200' : ''
                          }`}
                        >
                          <TableCell className="font-medium sticky left-0 bg-white group-hover:bg-gray-50 z-10 border border-gray-300">
                            <div className="flex items-center space-x-2">
                              {row.isEditing && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                              )}
                              <div>
                                <div className="font-medium">{row.student.name}</div>
                                <div className="text-xs text-gray-500">{row.student.email}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="sticky left-[200px] bg-white group-hover:bg-gray-50 z-10 font-mono border border-gray-300">
                            {row.student.admissionNumber}
                          </TableCell>
                          {subjects.map((subject) => (
                            <TableCell key={subject.id} className="text-center p-2 border border-gray-300">
                              {row.isEditing ? (
                                <Input
                                  type="number"
                                  min="0"
                                  max={subject.maxMarks || 100}
                                  value={row.marks[subject.name] || 0}
                                  onChange={(e) => handleMarksChange(row.student.id, subject.name, e.target.value)}
                                  className="w-20 text-center border-blue-300 focus:border-blue-500"
                                />
                              ) : (
                                <span className={`font-medium ${
                                  (row.marks[subject.name] || 0) === 0 ? 'text-gray-400' : 'text-gray-900'
                                }`}>
                                  {row.marks[subject.name] || 0}
                                </span>
                              )}
                            </TableCell>
                          ))}
                          <TableCell className="text-center font-bold text-indigo-700 border border-gray-300">
                            {row.total}
                          </TableCell>
                          <TableCell className="text-center font-medium border border-gray-300">
                            {row.percentage.toFixed(1)}%
                          </TableCell>
                          <TableCell className="text-center border border-gray-300">
                            <Badge variant={getBadgeVariant(row.grade)} className="font-medium">
                              {row.grade}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center border border-gray-300">
                            <div className="flex items-center justify-center space-x-1">
                              {bulkEditMode ? (
                                <span className="text-xs text-gray-500">Bulk Edit</span>
                              ) : row.isEditing ? (
                                <>
                                  <Button
                                    size="sm"
                                    onClick={() => handleSaveRow(row.student.id)}
                                    disabled={savingRows.has(row.student.id)}
                                    className="h-8 w-8 p-0 bg-green-600 hover:bg-green-700"
                                  >
                                    {savingRows.has(row.student.id) ? (
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                    ) : (
                                      <Check className="h-3 w-3" />
                                    )}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleCancelEdit(row.student.id)}
                                    className="h-8 w-8 p-0"
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleEditRow(row.student.id)}
                                  className="h-8 w-8 p-0 hover:bg-indigo-50 hover:border-indigo-300"
                                >
                                  <Edit3 className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* No Data States */}
      {!selectedExam && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="text-center py-12">
            <CardContent>
              <Award className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select an Exam</h3>
              <p className="text-gray-500">Choose an exam to start entering marks</p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {selectedExam && !selectedClass && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="text-center py-12">
            <CardContent>
              <Users className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Class</h3>
              <p className="text-gray-500">Choose a class to see students for marks entry</p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {selectedExam && selectedClass && subjects.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="text-center py-12">
            <CardContent>
              <AlertCircle className="h-16 w-16 mx-auto mb-4 text-orange-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Subjects Found</h3>
              <p className="text-gray-500">Add subjects for this exam in Subject Management</p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {selectedExam && selectedClass && filteredStudents.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="text-center py-12">
            <CardContent>
              <Users className="h-16 w-16 mx-auto mb-4 text-orange-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Students Found</h3>
              <p className="text-gray-500">No students found in Class {selectedClass}</p>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}