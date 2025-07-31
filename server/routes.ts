import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertStudentSchema, insertExamSchema, insertMarkSchema, insertSubjectSchema } from "@shared/schema";
import { aiService } from "./ai-service";
import authMultiRouter from "./auth-multi";
import multer from "multer";
import Papa from "papaparse";

// Authentication middleware - Updated for multi-org system
function isAuthenticated(req: any, res: any, next: any) {
  // For now, disable the old session-based auth check
  // Multi-org authentication will be handled by the specific route handlers
  res.status(401).json({ message: "Please use role-specific login endpoints" });
}

const upload = multer({ storage: multer.memoryStorage() });

export function registerRoutes(app: Express): Server {
  // Setup session middleware only (remove old auth setup)
  setupAuth(app);
  
  // Setup multi-auth routes (new authentication system)
  app.use(authMultiRouter);

  // Get current user info - Disabled for multi-org migration
  app.get('/api/user', (req: any, res) => {
    res.status(401).json({ message: "Please use role-specific authentication" });
  });

  // OLD ADMIN ROUTES REMOVED - Using multi-org authentication system instead
  // All admin functionality now handled by auth-multi.ts

  // Student routes
  app.get('/api/students', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const students = await storage.getStudents(userId);
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

  // Health check route
  app.get('/api/health', (req: any, res) => {
    res.json({ 
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'marksheet-pro-api'
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}