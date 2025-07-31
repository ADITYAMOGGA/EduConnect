import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import RoleSelector from "@/pages/role-selector";
import AdminLogin from "@/pages/admin-login";
import OrgLogin from "@/pages/org-login";
import TeacherLogin from "@/pages/teacher-login";
import AuthPage from "@/pages/auth-page";
import Dashboard from "@/pages/dashboard";
import AdminDashboard from "@/pages/admin-dashboard-new";
import Support from "@/pages/support";
import NotFound from "@/pages/not-found";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Switch>
            {/* Role-based login routes */}
            <Route path="/" component={RoleSelector} />
            <Route path="/admin/login" component={AdminLogin} />
            <Route path="/org/login" component={OrgLogin} />
            <Route path="/teacher/login" component={TeacherLogin} />
            
            {/* Protected dashboard routes */}
            <ProtectedRoute path="/admin" component={AdminDashboard} />
            <ProtectedRoute path="/org-dashboard" component={Dashboard} />
            <ProtectedRoute path="/teacher-dashboard" component={Dashboard} />
            <ProtectedRoute path="/support" component={Support} />
            
            {/* Legacy auth route - redirect to role selector */}
            <Route path="/auth" component={AuthPage} />
            
            <Route component={NotFound} />
          </Switch>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
