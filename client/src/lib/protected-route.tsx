import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";
import { hasPermission, hasMinimumRole } from "@/lib/role-utils";

/**
 * Basic protected route that requires authentication
 */
export function ProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: () => React.JSX.Element;
}) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-border" />
        </div>
      </Route>
    );
  }

  if (!user) {
    return (
      <Route path={path}>
        <Redirect to="/auth" />
      </Route>
    );
  }

  return <Route path={path} component={Component} />;
}

/**
 * Role-based protected route that requires specific feature permission
 */
export function FeatureProtectedRoute({
  path,
  component: Component,
  feature,
}: {
  path: string;
  component: () => React.JSX.Element;
  feature: string;
}) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-border" />
        </div>
      </Route>
    );
  }

  if (!user) {
    return (
      <Route path={path}>
        <Redirect to="/auth" />
      </Route>
    );
  }

  if (!hasPermission(user.role, feature)) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen flex-col space-y-4">
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="text-muted-foreground">
            You don't have permission to access this feature.
          </p>
          <Redirect to="/" />
        </div>
      </Route>
    );
  }

  return <Route path={path} component={Component} />;
}

/**
 * Role-based route that requires a minimum role level
 */
export function RoleProtectedRoute({
  path,
  component: Component,
  minimumRole,
}: {
  path: string;
  component: () => React.JSX.Element;
  minimumRole: string;
}) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-border" />
        </div>
      </Route>
    );
  }

  if (!user) {
    return (
      <Route path={path}>
        <Redirect to="/auth" />
      </Route>
    );
  }

  if (!hasMinimumRole(user.role, minimumRole)) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen flex-col space-y-4">
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="text-muted-foreground">
            You need higher access privileges to view this page.
          </p>
          <Redirect to="/" />
        </div>
      </Route>
    );
  }

  return <Route path={path} component={Component} />;
}

/**
 * Admin-only protected route (kept for backward compatibility)
 */
export function AdminProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: () => React.JSX.Element;
}) {
  return (
    <RoleProtectedRoute
      path={path}
      component={Component}
      minimumRole="admin"
    />
  );
}