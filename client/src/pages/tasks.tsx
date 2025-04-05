import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Plus, Search, Calendar, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { Task } from "@shared/schema";
import { TaskForm } from "@/components/task/task-form";

export default function TasksPage() {
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  
  const { data: tasks, isLoading } = useQuery<Task[]>({
    queryKey: ['/api/tasks'],
  });
  
  // Filter tasks based on status and search term
  const filteredTasks = tasks?.filter(task => {
    const matchesStatus = filterStatus === "all" || task.status === filterStatus;
    const matchesSearch = !searchTerm || 
      task.taskId.toLowerCase().includes(searchTerm.toLowerCase()) || 
      task.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'delayed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 mr-1" />;
      case 'in_progress':
        return <Calendar className="h-4 w-4 mr-1" />;
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 mr-1" />;
      case 'delayed':
        return <AlertTriangle className="h-4 w-4 mr-1" />;
      default:
        return null;
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Laundry Tasks</h2>
          <p className="text-muted-foreground">
            Manage and track laundry tasks across all departments
          </p>
        </div>
        <Dialog open={isTaskFormOpen} onOpenChange={setIsTaskFormOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> New Laundry Request
            </Button>
          </DialogTrigger>
          <TaskForm onClose={() => setIsTaskFormOpen(false)} />
        </Dialog>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex-1 rounded-lg border p-2 bg-white shadow-sm flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground ml-2" />
          <Input
            placeholder="Search tasks by ID or description..."
            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="delayed">Delayed</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Tasks</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="progress">In Progress</TabsTrigger>
          <TabsTrigger value="today">Due Today</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>All Laundry Tasks</CardTitle>
              <CardDescription>
                View and manage all laundry tasks in the system
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Task ID</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                      </TableCell>
                    </TableRow>
                  ) : filteredTasks?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center">
                        No tasks found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTasks?.map((task) => (
                      <TableRow key={task.id}>
                        <TableCell className="font-medium">{task.taskId}</TableCell>
                        <TableCell>{task.description}</TableCell>
                        <TableCell>{task.departmentId}</TableCell>
                        <TableCell>{task.priority}</TableCell>
                        <TableCell>
                          <Badge className={`flex items-center ${getStatusColor(task.status)}`}>
                            {getStatusIcon(task.status)}
                            {task.status.charAt(0).toUpperCase() + task.status.slice(1).replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>{format(new Date(task.createdAt), "MMM d, yyyy")}</TableCell>
                        <TableCell>{format(new Date(task.dueDate), "MMM d, yyyy")}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">View</Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              disabled={task.status === 'completed'}
                            >
                              Update Status
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Tasks</CardTitle>
              <CardDescription>Tasks that need to be processed</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Similar content for pending tasks */}
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : tasks?.filter(task => task.status === 'pending').length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No pending tasks found
                </div>
              ) : (
                <div className="space-y-4">
                  {tasks?.filter(task => task.status === 'pending').map((task) => (
                    <Card key={task.id} className="overflow-hidden">
                      <div className="p-4 border-l-4 border-yellow-500 flex justify-between items-center">
                        <div>
                          <div className="font-medium mb-1">{task.taskId}: {task.description}</div>
                          <div className="text-sm text-muted-foreground">
                            Due: {format(new Date(task.dueDate), "MMM d, yyyy")}
                          </div>
                        </div>
                        <Button size="sm">Start Processing</Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="progress" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>In Progress Tasks</CardTitle>
              <CardDescription>Tasks currently being processed</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Similar content for in-progress tasks */}
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : tasks?.filter(task => task.status === 'in_progress').length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No tasks in progress
                </div>
              ) : (
                <div className="space-y-4">
                  {tasks?.filter(task => task.status === 'in_progress').map((task) => (
                    <Card key={task.id} className="overflow-hidden">
                      <div className="p-4 border-l-4 border-blue-500 flex justify-between items-center">
                        <div>
                          <div className="font-medium mb-1">{task.taskId}: {task.description}</div>
                          <div className="text-sm text-muted-foreground">
                            Due: {format(new Date(task.dueDate), "MMM d, yyyy")}
                          </div>
                        </div>
                        <Button size="sm" variant="outline">Complete Task</Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="today" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Due Today</CardTitle>
              <CardDescription>Tasks that are due today</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Tasks due today */}
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <div className="space-y-4">
                  {(() => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const tomorrow = new Date(today);
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    
                    const dueTodayTasks = tasks?.filter(task => {
                      const dueDate = new Date(task.dueDate);
                      dueDate.setHours(0, 0, 0, 0);
                      return dueDate.getTime() === today.getTime();
                    }) || [];
                    
                    if (dueTodayTasks.length === 0) {
                      return (
                        <div className="text-center py-8 text-muted-foreground">
                          No tasks due today
                        </div>
                      );
                    }
                    
                    return dueTodayTasks.map((task) => (
                      <Card key={task.id} className="overflow-hidden">
                        <div className={`p-4 border-l-4 ${
                          task.status === 'completed' 
                            ? 'border-green-500' 
                            : 'border-amber-500'
                        } flex justify-between items-center`}>
                          <div>
                            <div className="font-medium mb-1">{task.taskId}: {task.description}</div>
                            <div className="text-sm text-muted-foreground">
                              Status: {task.status.charAt(0).toUpperCase() + task.status.slice(1).replace('_', ' ')}
                            </div>
                          </div>
                          <Button 
                            size="sm" 
                            variant={task.status !== 'completed' ? 'default' : 'outline'}
                            disabled={task.status === 'completed'}
                          >
                            {task.status === 'completed' ? 'Completed' : 'Mark Complete'}
                          </Button>
                        </div>
                      </Card>
                    ));
                  })()}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}