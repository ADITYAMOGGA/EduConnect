import { GoogleGenerativeAI } from '@google/generative-ai';
import { storage } from './storage';

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY environment variable is required");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export class AIService {
  private model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  async chatWithStudentData(message: string, userId: string): Promise<string> {
    try {
      // Get user's school data
      const user = await storage.getUser(userId);
      if (!user) {
        return "I couldn't find your profile. Please make sure you're logged in.";
      }

      // Get all students, exams, and marks for context
      const students = await storage.getStudents(userId);
      const exams = await storage.getExams(userId);
      const marks = await storage.getAllMarks(userId);
      const subjects = await storage.getSubjects(userId);

      // Create enriched marks data with student and subject names
      const enrichedMarks = marks.slice(0, 100).map((mark: any) => {
        const student = students.find(s => s.id === mark.studentId);
        const exam = exams.find(e => e.id === mark.examId);
        const subject = subjects.find(s => s.id === mark.subjectId);
        
        return {
          studentId: mark.studentId,
          studentName: student?.name || 'Unknown Student',
          admissionNo: student?.admissionNo || 'N/A',
          class: student?.class || 'N/A',
          examId: mark.examId,
          examName: exam?.name || 'Unknown Exam',
          subjectId: mark.subjectId,
          subjectName: subject?.name || mark.subject || 'Unknown Subject',
          marks: mark.marks,
          grade: mark.grade
        };
      });

      // Filter data for the user's school (if schoolName is available)
      const schoolData = {
        schoolName: user.schoolName || 'Your School',
        studentsCount: students.length,
        examsCount: exams.length,
        marksCount: marks.length,
        subjectsCount: subjects.length,
        students: students.slice(0, 50), // Limit to avoid token limits
        exams: exams.slice(0, 20),
        enrichedMarks: enrichedMarks,
        subjects: subjects.slice(0, 20)
      };

      const context = `
You are an AI assistant for ${schoolData.schoolName}, a school management system called MARKSHEET PRO. 
You help teachers and administrators with questions about students, marks, exams, and school data.

Current School Data Summary:
- School: ${schoolData.schoolName}
- Total Students: ${schoolData.studentsCount}
- Total Exams: ${schoolData.examsCount}
- Total Marks Entries: ${schoolData.marksCount}
- Total Subjects: ${schoolData.subjectsCount}

Available Students: ${JSON.stringify(schoolData.students.map(s => ({
  name: s.name,
  class: s.class,
  admissionNo: s.admissionNo
})))}

Available Exams: ${JSON.stringify(schoolData.exams.map(e => ({
  name: e.name,
  class: e.class
})))}

Available Subjects: ${JSON.stringify(schoolData.subjects.map(s => ({
  name: s.name,
  code: s.code
})))}

Recent Marks Data with Student Names: ${JSON.stringify(schoolData.enrichedMarks)}

Please provide helpful, accurate responses about the school data. Be friendly and professional.

IMPORTANT INSTRUCTIONS:
- You have complete student information including names, classes, admission numbers, and their marks data
- When asked about a specific student like "Vinay Gajjala", look through the enriched marks data which contains studentName field
- The enriched marks data shows student names, not just IDs, so you can directly answer questions about specific students
- Provide detailed analysis of student performance, class comparisons, and insights
- If a student has no marks data, say so clearly rather than asking for student IDs

User Question: ${message}
`;

      const result = await this.model.generateContent(context);
      const response = await result.response;
      return response.text();

    } catch (error) {
      console.error('AI Service Error:', error);
      return "I'm sorry, I encountered an error while processing your request. Please try again.";
    }
  }

  async generateStudentInsights(studentId: string, userId: string): Promise<string> {
    try {
      const user = await storage.getUser(userId);
      if (!user) {
        return "I couldn't find your profile. Please make sure you're logged in.";
      }

      const students = await storage.getStudents(userId);
      const student = students.find(s => s.id === studentId);
      
      if (!student) {
        return "Student not found.";
      }

      const marks = await storage.getAllMarks(userId);
      const studentMarks = marks.filter((m: any) => m.studentId === studentId);
      const exams = await storage.getExams(userId);
      const subjects = await storage.getSubjects(userId);

      const context = `
Generate detailed insights for this student:

Student Information:
- Name: ${student.name}
- Class: ${student.class}
- Admission Number: ${student.admissionNo}

Academic Performance:
${studentMarks.map((mark: any) => {
  const exam = exams.find(e => e.id === mark.examId);
  const subject = subjects.find(s => s.id === mark.subjectId);
  return `- ${exam?.name || 'Unknown Exam'}: ${subject?.name || 'Unknown Subject'} - ${mark.marks}/100 (Grade: ${mark.grade})`;
}).join('\n')}

Please provide:
1. Overall academic performance summary
2. Subject-wise strengths and areas for improvement
3. Grade trends and patterns
4. Recommendations for the student
5. Suggestions for parents/teachers

Be encouraging but honest about areas needing improvement.
`;

      const result = await this.model.generateContent(context);
      const response = await result.response;
      return response.text();

    } catch (error) {
      console.error('Student Insights Error:', error);
      return "I'm sorry, I couldn't generate insights for this student. Please try again.";
    }
  }
}

export const aiService = new AIService();