import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { InventoryItem } from "@shared/schema";
import { Edit, Package, Calendar, AlertCircle, Zap } from "lucide-react";
import { format } from "date-fns";
import { ProgressBar } from "@/components/ui/progress-bar";
import { formatIndianCurrency } from "@/lib/format-utils";

interface InventoryDetailProps {
  item: InventoryItem;
  onEdit: (item: InventoryItem) => void;
  onRestock: (item: InventoryItem) => void;
}

export function InventoryDetail({ item, onEdit, onRestock }: InventoryDetailProps) {
  // Calculate inventory level percentage and status
  const getInventoryStatus = (quantity: number, minimumLevel: number) => {
    const percentage = (quantity / (minimumLevel * 2)) * 100;
    
    if (percentage < 25) return "error";
    if (percentage < 50) return "warning";
    return "success";
  };

  const status = getInventoryStatus(item.quantity, item.minimumLevel);
  const percentage = Math.min(100, (item.quantity / (item.minimumLevel * 2)) * 100);
  
  // Calculate inventory value
  const inventoryValue = item.quantity * item.unitCost;

  return (
    <Card className="w-full shadow-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl flex items-center">
              <Package className="mr-2 h-5 w-5 text-primary" />
              {item.name}
            </CardTitle>
            <CardDescription>{item.category}</CardDescription>
          </div>
          <Badge variant={status === "error" ? "destructive" : status === "warning" ? "outline" : "outline"}>
            {status === "error" ? "Low Stock" : status === "warning" ? "Moderate Stock" : "In Stock"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-medium text-muted-foreground">Quantity</h4>
            <p className="text-2xl font-bold">{item.quantity} {item.unit}</p>
            <div className="mt-2">
              <ProgressBar
                value={percentage}
                showLabel={true}
                labelPosition="right"
                status={status}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Minimum level: {item.minimumLevel} {item.unit}
              </p>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-muted-foreground">Cost Information</h4>
            <p className="text-2xl font-bold">{formatIndianCurrency(item.unitCost)}</p>
            <p className="text-sm text-muted-foreground">per {item.unit}</p>
            <p className="mt-2 text-sm">
              Total Value: <span className="font-semibold">{formatIndianCurrency(inventoryValue)}</span>
            </p>
          </div>
        </div>

        <Separator />
        
        <div className="space-y-1">
          <h4 className="text-sm font-medium text-muted-foreground">Storage Information</h4>
          <p className="flex items-center text-sm">
            <span className="font-medium mr-2">Location:</span> {item.location || "Not specified"}
          </p>
          <p className="flex items-center text-sm">
            <span className="font-medium mr-2">Supplier:</span> {item.supplier || "Not specified"}
          </p>
          <p className="flex items-center text-sm mt-2">
            <Calendar className="mr-1 h-4 w-4 text-muted-foreground" />
            <span className="font-medium mr-2">Last Restocked:</span>
            {item.lastRestocked
              ? format(new Date(item.lastRestocked), "MMMM d, yyyy")
              : "Never"}
          </p>
        </div>

        {status === "error" && (
          <div className="rounded-md bg-red-50 p-3 mt-2">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Low Stock Alert</h3>
                <div className="mt-1 text-sm text-red-700">
                  <p>Current quantity is below the minimum level. Please restock soon.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {status === "warning" && (
          <div className="rounded-md bg-yellow-50 p-3 mt-2">
            <div className="flex">
              <Zap className="h-5 w-5 text-yellow-500" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Moderate Stock Warning</h3>
                <div className="mt-1 text-sm text-yellow-700">
                  <p>Stock is approaching minimum level. Consider restocking soon.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between border-t p-4">
        <Button variant="outline" onClick={() => onEdit(item)}>
          <Edit className="mr-2 h-4 w-4" />
          Edit Details
        </Button>
        <Button onClick={() => onRestock(item)}>
          <Package className="mr-2 h-4 w-4" />
          Restock
        </Button>
      </CardFooter>
    </Card>
  );
}