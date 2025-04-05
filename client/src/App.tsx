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
import { ProtectedRoute, AdminProtectedRoute } from "./lib/protected-route";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={() => (
        <MainLayout>
          <Dashboard />
        </MainLayout>
      )} />
      
      <AdminProtectedRoute path="/users" component={() => (
        <MainLayout>
          <UserManagement />
        </MainLayout>
      )} />
      
      <ProtectedRoute path="/process-config" component={() => (
        <MainLayout>
          <ProcessConfig />
        </MainLayout>
      )} />
      
      <ProtectedRoute path="/inventory" component={() => (
        <MainLayout>
          <Inventory />
        </MainLayout>
      )} />
      
      <ProtectedRoute path="/billing" component={() => (
        <MainLayout>
          <Billing />
        </MainLayout>
      )} />
      
      <ProtectedRoute path="/reports" component={() => (
        <MainLayout>
          <Reports />
        </MainLayout>
      )} />
      
      <ProtectedRoute path="/hms-integration" component={() => (
        <MainLayout>
          <HmsIntegration />
        </MainLayout>
      )} />
      
      <Route path="/auth" component={AuthPage} />
      
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
