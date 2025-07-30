import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Target,
  AlertTriangle,
  Award,
  Brain,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Star,
  Zap
} from "lucide-react";
import { motion } from "framer-motion";

interface Student {
  id: string;
  name: string;
  rollNumber: string;
  class: string;
  admissionNumber: string;
}

interface Mark {
  id: string;
  studentId: string;
  examId: string;
  subjectId: string;
  marks: number;
  maxMarks: number;
  grade: string;
  subject: string;
}

interface Exam {
  id: string;
  name: string;
  date: string;
  class: string;
}

interface Subject {
  id: string;
  name: string;
  code: string;
  maxMarks: number;
}

// AI Insight Generation
const generateStudentInsights = (studentData: any) => {
  const insights = [];
  
  if (studentData.averageScore < 60) {
    insights.push({
      type: "warning",
      icon: AlertTriangle,
      title: "Needs Attention",
      description: `${studentData.name} is performing below average (${studentData.averageScore.toFixed(1)}%). Consider additional support.`,
      priority: "high"
    });
  }
  
  if (studentData.trend === "declining") {
    insights.push({
      type: "danger",
      icon: TrendingDown,
      title: "Declining Performance",
      description: `${studentData.name}'s scores have decreased by ${Math.abs(studentData.trendValue)}% over recent exams.`,
      priority: "high"
    });
  }
  
  if (studentData.trend === "improving") {
    insights.push({
      type: "success",
      icon: TrendingUp,
      title: "Improving Performance",
      description: `${studentData.name} shows positive progress with ${studentData.trendValue}% improvement.`,
      priority: "medium"
    });
  }
  
  if (studentData.averageScore >= 90) {
    insights.push({
      type: "success",
      icon: Award,
      title: "Excellent Performance",
      description: `${studentData.name} is a top performer with ${studentData.averageScore.toFixed(1)}% average.`,
      priority: "low"
    });
  }

  return insights;
};

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1', '#d084d0'];

