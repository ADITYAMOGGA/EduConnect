import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Save, Plus, Edit, Trash2 } from "lucide-react";
import type { Student, Exam, Mark } from "@shared/schema";
import { z } from "zod";

const createMarksSchema = (maxMarks: number = 100) => z.object({
  studentId: z.string().min(1, "Please select a student"),
  examId: z.string().min(1, "Please select an exam"),
  english: z.number().min(0).max(maxMarks, `Maximum marks allowed is ${maxMarks}`),
  mathematics: z.number().min(0).max(maxMarks, `Maximum marks allowed is ${maxMarks}`),
  science: z.number().min(0).max(maxMarks, `Maximum marks allowed is ${maxMarks}`),
  socialStudies: z.number().min(0).max(maxMarks, `Maximum marks allowed is ${maxMarks}`),
  hindi: z.number().min(0).max(maxMarks, `Maximum marks allowed is ${maxMarks}`),
  computerScience: z.number().min(0).max(maxMarks, `Maximum marks allowed is ${maxMarks}`),
});

const examSchema = z.object({
  name: z.string().min(1, "Exam name is required"),
  class: z.string().min(1, "Please select a class"),
  maxMarks: z.number().min(1, "Maximum marks must be at least 1"),
});

type MarksFormData = z.infer<ReturnType<typeof createMarksSchema>>;
type ExamFormData = z.infer<typeof examSchema>;

export default function MarksEntry() {
  const [selectedExam, setSelectedExam] = useState<string>("");
  const [showNewExamInput, setShowNewExamInput] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch exams first to get maxMarks for selected exam
  const { data: exams = [] } = useQuery<Exam[]>({
    queryKey: ['/api/exams'],
  });

  const selectedExamData = exams.find((e: Exam) => e.id === selectedExam);
  const maxMarks = selectedExamData?.maxMarks || 100;

  const form = useForm<MarksFormData>({
    resolver: zodResolver(createMarksSchema(maxMarks)),
    defaultValues: {
      studentId: "",
      examId: "",
      english: undefined,
      mathematics: undefined,
      science: undefined,
      socialStudies: undefined,
      hindi: undefined,
      computerScience: undefined,
    },
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
    mutationFn: async (data: MarksFormData) => {
      const subjects = [
        { subject: 'English', marks: data.english },
        { subject: 'Mathematics', marks: data.mathematics },
        { subject: 'Science', marks: data.science },
        { subject: 'Social Studies', marks: data.socialStudies },
        { subject: 'Hindi', marks: data.hindi },
        { subject: 'Computer Science', marks: data.computerScience },
      ];

      for (const subjectData of subjects) {
        await apiRequest('POST', '/api/marks', {
          studentId: data.studentId,
          examId: data.examId,
          subject: subjectData.subject,
          marks: subjectData.marks,
          maxMarks: 100,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/marks'] });
      form.reset();
      toast({
        title: "Success",
        description: "Marks saved successfully",
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

  const handleCreateExam = (data: ExamFormData) => {
    createExamMutation.mutate(data);
  };

  const onSubmit = (data: MarksFormData) => {
    saveMarksMutation.mutate(data);
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
              <Select onValueChange={(value) => form.setValue('studentId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a student..." />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student: Student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.name} ({student.admissionNo})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
            <CardTitle>Enter Marks</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="english"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>English</FormLabel>
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
                  
                  <FormField
                    control={form.control}
                    name="mathematics"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mathematics</FormLabel>
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
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="science"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Science</FormLabel>
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
                  
                  <FormField
                    control={form.control}
                    name="socialStudies"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Social Studies</FormLabel>
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
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="hindi"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hindi</FormLabel>
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
                  
                  <FormField
                    control={form.control}
                    name="computerScience"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Computer Science</FormLabel>
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
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-success-500 hover:bg-success-600"
                  disabled={saveMarksMutation.isPending}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saveMarksMutation.isPending ? 'Saving...' : 'Save Marks'}
                </Button>
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
                            <button className="text-primary-600 hover:text-primary-900 transition-colors duration-200">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button className="text-red-600 hover:text-red-900 transition-colors duration-200">
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
