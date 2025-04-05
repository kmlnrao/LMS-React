import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { User } from "@shared/schema";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Extend schema to include confirmPassword
const userFormSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  role: z.enum(["admin", "staff", "department", "manager", "supervisor", "inventory", "technician", "billing", "reports"]),
  department: z.string().optional(),
  email: z.string().email("Invalid email format").optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type UserFormValues = z.infer<typeof userFormSchema>;

interface UserFormProps {
  user: User | null;
  onClose: () => void;
}

export function UserForm({ user, onClose }: UserFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Default values for the form
  const defaultValues: Partial<UserFormValues> = {
    username: user?.username || "",
    password: "",
    confirmPassword: "",
    name: user?.name || "",
    role: user?.role || "staff",
    department: user?.department || "",
    email: user?.email || "",
    phone: user?.phone || "",
  };

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues,
  });

  const createUserMutation = useMutation({
    mutationFn: async (data: UserFormValues) => {
      // Don't remove confirmPassword
      if (user) {
        // If updating, only send changed fields
        const updatedFields: Partial<UserFormValues> = {};
        let hasChanges = false;
        
        Object.keys(data).forEach((key) => {
          const typedKey = key as keyof typeof data;
          if (typedKey !== "confirmPassword" && data[typedKey] !== user[typedKey as keyof User]) {
            (updatedFields as any)[typedKey] = data[typedKey];
            hasChanges = true;
          }
        });
        
        // Don't send empty password
        if (updatedFields.password === "") {
          delete updatedFields.password;
        }
        
        if (!hasChanges) {
          return user;
        }
        
        const response = await apiRequest("PATCH", `/api/users/${user.id}`, updatedFields);
        return response.json();
      } else {
        // Send all data including confirmPassword for new users
        const response = await apiRequest("POST", "/api/users", data);
        return response.json();
      }
    },
    onSuccess: () => {
      // Invalidate all user queries with any query parameters
      queryClient.invalidateQueries({
        predicate: (query) => {
          const queryKey = query.queryKey;
          // Check if query key is an array and its first element is "/api/users"
          return Array.isArray(queryKey) && queryKey[0] === "/api/users";
        }
      });
      
      toast({
        title: `User ${user ? "updated" : "created"} successfully`,
        description: `The user has been ${user ? "updated" : "created"}.`,
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: `Failed to ${user ? "update" : "create"} user`,
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const onSubmit = (data: UserFormValues) => {
    setIsSubmitting(true);
    createUserMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input {...field} disabled={!!user} />
              </FormControl>
              <FormDescription>
                {user ? "Username cannot be changed" : "This will be used for login"}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{user ? "New Password" : "Password"}</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                {user && (
                  <FormDescription>
                    Leave blank to keep current password
                  </FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="admin">Administrator</SelectItem>
                  <SelectItem value="staff">Laundry Staff</SelectItem>
                  <SelectItem value="department">Department User</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="supervisor">Supervisor</SelectItem>
                  <SelectItem value="inventory">Inventory Manager</SelectItem>
                  <SelectItem value="technician">Technician</SelectItem>
                  <SelectItem value="billing">Billing Staff</SelectItem>
                  <SelectItem value="reports">Reports Analyst</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                This determines what actions the user can perform
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="department"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Department</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>
                Required for department users
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : user ? "Update User" : "Create User"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
