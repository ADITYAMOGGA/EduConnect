import { supabase } from "./db";
import type { UpsertUser, User, InsertStudent, Student, InsertExam, Exam, InsertMark, Mark, InsertSubject, Subject } from "@shared/schema";

export class SupabaseStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching user:', error);
      return undefined;
    }
    return data;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();
    
    if (error) {
      console.error('Error fetching user by username:', error);
      return undefined;
    }
    return data;
  }

  async createUser(userData: UpsertUser): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .insert(userData)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating user:', error);
      throw error;
    }
    return data;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .upsert(userData)
      .select()
      .single();
    
    if (error) {
      console.error('Error upserting user:', error);
      throw error;
    }
    return data;
  }

  // Student operations
  async getStudents(userId: string): Promise<Student[]> {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error fetching students:', error);
      return [];
    }
    return data || [];
  }

  async getStudentsByClass(userId: string, studentClass: string): Promise<Student[]> {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('user_id', userId)
      .eq('class', studentClass);
    
    if (error) {
      console.error('Error fetching students by class:', error);
      return [];
    }
    return data || [];
  }

  async getStudent(id: string, userId: string): Promise<Student | undefined> {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching student:', error);
      return undefined;
    }
    return data;
  }

  async createStudent(studentData: InsertStudent): Promise<Student> {
    const { data, error } = await supabase
      .from('students')
      .insert(studentData)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating student:', error);
      throw error;
    }
    return data;
  }

  async updateStudent(id: string, studentData: Partial<InsertStudent>, userId: string): Promise<Student> {
    const { data, error } = await supabase
      .from('students')
      .update(studentData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating student:', error);
      throw error;
    }
    return data;
  }

  async deleteStudent(id: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('students')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error deleting student:', error);
      throw error;
    }
  }

  // Exam operations
  async getExams(userId: string): Promise<Exam[]> {
    const { data, error } = await supabase
      .from('exams')
      .select('*')
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error fetching exams:', error);
      return [];
    }
    return data || [];
  }

  async getExam(id: string, userId: string): Promise<Exam | undefined> {
    const { data, error } = await supabase
      .from('exams')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching exam:', error);
      return undefined;
    }
    return data;
  }

  async createExam(examData: InsertExam): Promise<Exam> {
    const { data, error } = await supabase
      .from('exams')
      .insert(examData)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating exam:', error);
      throw error;
    }
    return data;
  }

  // Subject operations
  async getSubjects(userId: string): Promise<Subject[]> {
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error fetching subjects:', error);
      return [];
    }
    return data || [];
  }

  async createSubject(subjectData: InsertSubject): Promise<Subject> {
    const { data, error } = await supabase
      .from('subjects')
      .insert(subjectData)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating subject:', error);
      throw error;
    }
    return data;
  }

  async updateSubject(id: string, subjectData: Partial<InsertSubject>, userId: string): Promise<Subject> {
    const { data, error } = await supabase
      .from('subjects')
      .update(subjectData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating subject:', error);
      throw error;
    }
    return data;
  }

  async deleteSubject(id: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('subjects')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error deleting subject:', error);
      throw error;
    }
  }

  // Marks operations
  async getMarksByExam(examId: string): Promise<Mark[]> {
    const { data, error } = await supabase
      .from('marks')
      .select('*')
      .eq('exam_id', examId);
    
    if (error) {
      console.error('Error fetching marks by exam:', error);
      return [];
    }
    return data || [];
  }

  async getMarksByStudentAndExam(studentId: string, examId: string): Promise<Mark[]> {
    const { data, error } = await supabase
      .from('marks')
      .select('*')
      .eq('student_id', studentId)
      .eq('exam_id', examId);
    
    if (error) {
      console.error('Error fetching marks by student and exam:', error);
      return [];
    }
    return data || [];
  }

  async createMark(markData: InsertMark): Promise<Mark> {
    const { data, error } = await supabase
      .from('marks')
      .insert(markData)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating mark:', error);
      throw error;
    }
    return data;
  }

  async updateMark(id: string, markData: Partial<InsertMark>): Promise<Mark> {
    const { data, error } = await supabase
      .from('marks')
      .update(markData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating mark:', error);
      throw error;
    }
    return data;
  }

  async deleteMark(id: string): Promise<void> {
    const { error } = await supabase
      .from('marks')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting mark:', error);
      throw error;
    }
  }
}

export const storage = new SupabaseStorage();