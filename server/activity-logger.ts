import { supabase } from "./db";

interface ActivityLogData {
  orgId: string;
  userId: string;
  userType: 'admin' | 'org_admin' | 'teacher';
  userName: string;
  activity: string;
  description: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

export async function logActivity(data: ActivityLogData): Promise<void> {
  try {
    const { error } = await supabase
      .from('activity_logs')
      .insert({
        org_id: data.orgId,
        user_id: data.userId,
        user_type: data.userType,
        user_name: data.userName,
        activity: data.activity,
        description: data.description,
        metadata: data.metadata || null,
        ip_address: data.ipAddress || null,
        user_agent: data.userAgent || null,
      });

    if (error) {
      console.error('Failed to log activity:', error);
    }
  } catch (err) {
    console.error('Activity logging error:', err);
  }
}

// Helper function to extract client info from request
export function getClientInfo(req: any) {
  return {
    ipAddress: req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'],
    userAgent: req.headers['user-agent'],
  };
}

// Common activity types
export const ACTIVITIES = {
  LOGIN: 'login',
  LOGOUT: 'logout',
  CREATE_STUDENT: 'create_student',
  UPDATE_STUDENT: 'update_student',
  DELETE_STUDENT: 'delete_student',
  CREATE_TEACHER: 'create_teacher',
  UPDATE_TEACHER: 'update_teacher',
  DELETE_TEACHER: 'delete_teacher',
  CREATE_SUBJECT: 'create_subject',
  UPDATE_SUBJECT: 'update_subject',
  DELETE_SUBJECT: 'delete_subject',
  CREATE_EXAM: 'create_exam',
  UPDATE_EXAM: 'update_exam',
  DELETE_EXAM: 'delete_exam',
  ENTER_MARKS: 'enter_marks',
  UPDATE_MARKS: 'update_marks',
  GENERATE_CERTIFICATE: 'generate_certificate',
  ASSIGN_TEACHER: 'assign_teacher',
  BULK_IMPORT: 'bulk_import',
  VIEW_DASHBOARD: 'view_dashboard',
} as const;