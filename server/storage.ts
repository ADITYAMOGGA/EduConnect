export { storage } from "./storage-implementation";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: UpsertUser): Promise<User>;
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

// In-memory storage fallback
class MemoryStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private students: Map<string, Student> = new Map();
  private exams: Map<string, Exam> = new Map();
  private marks: Map<string, Mark> = new Map();

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const existingUser = Array.from(this.users.values()).find(u => u.email === userData.email);
    const user: User = {
      id: existingUser?.id || nanoid(),
      email: userData.email ?? null,
      firstName: userData.firstName ?? null,
      lastName: userData.lastName ?? null,
      profileImageUrl: userData.profileImageUrl ?? null,
      schoolName: userData.schoolName ?? null,
      schoolLogoUrl: userData.schoolLogoUrl ?? null,
      username: userData.username ?? null,
      password: userData.password ?? null,
      createdAt: existingUser?.createdAt || new Date(),
      updatedAt: new Date(),
    };
    this.users.set(user.id, user);
    return user;
  }

  async getStudents(userId: string): Promise<Student[]> {
    return Array.from(this.students.values()).filter(s => s.userId === userId);
  }

  async getStudentsByClass(userId: string, studentClass: string): Promise<Student[]> {
    return Array.from(this.students.values()).filter(s => s.userId === userId && s.class === studentClass);
  }

  async getStudent(id: string, userId: string): Promise<Student | undefined> {
    const student = this.students.get(id);
    return student?.userId === userId ? student : undefined;
  }

  async createStudent(student: InsertStudent): Promise<Student> {
    const newStudent: Student = {
      id: nanoid(),
      name: student.name,
      admissionNo: student.admissionNo,
      class: student.class,
      email: student.email ?? null,
      userId: student.userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.students.set(newStudent.id, newStudent);
    return newStudent;
  }

  async updateStudent(id: string, student: Partial<InsertStudent>, userId: string): Promise<Student> {
    const existing = this.students.get(id);
    if (!existing || existing.userId !== userId) {
      throw new Error("Student not found");
    }
    const updated: Student = { ...existing, ...student, updatedAt: new Date() };
    this.students.set(id, updated);
    return updated;
  }

  async deleteStudent(id: string, userId: string): Promise<void> {
    const student = this.students.get(id);
    if (student?.userId === userId) {
      this.students.delete(id);
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(u => u.username === username);
  }

  async createUser(userData: UpsertUser): Promise<User> {
    const user: User = {
      id: nanoid(),
      email: userData.email ?? null,
      firstName: userData.firstName ?? null,
      lastName: userData.lastName ?? null,
      profileImageUrl: userData.profileImageUrl ?? null,
      schoolName: userData.schoolName ?? null,
      schoolLogoUrl: userData.schoolLogoUrl ?? null,
      username: userData.username ?? null,
      password: userData.password ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(user.id, user);
    return user;
  }

  async getExams(userId: string): Promise<Exam[]> {
    return Array.from(this.exams.values()).filter(e => e.userId === userId);
  }

  async getExam(id: string, userId: string): Promise<Exam | undefined> {
    const exam = this.exams.get(id);
    return exam?.userId === userId ? exam : undefined;
  }

  async createExam(exam: InsertExam): Promise<Exam> {
    const newExam: Exam = {
      id: nanoid(),
      name: exam.name,
      class: exam.class,
      maxMarks: exam.maxMarks ?? 100,
      userId: exam.userId,
      createdAt: new Date(),
    };
    this.exams.set(newExam.id, newExam);
    return newExam;
  }

  async getMarksByStudentAndExam(studentId: string, examId: string): Promise<Mark[]> {
    return Array.from(this.marks.values()).filter(m => m.studentId === studentId && m.examId === examId);
  }

  async getMarksByExam(examId: string): Promise<(Mark & { student: Student })[]> {
    const examMarks = Array.from(this.marks.values()).filter(m => m.examId === examId);
    return examMarks.map(mark => ({
      ...mark,
      student: this.students.get(mark.studentId)!
    })).filter(item => item.student);
  }

  async createMark(mark: InsertMark): Promise<Mark> {
    const newMark: Mark = {
      id: nanoid(),
      studentId: mark.studentId,
      examId: mark.examId,
      subject: mark.subject,
      marks: mark.marks,
      maxMarks: mark.maxMarks ?? 100,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.marks.set(newMark.id, newMark);
    return newMark;
  }

  async updateMark(id: string, mark: Partial<InsertMark>): Promise<Mark> {
    const existing = this.marks.get(id);
    if (!existing) {
      throw new Error("Mark not found");
    }
    const updated: Mark = { ...existing, ...mark, updatedAt: new Date() };
    this.marks.set(id, updated);
    return updated;
  }

  async deleteMark(id: string): Promise<void> {
    this.marks.delete(id);
  }
}

export class DatabaseStorage implements IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(userData: UpsertUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
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
    if (!db) throw new Error("Database not available");
    return await db.select().from(students).where(
      and(eq(students.userId, userId), eq(students.class, studentClass))
    );
  }

  async getStudent(id: string, userId: string): Promise<Student | undefined> {
    if (!db) throw new Error("Database not available");
    const [student] = await db.select().from(students).where(
      and(eq(students.id, id), eq(students.userId, userId))
    );
    return student;
  }

  async createStudent(student: InsertStudent): Promise<Student> {
    if (!db) throw new Error("Database not available");
    const [newStudent] = await db.insert(students).values(student).returning();
    return newStudent;
  }

  async updateStudent(id: string, student: Partial<InsertStudent>, userId: string): Promise<Student> {
    if (!db) throw new Error("Database not available");
    const [updatedStudent] = await db
      .update(students)
      .set({ ...student, updatedAt: new Date() })
      .where(and(eq(students.id, id), eq(students.userId, userId)))
      .returning();
    return updatedStudent;
  }

  async deleteStudent(id: string, userId: string): Promise<void> {
    if (!db) throw new Error("Database not available");
    await db.delete(students).where(
      and(eq(students.id, id), eq(students.userId, userId))
    );
  }

  // Exam operations
  async getExams(userId: string): Promise<Exam[]> {
    if (!db) throw new Error("Database not available");
    return await db.select().from(exams).where(eq(exams.userId, userId));
  }

  async getExam(id: string, userId: string): Promise<Exam | undefined> {
    if (!db) throw new Error("Database not available");
    const [exam] = await db.select().from(exams).where(
      and(eq(exams.id, id), eq(exams.userId, userId))
    );
    return exam;
  }

  async createExam(exam: InsertExam): Promise<Exam> {
    if (!db) throw new Error("Database not available");
    const [newExam] = await db.insert(exams).values(exam).returning();
    return newExam;
  }

  // Marks operations
  async getMarksByStudentAndExam(studentId: string, examId: string): Promise<Mark[]> {
    if (!db) throw new Error("Database not available");
    return await db.select().from(marks).where(
      and(eq(marks.studentId, studentId), eq(marks.examId, examId))
    );
  }

  async getMarksByExam(examId: string): Promise<(Mark & { student: Student })[]> {
    if (!db) throw new Error("Database not available");
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
    if (!db) throw new Error("Database not available");
    const [newMark] = await db.insert(marks).values(mark).returning();
    return newMark;
  }

  async updateMark(id: string, mark: Partial<InsertMark>): Promise<Mark> {
    if (!db) throw new Error("Database not available");
    const [updatedMark] = await db
      .update(marks)
      .set({ ...mark, updatedAt: new Date() })
      .where(eq(marks.id, id))
      .returning();
    return updatedMark;
  }

  async deleteMark(id: string): Promise<void> {
    if (!db) throw new Error("Database not available");
    await db.delete(marks).where(eq(marks.id, id));
  }
}

// Use memory storage as fallback when database is not available, otherwise use database
export const storage = db ? new DatabaseStorage() : new MemoryStorage();
