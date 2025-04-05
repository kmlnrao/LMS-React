import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/hooks/use-auth";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [location] = useLocation();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const { user } = useAuth();
  
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
    }
  }, [isMobile]);
  
  // Close sidebar on mobile when location changes
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [location, isMobile]);
  
  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };
  
  // Get page title based on location
  const getPageTitle = () => {
    switch (location) {
      case "/":
        return "Dashboard";
      case "/users":
        return "User Management";
      case "/process-config":
        return "Process Configuration";
      case "/inventory":
        return "Inventory Management";
      case "/equipment":
        return "Equipment Management";
      case "/departments":
        return "Departments";
      case "/tasks":
        return "Tasks";
      case "/billing":
        return "Billing & Cost Allocation";
      case "/reports":
        return "Reports & Analytics";
      case "/hms-integration":
        return "HMS Integration";
      default:
        return "Laundry Management";
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      {sidebarOpen && (
        <div 
          className={`${
            isMobile ? "fixed inset-0 z-40 w-64" : "hidden md:flex md:w-64 md:flex-col"
          }`}
        >
          <Sidebar />
        </div>
      )}
      
      {/* Mobile overlay */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 z-30 bg-gray-600 bg-opacity-75"
          onClick={toggleSidebar}
        />
      )}
      
      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-y-auto">
        <Header title={getPageTitle()} onMenuClick={toggleSidebar} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
