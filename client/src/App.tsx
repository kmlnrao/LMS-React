import { useState, useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import Dashboard from "@/pages/dashboard";
import UserManagement from "@/pages/user-management";
import ProcessConfig from "@/pages/process-config";
import Inventory from "@/pages/inventory";
import Billing from "@/pages/billing";
import Reports from "@/pages/reports";
import HmsIntegration from "@/pages/hms-integration";
import NotFound from "@/pages/not-found";
import { MainLayout } from "@/components/layout/main-layout";
import { useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";

function Router() {
  const [location] = useLocation();
  const { toast } = useToast();
  
  const { data: session, isLoading, error } = useQuery<{ user: User } | null>({
    queryKey: ["/api/auth/session"],
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // This would be moved to a proper AuthProvider in a real app
  const isAuthenticated = !!session?.user;
  const userRole = session?.user?.role || 'guest';
  
  // Show error toast if authentication fails
  useEffect(() => {
    if (error) {
      toast({
        title: "Authentication Error",
        description: "Please log in to continue.",
        variant: "destructive",
      });
    }
  }, [error, toast]);
  
  // In a real app, we'd redirect to login if not authenticated
  if (!isAuthenticated && !isLoading && location !== '/login') {
    // We'd redirect to login page here
    // For now, let's assume we're authenticated
    
    // Mock authentication for development
    if (process.env.NODE_ENV !== 'production') {
      return (
        <MainLayout>
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/users" component={UserManagement} />
            <Route path="/process-config" component={ProcessConfig} />
            <Route path="/inventory" component={Inventory} />
            <Route path="/billing" component={Billing} />
            <Route path="/reports" component={Reports} />
            <Route path="/hms-integration" component={HmsIntegration} />
            <Route component={NotFound} />
          </Switch>
        </MainLayout>
      );
    }
  }
  
  return (
    <MainLayout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/users" component={UserManagement} />
        <Route path="/process-config" component={ProcessConfig} />
        <Route path="/inventory" component={Inventory} />
        <Route path="/billing" component={Billing} />
        <Route path="/reports" component={Reports} />
        <Route path="/hms-integration" component={HmsIntegration} />
        <Route component={NotFound} />
      </Switch>
    </MainLayout>
  );
}

function App() {
  return (
    <>
      <Router />
      <Toaster />
    </>
  );
}

export default App;
