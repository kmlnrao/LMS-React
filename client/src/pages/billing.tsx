import { useState } from "react";
import { Helmet } from "react-helmet";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { CostAllocation, Department } from "@shared/schema";
import { CostAllocationTable } from "@/components/billing/cost-allocation-table";
import { CostAllocationForm } from "@/components/billing/cost-allocation-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PlusCircle, RefreshCw, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function Billing() {
  const [isAddCostDialogOpen, setIsAddCostDialogOpen] = useState(false);
  const [editingCost, setEditingCost] = useState<CostAllocation | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: costAllocations, isLoading, error, refetch } = useQuery<CostAllocation[]>({
    queryKey: ["/api/cost-allocations"],
  });

  const { data: departments } = useQuery<Department[]>({
    queryKey: ["/api/departments"],
  });

  const deleteCostMutation = useMutation({
    mutationFn: async (costId: number) => {
      await apiRequest("DELETE", `/api/cost-allocations/${costId}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cost-allocations"] });
      toast({
        title: "Cost allocation deleted",
        description: "The cost allocation record has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete cost allocation: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      });
    },
  });

  const handleAddCost = () => {
    setEditingCost(null);
    setIsAddCostDialogOpen(true);
  };

  const handleEditCost = (cost: CostAllocation) => {
    setEditingCost(cost);
    setIsAddCostDialogOpen(true);
  };

  const handleDeleteCost = (costId: number) => {
    if (window.confirm("Are you sure you want to delete this cost allocation record?")) {
      deleteCostMutation.mutate(costId);
    }
  };

  const handleCostFormClose = () => {
    setIsAddCostDialogOpen(false);
    setEditingCost(null);
  };

  // Process data for chart
  const processChartData = () => {
    if (!costAllocations || !departments) return [];
    
    // Group by department
    const departmentMap = new Map<number, { name: string; totalCost: number }>();
    
    // Initialize with all departments
    departments.forEach(dept => {
      departmentMap.set(dept.id, { name: dept.name, totalCost: 0 });
    });
    
    // Sum up costs for each department
    costAllocations.forEach(cost => {
      const dept = departmentMap.get(cost.departmentId);
      if (dept) {
        dept.totalCost += cost.totalCost;
      }
    });
    
    // Convert to array for the chart
    return Array.from(departmentMap.values())
      .map(item => ({
        name: item.name,
        cost: parseFloat(item.totalCost.toFixed(2))
      }))
      .sort((a, b) => b.cost - a.cost);
  };

  const chartData = processChartData();

  return (
    <>
      <Helmet>
        <title>Billing & Cost Allocation | LMS-React</title>
      </Helmet>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Billing & Cost Allocation</h1>
          <p className="text-muted-foreground">
            Track and assign laundry costs to hospital departments
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => refetch()} className="gap-1" disabled={isLoading}>
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline" className="gap-1">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button onClick={handleAddCost} className="gap-1">
            <PlusCircle className="h-4 w-4" />
            Add Cost Record
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Department Cost Distribution</CardTitle>
            <CardDescription>
              Monthly cost allocation across hospital departments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 60,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name" 
                      angle={-45} 
                      textAnchor="end" 
                      height={60}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value}`, "Total Cost"]} />
                    <Legend />
                    <Bar dataKey="cost" name="Cost ($)" fill="#0070D1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">
                  No cost data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cost Summary</CardTitle>
            <CardDescription>
              Financial overview of laundry operations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Total Monthly Cost</h3>
                <p className="text-3xl font-bold mt-1">
                  ${costAllocations
                    ?.reduce((sum, item) => sum + item.totalCost, 0)
                    .toFixed(2) || "0.00"}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Average Cost Per Department</h3>
                <p className="text-3xl font-bold mt-1">
                  ${costAllocations && costAllocations.length > 0 && departments && departments.length > 0
                    ? (costAllocations.reduce((sum, item) => sum + item.totalCost, 0) / departments.length).toFixed(2)
                    : "0.00"}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Average Cost Per Kg</h3>
                <p className="text-3xl font-bold mt-1">
                  ${costAllocations && costAllocations.length > 0
                    ? (costAllocations.reduce((sum, item) => sum + item.totalCost, 0) / 
                       costAllocations.reduce((sum, item) => sum + item.totalWeight, 0)).toFixed(2)
                    : "0.00"}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Total Weight Processed</h3>
                <p className="text-3xl font-bold mt-1">
                  {costAllocations
                    ?.reduce((sum, item) => sum + item.totalWeight, 0)
                    .toFixed(2) || "0.00"} kg
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cost Allocation Records</CardTitle>
          <CardDescription>
            Monthly billing records by department
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CostAllocationTable
            costAllocations={costAllocations}
            departments={departments}
            isLoading={isLoading}
            error={error}
            onEdit={handleEditCost}
            onDelete={handleDeleteCost}
          />
        </CardContent>
      </Card>

      <Dialog open={isAddCostDialogOpen} onOpenChange={setIsAddCostDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>
              {editingCost ? "Edit Cost Allocation" : "Add New Cost Allocation"}
            </DialogTitle>
            <DialogDescription>
              {editingCost
                ? "Update cost allocation details"
                : "Assign laundry costs to a department"}
            </DialogDescription>
          </DialogHeader>
          <CostAllocationForm
            costAllocation={editingCost}
            departments={departments}
            onClose={handleCostFormClose}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
