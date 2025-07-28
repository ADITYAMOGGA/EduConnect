import {
  users,
  students,
  exams,
  marks,
  type User,
  type UpsertUser,
  type Student,
  type InsertStudent,
  type Exam,
  type InsertExam,
  type Mark,
  type InsertMark,
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
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
  
  // Marks operations
  getMarksByStudentAndExam(studentId: string, examId: string): Promise<Mark[]>;
  getMarksByExam(examId: string): Promise<(Mark & { student: Student })[]>;
  createMark(mark: InsertMark): Promise<Mark>;
  updateMark(id: string, mark: Partial<InsertMark>): Promise<Mark>;
  deleteMark(id: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Student operations
  async getStudents(userId: string): Promise<Student[]> {
    return await db.select().from(students).where(eq(students.userId, userId));
  }

  async getStudentsByClass(userId: string, studentClass: string): Promise<Student[]> {
    return await db.select().from(students).where(
      and(eq(students.userId, userId), eq(students.class, studentClass))
    );
  }

  async getStudent(id: string, userId: string): Promise<Student | undefined> {
    const [student] = await db.select().from(students).where(
      and(eq(students.id, id), eq(students.userId, userId))
    );
    return student;
  }

  async createStudent(student: InsertStudent): Promise<Student> {
    const [newStudent] = await db.insert(students).values(student).returning();
    return newStudent;
  }

  async updateStudent(id: string, student: Partial<InsertStudent>, userId: string): Promise<Student> {
    const [updatedStudent] = await db
      .update(students)
      .set({ ...student, updatedAt: new Date() })
      .where(and(eq(students.id, id), eq(students.userId, userId)))
      .returning();
    return updatedStudent;
  }

  async deleteStudent(id: string, userId: string): Promise<void> {
    await db.delete(students).where(
      and(eq(students.id, id), eq(students.userId, userId))
    );
  }

  // Exam operations
  async getExams(userId: string): Promise<Exam[]> {
    return await db.select().from(exams).where(eq(exams.userId, userId));
  }

  async getExam(id: string, userId: string): Promise<Exam | undefined> {
    const [exam] = await db.select().from(exams).where(
      and(eq(exams.id, id), eq(exams.userId, userId))
    );
    return exam;
  }

  async createExam(exam: InsertExam): Promise<Exam> {
    const [newExam] = await db.insert(exams).values(exam).returning();
    return newExam;
  }

  // Marks operations
  async getMarksByStudentAndExam(studentId: string, examId: string): Promise<Mark[]> {
    return await db.select().from(marks).where(
      and(eq(marks.studentId, studentId), eq(marks.examId, examId))
    );
  }

  async getMarksByExam(examId: string): Promise<(Mark & { student: Student })[]> {
    return await db
      .select({
        id: marks.id,
        studentId: marks.studentId,
        examId: marks.examId,
        subject: marks.subject,
        marks: marks.marks,
        maxMarks: marks.maxMarks,
        createdAt: marks.createdAt,
        updatedAt: marks.updatedAt,
        student: students,
      })
      .from(marks)
      .innerJoin(students, eq(marks.studentId, students.id))
      .where(eq(marks.examId, examId));
  }

  async createMark(mark: InsertMark): Promise<Mark> {
    const [newMark] = await db.insert(marks).values(mark).returning();
    return newMark;
  }

  async updateMark(id: string, mark: Partial<InsertMark>): Promise<Mark> {
    const [updatedMark] = await db
      .update(marks)
      .set({ ...mark, updatedAt: new Date() })
      .where(eq(marks.id, id))
      .returning();
    return updatedMark;
  }

  async deleteMark(id: string): Promise<void> {
    await db.delete(marks).where(eq(marks.id, id));
  }
}

export const storage = new DatabaseStorage();
