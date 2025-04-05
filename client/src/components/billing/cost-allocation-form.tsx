import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { CostAllocation, Department } from "@shared/schema";
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

// Validation schema for cost allocation form
const costAllocationFormSchema = z.object({
  departmentId: z.coerce.number().min(1, "Department is required"),
  month: z.string().min(1, "Month is required").regex(/^\d{4}-\d{2}$/, "Use format YYYY-MM"),
  totalWeight: z.coerce.number().min(0.1, "Weight must be greater than 0"),
  totalCost: z.coerce.number().min(0.01, "Cost must be greater than 0"),
  costPerKg: z.coerce.number().min(0.01, "Cost per kg must be greater than 0"),
});

type CostAllocationFormValues = z.infer<typeof costAllocationFormSchema>;

interface CostAllocationFormProps {
  costAllocation: CostAllocation | null;
  departments?: Department[];
  onClose: () => void;
}

export function CostAllocationForm({ costAllocation, departments, onClose }: CostAllocationFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [autoCalculate, setAutoCalculate] = useState(!costAllocation);

  // Default values for the form
  const defaultValues: Partial<CostAllocationFormValues> = {
    departmentId: costAllocation?.departmentId || 0,
    month: costAllocation?.month || new Date().toISOString().slice(0, 7), // Default to current month
    totalWeight: costAllocation?.totalWeight || 0,
    totalCost: costAllocation?.totalCost || 0,
    costPerKg: costAllocation?.costPerKg || 0,
  };

  const form = useForm<CostAllocationFormValues>({
    resolver: zodResolver(costAllocationFormSchema),
    defaultValues,
  });

  // Watch for changes to weight and total cost to auto-calculate cost per kg
  const totalWeight = form.watch("totalWeight");
  const totalCost = form.watch("totalCost");

  // Update cost per kg when weight or cost changes
  useEffect(() => {
    if (autoCalculate && totalWeight > 0 && totalCost > 0) {
      const costPerKg = totalCost / totalWeight;
      form.setValue("costPerKg", parseFloat(costPerKg.toFixed(2)));
    }
  }, [totalWeight, totalCost, autoCalculate, form]);

  const costAllocationMutation = useMutation({
    mutationFn: async (data: CostAllocationFormValues) => {
      if (costAllocation) {
        // Update existing record
        const response = await apiRequest("PATCH", `/api/cost-allocations/${costAllocation.id}`, data);
        return response.json();
      } else {
        // Create new record
        const response = await apiRequest("POST", "/api/cost-allocations", data);
        return response.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cost-allocations"] });
      toast({
        title: `Cost allocation ${costAllocation ? "updated" : "created"} successfully`,
        description: `The cost allocation record has been ${costAllocation ? "updated" : "created"}.`,
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: `Failed to ${costAllocation ? "update" : "create"} cost allocation`,
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const onSubmit = (data: CostAllocationFormValues) => {
    setIsSubmitting(true);
    costAllocationMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="departmentId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Department</FormLabel>
              <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value.toString()}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a department" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {departments?.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id.toString()}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Department to allocate costs to
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="month"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Month (YYYY-MM)</FormLabel>
              <FormControl>
                <Input {...field} placeholder="e.g., 2023-05" />
              </FormControl>
              <FormDescription>
                Billing period in YYYY-MM format
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="totalWeight"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total Weight (kg)</FormLabel>
                <FormControl>
                  <Input type="number" min="0.1" step="0.1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="totalCost"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total Cost (₹)</FormLabel>
                <FormControl>
                  <Input type="number" min="0.01" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="costPerKg"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cost Per Kg (₹)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  min="0.01" 
                  step="0.01" 
                  {...field} 
                  disabled={autoCalculate} 
                />
              </FormControl>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="checkbox"
                  id="autoCalculate"
                  checked={autoCalculate}
                  onChange={() => setAutoCalculate(!autoCalculate)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <label htmlFor="autoCalculate" className="text-sm text-gray-500">
                  Auto-calculate from total weight and cost
                </label>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : costAllocation ? "Update Record" : "Create Record"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
