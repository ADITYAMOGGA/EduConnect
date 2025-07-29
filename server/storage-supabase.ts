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
      if (error.code !== 'PGRST116') { // Don't log "no rows" as error
        console.error('Error fetching user:', error);
      }
      return undefined;
    }
    
    // Map snake_case to camelCase
    return {
      id: data.id,
      email: data.email,
      firstName: data.first_name,
      lastName: data.last_name,
      profileImageUrl: data.profile_image_url,
      schoolName: data.school_name,
      schoolLogoUrl: data.school_logo_url,
      username: data.username,
      password: data.password,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();
    
    if (error) {
      if (error.code !== 'PGRST116') { // Don't log "no rows" as error
        console.error('Error fetching user by username:', error);
      }
      return undefined;
    }
    
    // Map snake_case to camelCase
    return {
      id: data.id,
      email: data.email,
      firstName: data.first_name,
      lastName: data.last_name,
      profileImageUrl: data.profile_image_url,
      schoolName: data.school_name,
      schoolLogoUrl: data.school_logo_url,
      username: data.username,
      password: data.password,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }

  async createUser(userData: UpsertUser): Promise<User> {
    // Map the camelCase fields to snake_case for Supabase
    const dbUserData = {
      id: userData.id,
      email: userData.email,
      first_name: userData.firstName,
      last_name: userData.lastName,
      profile_image_url: userData.profileImageUrl,
      school_name: userData.schoolName,
      school_logo_url: userData.schoolLogoUrl,
      username: userData.username,
      password: userData.password
    };

    console.log('Creating user with data:', dbUserData);

    const { data, error } = await supabase
      .from('users')
      .insert(dbUserData)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating user:', error);
      throw error;
    }
    
    // Map snake_case back to camelCase for return
    return {
      id: data.id,
      email: data.email,
      firstName: data.first_name,
      lastName: data.last_name,
      profileImageUrl: data.profile_image_url,
      schoolName: data.school_name,
      schoolLogoUrl: data.school_logo_url,
      username: data.username,
      password: data.password,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    // Map the camelCase fields to snake_case for Supabase
    const dbUserData = {
      id: userData.id,
      email: userData.email,
      first_name: userData.firstName,
      last_name: userData.lastName,
      profile_image_url: userData.profileImageUrl,
      school_name: userData.schoolName,
      school_logo_url: userData.schoolLogoUrl,
      username: userData.username,
      password: userData.password
    };

    const { data, error } = await supabase
      .from('users')
      .upsert(dbUserData)
      .select()
      .single();
    
    if (error) {
      console.error('Error upserting user:', error);
      throw error;
    }
    
    // Map snake_case back to camelCase for return
    return {
      id: data.id,
      email: data.email,
      firstName: data.first_name,
      lastName: data.last_name,
      profileImageUrl: data.profile_image_url,
      schoolName: data.school_name,
      schoolLogoUrl: data.school_logo_url,
      username: data.username,
      password: data.password,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
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
    
    // Map snake_case to camelCase
    return (data || []).map(student => ({
      id: student.id,
      name: student.name,
      admissionNo: student.admission_no,
      class: student.class,
      email: student.email,
      userId: student.user_id,
      createdAt: student.created_at,
      updatedAt: student.updated_at
    }));
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
    
    // Map snake_case to camelCase
    return (data || []).map(student => ({
      id: student.id,
      name: student.name,
      admissionNo: student.admission_no,
      class: student.class,
      email: student.email,
      userId: student.user_id,
      createdAt: student.created_at,
      updatedAt: student.updated_at
    }));
  }

  async getStudent(id: string, userId: string): Promise<Student | undefined> {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();
    
    if (error) {
      if (error.code !== 'PGRST116') {
        console.error('Error fetching student:', error);
      }
      return undefined;
    }
    
    // Map snake_case to camelCase
    return {
      id: data.id,
      name: data.name,
      admissionNo: data.admission_no,
      class: data.class,
      email: data.email,
      userId: data.user_id,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }

  async createStudent(studentData: InsertStudent): Promise<Student> {
    // Map camelCase to snake_case for database
    const dbStudentData = {
      name: studentData.name,
      admission_no: studentData.admissionNo,
      class: studentData.class,
      email: studentData.email,
      user_id: studentData.userId
    };

    console.log('Creating student with data:', dbStudentData);

    const { data, error } = await supabase
      .from('students')
      .insert(dbStudentData)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating student:', error);
      throw error;
    }
    
    // Map snake_case back to camelCase
    return {
      id: data.id,
      name: data.name,
      admissionNo: data.admission_no,
      class: data.class,
      email: data.email,
      userId: data.user_id,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }

  async updateStudent(id: string, studentData: Partial<InsertStudent>, userId: string): Promise<Student> {
    // Map camelCase to snake_case for database
    const dbStudentData: any = {};
    if (studentData.name !== undefined) dbStudentData.name = studentData.name;
    if (studentData.admissionNo !== undefined) dbStudentData.admission_no = studentData.admissionNo;
    if (studentData.class !== undefined) dbStudentData.class = studentData.class;
    if (studentData.email !== undefined) dbStudentData.email = studentData.email;

    const { data, error } = await supabase
      .from('students')
      .update(dbStudentData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating student:', error);
      throw error;
    }
    
    // Map snake_case back to camelCase
    return {
      id: data.id,
      name: data.name,
      admissionNo: data.admission_no,
      class: data.class,
      email: data.email,
      userId: data.user_id,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
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
    
    // Map snake_case to camelCase
    return (data || []).map(exam => ({
      id: exam.id,
      name: exam.name,
      class: exam.class,
      maxMarks: exam.max_marks,
      userId: exam.user_id,
      createdAt: exam.created_at
    }));
  }

  async getExam(id: string, userId: string): Promise<Exam | undefined> {
    const { data, error } = await supabase
      .from('exams')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();
    
    if (error) {
      if (error.code !== 'PGRST116') {
        console.error('Error fetching exam:', error);
      }
      return undefined;
    }
    
    // Map snake_case to camelCase
    return {
      id: data.id,
      name: data.name,
      class: data.class,
      maxMarks: data.max_marks,
      userId: data.user_id,
      createdAt: data.created_at
    };
  }

  async createExam(examData: InsertExam): Promise<Exam> {
    // Map camelCase to snake_case
    const dbExamData = {
      name: examData.name,
      class: examData.class,
      max_marks: examData.maxMarks,
      user_id: examData.userId
    };

    const { data, error } = await supabase
      .from('exams')
      .insert(dbExamData)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating exam:', error);
      throw error;
    }
    
    // Map snake_case back to camelCase
    return {
      id: data.id,
      name: data.name,
      class: data.class,
      maxMarks: data.max_marks,
      userId: data.user_id,
      createdAt: data.created_at
    };
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
    
    // Map snake_case to camelCase
    return (data || []).map(mark => ({
      id: mark.id,
      studentId: mark.student_id,
      examId: mark.exam_id,
      subject: mark.subject,
      marks: mark.marks,
      maxMarks: mark.max_marks,
      createdAt: mark.created_at,
      updatedAt: mark.updated_at
    }));
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
    
    // Map snake_case to camelCase
    return (data || []).map(mark => ({
      id: mark.id,
      studentId: mark.student_id,
      examId: mark.exam_id,
      subject: mark.subject,
      marks: mark.marks,
      maxMarks: mark.max_marks,
      createdAt: mark.created_at,
      updatedAt: mark.updated_at
    }));
  }

  async createMark(markData: InsertMark): Promise<Mark> {
    // Map camelCase to snake_case
    const dbMarkData = {
      student_id: markData.studentId,
      exam_id: markData.examId,
      subject: markData.subject,
      marks: markData.marks,
      max_marks: markData.maxMarks
    };

    const { data, error } = await supabase
      .from('marks')
      .insert(dbMarkData)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating mark:', error);
      throw error;
    }
    
    // Map snake_case back to camelCase
    return {
      id: data.id,
      studentId: data.student_id,
      examId: data.exam_id,
      subject: data.subject,
      marks: data.marks,
      maxMarks: data.max_marks,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }

  async updateMark(id: string, markData: Partial<InsertMark>): Promise<Mark> {
    // Map camelCase to snake_case
    const dbMarkData: any = {};
    if (markData.studentId !== undefined) dbMarkData.student_id = markData.studentId;
    if (markData.examId !== undefined) dbMarkData.exam_id = markData.examId;
    if (markData.subject !== undefined) dbMarkData.subject = markData.subject;
    if (markData.marks !== undefined) dbMarkData.marks = markData.marks;
    if (markData.maxMarks !== undefined) dbMarkData.max_marks = markData.maxMarks;

    const { data, error } = await supabase
      .from('marks')
      .update(dbMarkData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating mark:', error);
      throw error;
    }
    
    // Map snake_case back to camelCase
    return {
      id: data.id,
      studentId: data.student_id,
      examId: data.exam_id,
      subject: data.subject,
      marks: data.marks,
      maxMarks: data.max_marks,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
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
    
    // Map snake_case to camelCase
    return (data || []).map(subject => ({
      id: subject.id,
      name: subject.name,
      code: subject.code,
      userId: subject.user_id,
      createdAt: subject.created_at
    }));
  }

  async getSubject(id: string, userId: string): Promise<Subject | undefined> {
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();
    
    if (error) {
      if (error.code !== 'PGRST116') {
        console.error('Error fetching subject:', error);
      }
      return undefined;
    }
    
    // Map snake_case to camelCase
    return {
      id: data.id,
      name: data.name,
      code: data.code,
      userId: data.user_id,
      createdAt: data.created_at
    };
  }

  async createSubject(subjectData: InsertSubject): Promise<Subject> {
    // Map camelCase to snake_case for database
    const dbSubjectData = {
      name: subjectData.name,
      code: subjectData.code,
      user_id: subjectData.userId
    };

    console.log('Creating subject with data:', dbSubjectData);

    const { data, error } = await supabase
      .from('subjects')
      .insert(dbSubjectData)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating subject:', error);
      throw error;
    }
    
    // Map snake_case back to camelCase
    return {
      id: data.id,
      name: data.name,
      code: data.code,
      userId: data.user_id,
      createdAt: data.created_at
    };
  }

  async updateSubject(id: string, subjectData: Partial<InsertSubject>, userId: string): Promise<Subject> {
    // Map camelCase to snake_case for database
    const dbSubjectData: any = {};
    if (subjectData.name !== undefined) dbSubjectData.name = subjectData.name;
    if (subjectData.code !== undefined) dbSubjectData.code = subjectData.code;

    const { data, error } = await supabase
      .from('subjects')
      .update(dbSubjectData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating subject:', error);
      throw error;
    }
    
    // Map snake_case back to camelCase
    return {
      id: data.id,
      name: data.name,
      code: data.code,
      userId: data.user_id,
      createdAt: data.created_at
    };
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
}

export const storage = new SupabaseStorage();