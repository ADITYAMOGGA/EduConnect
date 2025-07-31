import type { UpsertUser, User, InsertStudent, Student, InsertExam, Exam, InsertMark, Mark, InsertSubject, Subject } from "@shared/schema";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  createUser(user: UpsertUser): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User>;
  deleteUser(id: string): Promise<void>;
  
  // Student operations
  getStudents(userId: string): Promise<Student[]>;
  getStudentsByClass(userId: string, studentClass: string): Promise<Student[]>;
  getStudent(id: string, userId: string): Promise<Student | undefined>;
  createStudent(student: InsertStudent): Promise<Student>;
  updateStudent(id: string, student: Partial<InsertStudent>, userId: string): Promise<Student>;
  deleteStudent(id: string, userId: string): Promise<void>;
  
  // Exam operations
  getExams(userId: string): Promise<Exam[]>;
  getExam(id: string, userId: string): Promise<Exam | undefined>;
  createExam(exam: InsertExam): Promise<Exam>;
  
  // Subject operations
  getSubjects(userId: string): Promise<Subject[]>;
  createSubject(subject: InsertSubject): Promise<Subject>;
  updateSubject(id: string, subject: Partial<InsertSubject>, userId: string): Promise<Subject>;
  deleteSubject(id: string, userId: string): Promise<void>;
  
  // Marks operations
  getAllMarks(userId: string): Promise<Mark[]>;
  getMarksByStudentAndExam(studentId: string, examId: string): Promise<Mark[]>;
  getMarksByExam(examId: string): Promise<Mark[]>;
  createMark(mark: InsertMark): Promise<Mark>;
  updateMark(id: string, mark: Partial<InsertMark>): Promise<Mark>;
  deleteMark(id: string): Promise<void>;
}

// Import and export the Supabase storage implementation
export { SupabaseStorage } from './storage-supabase';

// Create storage instance
import { SupabaseStorage } from './storage-supabase';
export const storage = new SupabaseStorage();
