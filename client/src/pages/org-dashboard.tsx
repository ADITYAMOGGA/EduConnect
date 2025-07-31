import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  FileText, 
  Plus,
  Search,
  Edit,
  Trash2,
  Download,
  Upload,
  LogOut,
  Settings,
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import AddStudentModal from "@/components/AddStudentModal";
import AddTeacherModal from "@/components/AddTeacherModal";
import AddSubjectModal from "@/components/AddSubjectModal";

interface Organization {
  id: string;
  name: string;
  address: string;
  board_type: string;
  principal_name: string;
}

interface Student {
  id: string;
  name: string;
  admission_no: string;
  class_level: string;
  section: string;
  roll_no: string;
  father_name: string;
  mother_name: string;
  phone: string;
}

interface Teacher {
  id: string;
  name: string;
  email: string;
  phone: string;
  qualification: string;
  experience_years: number;
  employee_id: string;
}

interface Subject {
  id: string;
  name: string;
  code: string;
  class_level: string;
  max_marks: number;
}

export default function OrgDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [showAddTeacher, setShowAddTeacher] = useState(false);
  const [showAddSubject, setShowAddSubject] = useState(false);

  // Get organization data from localStorage
  const orgData = JSON.parse(localStorage.getItem("organizationData") || "{}");
  const orgAdminData = JSON.parse(localStorage.getItem("orgAdminData") || "{}");

  // Fetch dashboard statistics
  const { data: stats } = useQuery({
    queryKey: ["/api/org/stats", orgData.id],
    queryFn: () => fetch(`/api/org/stats?orgId=${orgData.id}`).then(res => res.json()),
    enabled: !!orgData.id,
  });

  // Fetch students
  const { data: students = [] } = useQuery({
    queryKey: ["/api/org/students", orgData.id],
    queryFn: () => fetch(`/api/org/students?orgId=${orgData.id}`).then(res => res.json()),
    enabled: !!orgData.id,
  });

  // Fetch teachers
  const { data: teachers = [] } = useQuery({
    queryKey: ["/api/org/teachers", orgData.id],
    queryFn: () => fetch(`/api/org/teachers?orgId=${orgData.id}`).then(res => res.json()),
    enabled: !!orgData.id,
  });

  // Fetch subjects
  const { data: subjects = [] } = useQuery({
    queryKey: ["/api/org/subjects", orgData.id],
    queryFn: () => fetch(`/api/org/subjects?orgId=${orgData.id}`).then(res => res.json()),
    enabled: !!orgData.id,
  });

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    localStorage.removeItem("orgAdminData");
    localStorage.removeItem("organizationData");
    window.location.href = "/";
  };

  const filteredStudents = Array.isArray(students) ? students.filter((student: Student) =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.admission_no.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  const filteredTeachers = Array.isArray(teachers) ? teachers.filter((teacher: Teacher) =>
    teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.email.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  const filteredSubjects = Array.isArray(subjects) ? subjects.filter((subject: Subject) =>
    subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subject.code.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900 dark:to-purple-900">
      {/* Header */}
      <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border-b border-blue-200/50 dark:border-blue-800/50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <GraduationCap className="text-white text-xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                  {orgData.name || "School Dashboard"}
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                  Welcome, {orgAdminData.name}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
            <TabsTrigger value="dashboard" className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span>Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="students" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Students</span>
            </TabsTrigger>
            <TabsTrigger value="teachers" className="flex items-center space-x-2">
              <GraduationCap className="w-4 h-4" />
              <span>Teachers</span>
            </TabsTrigger>
            <TabsTrigger value="subjects" className="flex items-center space-x-2">
              <BookOpen className="w-4 h-4" />
              <span>Subjects</span>
            </TabsTrigger>
            <TabsTrigger value="exams" className="flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>Exams</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4" />
              <span>Reports</span>
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Overview */}
          <TabsContent value="dashboard" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium opacity-90">Total Students</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="text-3xl font-bold">{stats?.totalStudents || 0}</div>
                      <Users className="w-8 h-8 opacity-80" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium opacity-90">Total Teachers</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="text-3xl font-bold">{stats?.totalTeachers || 0}</div>
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
                      <div className="text-3xl font-bold">{stats?.totalSubjects || 0}</div>
                      <BookOpen className="w-8 h-8 opacity-80" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium opacity-90">Active Exams</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="text-3xl font-bold">{stats?.totalExams || 0}</div>
                      <FileText className="w-8 h-8 opacity-80" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <Card className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="w-5 h-5" />
                    <span>Recent Activity</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-medium">New student registered</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Arjun Kumar added to Class 10-A</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <Users className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-medium">Teacher assigned</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Mrs. Priya Sharma assigned to Mathematics</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Students Management */}
          <TabsContent value="students" className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    placeholder="Search students..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline">
                  <Upload className="w-4 h-4 mr-2" />
                  Import CSV
                </Button>
                <Button onClick={() => setShowAddStudent(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Student
                </Button>
              </div>
            </div>

            <Card className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Students List</CardTitle>
                <CardDescription>Manage all students in your school</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredStudents.map((student: Student) => (
                    <motion.div
                      key={student.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                          {student.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-semibold">{student.name}</h3>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {student.admission_no} • Class {student.class_level}-{student.section} • Roll No: {student.roll_no}
                          </p>
                          <p className="text-xs text-slate-500">
                            Father: {student.father_name} • {student.phone}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary">Class {student.class_level}</Badge>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Teachers Management */}
          <TabsContent value="teachers" className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    placeholder="Search teachers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
              </div>
              <Button onClick={() => setShowAddTeacher(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Teacher
              </Button>
            </div>

            <Card className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Teachers List</CardTitle>
                <CardDescription>Manage all teachers in your school</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredTeachers.map((teacher: Teacher) => (
                    <motion.div
                      key={teacher.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-semibold">
                          {teacher.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-semibold">{teacher.name}</h3>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {teacher.email} • {teacher.phone}
                          </p>
                          <p className="text-xs text-slate-500">
                            {teacher.qualification} • {teacher.experience_years} years exp • ID: {teacher.employee_id}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary">{teacher.experience_years}y exp</Badge>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Subjects Management */}
          <TabsContent value="subjects" className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    placeholder="Search subjects..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
              </div>
              <Button onClick={() => setShowAddSubject(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Subject
              </Button>
            </div>

            <Card className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Subjects List</CardTitle>
                <CardDescription>Manage all subjects and teacher assignments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredSubjects.map((subject: Subject) => (
                    <motion.div
                      key={subject.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold">{subject.name}</h3>
                        <Badge variant="outline">Class {subject.class_level}</Badge>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                        Code: {subject.code}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                        Max Marks: {subject.max_marks}
                      </p>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Exams Management */}
          <TabsContent value="exams" className="space-y-6">
            <Card className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Exams Management</CardTitle>
                <CardDescription>Create and manage exams</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <FileText className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Exams Yet</h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-4">Create your first exam to get started</p>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Exam
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports */}
          <TabsContent value="reports" className="space-y-6">
            <Card className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Reports & Analytics</CardTitle>
                <CardDescription>Generate and download reports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg">
                    <h3 className="font-semibold mb-2">Student Performance Report</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                      Comprehensive report of all students' academic performance
                    </p>
                    <Button variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Generate Report
                    </Button>
                  </div>
                  
                  <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg">
                    <h3 className="font-semibold mb-2">Progress Cards</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                      Individual progress cards for all students
                    </p>
                    <Button variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Download Cards
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      <AddStudentModal 
        open={showAddStudent} 
        onOpenChange={setShowAddStudent} 
        orgId={orgData.id} 
      />
      <AddTeacherModal 
        open={showAddTeacher} 
        onOpenChange={setShowAddTeacher} 
        orgId={orgData.id} 
      />
      <AddSubjectModal 
        open={showAddSubject} 
        onOpenChange={setShowAddSubject} 
        orgId={orgData.id} 
      />
    </div>
  );
}