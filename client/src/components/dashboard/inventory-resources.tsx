import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { useQuery } from "@tanstack/react-query";
import { InventoryItem, Equipment } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/status-badge";
import { 
  Syringe, 
  Shirt, 
  FlaskRound, 
  Droplet,
  Plus,
  Settings
} from "lucide-react";

export function InventoryResources() {
  const { data: inventoryItems, isLoading: inventoryLoading, error: inventoryError } = useQuery<InventoryItem[]>({
    queryKey: ["/api/inventory"],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const { data: equipment, isLoading: equipmentLoading, error: equipmentError } = useQuery<Equipment[]>({
    queryKey: ["/api/equipment"],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Helper function to determine icon based on inventory item category
  const getInventoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'detergent':
        return <Syringe className="h-5 w-5" />;
      case 'softener':
        return <Droplet className="h-5 w-5" />;
      case 'disinfectant':
        return <FlaskRound className="h-5 w-5" />;
      case 'bleach':
        return <Shirt className="h-5 w-5" />;
      default:
        return <FlaskRound className="h-5 w-5" />;
    }
  };

  // Determine status color based on quantity percentage
  const getInventoryStatus = (quantity: number, minimumLevel: number) => {
    // Calculate percentage of stock level
    const percentage = (quantity / (minimumLevel * 2)) * 100;
    
    if (percentage < 25) return "error";
    if (percentage < 50) return "warning";
    return "success";
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Inventory Status */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Inventory Status</CardTitle>
          <Button variant="link" size="sm" onClick={() => window.location.href = '/inventory'}>
            View All
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {inventoryLoading && (
            Array(4).fill(0).map((_, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <Skeleton className="w-10 h-10 rounded-lg" />
                  <div className="ml-3">
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <div>
                  <Skeleton className="h-3 w-36" />
                </div>
              </div>
            ))
          )}

          {inventoryError && (
            <div className="text-red-500">Error loading inventory data</div>
          )}

          {!inventoryLoading && !inventoryError && inventoryItems?.slice(0, 4).map((item) => {
            const percentage = Math.min(100, (item.quantity / (item.minimumLevel * 2)) * 100);
            const status = getInventoryStatus(item.quantity, item.minimumLevel);
            
            return (
              <div key={item.id} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-lg bg-${status === 'error' ? 'red' : status === 'warning' ? 'yellow' : 'blue'}-100 flex items-center justify-center text-${status === 'error' ? 'red' : status === 'warning' ? 'yellow' : 'blue'}-600`}>
                    {getInventoryIcon(item.category)}
                  </div>
                  <div className="ml-3">
                    <p className="font-medium text-gray-800">{item.name}</p>
                    <p className="text-sm text-gray-500">{item.category}</p>
                  </div>
                </div>
                <div className="w-36">
                  <ProgressBar 
                    value={percentage} 
                    showLabel={true} 
                    labelPosition="right"
                    status={status}
                  />
                </div>
              </div>
            );
          })}
        </CardContent>
        <CardFooter className="border-t pt-4">
          <Button className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            Request Supplies
          </Button>
        </CardFooter>
      </Card>
      
      {/* Equipment Status */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Equipment Status</CardTitle>
          <Button variant="link" size="sm" onClick={() => window.location.href = '/equipment'}>
            View All
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {equipmentLoading && (
              Array(6).fill(0).map((_, index) => (
                <div key={index} className="p-3 border border-gray-200 rounded-lg">
                  <div className="flex justify-between mb-2">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                  <div className="mt-2">
                    <div className="flex justify-between text-sm mb-2">
                      <Skeleton className="h-3 w-12" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-2 w-full rounded-full" />
                  </div>
                </div>
              ))
            )}

            {equipmentError && (
              <div className="col-span-2 text-red-500">Error loading equipment data</div>
            )}

            {!equipmentLoading && !equipmentError && equipment?.slice(0, 6).map((item) => {
              // Calculate progress based on status and time remaining
              let progress = 100;
              let statusText = "Ready";
              
              if (item.status === "active" && item.timeRemaining !== null) {
                // Assume full cycle is 60 minutes
                progress = Math.max(0, Math.min(100, (item.timeRemaining / 60) * 100));
                statusText = `${item.timeRemaining} min remaining`;
              } else if (item.status === "maintenance") {
                progress = 0;
                statusText = "Service Required";
              } else if (item.status === "in_queue") {
                progress = 50;
                statusText = "In Queue";
              }
              
              return (
                <div key={item.id} className="p-3 border border-gray-200 rounded-lg">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">{item.name}</span>
                    <StatusBadge status={item.status} />
                  </div>
                  <div className="mt-2">
                    <div className="flex justify-between text-sm">
                      <span>Status:</span>
                      <span className={`font-medium ${item.status === "maintenance" ? "text-red-600" : ""}`}>
                        {statusText}
                      </span>
                    </div>
                    <div className="mt-2">
                      <ProgressBar 
                        value={progress} 
                        status={
                          item.status === "maintenance" ? "error" :
                          item.status === "in_queue" ? "warning" :
                          item.status === "active" ? "info" : "success"
                        }
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
        <CardFooter className="border-t pt-4">
          <Button variant="outline" className="w-full">
            <Settings className="mr-2 h-4 w-4" />
            Manage Equipment
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
