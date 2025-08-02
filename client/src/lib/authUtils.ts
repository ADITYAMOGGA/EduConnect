export function isUnauthorizedError(error: any): boolean {
  return error?.message?.includes('401') || error?.message?.includes('Unauthorized') || error?.status === 401;
}

export function handleAuthError(error: any, toast: any, onSessionExpired?: () => void) {
  if (isUnauthorizedError(error)) {
    toast({
      title: "Session Expired",
      description: "Your session has expired. Please log in again.",
      variant: "destructive",
    });
    
    if (onSessionExpired) {
      onSessionExpired();
    } else {
      // Redirect to login after a short delay
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    }
    return true;
  }
  return false;
}

export function createAuthenticatedFetch(orgId: string, toast: any) {
  return async (url: string, options: RequestInit = {}) => {
    const response = await fetch(url, {
      ...options,
      credentials: 'include',
    });
    
    if (response.status === 401) {
      handleAuthError({ status: 401 }, toast);
      throw new Error('Session expired');
    }
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response;
  };
}