import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertStudentSchema, insertExamSchema, insertMarkSchema, insertSubjectSchema } from "@shared/schema";
import { aiService } from "./ai-service";
import multer from "multer";
import Papa from "papaparse";

// Authentication middleware
function isAuthenticated(req: any, res: any, next: any) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
}

const upload = multer({ storage: multer.memoryStorage() });

export function registerRoutes(app: Express): Server {
  // Setup authentication
  setupAuth(app);

  // Get current user info - Optimized
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      // Return user info directly from session/request (already available from authentication)
      const userInfo = {
        id: req.user.id,
        username: req.user.username,
        email: req.user.email,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        schoolName: req.user.schoolName,
        profileImageUrl: req.user.profileImageUrl,
      };
      
      // Cache the response for 5 minutes to reduce database calls
      res.set('Cache-Control', 'public, max-age=300');
      res.json(userInfo);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Update user (school name, etc.)
  app.patch('/api/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { schoolName, firstName, lastName, username } = req.body;
      
      const updatedUser = await storage.upsertUser({
        id: userId,
        email: req.user.email,
        firstName: firstName || req.user.firstName,
        lastName: lastName || req.user.lastName,
        username: username || req.user.username,
        password: req.user.password,
        profileImageUrl: req.user.profileImageUrl,
        schoolName: schoolName || req.user.schoolName,
        schoolLogoUrl: req.user.schoolLogoUrl,
      });
      
      // Update the session with new user data
      req.user.firstName = updatedUser.firstName;
      req.user.lastName = updatedUser.lastName;
      req.user.username = updatedUser.username;
      req.user.schoolName = updatedUser.schoolName;
      
      res.json({
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        schoolName: updatedUser.schoolName,
        profileImageUrl: updatedUser.profileImageUrl,
      });
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  // Student routes
  app.get('/api/students', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { class: studentClass } = req.query;
      
      const students = studentClass 
        ? await storage.getStudentsByClass(userId, studentClass as string)
        : await storage.getStudents(userId);
      
      res.json(students);
    } catch (error) {
      console.error("Error fetching students:", error);
      res.status(500).json({ message: "Failed to fetch students" });
    }
  });

  app.post('/api/students', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const studentData = insertStudentSchema.parse({
        ...req.body,
        userId,
      });
      
      const student = await storage.createStudent(studentData);
      res.json(student);
    } catch (error) {
      console.error("Error creating student:", error);
      res.status(400).json({ message: "Invalid student data" });
    }
  });

  app.patch('/api/students/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const studentData = req.body;
      
      const student = await storage.updateStudent(id, studentData, userId);
      res.json(student);
    } catch (error) {
      console.error("Error updating student:", error);
      res.status(500).json({ message: "Failed to update student" });
    }
  });

  app.delete('/api/students/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      
      await storage.deleteStudent(id, userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting student:", error);
      res.status(500).json({ message: "Failed to delete student" });
    }
  });

  // Import students from CSV - Optimized for speed
  app.post('/api/students/import', isAuthenticated, upload.single('file'), async (req: any, res) => {
    try {
      const userId = req.user.id;
      const file = req.file;
      
      if (!file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      const csvData = file.buffer.toString('utf8');
      const parsed = Papa.parse(csvData, { header: true });
      
      // Validate and prepare all students data first
      const studentsToCreate = [];
      for (const row of parsed.data as any[]) {
        if (row.name && row.admission_no && row.class) {
          try {
            const studentData = insertStudentSchema.parse({
              name: row.name.trim(),
              admissionNo: row.admission_no.trim(),
              class: row.class.trim(),
              email: row.email?.trim() || null,
              userId,
            });
            studentsToCreate.push(studentData);
          } catch (validationError) {
            console.warn(`Invalid student data for row: ${row.name}`, validationError);
          }
        }
      }
      
      // Bulk create students for better performance
      const students = [];
      const batchSize = 10; // Process in batches to avoid overwhelming the database
      
      for (let i = 0; i < studentsToCreate.length; i += batchSize) {
        const batch = studentsToCreate.slice(i, i + batchSize);
        const batchPromises = batch.map(studentData => storage.createStudent(studentData));
        const batchResults = await Promise.all(batchPromises);
        students.push(...batchResults);
      }
      
      res.json({ 
        message: `Successfully imported ${students.length} students from ${parsed.data.length} rows`, 
        students,
        skipped: parsed.data.length - students.length
      });
    } catch (error) {
      console.error("Error importing students:", error);
      res.status(500).json({ message: "Failed to import students" });
    }
  });

  // Subject routes
  app.get('/api/subjects', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const subjects = await storage.getSubjects(userId);
      res.json(subjects);
    } catch (error) {
      console.error("Error fetching subjects:", error);
      res.status(500).json({ message: "Failed to fetch subjects" });
    }
  });

  app.post('/api/subjects', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const subjectData = insertSubjectSchema.parse({
        ...req.body,
        userId,
      });
      
      const subject = await storage.createSubject(subjectData);
      res.json(subject);
    } catch (error) {
      console.error("Error creating subject:", error);
      if (error instanceof Error && error.name === 'ZodError') {
        res.status(400).json({ 
          message: "Invalid subject data", 
          details: error.message,
          validation: (error as any).errors 
        });
      } else {
        res.status(400).json({ message: "Invalid subject data" });
      }
    }
  });

  // Bulk create subjects - Fixed for database schema
  app.post('/api/subjects/bulk', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { subjects } = req.body;
      
      if (!Array.isArray(subjects) || subjects.length === 0) {
        return res.status(400).json({ message: "Invalid subjects data" });
      }
      
      console.log('Bulk creating subjects:', { subjects, userId });
      
      const createdSubjects = [];
      const batchSize = 5; // Process in smaller batches for subjects
      
      for (let i = 0; i < subjects.length; i += batchSize) {
        const batch = subjects.slice(i, i + batchSize);
        const batchPromises = batch.map(async (subjectItem) => {
          try {
            const subjectData = insertSubjectSchema.parse({
              name: subjectItem.name,
              code: subjectItem.code,
              userId,
            });
            
            console.log('Creating subject with data:', subjectData);
            return await storage.createSubject(subjectData);
          } catch (error) {
            console.error('Error creating individual subject:', error);
            throw error;
          }
        });
        
        const batchResults = await Promise.all(batchPromises);
        createdSubjects.push(...batchResults);
      }
      
      res.json({ 
        message: `Successfully created ${createdSubjects.length} subjects`, 
        subjects: createdSubjects 
      });
    } catch (error) {
      console.error("Error creating subjects:", error);
      res.status(400).json({ message: "Failed to create subjects", error: error instanceof Error ? error.message : String(error) });
    }
  });

  app.patch('/api/subjects/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const subjectData = req.body;
      
      const subject = await storage.updateSubject(id, subjectData, userId);
      res.json(subject);
    } catch (error) {
      console.error("Error updating subject:", error);
      res.status(500).json({ message: "Failed to update subject" });
    }
  });

  app.delete('/api/subjects/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      
      await storage.deleteSubject(id, userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting subject:", error);
      res.status(500).json({ message: "Failed to delete subject" });
    }
  });

  // Exam routes
  app.get('/api/exams', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const exams = await storage.getExams(userId);
      res.json(exams);
    } catch (error) {
      console.error("Error fetching exams:", error);
      res.status(500).json({ message: "Failed to fetch exams" });
    }
  });

  app.post('/api/exams', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const examData = insertExamSchema.parse({
        ...req.body,
        userId,
      });
      
      const exam = await storage.createExam(examData);
      res.json(exam);
    } catch (error) {
      console.error("Error creating exam:", error);
      res.status(400).json({ message: "Invalid exam data" });
    }
  });

  app.patch('/api/exams/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const examData = req.body;
      
      const exam = await storage.updateExam(id, examData, userId);
      res.json(exam);
    } catch (error) {
      console.error("Error updating exam:", error);
      res.status(500).json({ message: "Failed to update exam" });
    }
  });

  app.delete('/api/exams/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      
      await storage.deleteExam(id, userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting exam:", error);
      res.status(500).json({ message: "Failed to delete exam" });
    }
  });

  app.patch('/api/exams/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const subjectData = req.body;
      
      const subject = await storage.updateSubject(id, subjectData, userId);
      res.json(subject);
    } catch (error) {
      console.error("Error updating subject:", error);
      res.status(500).json({ message: "Failed to update subject" });
    }
  });

  app.delete('/api/subjects/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      
      await storage.deleteSubject(id, userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting subject:", error);
      res.status(500).json({ message: "Failed to delete subject" });
    }
  });

  // Exam routes
  app.get('/api/exams', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const exams = await storage.getExams(userId);
      res.json(exams);
    } catch (error) {
      console.error("Error fetching exams:", error);
      res.status(500).json({ message: "Failed to fetch exams" });
    }
  });

  app.post('/api/exams', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const examData = insertExamSchema.parse({
        ...req.body,
        userId,
      });
      
      const exam = await storage.createExam(examData);
      res.json(exam);
    } catch (error) {
      console.error("Error creating exam:", error);
      res.status(400).json({ message: "Invalid exam data" });
    }
  });

  app.patch('/api/exams/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const examData = req.body;
      
      const exam = await storage.updateExam(id, examData, userId);
      res.json(exam);
    } catch (error) {
      console.error("Error updating exam:", error);
      res.status(500).json({ message: "Failed to update exam" });
    }
  });

  app.delete('/api/exams/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      
      await storage.deleteExam(id, userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting exam:", error);
      res.status(500).json({ message: "Failed to delete exam" });
    }
  });

  // Bulk certificate generation route
  app.post('/api/certificates/bulk/:examId/:studentClass', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { examId, studentClass } = req.params;
      
      // Get students in the class
      const students = await storage.getStudentsByClass(userId, studentClass);
      
      // Get exam details
      const exams = await storage.getExams(userId);
      const exam = exams.find(e => e.id === examId);
      
      if (!exam) {
        return res.status(404).json({ message: "Exam not found" });
      }

      const certificates = [];
      
      for (const student of students) {
        // Get marks for this student and exam
        const marks = await storage.getMarksByStudentAndExam(student.id, examId);
        
        if (marks.length > 0) {
          const totalMarks = marks.reduce((sum, mark) => sum + mark.marks, 0);
          const totalMaxMarks = marks.reduce((sum, mark) => sum + mark.maxMarks, 0);
          const percentage = totalMaxMarks > 0 ? Math.round((totalMarks / totalMaxMarks) * 100) : 0;

          certificates.push({
            studentName: student.name,
            admissionNo: student.admissionNo,
            class: student.class,
            examName: exam.name,
            marks: marks,
            totalMarks,
            totalMaxMarks,
            percentage
          });
        }
      }

      res.json({ certificates });
    } catch (error) {
      console.error("Error generating bulk certificates:", error);
      res.status(500).json({ message: "Failed to generate certificates" });
    }
  });

  // Marks routes
  app.get('/api/marks', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const marks = await storage.getAllMarks(userId);
      res.json(marks);
    } catch (error) {
      console.error("Error fetching all marks:", error);
      res.status(500).json({ message: "Failed to fetch marks" });
    }
  });

  app.get('/api/marks/:examId', isAuthenticated, async (req: any, res) => {
    try {
      const { examId } = req.params;
      const marks = await storage.getMarksByExam(examId);
      res.json(marks);
    } catch (error) {
      console.error("Error fetching marks:", error);
      res.status(500).json({ message: "Failed to fetch marks" });
    }
  });

  app.get('/api/marks/:studentId/:examId', isAuthenticated, async (req: any, res) => {
    try {
      const { studentId, examId } = req.params;
      const marks = await storage.getMarksByStudentAndExam(studentId, examId);
      res.json(marks);
    } catch (error) {
      console.error("Error fetching student marks:", error);
      res.status(500).json({ message: "Failed to fetch student marks" });
    }
  });

  app.post('/api/marks', isAuthenticated, async (req: any, res) => {
    try {
      const markData = insertMarkSchema.parse(req.body);
      const mark = await storage.createMark(markData);
      res.json(mark);
    } catch (error) {
      console.error("Error creating mark:", error);
      res.status(400).json({ message: "Invalid mark data" });
    }
  });

  app.patch('/api/marks/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const markData = req.body;
      
      const mark = await storage.updateMark(id, markData);
      res.json(mark);
    } catch (error) {
      console.error("Error updating mark:", error);
      res.status(500).json({ message: "Failed to update mark" });
    }
  });

  app.delete('/api/marks/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      
      await storage.deleteMark(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting mark:", error);
      res.status(500).json({ message: "Failed to delete mark" });
    }
  });

  // Export data functionality
  app.get('/api/export/students', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const students = await storage.getStudents(userId);
      
      // Convert to CSV Format
      const csvData = [
        ['Name', 'Admission No', 'Class', 'Email'], // Headers
        ...students.map(student => [
          student.name,
          student.admissionNo,
          student.class,
          student.email || ''
        ])
      ];
      
      // Convert to CSV string
      const csv = csvData.map(row => 
        row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(',')
      ).join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="students.csv"');
      res.send(csv);
    } catch (error) {
      console.error("Error exporting students:", error);
      res.status(500).json({ message: "Failed to export students" });
    }
  });

  app.get('/api/export/complete', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      // Fetch all data
      const [students, exams, subjects, user] = await Promise.all([
        storage.getStudents(userId),
        storage.getExams(userId),
        storage.getSubjects(userId),
        storage.getUser(userId)
      ]);
      
      // Get all marks for all exams
      const allMarks = [];
      for (const exam of exams) {
        const examMarks = await storage.getMarksByExam(exam.id);
        allMarks.push(...examMarks);
      }
      
      const exportData = {
        user: {
          schoolName: user?.schoolName,
          exportDate: new Date().toISOString(),
        },
        students,
        exams,
        subjects,
        marks: allMarks,
        summary: {
          totalStudents: students.length,
          totalExams: exams.length,
          totalSubjects: subjects.length,
          totalMarks: allMarks.length
        }
      };
      
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename="school_data_export.json"');
      res.json(exportData);
    } catch (error) {
      console.error("Error exporting complete data:", error);
      res.status(500).json({ message: "Failed to export data" });
    }
  });

  // AI Chat routes
  app.post('/api/ai/chat', isAuthenticated, async (req: any, res) => {
    try {
      const { message } = req.body;
      const userId = req.user.id;
      
      if (!message || typeof message !== 'string') {
        return res.status(400).json({ message: "Message is required" });
      }
      
      const response = await aiService.chatWithStudentData(message, userId);
      res.json({ response });
    } catch (error) {
      console.error("Error in AI chat:", error);
      res.status(500).json({ message: "Failed to process AI request" });
    }
  });

  app.post('/api/ai/student-insights', isAuthenticated, async (req: any, res) => {
    try {
      const { studentId } = req.body;
      const userId = req.user.id;
      
      if (!studentId) {
        return res.status(400).json({ message: "Student ID is required" });
      }
      
      const insights = await aiService.generateStudentInsights(studentId, userId);
      res.json({ insights });
    } catch (error) {
      console.error("Error generating student insights:", error);
      res.status(500).json({ message: "Failed to generate student insights" });
    }
  });

  // Health check route for Render deployment
  app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  const httpServer = createServer(app);
  return httpServer;
}
