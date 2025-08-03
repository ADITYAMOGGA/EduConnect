import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  BookOpen, 
  Users, 
  GraduationCap, 
  Edit3, 
  Save, 
  Search, 
  LogOut, 
  User,
  Calendar,
  Trophy,
  TrendingUp,
  Clock,
  CheckCircle,
  FileText,
  Settings,
  Bell,
  ChevronRight,
  BarChart3,
  PlusCircle,
  Eye
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTeacherAuth } from "@/hooks/useTeacherAuth";
import { useLocation } from "wouter";
import TeacherMarksEntry from "@/components/TeacherMarksEntry";

interface Student {
  id: string;
  name: string;
  rollNo: string;
  admissionNo: string;
  classLevel: string;
  fatherName: string;
  motherName: string;
  phone: string;
  email: string;
}

interface Mark {
  id: string;
  student_id: string;
  subject_name: string;
  marks_obtained: number;
  max_marks: number;
  student?: Student;
}

interface Exam {
  id: string;
  name: string;
  type: string;
  exam_date: string;
  status: string;
  instructions?: string;
  max_duration?: number;
}

export default function TeacherDashboard() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const { teacher, organization, subjects, isAuthenticated, isLoading: authLoading, isError } = useTeacherAuth();

  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [editingMark, setEditingMark] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState<string>("");

  // Fetch teacher's assigned classes
  const { data: teacherClasses = [], isLoading: classesLoading } = useQuery({
    queryKey: ['/api/teacher/classes'],
    queryFn: async () => {
      const response = await fetch('/api/teacher/classes', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch classes');
      return response.json();
    },
    enabled: !!teacher,
  });

  // Fetch students for teacher's classes - always call useQuery hooks
  const { data: students = [], isLoading: studentsLoading } = useQuery<Student[]>({
    queryKey: ['/api/teacher/students'],
    queryFn: async () => {
      const response = await fetch('/api/teacher/students', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch students');
      return response.json();
    },
    enabled: !!teacher,
  });

  // Fetch exams
  const { data: exams = [], isLoading: examsLoading } = useQuery<Exam[]>({
    queryKey: ['/api/teacher/exams'],
    queryFn: async () => {
      const response = await fetch('/api/teacher/exams', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch exams');
      return response.json();
    },
    enabled: !!teacher,
  });

  // Fetch marks for teacher's subjects
  const { data: marks = [], isLoading: marksLoading } = useQuery<Mark[]>({
    queryKey: ['/api/teacher/marks'],
    queryFn: async () => {
      const response = await fetch('/api/teacher/marks', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch marks');
      return response.json();
    },
    enabled: !!teacher,
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/teacher/logout', {
        method: 'POST',
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Logout failed');
      return response.json();
    },
    onSuccess: () => {
      // Clear all localStorage data
      localStorage.removeItem("userRole");
      localStorage.removeItem("teacherData");
      localStorage.removeItem("organizationData");
      localStorage.removeItem("teacherSubjects");
      
      toast({ title: "Logged out successfully" });
      navigate('/teacher-login');
    },
    onError: () => {
      // Even if logout fails on server, clear local data
      localStorage.removeItem("userRole");
      localStorage.removeItem("teacherData");
      localStorage.removeItem("organizationData");
      localStorage.removeItem("teacherSubjects");
      
      toast({ title: "Logout completed", description: "Session cleared" });
      navigate('/teacher-login');
    }
  });

  // Update marks mutation
  const updateMarkMutation = useMutation({
    mutationFn: async ({ markId, value }: { markId: string; value: number }) => {
      const response = await fetch(`/api/marks/${markId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ marks: value })
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update mark');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/teacher/marks'] });
      toast({ title: "Mark updated successfully" });
      setEditingMark(null);
      setEditingValue("");
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to update mark", 
        description: error.message || "Please try again",
        variant: "destructive" 
      });
    }
  });

  const handleEditMark = (markId: string, currentValue: number) => {
    setEditingMark(markId);
    setEditingValue(currentValue.toString());
  };

  const handleSaveMark = () => {
    if (editingMark && editingValue) {
      const value = parseFloat(editingValue);
      if (!isNaN(value)) {
        updateMarkMutation.mutate({ markId: editingMark, value });
      }
    }
  };

  // Filtered data based on search and subject selection - Move all useMemo hooks before conditional returns
  const filteredStudents = useMemo(() => {
    if (!students) return [];
    return students.filter(student =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.rollNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.admissionNo.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [students, searchTerm]);

  const filteredMarks = useMemo(() => {
    if (!marks) return [];
    return marks.filter(mark => {
      const matchesSearch = mark.student?.name.toLowerCase().includes(searchTerm.toLowerCase()) || false;
      const matchesSubject = selectedSubject ? mark.subject_name === selectedSubject : true;
      return matchesSearch && matchesSubject;
    });
  }, [marks, searchTerm, selectedSubject]);

  // Stats calculations
  const stats = useMemo(() => {
    const totalStudents = students?.length || 0;
    const totalSubjects = subjects?.length || 0;
    const totalMarksEntered = marks?.length || 0;
    const avgMarks = marks && marks.length > 0 
      ? marks.reduce((sum, mark) => sum + (mark.marks_obtained / mark.max_marks * 100), 0) / marks.length 
      : 0;

    return {
      totalStudents,
      totalSubjects,
      totalMarksEntered,
      avgMarks: Math.round(avgMarks * 10) / 10
    };
  }, [students, subjects, marks]);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // Handle session expired or authentication errors (check after all hooks are called)
  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
        <Card className="max-w-md">
          <CardContent className="text-center py-8">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <LogOut className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Session Expired</h2>
            <p className="text-gray-600 mb-4">Your session has expired. Please log in again to continue.</p>
            <Button onClick={() => navigate('/teacher-login')} className="w-full bg-gradient-to-r from-green-600 to-emerald-600">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
        <div className="text-center space-y-4">
          <motion.div 
            className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <BookOpen className="h-8 w-8 text-white" />
          </motion.div>
          <p className="text-green-800 text-lg font-medium">Loading teaching dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 -left-20 w-40 h-40 bg-green-200/20 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-20 -right-20 w-60 h-60 bg-emerald-200/20 rounded-full blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.4, 0.2, 0.4] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-sm border-b border-green-200/50 sticky top-0 z-40"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <motion.div
                whileHover={{ scale: 1.05, rotate: 5 }}
                className="w-10 h-10 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl flex items-center justify-center"
              >
                <BookOpen className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  Teacher Dashboard
                </h1>
                <p className="text-sm text-slate-600">Welcome, {teacher?.name}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <motion.div whileHover={{ scale: 1.05 }}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="relative text-slate-600 hover:text-green-600"
                >
                  <Bell className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full"></span>
                </Button>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.05 }}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-600 hover:text-green-600"
                >
                  <Settings className="w-5 h-5" />
                </Button>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05 }}>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  size="sm"
                  disabled={logoutMutation.isPending}
                  className="border-green-200 hover:bg-green-50 text-green-700"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <motion.div whileHover={{ scale: 1.02, y: -2 }}>
            <Card className="border-green-200/50 bg-white/90 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Total Students</p>
                    <p className="text-2xl font-bold text-green-700">{stats.totalStudents}</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02, y: -2 }}>
            <Card className="border-green-200/50 bg-white/90 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Assigned Subjects</p>
                    <p className="text-2xl font-bold text-green-700">{stats.totalSubjects}</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02, y: -2 }}>
            <Card className="border-green-200/50 bg-white/90 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Marks Entered</p>
                    <p className="text-2xl font-bold text-green-700">{stats.totalMarksEntered}</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02, y: -2 }}>
            <Card className="border-green-200/50 bg-white/90 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Average Score</p>
                    <p className="text-2xl font-bold text-green-700">{stats.avgMarks}%</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5 bg-white/80 backdrop-blur-sm">
              <TabsTrigger value="overview" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
                Overview
              </TabsTrigger>
              <TabsTrigger value="students" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
                Students
              </TabsTrigger>
              <TabsTrigger value="subjects" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
                Subjects
              </TabsTrigger>
              <TabsTrigger value="marks" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
                Marks Entry
              </TabsTrigger>
              <TabsTrigger value="exams" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
                Exams
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activity */}
                <Card className="border-green-200/50 bg-white/90 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Clock className="w-5 h-5 text-green-600" />
                      <span>Recent Activity</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg"
                      >
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <div>
                          <p className="text-sm font-medium">Marks entered for Math Class 8</p>
                          <p className="text-xs text-slate-500">2 hours ago</p>
                        </div>
                      </motion.div>
                      <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="flex items-center space-x-3 p-3 bg-emerald-50 rounded-lg"
                      >
                        <FileText className="w-5 h-5 text-emerald-600" />
                        <div>
                          <p className="text-sm font-medium">Science assignment reviewed</p>
                          <p className="text-xs text-slate-500">5 hours ago</p>
                        </div>
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>

                {/* Assigned Classes */}
                <Card className="border-green-200/50 bg-white/90 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <GraduationCap className="w-5 h-5 text-green-600" />
                      <span>Your Classes</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {classesLoading ? (
                      <div className="text-center py-4">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                          className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full mx-auto"
                        />
                        <p className="text-sm text-slate-500 mt-2">Loading classes...</p>
                      </div>
                    ) : teacherClasses && teacherClasses.length > 0 ? (
                      <div className="space-y-3">
                        {teacherClasses.map((classData: any, index: number) => (
                          <motion.div
                            key={`class-${classData.className}-${index}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-semibold text-green-800">Class {classData.className}</span>
                              <Badge variant="secondary" className="bg-green-100 text-green-700">
                                {classData.subjects?.length || 0} subjects
                              </Badge>
                            </div>
                            {classData.subjects && classData.subjects.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {classData.subjects.map((subject: any, subIndex: number) => (
                                  <Badge key={`${subject.name}-${subject.code}-${subIndex}`} variant="outline" className="text-xs border-green-200 text-green-700">
                                    {subject.name}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500 font-medium">No classes assigned</p>
                        <p className="text-sm text-slate-400 mt-1">
                          Contact your school admin to assign classes and subjects
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Students Tab */}
            <TabsContent value="students" className="space-y-6">
              <Card className="border-green-200/50 bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Your Students</CardTitle>
                  <CardDescription>Manage students in your assigned classes</CardDescription>
                  <div className="flex items-center space-x-4">
                    <div className="relative flex-1 max-w-sm">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <Input
                        placeholder="Search students..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 border-green-200 focus:border-green-400"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {studentsLoading ? (
                    <div className="text-center py-8">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full mx-auto"
                      />
                      <p className="text-slate-600 mt-2">Loading students...</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Class</TableHead>
                          <TableHead>Roll No.</TableHead>
                          <TableHead>Admission No.</TableHead>
                          <TableHead>Contact</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredStudents.map((student, index) => (
                          <motion.tr
                            key={`student-${student.id}-${index}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="hover:bg-green-50/50"
                          >
                            <TableCell className="font-medium">{student.name}</TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="bg-green-100 text-green-800">
                                Class {student.classLevel}
                              </Badge>
                            </TableCell>
                            <TableCell>{student.rollNo}</TableCell>
                            <TableCell>{student.admissionNo}</TableCell>
                            <TableCell>{student.phone || 'N/A'}</TableCell>
                            <TableCell>
                              <motion.div whileHover={{ scale: 1.05 }}>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </motion.div>
                            </TableCell>
                          </motion.tr>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Subjects Tab */}
            <TabsContent value="subjects" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {subjects.map((subject, index) => (
                  <motion.div
                    key={subject.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02, y: -4 }}
                  >
                    <Card className="border-green-200/50 bg-white/90 backdrop-blur-sm hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                            <BookOpen className="w-6 h-6 text-white" />
                          </div>
                          <Badge variant="outline" className="border-green-200 text-green-700">
                            Class {subject.class_level}
                          </Badge>
                        </div>
                        <div>
                          <CardTitle className="text-lg">{subject.name}</CardTitle>
                          <CardDescription>Code: {subject.code}</CardDescription>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-600">Max Marks:</span>
                            <span className="font-semibold text-green-700">{subject.max_marks}</span>
                          </div>
                          <motion.div whileHover={{ scale: 1.02 }}>
                            <Button 
                              variant="outline" 
                              className="w-full border-green-200 hover:bg-green-50 text-green-700"
                              onClick={() => {
                                setSelectedSubject(subject.name);
                                setActiveTab("marks");
                              }}
                            >
                              Enter Marks
                              <ChevronRight className="w-4 h-4 ml-2" />
                            </Button>
                          </motion.div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            {/* Marks Entry Tab */}
            <TabsContent value="marks" className="space-y-6">
              <TeacherMarksEntry />
            </TabsContent>

            {/* Exams Tab */}
            <TabsContent value="exams" className="space-y-6">
              <Card className="border-green-200/50 bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Upcoming Exams</CardTitle>
                  <CardDescription>View scheduled exams and their details</CardDescription>
                </CardHeader>
                <CardContent>
                  {examsLoading ? (
                    <div className="text-center py-8">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full mx-auto"
                      />
                      <p className="text-slate-600 mt-2">Loading exams...</p>
                    </div>
                  ) : exams.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {exams.map((exam, index) => (
                        <motion.div
                          key={exam.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ scale: 1.02 }}
                        >
                          <Card className="border-green-200/50 bg-gradient-to-r from-green-50 to-emerald-50">
                            <CardHeader>
                              <div className="flex items-center justify-between">
                                <CardTitle className="text-lg">{exam.name}</CardTitle>
                                <Badge 
                                  variant={exam.status === 'scheduled' ? 'default' : 'secondary'}
                                  className={exam.status === 'scheduled' ? 'bg-green-100 text-green-800' : ''}
                                >
                                  {exam.status}
                                </Badge>
                              </div>
                              <CardDescription>
                                <div className="flex items-center space-x-2">
                                  <Calendar className="w-4 h-4" />
                                  <span>{new Date(exam.exam_date).toLocaleDateString()}</span>
                                </div>
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-2">
                                <p className="text-sm"><strong>Type:</strong> {exam.type}</p>
                                {exam.max_duration && (
                                  <p className="text-sm"><strong>Duration:</strong> {exam.max_duration} minutes</p>
                                )}
                                {exam.instructions && (
                                  <p className="text-sm text-slate-600">{exam.instructions}</p>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-600">No exams scheduled</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}