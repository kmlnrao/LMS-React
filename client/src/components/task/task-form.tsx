import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { InsertTask, Department, User } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { addDays } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

// Validation schema for task form
const taskFormSchema = z.object({
  description: z.string().min(3, "Description must be at least 3 characters"),
  departmentId: z.coerce.number().min(1, "Department is required"),
  assignedToId: z.coerce.number().optional(),
  priority: z.string().min(1, "Priority is required"),
  status: z.enum(["pending", "in_progress", "completed", "delayed"]).default("pending"),
  weight: z.coerce.number().min(0, "Weight must be non-negative").optional(),
  dueDate: z.date(),
  notes: z.string().optional(),
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

interface TaskFormProps {
  onClose: () => void;
}

export function TaskForm({ onClose }: TaskFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Default values for the form - defined outside of component rendering logic
  const defaultValues = {
    description: "",
    departmentId: 0,
    assignedToId: undefined,
    priority: "medium",
    status: "pending" as const,  // Use const assertion to ensure correct type
    weight: undefined as number | undefined,
    dueDate: addDays(new Date(), 1),
    notes: "",
  };

  // Form must be initialized before any conditional returns
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues,
  });

  // Get departments for select input - ensure consistent order of hooks
  const departmentsQuery = useQuery<Department[]>({
    queryKey: ["/api/departments"],
  });
  const departments = departmentsQuery.data;
  const isDepartmentsLoading = departmentsQuery.isLoading;

  // Get users (staff) for select input
  const usersQuery = useQuery<User[]>({
    queryKey: ["/api/users"],
  });
  const users = usersQuery.data;
  const isUsersLoading = usersQuery.isLoading;

  // Mutation for creating a new task
  const createTaskMutation = useMutation({
    mutationFn: async (data: TaskFormValues) => {
      if (!user?.id) {
        throw new Error("User not authenticated");
      }
      
      const taskData = {
        ...data,
        requestedById: user.id,
        status: data.status as "pending" | "in_progress" | "completed" | "delayed"
      };
      
      const res = await apiRequest("POST", "/api/tasks", taskData);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to create task");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({
        title: "Success",
        description: "New laundry task created successfully",
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create task",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: TaskFormValues) => {
    setIsSubmitting(true);
    try {
      await createTaskMutation.mutateAsync(data);
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input {...field} placeholder="e.g., Ward 5 daily linen change" />
              </FormControl>
              <FormDescription>
                Brief description of the laundry task
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="departmentId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Department</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(parseInt(value))}
                  defaultValue={field.value?.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {isDepartmentsLoading ? (
                      <SelectItem value="loading" disabled>Loading...</SelectItem>
                    ) : departments?.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id.toString()}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="assignedToId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Assign To (Optional)</FormLabel>
                <Select
                  onValueChange={(value) => {
                    if (value === "unassigned") {
                      field.onChange(undefined);
                    } else {
                      field.onChange(parseInt(value));
                    }
                  }}
                  defaultValue={field.value?.toString() || "unassigned"}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Assign to staff" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {isUsersLoading ? (
                      <SelectItem value="loading" disabled>Loading...</SelectItem>
                    ) : users?.filter(user => 
                        user.role === "staff" || 
                        user.role === "supervisor"
                      ).map((staff) => (
                      <SelectItem key={staff.id} value={staff.id.toString()}>
                        {staff.username} ({staff.role})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Priority</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="weight"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Weight (kg) (Optional)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.1" 
                    min="0" 
                    {...field} 
                    onChange={(e) => {
                      if (e.target.value === '') {
                        field.onChange(undefined);
                      } else {
                        field.onChange(parseFloat(e.target.value));
                      }
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="dueDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Due Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormDescription>
                When this task needs to be completed
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea 
                  {...field} 
                  placeholder="Any additional instructions or information"
                  rows={3}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Task"}
          </Button>
        </div>
      </form>
    </Form>
  );
}