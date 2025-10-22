import { Navigate, Outlet } from "react-router-dom";
import { useAuth, UserRole } from "@/store/auth";
import { Icons } from "@/components/ui/icons";

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
  redirectTo?: string;
  children?: React.ReactNode; // Add t
}

export default function ProtectedRoute({
  allowedRoles,
  redirectTo = "/login",
  children,
}: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuth();

  // Not authenticated - redirect to login
  if (!isAuthenticated || !user) {
    return <Navigate to={redirectTo} replace />;
  }

  // Check role-based access
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Icons.command className="h-16 w-16 text-muted-foreground mx-auto" />
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="text-muted-foreground">
            You don't have permission to access this page.
          </p>
          <p className="text-sm text-muted-foreground">
            Your role: <strong>{user.role}</strong>
          </p>
        </div>
      </div>
    );
  }

   return children ? <>{children}</> : <Outlet />;
}
