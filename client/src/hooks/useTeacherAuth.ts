import { useQuery } from "@tanstack/react-query";

interface Teacher {
  id: string;
  name: string;
  username: string;
  email: string;
  phone: string;
  status: string;
  org_id: string;
  classes: string[];
  created_at: string;
  updated_at: string;
}

interface Organization {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  email: string;
}

interface Subject {
  id: string;
  name: string;
  code: string;
  class_level: string;
  max_marks: number;
  org_id: string;
}

interface TeacherAuthResponse {
  teacher: Teacher;
  organization: Organization;
  subjects: Subject[];
}

export function useTeacherAuth() {
  const {
    data,
    isLoading,
    isError,
    refetch
  } = useQuery<TeacherAuthResponse>({
    queryKey: ['/api/teacher/auth/user'],
    queryFn: async () => {
      const response = await fetch('/api/teacher/auth/user', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Not authenticated');
        }
        throw new Error('Failed to fetch teacher data');
      }
      
      return response.json();
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    teacher: data?.teacher,
    organization: data?.organization,
    subjects: data?.subjects || [],
    teacherId: data?.teacher?.id,
    orgId: data?.organization?.id,
    isAuthenticated: !!data?.teacher && !isError,
    isLoading,
    isError,
    refetch
  };
}