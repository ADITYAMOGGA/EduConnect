import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Save, Plus, Edit, Trash2 } from "lucide-react";
import type { Student, Exam, Mark, Subject } from "@shared/schema";
import { z } from "zod";

const createMarksSchema = (subjects: Subject[], maxMarks: number = 100) => {
  const schema: any = {
    studentId: z.string().min(1, "Please select a student"),
    examId: z.string().min(1, "Please select an exam"),
  };
  
  // Dynamically add subject fields based on custom subjects
  subjects.forEach((subject) => {
    const fieldName = subject.name.toLowerCase().replace(/\s+/g, '');
    schema[fieldName] = z.number().min(0).max(maxMarks, `Maximum marks allowed is ${maxMarks}`);
  });
  
  return z.object(schema);
};

const examSchema = z.object({
  name: z.string().min(1, "Exam name is required"),
  class: z.string().min(1, "Please select a class"),
  maxMarks: z.number().min(1, "Maximum marks must be at least 1"),
});

type ExamFormData = z.infer<typeof examSchema>;
type MarksFormData = any; // Dynamic type based on subjects

export default function MarksEntry() {
  const [selectedExam, setSelectedExam] = useState<string>("");
  const [showNewExamInput, setShowNewExamInput] = useState(false);
  const [editingStudent, setEditingStudent] = useState<string | null>(null);
  const [openStudentSelect, setOpenStudentSelect] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch exams first to get maxMarks for selected exam
  const { data: exams = [] } = useQuery<Exam[]>({
    queryKey: ['/api/exams'],
  });

  // Fetch all subjects (exam-specific subjects)
  const { data: allSubjects = [] } = useQuery<Subject[]>({
    queryKey: ['/api/subjects'],
  });

  // Filter subjects by selected exam
  const subjects = selectedExam 
    ? allSubjects.filter(subject => {
        // Filter subjects based on the selected exam
        const selectedExamData = exams.find(e => e.id === selectedExam);
        return selectedExamData && subject.code.includes(selectedExamData.name);
      })
    : [];

  const selectedExamData = exams.find((e: Exam) => e.id === selectedExam);
  const maxMarks = selectedExamData?.maxMarks || 100;

  // Create dynamic default values based on subjects
  const createDefaultValues = () => {
    const defaults: any = {
      studentId: "",
      examId: "",
    };
    
    subjects.forEach((subject) => {
      const fieldName = subject.name.toLowerCase().replace(/\s+/g, '');
      defaults[fieldName] = undefined;
    });
    
    return defaults;
  };

  const form = useForm({
    resolver: subjects.length > 0 ? zodResolver(createMarksSchema(subjects, maxMarks)) : undefined,
    defaultValues: createDefaultValues(),
  });

  const examForm = useForm<ExamFormData>({
    resolver: zodResolver(examSchema),
    defaultValues: {
      name: "",
      class: "",
      maxMarks: 100,
    },
  });

  // Fetch students
  const { data: students = [] } = useQuery<Student[]>({
    queryKey: ['/api/students'],
  });

  // Fetch marks for selected exam
  const { data: examMarks = [] } = useQuery<Mark[]>({
    queryKey: ['/api/marks', selectedExam],
    enabled: !!selectedExam,
  });

  // Create exam mutation
  const createExamMutation = useMutation({
    mutationFn: async (data: ExamFormData) => {
      await apiRequest('POST', '/api/exams', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/exams'] });
      examForm.reset();
      setShowNewExamInput(false);
      toast({
        title: "Success",
        description: "Exam created successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to create exam",
        variant: "destructive",
      });
    },
  });

  // Save marks mutation
  const saveMarksMutation = useMutation({
    mutationFn: async (data: any) => {
      // Build subject marks from custom subjects
      const subjectMarks = subjects.map((subject) => {
        const fieldName = subject.name.toLowerCase().replace(/\s+/g, '');
        return {
          subject: subject.name,
          marks: data[fieldName],
        };
      });

      if (editingStudent) {
        // Update existing marks
        const existingMarks = examMarks.filter(mark => mark.studentId === editingStudent);
        
        for (const subjectData of subjectMarks) {
          const existingMark = existingMarks.find(mark => mark.subject === subjectData.subject);
          
          if (existingMark) {
            // Update existing mark
            await apiRequest('PATCH', `/api/marks/${existingMark.id}`, {
              marks: subjectData.marks,
              maxMarks: maxMarks,
            });
          } else {
            // Create new mark if it doesn't exist
            await apiRequest('POST', '/api/marks', {
              studentId: data.studentId,
              examId: data.examId,
              subject: subjectData.subject,
              marks: subjectData.marks,
              maxMarks: maxMarks,
            });
          }
        }
      } else {
        // Create new marks
        for (const subjectData of subjectMarks) {
          await apiRequest('POST', '/api/marks', {
            studentId: data.studentId,
            examId: data.examId,
            subject: subjectData.subject,
            marks: subjectData.marks,
            maxMarks: maxMarks,
          });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/marks'] });
      form.reset();
      setEditingStudent(null);
      toast({
        title: "Success",
        description: editingStudent ? "Marks updated successfully" : "Marks saved successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "Unauthorized", 
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to save marks",
        variant: "destructive",
      });
    },
  });

  // Delete student marks mutation
  const deleteStudentMarksMutation = useMutation({
    mutationFn: async (studentId: string) => {
      const studentMarks = examMarks.filter(mark => mark.studentId === studentId);
      for (const mark of studentMarks) {
        await apiRequest('DELETE', `/api/marks/${mark.id}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/marks'] });
      toast({
        title: "Success",
        description: "Student marks deleted successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to delete marks",
        variant: "destructive",
      });
    },
  });

  const handleCreateExam = (data: ExamFormData) => {
    createExamMutation.mutate(data);
  };

  const onSubmit = (data: MarksFormData) => {
    saveMarksMutation.mutate(data);
  };

  const handleEditStudent = (studentId: string, marks: Mark[]) => {
    setEditingStudent(studentId);
    
    // Pre-populate the form with existing marks
    const marksMap: any = {
      studentId: studentId,
      examId: selectedExam,
    };
    
    // Build marks map from custom subjects
    subjects.forEach((subject) => {
      const fieldName = subject.name.toLowerCase().replace(/\s+/g, '');
      const existingMark = marks.find(mark => mark.subject === subject.name);
      marksMap[fieldName] = existingMark ? existingMark.marks : 0;
    });
    
    form.reset(marksMap);
  };

  const handleDeleteStudent = (studentId: string) => {
    if (confirm("Are you sure you want to delete all marks for this student?")) {
      deleteStudentMarksMutation.mutate(studentId);
    }
  };

  const calculateTotal = (marks: any[]) => {
    return marks.reduce((sum, mark) => sum + mark.marks, 0);
  };

  const calculatePercentage = (total: number, maxTotal: number) => {
    return ((total / maxTotal) * 100).toFixed(1);
  };

  const getGrade = (percentage: number) => {
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B+';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C';
    return 'F';
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Marks Entry</h2>
        <p className="text-gray-600">Enter and manage exam marks for students</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Student & Exam Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Student & Exam</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Student</label>
              <Popover open={openStudentSelect} onOpenChange={setOpenStudentSelect}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openStudentSelect}
                    className="w-full justify-between h-10 px-3"
                  >
                    {selectedStudentId
                      ? students.find((student) => student.id === selectedStudentId)?.name + 
                        " (" + students.find((student) => student.id === selectedStudentId)?.admissionNo + ")"
                      : "Select a student..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Search students..." />
                    <CommandEmpty>No student found.</CommandEmpty>
                    <CommandGroup className="max-h-[200px] overflow-auto">
                      {students.map((student) => (
                        <CommandItem
                          key={student.id}
                          value={`${student.name} ${student.admissionNo}`}
                          onSelect={() => {
                            setSelectedStudentId(student.id);
                            form.setValue('studentId', student.id);
                            setOpenStudentSelect(false);
                          }}
                        >
                          <Check
                            className={`mr-2 h-4 w-4 ${
                              selectedStudentId === student.id ? "opacity-100" : "opacity-0"
                            }`}
                          />
                          {student.name} ({student.admissionNo})
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Exam</label>
              <div className="flex space-x-2">
                <Select 
                  onValueChange={(value) => {
                    form.setValue('examId', value);
                    setSelectedExam(value);
                  }}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select exam..." />
                  </SelectTrigger>
                  <SelectContent>
                    {exams.map((exam: Exam) => (
                      <SelectItem key={exam.id} value={exam.id}>
                        {exam.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  onClick={() => setShowNewExamInput(!showNewExamInput)}
                  className="bg-primary-500 hover:bg-primary-600"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              
              {showNewExamInput && (
                <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <h4 className="font-medium text-gray-800 mb-3">Create New Exam</h4>
                  <Form {...examForm}>
                    <form onSubmit={examForm.handleSubmit(handleCreateExam)} className="space-y-3">
                      <FormField
                        control={examForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Exam Name</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Mid-Term Exam" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-2 gap-3">
                        <FormField
                          control={examForm.control}
                          name="class"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Class</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select class" />
                                  </SelectTrigger>
                                </FormControl>
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
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={examForm.control}
                          name="maxMarks"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Max Marks</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="100"
                                  {...field}
                                  onChange={(e) => field.onChange(Number(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowNewExamInput(false)}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={createExamMutation.isPending}
                          className="flex-1 bg-success-500 hover:bg-success-600"
                        >
                          {createExamMutation.isPending ? 'Creating...' : 'Create Exam'}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Marks Entry Form */}
        <Card>
          <CardHeader>
            <CardTitle>
              {editingStudent ? 'Edit Marks' : 'Enter Marks'}
              {editingStudent && (
                <span className="text-sm text-gray-600 ml-2">
                  (Editing: {(() => {
                    const studentData = examMarks.find(mark => mark.studentId === editingStudent);
                    return studentData?.student?.name || `Student ${editingStudent.slice(0, 8)}`;
                  })()})
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {/* Dynamic subject fields based on custom subjects */}
                <div className="grid grid-cols-2 gap-4">
                  {subjects.map((subject, index) => {
                    const fieldName = subject.name.toLowerCase().replace(/\s+/g, '');
                    return (
                      <FormField
                        key={subject.id}
                        control={form.control}
                        name={fieldName}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {subject.name}
                              {subject.code && (
                                <span className="text-xs text-gray-500 ml-1">({subject.code})</span>
                              )}
                            </FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="Enter marks" 
                                {...field}
                                value={field.value || ''}
                                onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    );
                  })}
                </div>

                <div className="flex space-x-2">
                  {editingStudent && (
                    <Button 
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setEditingStudent(null);
                        form.reset();
                      }}
                      className="flex-1"
                    >
                      Cancel Edit
                    </Button>
                  )}
                  <Button 
                    type="submit" 
                    className={`${editingStudent ? 'flex-1' : 'w-full'} bg-success-500 hover:bg-success-600`}
                    disabled={saveMarksMutation.isPending}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {saveMarksMutation.isPending 
                      ? (editingStudent ? 'Updating...' : 'Saving...') 
                      : (editingStudent ? 'Update Marks' : 'Save Marks')}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      {/* Recent Marks Table */}
      {selectedExam && (
        <Card className="mt-8">
          <CardHeader className="bg-gray-50">
            <CardTitle>Recent Marks Entries</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {examMarks.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-600">No marks entered for this exam yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Percentage
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Grade
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {/* Group marks by student */}
                    {Object.entries(
                      examMarks.reduce((acc: any, mark: any) => {
                        if (!acc[mark.studentId]) {
                          acc[mark.studentId] = {
                            student: mark.student,
                            marks: [],
                          };
                        }
                        acc[mark.studentId].marks.push(mark);
                        return acc;
                      }, {})
                    ).map(([studentId, data]: [string, any]) => {
                      const total = calculateTotal(data.marks);
                      const selectedExamData = exams.find((e: Exam) => e.id === selectedExam);
                      const maxTotal = selectedExamData ? selectedExamData.maxMarks * 6 : 600;
                      const percentage = parseFloat(calculatePercentage(total, maxTotal));
                      const grade = getGrade(percentage);
                      
                      return (
                        <tr key={studentId} className="hover:bg-gray-50 transition-colors duration-200">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {data.student?.name || `Student ${studentId.slice(0, 8)}`}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {total}/{maxTotal}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {percentage}%
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              grade === 'A+' || grade === 'A' 
                                ? 'bg-success-100 text-success-800'
                                : grade === 'B+' || grade === 'B'
                                ? 'bg-primary-100 text-primary-800'
                                : 'bg-warning-100 text-warning-800'
                            }`}>
                              {grade}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <button 
                              onClick={() => handleEditStudent(studentId, data.marks)}
                              className="text-primary-600 hover:text-primary-900 transition-colors duration-200"
                              title="Edit marks"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteStudent(studentId)}
                              className="text-red-600 hover:text-red-900 transition-colors duration-200"
                              title="Delete marks"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
