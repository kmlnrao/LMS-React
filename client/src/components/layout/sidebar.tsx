import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  Archive, 
  Receipt, 
  PieChart, 
  Link as LinkIcon,
  LogOut, 
  Wrench,
  ClipboardList,
  BoxIcon
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useMemo } from "react";
import { useAuth } from "@/hooks/use-auth";
import { hasPermission } from "@/lib/role-utils";
import suvarnaLogo from "../../assets/suvarna_logo.png";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [location] = useLocation();
  const { toast } = useToast();
  const { user, logoutMutation } = useAuth();
  
  const userName = user?.name || "User";
  const userRole = user?.role || "staff";
  
  const initials = useMemo(() => {
    if (!userName) return "UN";
    return userName
      .split(" ")
      .map(name => name[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  }, [userName]);
  
  const handleLogout = async () => {
    try {
      logoutMutation.mutate(undefined, {
        onSuccess: () => {
          toast({
            title: "Success",
            description: "You have been logged out successfully.",
          });
          // Force navigation to auth page
          window.location.href = "/auth";
        }
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Define all possible navigation items
  const navItems = [
    {
      name: "Dashboard",
      href: "/",
      icon: <LayoutDashboard className="h-5 w-5" />,
      feature: "dashboard"
    },
    {
      name: "Tasks",
      href: "/tasks",
      icon: <ClipboardList className="h-5 w-5" />,
      feature: "tasks"
    },
    {
      name: "Inventory",
      href: "/inventory",
      icon: <Archive className="h-5 w-5" />,
      feature: "inventory"
    },
    {
      name: "Equipment",
      href: "/equipment",
      icon: <Wrench className="h-5 w-5" />,
      feature: "equipment"
    },
    {
      name: "Departments",
      href: "/departments",
      icon: <BoxIcon className="h-5 w-5" />,
      feature: "departments"
    },
    {
      name: "Process Configuration",
      href: "/process-config",
      icon: <Settings className="h-5 w-5" />,
      feature: "processes"
    },
    {
      name: "User Management",
      href: "/users",
      icon: <Users className="h-5 w-5" />,
      feature: "users"
    },
    {
      name: "Billing & Cost Allocation",
      href: "/billing",
      icon: <Receipt className="h-5 w-5" />,
      feature: "billing"
    },
    {
      name: "Reports & Analytics",
      href: "/reports",
      icon: <PieChart className="h-5 w-5" />,
      feature: "reports"
    },
    {
      name: "HMS Integration",
      href: "/hms-integration",
      icon: <LinkIcon className="h-5 w-5" />,
      feature: "hms-integration"
    }
  ];
  
  // Filter nav items based on user role permissions
  const filteredNavItems = navItems.filter(item => 
    hasPermission(userRole, item.feature)
  );

  return (
    <div className={cn("flex flex-col h-full bg-gray-800 text-white", className)}>
      {/* Logo */}
      <div className="flex items-center justify-center h-20 border-b border-gray-700 bg-white p-2">
        <div className="flex items-center justify-center">
          <img 
            src={suvarnaLogo} 
            alt="Suvarna Technosoft" 
            className="h-14 object-contain"
          />
        </div>
      </div>
      
      {/* User Profile */}
      <div className="flex items-center px-4 py-3 border-b border-gray-700">
        <Avatar>
          <AvatarFallback className="bg-primary-600 text-white font-semibold">{initials}</AvatarFallback>
        </Avatar>
        <div className="ml-3">
          <p className="text-sm font-medium">{userName}</p>
          <p className="text-xs text-gray-400">{userRole.charAt(0).toUpperCase() + userRole.slice(1)}</p>
        </div>
      </div>
      
      {/* Navigation */}
      <ScrollArea className="flex-1 px-2 py-4">
        <nav className="space-y-1">
          {filteredNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-md",
                location === item.href
                  ? "bg-primary-600 text-white"
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"
              )}
            >
              <span className="mr-3 text-lg">{item.icon}</span>
              {item.name}
            </Link>
          ))}
        </nav>
      </ScrollArea>
      
      {/* Logout */}
      <div className="px-4 py-3 border-t border-gray-700">
        <Button 
          variant="ghost" 
          className="w-full flex items-center justify-start text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700"
          onClick={handleLogout}
        >
          <LogOut className="mr-3 h-5 w-5" />
          Logout
        </Button>
      </div>
    </div>
  );
}
