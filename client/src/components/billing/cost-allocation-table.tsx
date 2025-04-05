import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { CostAllocation, Department } from "@shared/schema";
import { Edit, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface CostAllocationTableProps {
  costAllocations?: CostAllocation[];
  departments?: Department[];
  isLoading: boolean;
  error: unknown;
  onEdit: (costAllocation: CostAllocation) => void;
  onDelete: (costAllocationId: number) => void;
}

export function CostAllocationTable({ 
  costAllocations, 
  departments,
  isLoading, 
  error, 
  onEdit, 
  onDelete 
}: CostAllocationTableProps) {
  // Function to get department name by ID
  const getDepartmentName = (departmentId: number) => {
    const department = departments?.find(d => d.id === departmentId);
    return department ? department.name : `Department ID: ${departmentId}`;
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="text-red-500">Error loading cost allocation data</div>
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
            <TableHead>Department</TableHead>
            <TableHead>Month</TableHead>
            <TableHead>Total Weight (kg)</TableHead>
            <TableHead>Cost Per Kg</TableHead>
            <TableHead>Total Cost</TableHead>
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
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="h-8 w-20 ml-auto" />
                  </TableCell>
                </TableRow>
              ))}

          {!isLoading && (!costAllocations || costAllocations.length === 0) && (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                No cost allocation records found.
              </TableCell>
            </TableRow>
          )}

          {!isLoading &&
            costAllocations?.map((cost) => (
              <TableRow key={cost.id}>
                <TableCell className="font-medium">{cost.id}</TableCell>
                <TableCell>{getDepartmentName(cost.departmentId)}</TableCell>
                <TableCell>{cost.month}</TableCell>
                <TableCell>{cost.totalWeight.toFixed(2)} kg</TableCell>
                <TableCell>{formatCurrency(cost.costPerKg)}</TableCell>
                <TableCell className="font-medium">{formatCurrency(cost.totalCost)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(cost)}
                    >
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(cost.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  );
}
