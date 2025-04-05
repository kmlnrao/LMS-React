import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import Dashboard from "@/pages/dashboard";
import UserManagement from "@/pages/user-management";
import ProcessConfig from "@/pages/process-config";
import Inventory from "@/pages/inventory";
import Billing from "@/pages/billing";
import Reports from "@/pages/reports";
import HmsIntegration from "@/pages/hms-integration";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import { MainLayout } from "@/components/layout/main-layout";
import { AuthProvider } from "@/hooks/use-auth";
import { 
  ProtectedRoute, 
  FeatureProtectedRoute, 
  RoleProtectedRoute, 
  AdminProtectedRoute 
} from "./lib/protected-route";

function Router() {
  return (
    <Switch>
      {/* Dashboard - accessible by all authenticated users */}
      <FeatureProtectedRoute 
        path="/" 
        feature="dashboard"
        component={() => (
          <MainLayout>
            <Dashboard />
          </MainLayout>
        )} 
      />
      
      {/* User Management - requires 'users' feature permission */}
      <FeatureProtectedRoute 
        path="/users" 
        feature="users"
        component={() => (
          <MainLayout>
            <UserManagement />
          </MainLayout>
        )} 
      />
      
      {/* Process Configuration - requires 'processes' feature permission */}
      <FeatureProtectedRoute 
        path="/process-config" 
        feature="processes"
        component={() => (
          <MainLayout>
            <ProcessConfig />
          </MainLayout>
        )} 
      />
      
      {/* Inventory Management - requires 'inventory' feature permission */}
      <FeatureProtectedRoute 
        path="/inventory" 
        feature="inventory"
        component={() => (
          <MainLayout>
            <Inventory />
          </MainLayout>
        )} 
      />
      
      {/* Billing - requires 'billing' feature permission */}
      <FeatureProtectedRoute 
        path="/billing" 
        feature="billing"
        component={() => (
          <MainLayout>
            <Billing />
          </MainLayout>
        )} 
      />
      
      {/* Reports - requires 'reports' feature permission */}
      <FeatureProtectedRoute 
        path="/reports" 
        feature="reports"
        component={() => (
          <MainLayout>
            <Reports />
          </MainLayout>
        )} 
      />
      
      {/* HMS Integration - requires 'hms-integration' feature permission */}
      <FeatureProtectedRoute 
        path="/hms-integration" 
        feature="hms-integration"
        component={() => (
          <MainLayout>
            <HmsIntegration />
          </MainLayout>
        )} 
      />
      
      {/* Authentication page - public */}
      <Route path="/auth" component={AuthPage} />
      
      {/* 404 page - public */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router />
      <Toaster />
    </AuthProvider>
  );
}

export default App;
