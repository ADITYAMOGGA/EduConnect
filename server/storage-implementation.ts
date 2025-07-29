import { db } from "./db";
import { users, students, exams, marks, subjects } from "@shared/schema";
import type { UpsertUser, User, InsertStudent, Student, InsertExam, Exam, InsertMark, Mark, InsertSubject, Subject } from "@shared/schema";
import { eq, and } from "drizzle-orm";
import { nanoid } from "nanoid";

export class DatabaseStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(userData: UpsertUser): Promise<User> {
    const [user] = await db.insert(users).values({
      ...userData,
      id: userData.id || nanoid(),
    }).returning();
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db.insert(users).values({
      ...userData,
      id: userData.id || nanoid(),
    }).onConflictDoUpdate({
      target: users.id,
      set: userData
    }).returning();
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

  async createStudent(studentData: InsertStudent): Promise<Student> {
    const [student] = await db.insert(students).values({
      ...studentData,
      id: nanoid(),
    }).returning();
    return student;
  }

  async updateStudent(id: string, studentData: Partial<InsertStudent>, userId: string): Promise<Student> {
    const [student] = await db.update(students)
      .set(studentData)
      .where(and(eq(students.id, id), eq(students.userId, userId)))
      .returning();
    return student;
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

  async createExam(examData: InsertExam): Promise<Exam> {
    const [exam] = await db.insert(exams).values({
      ...examData,
      id: nanoid(),
    }).returning();
    return exam;
  }

  // Subject operations
  async getSubjects(userId: string): Promise<Subject[]> {
    return await db.select().from(subjects).where(eq(subjects.userId, userId));
  }

  async createSubject(subjectData: InsertSubject): Promise<Subject> {
    const [subject] = await db.insert(subjects).values({
      ...subjectData,
      id: nanoid(),
    }).returning();
    return subject;
  }

  async updateSubject(id: string, subjectData: Partial<InsertSubject>, userId: string): Promise<Subject> {
    const [subject] = await db.update(subjects)
      .set(subjectData)
      .where(and(eq(subjects.id, id), eq(subjects.userId, userId)))
      .returning();
    return subject;
  }

  async deleteSubject(id: string, userId: string): Promise<void> {
    await db.delete(subjects).where(
      and(eq(subjects.id, id), eq(subjects.userId, userId))
    );
  }

  // Marks operations
  async getMarksByExam(examId: string): Promise<Mark[]> {
    return await db.select().from(marks).where(eq(marks.examId, examId));
  }

  async getMarksByStudentAndExam(studentId: string, examId: string): Promise<Mark[]> {
    return await db.select().from(marks).where(
      and(eq(marks.studentId, studentId), eq(marks.examId, examId))
    );
  }

  async createMark(markData: InsertMark): Promise<Mark> {
    const [mark] = await db.insert(marks).values({
      ...markData,
      id: nanoid(),
    }).returning();
    return mark;
  }

  async updateMark(id: string, markData: Partial<InsertMark>): Promise<Mark> {
    const [mark] = await db.update(marks)
      .set(markData)
      .where(eq(marks.id, id))
      .returning();
    return mark;
  }

  async deleteMark(id: string): Promise<void> {
    await db.delete(marks).where(eq(marks.id, id));
  }
}

// This file is deprecated - use storage.ts instead
// Keeping for compatibility during migration