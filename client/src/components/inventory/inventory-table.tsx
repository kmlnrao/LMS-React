import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { InventoryItem } from "@shared/schema";
import { Edit, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { ProgressBar } from "@/components/ui/progress-bar";
import { formatIndianCurrency } from "@/lib/format-utils";

interface InventoryTableProps {
  items?: InventoryItem[];
  isLoading: boolean;
  error: unknown;
  onEdit: (item: InventoryItem) => void;
  onDelete: (itemId: number) => void;
}

export function InventoryTable({ items, isLoading, error, onEdit, onDelete }: InventoryTableProps) {
  // Calculate inventory level percentage and status
  const getInventoryStatus = (quantity: number, minimumLevel: number) => {
    const percentage = (quantity / (minimumLevel * 2)) * 100;
    
    if (percentage < 25) return "error";
    if (percentage < 50) return "warning";
    return "success";
  };

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="text-red-500">Error loading inventory items</div>
        <div className="text-sm text-gray-500 mt-2">
          {error instanceof Error ? error.message : "Unknown error"}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Unit</TableHead>
            <TableHead>Unit Cost</TableHead>
            <TableHead>Stock Level</TableHead>
            <TableHead>Last Restocked</TableHead>
            <TableHead className="w-[100px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading &&
            Array(5)
              .fill(0)
              .map((_, index) => (
                <TableRow key={index}>
                  <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="h-8 w-20 ml-auto" />
                  </TableCell>
                </TableRow>
              ))}

          {!isLoading && (!items || items.length === 0) && (
            <TableRow>
              <TableCell colSpan={9} className="h-24 text-center">
                No inventory items found.
              </TableCell>
            </TableRow>
          )}

          {!isLoading &&
            items?.map((item) => {
              const percentage = Math.min(100, (item.quantity / (item.minimumLevel * 2)) * 100);
              const status = getInventoryStatus(item.quantity, item.minimumLevel);
              
              return (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.id}</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{item.unit}</TableCell>
                  <TableCell>{formatIndianCurrency(item.unitCost)}</TableCell>
                  <TableCell>
                    <ProgressBar
                      value={percentage}
                      showLabel={true}
                      labelPosition="right"
                      status={status}
                      className="w-32"
                    />
                  </TableCell>
                  <TableCell>
                    {item.lastRestocked
                      ? format(new Date(item.lastRestocked), "MMM d, yyyy")
                      : "Never"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(item)}
                      >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
        </TableBody>
      </Table>
    </div>
  );
}
