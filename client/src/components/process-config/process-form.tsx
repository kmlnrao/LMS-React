import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { LaundryProcess } from "@shared/schema";
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
import { Switch } from "@/components/ui/switch";

// Validation schema for process form
const processFormSchema = z.object({
  name: z.string().min(2, "Process name must be at least 2 characters"),
  description: z.string().optional(),
  duration: z.coerce.number().min(1, "Duration must be at least 1 minute"),
  temperature: z.coerce.number().min(0, "Temperature cannot be negative").nullable().optional(),
  detergentAmount: z.coerce.number().min(0, "Amount cannot be negative").nullable().optional(),
  softenerAmount: z.coerce.number().min(0, "Amount cannot be negative").nullable().optional(),
  disinfectantAmount: z.coerce.number().min(0, "Amount cannot be negative").nullable().optional(),
  isActive: z.boolean().default(true),
});

type ProcessFormValues = z.infer<typeof processFormSchema>;

interface ProcessFormProps {
  process: LaundryProcess | null;
  onClose: () => void;
}

export function ProcessForm({ process, onClose }: ProcessFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Default values for the form
  const defaultValues: Partial<ProcessFormValues> = {
    name: process?.name || "",
    description: process?.description || "",
    duration: process?.duration || 30,
    temperature: process?.temperature || null,
    detergentAmount: process?.detergentAmount || null,
    softenerAmount: process?.softenerAmount || null,
    disinfectantAmount: process?.disinfectantAmount || null,
    isActive: process?.isActive ?? true,
  };

  const form = useForm<ProcessFormValues>({
    resolver: zodResolver(processFormSchema),
    defaultValues,
  });

  const processDataMutation = useMutation({
    mutationFn: async (data: ProcessFormValues) => {
      if (process) {
        // If updating, only send changed fields
        const updatedFields: Partial<ProcessFormValues> = {};
        let hasChanges = false;
        
        Object.keys(data).forEach((key) => {
          const typedKey = key as keyof ProcessFormValues;
          if (data[typedKey] !== process[typedKey as keyof LaundryProcess]) {
            (updatedFields as any)[typedKey] = data[typedKey];
            hasChanges = true;
          }
        });
        
        if (!hasChanges) {
          return process;
        }
        
        const response = await apiRequest("PATCH", `/api/laundry-processes/${process.id}`, updatedFields);
        return response.json();
      } else {
        const response = await apiRequest("POST", "/api/laundry-processes", data);
        return response.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/laundry-processes"] });
      toast({
        title: `Process ${process ? "updated" : "created"} successfully`,
        description: `The laundry process has been ${process ? "updated" : "created"}.`,
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: `Failed to ${process ? "update" : "create"} process`,
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const onSubmit = (data: ProcessFormValues) => {
    setIsSubmitting(true);
    processDataMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Process Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>
                Name of the laundry process (e.g., Regular Wash, Intensive, Sterilization)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Describe the process details" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duration (minutes)</FormLabel>
                <FormControl>
                  <Input type="number" min="1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="temperature"
            render={({ field: { value, onChange, ...field }}) => (
              <FormItem>
                <FormLabel>Temperature (°C)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="Optional" 
                    {...field} 
                    value={value === null ? "" : value}
                    onChange={event => onChange(event.target.value === "" ? null : parseFloat(event.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="detergentAmount"
            render={({ field: { value, onChange, ...field }}) => (
              <FormItem>
                <FormLabel>Detergent Amount</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.1" 
                    min="0" 
                    placeholder="Optional" 
                    {...field} 
                    value={value === null ? "" : value}
                    onChange={event => onChange(event.target.value === "" ? null : parseFloat(event.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="softenerAmount"
            render={({ field: { value, onChange, ...field }}) => (
              <FormItem>
                <FormLabel>Softener Amount</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.1" 
                    min="0" 
                    placeholder="Optional" 
                    {...field} 
                    value={value === null ? "" : value}
                    onChange={event => onChange(event.target.value === "" ? null : parseFloat(event.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="disinfectantAmount"
            render={({ field: { value, onChange, ...field }}) => (
              <FormItem>
                <FormLabel>Disinfectant Amount</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.1" 
                    min="0" 
                    placeholder="Optional" 
                    {...field} 
                    value={value === null ? "" : value}
                    onChange={event => onChange(event.target.value === "" ? null : parseFloat(event.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between space-y-0 rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Active Status</FormLabel>
                <FormDescription>
                  Whether this process is currently available for use
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
        
        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : process ? "Update Process" : "Create Process"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
