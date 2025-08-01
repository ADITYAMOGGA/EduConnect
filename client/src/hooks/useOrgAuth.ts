import { useQuery } from "@tanstack/react-query";

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
  const { data, isLoading, error } = useQuery<OrgAuthData>({
    queryKey: ["/api/org/auth/user"],
    retry: false,
  });

  return {
    orgAdmin: data?.orgAdmin,
    organization: data?.organization,
    orgId: data?.organization?.id,
    isLoading,
    isAuthenticated: !!data?.orgAdmin,
    error
  };
}