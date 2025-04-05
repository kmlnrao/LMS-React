import { useState } from "react";
import { Helmet } from "react-helmet";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { LaundryProcess } from "@shared/schema";
import { ProcessTable } from "@/components/process-config/process-table";
import { ProcessForm } from "@/components/process-config/process-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PlusCircle, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ProcessConfig() {
  const [isAddProcessDialogOpen, setIsAddProcessDialogOpen] = useState(false);
  const [editingProcess, setEditingProcess] = useState<LaundryProcess | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: processes, isLoading, error, refetch } = useQuery<LaundryProcess[]>({
    queryKey: ["/api/laundry-processes"],
  });

  const deleteProcessMutation = useMutation({
    mutationFn: async (processId: number) => {
      await apiRequest("DELETE", `/api/laundry-processes/${processId}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/laundry-processes"] });
      toast({
        title: "Process deleted",
        description: "The laundry process has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete process: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      });
    },
  });

  const handleAddProcess = () => {
    setEditingProcess(null);
    setIsAddProcessDialogOpen(true);
  };

  const handleEditProcess = (process: LaundryProcess) => {
    setEditingProcess(process);
    setIsAddProcessDialogOpen(true);
  };

  const handleDeleteProcess = (processId: number) => {
    if (window.confirm("Are you sure you want to delete this process?")) {
      deleteProcessMutation.mutate(processId);
    }
  };

  const handleProcessFormClose = () => {
    setIsAddProcessDialogOpen(false);
    setEditingProcess(null);
  };

  return (
    <>
      <Helmet>
        <title>Process Configuration | LMS-React</title>
      </Helmet>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Process Configuration</h1>
          <p className="text-muted-foreground">
            Define and configure laundry processing procedures
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => refetch()} className="gap-1" disabled={isLoading}>
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={handleAddProcess} className="gap-1">
            <PlusCircle className="h-4 w-4" />
            Add Process
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Laundry Processes</CardTitle>
          <CardDescription>
            Configure washing, drying, and sterilization procedures
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProcessTable
            processes={processes}
            isLoading={isLoading}
            error={error}
            onEdit={handleEditProcess}
            onDelete={handleDeleteProcess}
          />
        </CardContent>
      </Card>

      <Dialog open={isAddProcessDialogOpen} onOpenChange={setIsAddProcessDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>
              {editingProcess ? "Edit Laundry Process" : "Add New Laundry Process"}
            </DialogTitle>
            <DialogDescription>
              {editingProcess
                ? "Update laundry process settings"
                : "Define a new laundry process with detailed specifications"}
            </DialogDescription>
          </DialogHeader>
          <ProcessForm
            process={editingProcess}
            onClose={handleProcessFormClose}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
