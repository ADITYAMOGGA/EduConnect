import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Alert,
  AlertDescription,
} from "@/components/ui/alert";
import {
  Activity,
  TrendingUp,
  BarChart3,
  PieChart as PieChartIcon,
  Brain,
  Users,
  Target,
  AlertTriangle,
  Award,
  BookOpen,
  TrendingDown,
} from "lucide-react";

interface Mark {
  id: string;
  studentId: string;
  examId: string;
  subjectId: string;
  marks: number;
  maxMarks: number;
  grade: string;
  subject: string;
  createdAt: string;
  updatedAt: string;
}

interface Student {
  id: string;
  name: string;
  admissionNo: string;
  class: string;
  rollNumber: string;
  email?: string;
}

interface Exam {
  id: string;
  name: string;
  date: string;
  userId: string;
}

interface Subject {
  id: string;
  name: string;
  code: string;
  userId: string;
}

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#8b5a2b'];

export default function AnalyticsDashboard() {
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [selectedStudent, setSelectedStudent] = useState<string>("all");

  // Fetch all data
  const { data: marks = [], isLoading: marksLoading } = useQuery<Mark[]>({
    queryKey: ['/api/marks'],
  });

  const { data: students = [], isLoading: studentsLoading } = useQuery<Student[]>({
    queryKey: ['/api/students'],
  });

  const { data: exams = [], isLoading: examsLoading } = useQuery<Exam[]>({
    queryKey: ['/api/exams'],
  });

  const { data: subjects = [], isLoading: subjectsLoading } = useQuery<Subject[]>({
    queryKey: ['/api/subjects'],
  });

  const isLoading = marksLoading || studentsLoading || examsLoading || subjectsLoading;

  // Calculate analytics data
  const analyticsData = useMemo(() => {
    if (isLoading || !marks.length) {
      return {
        studentTrends: [],
        classComparison: [],
        subjectAnalysis: [],
        priorityInsights: []
      };
    }

    // Calculate student trends
    const studentTrends = students.map(student => {
      const studentMarks = marks.filter(mark => mark.studentId === student.id);
      const examPerformance = exams.map(exam => {
        const examMarks = studentMarks.filter(mark => mark.examId === exam.id);
        const totalMarks = examMarks.reduce((sum, mark) => sum + mark.marks, 0);
        const totalMaxMarks = examMarks.reduce((sum, mark) => sum + mark.maxMarks, 0);
        const percentage = totalMaxMarks > 0 ? (totalMarks / totalMaxMarks) * 100 : 0;
        
        return {
          exam: exam.name,
          percentage: Math.round(percentage * 100) / 100,
          date: exam.date
        };
      });

      return {
        student,
        examPerformance,
        averagePerformance: examPerformance.reduce((sum, exam) => sum + exam.percentage, 0) / examPerformance.length || 0
      };
    });

    // Calculate class comparison
    const classes = Array.from(new Set(students.map(s => s.class)));
    const classComparison = classes.map(className => {
      const classStudents = students.filter(s => s.class === className);
      const classMarks = marks.filter(mark => 
        classStudents.some(student => student.id === mark.studentId)
      );
      
      const totalMarks = classMarks.reduce((sum, mark) => sum + mark.marks, 0);
      const totalMaxMarks = classMarks.reduce((sum, mark) => sum + mark.maxMarks, 0);
      const averageScore = totalMaxMarks > 0 ? (totalMarks / totalMaxMarks) * 100 : 0;

      return {
        class: className,
        averageScore: Math.round(averageScore * 100) / 100,
        studentCount: classStudents.length
      };
    });

    // Calculate subject analysis
    const subjectAnalysis = subjects.map(subject => {
      const subjectMarks = marks.filter(mark => mark.subjectId === subject.id);
      const totalMarks = subjectMarks.reduce((sum, mark) => sum + mark.marks, 0);
      const totalMaxMarks = subjectMarks.reduce((sum, mark) => sum + mark.maxMarks, 0);
      const averageScore = totalMaxMarks > 0 ? (totalMarks / totalMaxMarks) * 100 : 0;

      return {
        subject: subject.name,
        averageScore: Math.round(averageScore * 100) / 100,
        totalStudents: new Set(subjectMarks.map(mark => mark.studentId)).size
      };
    });

    // Calculate priority insights (students needing attention)
    const priorityInsights = studentTrends
      .filter(trend => trend.averagePerformance < 60)
      .map(trend => ({
        student: trend.student,
        averagePerformance: trend.averagePerformance,
        recommendation: trend.averagePerformance < 40 ? "Immediate intervention required" : "Additional support recommended"
      }))
      .sort((a, b) => a.averagePerformance - b.averagePerformance);

    return {
      studentTrends,
      classComparison,
      subjectAnalysis,
      priorityInsights
    };
  }, [marks, students, exams, subjects, isLoading]);

  // Filter data based on selected class and student
  const filteredData = useMemo(() => {
    let filtered = analyticsData.studentTrends;

    if (selectedClass !== "all") {
      filtered = filtered.filter(trend => trend.student.class === selectedClass);
    }

    if (selectedStudent !== "all") {
      filtered = filtered.filter(trend => trend.student.id === selectedStudent);
    }

    return filtered;
  }, [analyticsData.studentTrends, selectedStudent, selectedClass]);

  const classes = Array.from(new Set(students.map(s => s.class)));

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-indigo-50/30 dark:from-slate-900 dark:via-purple-900/20 dark:to-indigo-900/20 p-6 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto"></div>
          <p className="text-lg text-slate-600 dark:text-slate-300">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-indigo-50/30 dark:from-slate-900 dark:via-purple-900/20 dark:to-indigo-900/20 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center space-y-4"
        >
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-full shadow-lg border border-purple-100 dark:border-purple-800">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Performance Analytics Dashboard
            </h1>
          </div>
          <p className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            AI-powered insights and comprehensive visual analysis of student performance trends, 
            class comparisons, and predictive recommendations
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex flex-wrap justify-center gap-4"
        >
          <div className="flex items-center gap-3 px-4 py-2 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-lg shadow-md border border-slate-200 dark:border-slate-700">
            <Users className="h-4 w-4 text-purple-600" />
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="w-36 border-0 bg-transparent focus:ring-0">
                <SelectValue placeholder="Select Class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {classes.map(cls => (
                  <SelectItem key={cls} value={cls}>Class {cls}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-3 px-4 py-2 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-lg shadow-md border border-slate-200 dark:border-slate-700">
            <Target className="h-4 w-4 text-indigo-600" />
            <Select value={selectedStudent} onValueChange={setSelectedStudent}>
              <SelectTrigger className="w-48 border-0 bg-transparent focus:ring-0">
                <SelectValue placeholder="Select Student" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Students</SelectItem>
                {students.map(student => (
                  <SelectItem key={student.id} value={student.id}>
                    {student.name} ({student.rollNumber})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        {/* No Data Alert */}
        {marks.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <Alert className="bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800 dark:text-amber-200">
                No student performance data available. Add students and enter exam marks to see analytics.
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        {/* Main Analytics Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <Tabs defaultValue="trends" className="space-y-8">
            <TabsList className="grid w-full grid-cols-4 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-xl p-2 shadow-lg">
              <TabsTrigger 
                value="trends" 
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white rounded-lg transition-all duration-300"
              >
                <TrendingUp className="h-4 w-4" />
                Grade Trends
              </TabsTrigger>
              <TabsTrigger 
                value="comparison" 
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white rounded-lg transition-all duration-300"
              >
                <BarChart3 className="h-4 w-4" />
                Class Comparison  
              </TabsTrigger>
              <TabsTrigger 
                value="subjects" 
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500 data-[state=active]:text-white rounded-lg transition-all duration-300"
              >
                <PieChartIcon className="h-4 w-4" />
                Subject Analysis
              </TabsTrigger>
              <TabsTrigger 
                value="insights" 
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-500 data-[state=active]:text-white rounded-lg transition-all duration-300"
              >
                <Brain className="h-4 w-4" />
                AI Insights
              </TabsTrigger>
            </TabsList>

            {/* Grade Trends Tab */}
            <TabsContent value="trends" className="space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-6"
              >
                <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                  <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200 dark:border-blue-800 shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <div className="p-2 bg-blue-500 rounded-full">
                          <Users className="h-4 w-4 text-white" />
                        </div>
                        Total Students
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-blue-600">{students.length}</div>
                      <p className="text-sm text-blue-600/70 mt-1">Across all classes</p>
                    </CardContent>
                  </Card>
                </motion.div>
                
                <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                  <Card className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border-emerald-200 dark:border-emerald-800 shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <div className="p-2 bg-emerald-500 rounded-full">
                          <Target className="h-4 w-4 text-white" />
                        </div>
                        Average Performance
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-emerald-600">
                        {analyticsData.classComparison.length > 0 
                          ? Math.round(analyticsData.classComparison.reduce((sum, c) => sum + c.averageScore, 0) / analyticsData.classComparison.length)
                          : 0}%
                      </div>
                      <p className="text-sm text-emerald-600/70 mt-1">Overall class average</p>
                    </CardContent>
                  </Card>
                </motion.div>
                
                <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                  <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200 dark:border-amber-800 shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <div className="p-2 bg-amber-500 rounded-full">
                          <AlertTriangle className="h-4 w-4 text-white" />
                        </div>
                        Need Attention
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-amber-600">
                        {analyticsData.priorityInsights.length}
                      </div>
                      <p className="text-sm text-amber-600/70 mt-1">Students requiring support</p>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm shadow-2xl border-0 ring-1 ring-slate-200 dark:ring-slate-700">
                  <CardHeader className="pb-6">
                    <CardTitle className="flex items-center gap-3 text-2xl">
                      <div className="p-3 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl">
                        <Activity className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                          {selectedStudent !== "all" && filteredData.length > 0 
                            ? `${filteredData[0].student.name}'s Performance Trend`
                            : "Class Performance Trends"
                          }
                        </span>
                        <p className="text-sm text-slate-600 dark:text-slate-300 font-normal mt-1">
                          {selectedStudent !== "all" 
                            ? "Individual student progress across all exams"
                            : "Average class performance comparison across exams"
                          }
                        </p>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart 
                          data={selectedStudent !== "all" && filteredData.length > 0 
                            ? filteredData[0]?.examPerformance || [] 
                            : exams.map(exam => {
                                const examData = analyticsData.classComparison.map(classData => {
                                  const classStudents = students.filter(s => s.class === classData.class);
                                  const classMarks = marks.filter(mark => 
                                    mark.examId === exam.id && 
                                    classStudents.some(student => student.id === mark.studentId)
                                  );
                                  const avgScore = classMarks.length > 0
                                    ? classMarks.reduce((sum, mark) => sum + (mark.marks / mark.maxMarks) * 100, 0) / classMarks.length
                                    : 0;
                                  return { [classData.class]: Math.round(avgScore * 100) / 100 };
                                }).reduce((acc, curr) => ({ ...acc, ...curr }), {});
                                
                                return {
                                  exam: exam.name,
                                  date: exam.date,
                                  ...examData
                                };
                              })
                          }
                        >
                          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                          <XAxis 
                            dataKey="exam" 
                            tick={{ fontSize: 12 }}
                            angle={-45}
                            textAnchor="end"
                            height={60}
                          />
                          <YAxis 
                            domain={[0, 100]} 
                            tick={{ fontSize: 12 }}
                            label={{ value: 'Percentage (%)', angle: -90, position: 'insideLeft' }}
                          />
                          <Tooltip 
                            contentStyle={{
                              backgroundColor: 'rgba(255, 255, 255, 0.95)',
                              border: '1px solid #e2e8f0',
                              borderRadius: '8px',
                              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                            }}
                          />
                          <Legend />
                          {selectedStudent !== "all" && filteredData.length > 0 ? (
                            <Line
                              type="monotone"
                              dataKey="percentage"
                              stroke="#8b5cf6"
                              strokeWidth={3}
                              dot={{ fill: '#8b5cf6', r: 6 }}
                              activeDot={{ r: 8, stroke: '#8b5cf6', strokeWidth: 2, fill: '#fff' }}
                              name={filteredData[0].student.name}
                            />
                          ) : (
                            analyticsData.classComparison.map((classData, index) => (
                              <Line
                                key={classData.class}
                                type="monotone"
                                dataKey={classData.class}
                                stroke={COLORS[index % COLORS.length]}
                                strokeWidth={2}
                                dot={{ r: 4 }}
                                activeDot={{ r: 6, stroke: COLORS[index % COLORS.length], strokeWidth: 2, fill: '#fff' }}
                                name={`Class ${classData.class}`}
                              />
                            ))
                          )}
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Class Comparison Tab */}
            <TabsContent value="comparison" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
              >
                <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm shadow-xl border-0 ring-1 ring-slate-200 dark:ring-slate-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
                        <BarChart3 className="h-5 w-5 text-white" />
                      </div>
                      Class Performance Comparison
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={analyticsData.classComparison}>
                          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                          <XAxis dataKey="class" />
                          <YAxis domain={[0, 100]} />
                          <Tooltip />
                          <Bar 
                            dataKey="averageScore" 
                            fill="#3b82f6"
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Subject Analysis Tab */}
            <TabsContent value="subjects" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1, duration: 0.5 }}
                >
                  <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm shadow-xl border-0 ring-1 ring-slate-200 dark:ring-slate-700">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg">
                          <PieChartIcon className="h-5 w-5 text-white" />
                        </div>
                        Subject Performance Distribution
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={analyticsData.subjectAnalysis}
                              cx="50%"
                              cy="50%"
                              outerRadius={80}
                              dataKey="averageScore"
                              nameKey="subject"
                            >
                              {analyticsData.subjectAnalysis.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm shadow-xl border-0 ring-1 ring-slate-200 dark:ring-slate-700">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg">
                          <Target className="h-5 w-5 text-white" />
                        </div>
                        Subject Performance Radar
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart data={analyticsData.subjectAnalysis}>
                            <PolarGrid />
                            <PolarAngleAxis dataKey="subject" />
                            <PolarRadiusAxis domain={[0, 100]} />
                            <Radar
                              name="Average Score"
                              dataKey="averageScore"
                              stroke="#10b981"
                              fill="#10b981"
                              fillOpacity={0.2}
                              strokeWidth={2}
                            />
                            <Tooltip />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </TabsContent>

            {/* AI Insights Tab */}
            <TabsContent value="insights" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
              >
                <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200 dark:border-amber-800 shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <div className="p-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg">
                        <Brain className="h-5 w-5 text-white" />
                      </div>
                      AI-Powered Student Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analyticsData.priorityInsights.length === 0 ? (
                        <div className="text-center py-12">
                          <Award className="h-16 w-16 text-emerald-500 mx-auto mb-4" />
                          <h3 className="text-lg font-semibold text-emerald-700 dark:text-emerald-300">
                            Excellent Performance!
                          </h3>
                          <p className="text-emerald-600 dark:text-emerald-400">
                            All students are performing well. No immediate interventions needed.
                          </p>
                        </div>
                      ) : (
                        analyticsData.priorityInsights.map((insight, index) => (
                          <motion.div
                            key={insight.student.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1, duration: 0.4 }}
                            className="flex items-center justify-between p-4 bg-white/80 dark:bg-slate-800/80 rounded-lg shadow-md border border-amber-200 dark:border-amber-800"
                          >
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-full ${
                                insight.averagePerformance < 40 
                                  ? 'bg-red-500' 
                                  : 'bg-amber-500'
                              }`}>
                                {insight.averagePerformance < 40 ? (
                                  <AlertTriangle className="h-4 w-4 text-white" />
                                ) : (
                                  <TrendingDown className="h-4 w-4 text-white" />
                                )}
                              </div>
                              <div>
                                <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                                  {insight.student.name}
                                </h4>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                  Class {insight.student.class} • Average: {Math.round(insight.averagePerformance)}%
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                insight.averagePerformance < 40
                                  ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                                  : 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300'
                              }`}>
                                {insight.recommendation}
                              </span>
                            </div>
                          </motion.div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}