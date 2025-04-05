import { useAuth } from "@/hooks/use-auth";
import { hasPermission, hasMinimumRole } from "@/lib/role-utils";
import { ReactNode } from "react";

interface RoleGateProps {
  /**
   * The children to render if the user has access
   */
  children: ReactNode;
  
  /**
   * A specific feature to check (like 'dashboard', 'inventory', etc.)
   */
  feature?: string;
  
  /**
   * A minimum role required (like 'admin', 'manager', etc.) - uses role hierarchy
   */
  minimumRole?: string;
  
  /**
   * A specific role or set of roles to check for - exact match required
   */
  allowedRoles?: string[];
  
  /**
   * What to render if the user doesn't have permission (optional)
   */
  fallback?: ReactNode;
}

/**
 * A component that conditionally renders children based on the user's role
 */
export function RoleGate({
  children,
  feature,
  minimumRole,
  allowedRoles,
  fallback = null
}: RoleGateProps) {
  const { user } = useAuth();
  
  // If there's no user, don't render anything
  if (!user) {
    return <>{fallback}</>;
  }
  
  // Get the user's role
  const role = user.role;
  
  // Check access based on the provided criteria
  let hasAccess = true;
  
  // If a specific feature is specified, check if the user's role has access to it
  if (feature && !hasPermission(role, feature)) {
    hasAccess = false;
  }
  
  // If a minimum role is specified, check if the user has at least that role
  if (minimumRole && !hasMinimumRole(role, minimumRole)) {
    hasAccess = false;
  }
  
  // If specific allowed roles are specified, check if the user's role is one of them
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    hasAccess = false;
  }
  
  // Render children if the user has access, otherwise render fallback
  return <>{hasAccess ? children : fallback}</>;
}