export default function AnalyticsDashboard() {
  const [selectedStudent, setSelectedStudent] = useState<string>("all");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [selectedClass, setSelectedClass] = useState<string>("all");

  // Fetch data
  const { data: students = [] } = useQuery<Student[]>({
    queryKey: ['/api/students'],
  });

  const { data: marks = [] } = useQuery<Mark[]>({
    queryKey: ['/api/marks'],
  });

  const { data: exams = [] } = useQuery<Exam[]>({
    queryKey: ['/api/exams'],
  });

  const { data: subjects = [] } = useQuery<Subject[]>({
    queryKey: ['/api/subjects'],
  });

  // Process data for analytics
  const analyticsData = useMemo(() => {
    // Student Performance Trends
    const studentTrends = students.map(student => {
      const studentMarks = marks.filter(mark => mark.studentId === student.id);
      const examPerformance = exams.map(exam => {
        const examMarks = studentMarks.filter(mark => mark.examId === exam.id);
        const totalMarks = examMarks.reduce((sum, mark) => sum + mark.marks, 0);
        const maxPossible = examMarks.reduce((sum, mark) => sum + mark.maxMarks, 0);
        const percentage = maxPossible > 0 ? (totalMarks / maxPossible) * 100 : 0;
        
        return {
          exam: exam.name,
          date: exam.date,
          percentage: Math.round(percentage * 100) / 100,
          totalMarks,
          maxPossible
        };
      }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      // Calculate trend
      const scores = examPerformance.map(e => e.percentage);
      let trend = "stable";
      let trendValue = 0;
      
      if (scores.length >= 2) {
        const recent = scores.slice(-2);
        const change = recent[1] - recent[0];
        trendValue = Math.round(change * 100) / 100;
        
        if (change > 5) trend = "improving";
        else if (change < -5) trend = "declining";
      }

      const averageScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

      return {
        student,
        examPerformance,
        averageScore,
        trend,
        trendValue,
        name: student.name
      };
    });

    // Subject Performance Analysis
    const subjectAnalysis = subjects.map(subject => {
      const subjectMarks = marks.filter(mark => mark.subjectId === subject.id);
      const totalStudents = Array.from(new Set(subjectMarks.map(mark => mark.studentId))).length;
      const averageScore = subjectMarks.length > 0 
        ? subjectMarks.reduce((sum, mark) => sum + (mark.marks / mark.maxMarks) * 100, 0) / subjectMarks.length 
        : 0;
      
      const gradeDistribution = subjectMarks.reduce((acc, mark) => {
        acc[mark.grade] = (acc[mark.grade] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        subject: subject.name,
        averageScore: Math.round(averageScore * 100) / 100,
        totalStudents,
        gradeDistribution
      };
    });

    // Class Performance Comparison
    const classComparison = Array.from(new Set(students.map(s => s.class))).map(className => {
      const classStudents = students.filter(s => s.class === className);
      const classMarks = marks.filter(mark => 
        classStudents.some(student => student.id === mark.studentId)
      );
      
      const averageScore = classMarks.length > 0
        ? classMarks.reduce((sum, mark) => sum + (mark.marks / mark.maxMarks) * 100, 0) / classMarks.length
        : 0;

      return {
        class: className,
        students: classStudents.length,
        averageScore: Math.round(averageScore * 100) / 100,
        totalMarks: classMarks.reduce((sum, mark) => sum + mark.marks, 0)
      };
    });

    // Generate AI Insights
    const allInsights = studentTrends.flatMap(data => generateStudentInsights(data));
    const priorityInsights = allInsights.filter(insight => insight.priority === "high");

    return {
      studentTrends,
      subjectAnalysis,
      classComparison,
      allInsights,
      priorityInsights
    };
  }, [students, marks, exams, subjects]);

  // Filter data based on selections
  const filteredData = useMemo(() => {
    let filtered = analyticsData.studentTrends;
    
    if (selectedStudent !== "all") {
      filtered = filtered.filter(data => data.student.id === selectedStudent);
    }
    
    if (selectedClass !== "all") {
      filtered = filtered.filter(data => data.student.class === selectedClass);
    }

    return filtered;
  }, [analyticsData.studentTrends, selectedStudent, selectedClass]);

  const classes = Array.from(new Set(students.map(s => s.class)));

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0"
      >
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Performance Analytics
          </h2>
          <p className="text-slate-600 dark:text-slate-300">
            AI-powered insights and visual performance analysis
          </p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Class" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              {classes.map(cls => (
                <SelectItem key={cls} value={cls}>{cls}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={selectedStudent} onValueChange={setSelectedStudent}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Student" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Students</SelectItem>
              {students.map(student => (
                <SelectItem key={student.id} value={student.id}>
                  {student.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      {/* AI Insights Alert */}
      {analyticsData.priorityInsights.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20">
            <Brain className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800 dark:text-amber-200">
              <strong>AI Insights:</strong> {analyticsData.priorityInsights.length} students need attention. 
              Check the insights section below for detailed recommendations.
            </AlertDescription>
          </Alert>
        </motion.div>
      )}

      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="trends" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Grade Trends
          </TabsTrigger>
          <TabsTrigger value="comparison" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Class Comparison  
          </TabsTrigger>
          <TabsTrigger value="subjects" className="flex items-center gap-2">
            <PieChartIcon className="h-4 w-4" />
            Subject Analysis
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            AI Insights
          </TabsTrigger>
        </TabsList>

        {/* Grade Trends Tab */}
        <TabsContent value="trends" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  Total Students
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{students.length}</div>
                <p className="text-xs text-muted-foreground">Across all classes</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Target className="h-4 w-4 text-green-600" />
                  Average Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analyticsData.classComparison.length > 0 
                    ? Math.round(analyticsData.classComparison.reduce((sum, c) => sum + c.averageScore, 0) / analyticsData.classComparison.length)
                    : 0}%
                </div>
                <p className="text-xs text-muted-foreground">Overall class average</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  Need Attention
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-600">
                  {analyticsData.priorityInsights.length}
                </div>
                <p className="text-xs text-muted-foreground">Students requiring support</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-purple-600" />
                Student Performance Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={filteredData.length > 0 ? filteredData[0]?.examPerformance || [] : []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="exam" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    {filteredData.slice(0, 5).map((studentData, index) => (
                      <Line
                        key={studentData.student.id}
                        type="monotone"
                        dataKey="percentage"
                        data={studentData.examPerformance}
                        stroke={COLORS[index % COLORS.length]}
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        name={studentData.student.name}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Class Comparison Tab */}
        <TabsContent value="comparison" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-indigo-600" />
                Class Performance Comparison
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsData.classComparison}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="class" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Bar dataKey="averageScore" fill="#8884d8" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analyticsData.classComparison.map((classData, index) => (
              <motion.div
                key={classData.class}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Class {classData.class}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Students:</span>
                      <span className="font-medium">{classData.students}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Average Score:</span>
                      <Badge variant={classData.averageScore >= 75 ? "default" : classData.averageScore >= 60 ? "secondary" : "destructive"}>
                        {classData.averageScore}%
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Subject Analysis Tab */}
        <TabsContent value="subjects" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5 text-green-600" />
                  Subject Performance Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analyticsData.subjectAnalysis}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="averageScore"
                        nameKey="subject"
                        label={({ subject, averageScore }) => `${subject}: ${averageScore}%`}
                      >
                        {analyticsData.subjectAnalysis.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-600" />
                  Subject Performance Radar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={analyticsData.subjectAnalysis}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="subject" />
                      <PolarRadiusAxis domain={[0, 100]} />
                      <Radar
                        name="Average Score"
                        dataKey="averageScore"
                        stroke="#8884d8"
                        fill="#8884d8"
                        fillOpacity={0.3}
                      />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analyticsData.subjectAnalysis.map((subject, index) => (
              <motion.div
                key={subject.subject}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{subject.subject}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Average Score:</span>
                      <Badge variant={subject.averageScore >= 75 ? "default" : subject.averageScore >= 60 ? "secondary" : "destructive"}>
                        {subject.averageScore}%
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Students:</span>
                      <span className="font-medium">{subject.totalStudents}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* AI Insights Tab */}
        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-600" />
                AI-Powered Student Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.allInsights.length === 0 ? (
                  <div className="text-center py-8">
                    <Zap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No insights available yet. Add more exam data to generate AI recommendations.</p>
                  </div>
                ) : (
                  analyticsData.allInsights.map((insight, index) => {
                    const IconComponent = insight.icon;
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`p-4 rounded-lg border ${
                          insight.type === "success" 
                            ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800"
                            : insight.type === "warning"
                            ? "bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800"
                            : "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <IconComponent className={`h-5 w-5 mt-0.5 ${
                            insight.type === "success" 
                              ? "text-green-600" 
                              : insight.type === "warning"
                              ? "text-amber-600"
                              : "text-red-600"
                          }`} />
                          <div className="flex-1">
                            <h4 className="font-medium mb-1">{insight.title}</h4>
                            <p className="text-sm text-muted-foreground">{insight.description}</p>
                          </div>
                          <Badge variant={insight.priority === "high" ? "destructive" : insight.priority === "medium" ? "secondary" : "outline"}>
                            {insight.priority}
                          </Badge>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}