import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { InventoryItem } from "@shared/schema";
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
import { Textarea } from "@/components/ui/textarea";

// Validation schema for inventory form
const inventoryFormSchema = z.object({
  name: z.string().min(2, "Item name must be at least 2 characters"),
  category: z.string().min(1, "Category is required"),
  unit: z.string().min(1, "Unit of measurement is required"),
  quantity: z.coerce.number().min(0, "Quantity cannot be negative"),
  minimumLevel: z.coerce.number().min(0, "Minimum level cannot be negative"),
  notes: z.string().optional(),
});

type InventoryFormValues = z.infer<typeof inventoryFormSchema>;

interface InventoryFormProps {
  item: InventoryItem | null;
  onClose: () => void;
}

export function InventoryForm({ item, onClose }: InventoryFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Default values for the form
  const defaultValues: Partial<InventoryFormValues> = {
    name: item?.name || "",
    category: item?.category || "",
    unit: item?.unit || "",
    quantity: item?.quantity || 0,
    minimumLevel: item?.minimumLevel || 0,
    notes: item?.notes || "",
  };

  const form = useForm<InventoryFormValues>({
    resolver: zodResolver(inventoryFormSchema),
    defaultValues,
  });

  const inventoryItemMutation = useMutation({
    mutationFn: async (data: InventoryFormValues) => {
      if (item) {
        // Update - add lastRestocked if quantity changed
        const updateData = { ...data };
        if (item.quantity !== data.quantity) {
          updateData.lastRestocked = new Date();
        }
        
        const response = await apiRequest("PATCH", `/api/inventory/${item.id}`, updateData);
        return response.json();
      } else {
        // Create new
        const response = await apiRequest("POST", "/api/inventory", data);
        return response.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      toast({
        title: `Inventory item ${item ? "updated" : "created"} successfully`,
        description: `The inventory item has been ${item ? "updated" : "created"}.`,
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: `Failed to ${item ? "update" : "create"} inventory item`,
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const onSubmit = (data: InventoryFormValues) => {
    setIsSubmitting(true);
    inventoryItemMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Item Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>
                Name of the inventory item
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="detergent">Detergent</SelectItem>
                    <SelectItem value="softener">Fabric Softener</SelectItem>
                    <SelectItem value="disinfectant">Disinfectant</SelectItem>
                    <SelectItem value="bleach">Bleach</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="unit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unit of Measurement</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a unit" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="liter">Liter</SelectItem>
                    <SelectItem value="kg">Kilogram</SelectItem>
                    <SelectItem value="box">Box</SelectItem>
                    <SelectItem value="bottle">Bottle</SelectItem>
                    <SelectItem value="packet">Packet</SelectItem>
                    <SelectItem value="piece">Piece</SelectItem>
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
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Current Quantity</FormLabel>
                <FormControl>
                  <Input type="number" min="0" step="0.1" {...field} />
                </FormControl>
                <FormDescription>
                  Available stock level
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="minimumLevel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Minimum Level</FormLabel>
                <FormControl>
                  <Input type="number" min="0" step="0.1" {...field} />
                </FormControl>
                <FormDescription>
                  Threshold for low stock alert
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Additional information about this item" />
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
            {isSubmitting ? "Saving..." : item ? "Update Item" : "Create Item"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
