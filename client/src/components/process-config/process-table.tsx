import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { LaundryProcess } from "@shared/schema";
import { Edit, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ProcessTableProps {
  processes?: LaundryProcess[];
  isLoading: boolean;
  error: unknown;
  onEdit: (process: LaundryProcess) => void;
  onDelete: (processId: number) => void;
}

export function ProcessTable({ processes, isLoading, error, onEdit, onDelete }: ProcessTableProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const toggleProcessStatus = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      await apiRequest("PATCH", `/api/laundry-processes/${id}`, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/laundry-processes"] });
      toast({
        title: "Process updated",
        description: "The process status has been updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error updating process",
        description: `Failed to update process: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      });
    },
  });

  const handleToggleStatus = (process: LaundryProcess) => {
    toggleProcessStatus.mutate({
      id: process.id,
      isActive: !process.isActive,
    });
  };

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="text-red-500">Error loading processes</div>
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
            <TableHead>Process Name</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Temperature</TableHead>
            <TableHead>Detergent</TableHead>
            <TableHead>Softener</TableHead>
            <TableHead>Disinfectant</TableHead>
            <TableHead>Status</TableHead>
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
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="h-8 w-20 ml-auto" />
                  </TableCell>
                </TableRow>
              ))}

          {!isLoading && (!processes || processes.length === 0) && (
            <TableRow>
              <TableCell colSpan={9} className="h-24 text-center">
                No laundry processes found.
              </TableCell>
            </TableRow>
          )}

          {!isLoading &&
            processes?.map((process) => (
              <TableRow key={process.id}>
                <TableCell className="font-medium">{process.id}</TableCell>
                <TableCell>{process.name}</TableCell>
                <TableCell>{process.duration} mins</TableCell>
                <TableCell>{process.temperature ? `${process.temperature}°C` : "N/A"}</TableCell>
                <TableCell>{process.detergentAmount || "N/A"}</TableCell>
                <TableCell>{process.softenerAmount || "N/A"}</TableCell>
                <TableCell>{process.disinfectantAmount || "N/A"}</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={process.isActive}
                      onCheckedChange={() => handleToggleStatus(process)}
                    />
                    <Badge variant={process.isActive ? "default" : "secondary"}>
                      {process.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(process)}
                    >
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(process.id)}
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
