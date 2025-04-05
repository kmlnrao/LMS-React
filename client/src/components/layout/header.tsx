import { Button } from "@/components/ui/button";
import { Bell, Menu } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface HeaderProps {
  title: string;
  onMenuClick: () => void;
}

export function Header({ title, onMenuClick }: HeaderProps) {
  const [notifications] = useState(3); // This would come from an API in a real app
  const { toast } = useToast();
  
  const handleNotificationClick = () => {
    toast({
      title: "Notifications",
      description: `You have ${notifications} unread notifications.`,
    });
  };

  return (
    <header className="z-10 py-4 bg-white shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle menu</span>
        </Button>
        
        {/* Page Title */}
        <h1 className="text-xl font-semibold text-gray-800">{title}</h1>
        
        {/* Header Right */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-600 hover:text-gray-800"
              onClick={handleNotificationClick}
            >
              <Bell className="h-5 w-5" />
              {notifications > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute top-0 right-0 h-2 w-2 p-0"
                />
              )}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
