import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/ui/status-badge";
import { useQuery } from "@tanstack/react-query";
import { Task } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  PlusCircle, 
  UserPlus, 
  FileSpreadsheet, 
  Settings,
  AlertTriangle,
  BellRing,
  ChevronRight,
  ChevronLeft
} from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TaskForm } from "@/components/task/task-form";
import { useLocation } from "wouter";

interface TasksOverviewProps {
  limit?: number;
}

export function TasksOverview({ limit = 4 }: TasksOverviewProps) {
  const [activeTab, setActiveTab] = useState("all");
  const [page, setPage] = useState(1);
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [, setLocation] = useLocation();
  
  const statusFilter = activeTab !== "all" ? activeTab : undefined;
  
  const { data: tasks, isLoading, error } = useQuery<Task[]>({
    queryKey: ["/api/tasks", { offset: (page - 1) * limit, limit, status: statusFilter }],
    staleTime: 1000 * 60 * 1, // 1 minute
  });
  
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setPage(1);
  };
  
  const handlePrevPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };
  
  const handleNextPage = () => {
    setPage(page + 1);
  };
  
  const openTaskForm = () => {
    setIsTaskFormOpen(true);
  };
  
  const closeTaskForm = () => {
    setIsTaskFormOpen(false);
  };
  
  const navigateToUsers = () => {
    setLocation("/users");
  };
  
  const navigateToReports = () => {
    setLocation("/reports");
  };
  
  const navigateToProcessConfig = () => {
    setLocation("/process-config");
  };
  
  return (
    <>
      <div className="mb-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Tasks */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
            <div className="flex items-center space-x-2">
              <CardTitle>Recent Laundry Tasks</CardTitle>
              <Button
                variant="link"
                size="sm"
                className="text-primary hover:text-primary/80"
                onClick={() => setLocation("/process-config")}
              >
                View All
              </Button>
            </div>
            <div className="flex space-x-2">
              <Button
                variant={activeTab === "all" ? "default" : "ghost"}
                size="sm"
                onClick={() => handleTabChange("all")}
              >
                All
              </Button>
              <Button
                variant={activeTab === "pending" ? "default" : "ghost"}
                size="sm"
                onClick={() => handleTabChange("pending")}
              >
                Pending
              </Button>
              <Button
                variant={activeTab === "completed" ? "default" : "ghost"}
                size="sm"
                onClick={() => handleTabChange("completed")}
              >
                Completed
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Task ID</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Requested By</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading && (
                    Array(limit).fill(0).map((_, index) => (
                      <TableRow key={index}>
                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      </TableRow>
                    ))
                  )}
                  
                  {error && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-red-500">
                        Error loading tasks data
                      </TableCell>
                    </TableRow>
                  )}
                  
                  {!isLoading && !error && tasks?.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        No tasks found
                      </TableCell>
                    </TableRow>
                  )}
                  
                  {!isLoading && !error && tasks?.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell className="font-medium">{task.taskId}</TableCell>
                      <TableCell>{task.description}</TableCell>
                      <TableCell>Dept ID: {task.departmentId}</TableCell>
                      <TableCell>
                        <StatusBadge status={task.status} />
                      </TableCell>
                      <TableCell>
                        {task.dueDate ? format(new Date(task.dueDate), "MMM d, h:mm a") : "Not set"}
                      </TableCell>
                      <TableCell>
                        <Button variant="link" size="sm">
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t p-3">
            <span className="text-sm text-gray-500">
              Showing up to {limit} tasks per page
            </span>
            <div className="flex space-x-1">
              <Button
                variant={page === 1 ? "outline" : "secondary"}
                size="icon"
                onClick={handlePrevPage}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="default" size="sm" className="px-3">
                {page}
              </Button>
              <Button
                variant="secondary"
                size="icon"
                onClick={handleNextPage}
                disabled={!tasks || tasks.length === 0 || tasks.length < limit}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardFooter>
        </Card>
        
        {/* Quick Actions / Alerts */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              variant="outline" 
              className="w-full flex items-center justify-between p-3 bg-primary-50 text-primary-700 hover:bg-primary-100"
              onClick={openTaskForm}
            >
              <span className="flex items-center">
                <PlusCircle className="mr-2 h-5 w-5" />
                New Laundry Request
              </span>
              <ChevronRight className="h-4 w-4" />
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full flex items-center justify-between p-3"
              onClick={navigateToUsers}
            >
              <span className="flex items-center">
                <UserPlus className="mr-2 h-5 w-5" />
                Assign Staff
              </span>
              <ChevronRight className="h-4 w-4" />
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full flex items-center justify-between p-3"
              onClick={navigateToReports}
            >
              <span className="flex items-center">
                <FileSpreadsheet className="mr-2 h-5 w-5" />
                Generate Reports
              </span>
              <ChevronRight className="h-4 w-4" />
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full flex items-center justify-between p-3"
              onClick={navigateToProcessConfig}
            >
              <span className="flex items-center">
                <Settings className="mr-2 h-5 w-5" />
                Configure Processes
              </span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </CardContent>
          
          <CardHeader className="pt-0 pb-2">
            <CardTitle>Alerts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 bg-red-50 text-red-800 rounded-lg">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 mt-0.5 mr-2 flex-shrink-0" />
                <div>
                  <p className="font-medium">Low Detergent Stock</p>
                  <p className="text-sm mt-1">Inventory level below 20%. Please reorder soon.</p>
                </div>
              </div>
            </div>
            
            <div className="p-3 bg-yellow-50 text-yellow-800 rounded-lg">
              <div className="flex items-start">
                <BellRing className="h-5 w-5 mt-0.5 mr-2 flex-shrink-0" />
                <div>
                  <p className="font-medium">Maintenance Required</p>
                  <p className="text-sm mt-1">Washing Machine #3 needs service.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* New Laundry Request Dialog */}
      <Dialog open={isTaskFormOpen} onOpenChange={setIsTaskFormOpen}>
        <DialogContent className="sm:max-w-[650px]">
          <DialogHeader>
            <DialogTitle>Create New Laundry Request</DialogTitle>
            <DialogDescription>
              Fill in the details to create a new laundry task
            </DialogDescription>
          </DialogHeader>
          <TaskForm onClose={closeTaskForm} />
        </DialogContent>
      </Dialog>
    </>
  );
}
