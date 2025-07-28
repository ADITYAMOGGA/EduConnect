import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertStudentSchema, insertExamSchema, insertMarkSchema } from "@shared/schema";
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

  // Update user (school name, etc.)
  app.patch('/api/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { schoolName, firstName, lastName } = req.body;
      
      const updatedUser = await storage.upsertUser({
        id: userId,
        email: req.user.email,
        firstName: firstName || req.user.firstName,
        lastName: lastName || req.user.lastName,
        username: req.user.username,
        password: req.user.password,
        profileImageUrl: req.user.profileImageUrl,
        schoolName,
        schoolLogoUrl: req.user.schoolLogoUrl,
      });
      
      res.json({
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        schoolName: updatedUser.schoolName,
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

  // Import students from CSV
  app.post('/api/students/import', isAuthenticated, upload.single('file'), async (req: any, res) => {
    try {
      const userId = req.user.id;
      const file = req.file;
      
      if (!file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      const csvData = file.buffer.toString('utf8');
      const parsed = Papa.parse(csvData, { header: true });
      
      const students = [];
      for (const row of parsed.data as any[]) {
        if (row.name && row.admission_no && row.class) {
          const studentData = insertStudentSchema.parse({
            name: row.name,
            admissionNo: row.admission_no,
            class: row.class,
            email: row.email || null,
            userId,
          });
          
          const student = await storage.createStudent(studentData);
          students.push(student);
        }
      }
      
      res.json({ message: `Successfully imported ${students.length} students`, students });
    } catch (error) {
      console.error("Error importing students:", error);
      res.status(500).json({ message: "Failed to import students" });
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

  // Marks routes
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

  const httpServer = createServer(app);
  return httpServer;
}
