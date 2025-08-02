import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { handleAuthError } from "@/lib/authUtils";

interface OrgAdmin {
  id: string;
  username: string;
  name: string;
  email: string;
  org_id: string;
  status: string;
}

interface Organization {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  status: string;
}

interface OrgAuthData {
  orgAdmin: OrgAdmin;
  organization: Organization;
}

export function useOrgAuth() {
  const { toast } = useToast();
  
  const { data, isLoading, error, isError } = useQuery<OrgAuthData>({
    queryKey: ["/api/org/auth/user"],
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });

  // Handle authentication errors
  if (isError && error) {
    const isAuthError = handleAuthError(error, toast, () => {
      // Clear any cached data and redirect
      window.location.href = '/';
    });
    
    if (!isAuthError) {
      // Handle other types of errors
      console.error("Auth check error:", error);
    }
  }

  return {
    orgAdmin: data?.orgAdmin,
    organization: data?.organization,
    orgId: data?.organization?.id,
    isLoading,
    isAuthenticated: !!data?.orgAdmin,
    error,
    isError
  };
}