import { useState } from "react";
import { Helmet } from "react-helmet";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { InventoryItem } from "@shared/schema";
import { InventoryTable } from "@/components/inventory/inventory-table";
import { InventoryForm } from "@/components/inventory/inventory-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, PlusCircle, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Inventory() {
  const [isAddItemDialogOpen, setIsAddItemDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: inventoryItems, isLoading, error, refetch } = useQuery<InventoryItem[]>({
    queryKey: ["/api/inventory"],
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (itemId: number) => {
      await apiRequest("DELETE", `/api/inventory/${itemId}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      toast({
        title: "Item deleted",
        description: "The inventory item has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete item: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      });
    },
  });

  const handleAddItem = () => {
    setEditingItem(null);
    setIsAddItemDialogOpen(true);
  };

  const handleEditItem = (item: InventoryItem) => {
    setEditingItem(item);
    setIsAddItemDialogOpen(true);
  };

  const handleDeleteItem = (itemId: number) => {
    if (window.confirm("Are you sure you want to delete this inventory item?")) {
      deleteItemMutation.mutate(itemId);
    }
  };

  const handleInventoryFormClose = () => {
    setIsAddItemDialogOpen(false);
    setEditingItem(null);
  };

  // Calculate low stock items
  const lowStockItems = inventoryItems?.filter(
    (item) => item.quantity < item.minimumLevel
  ) || [];

  return (
    <>
      <Helmet>
        <title>Inventory Management | LMS-React</title>
      </Helmet>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inventory Management</h1>
          <p className="text-muted-foreground">
            Track and manage laundry supplies and consumables
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => refetch()} className="gap-1" disabled={isLoading}>
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={handleAddItem} className="gap-1">
            <PlusCircle className="h-4 w-4" />
            Add Item
          </Button>
        </div>
      </div>

      {lowStockItems.length > 0 && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Low Stock Alert</AlertTitle>
          <AlertDescription>
            {lowStockItems.length} item{lowStockItems.length > 1 ? "s" : ""} below minimum stock level.
            Please reorder soon.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Items</TabsTrigger>
          <TabsTrigger value="detergent">Detergents</TabsTrigger>
          <TabsTrigger value="disinfectant">Disinfectants</TabsTrigger>
          <TabsTrigger value="softener">Softeners</TabsTrigger>
          <TabsTrigger value="bleach">Bleach</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Items</CardTitle>
              <CardDescription>
                All laundry supplies and consumables
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InventoryTable
                items={inventoryItems}
                isLoading={isLoading}
                error={error}
                onEdit={handleEditItem}
                onDelete={handleDeleteItem}
              />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="detergent">
          <Card>
            <CardHeader>
              <CardTitle>Detergents</CardTitle>
              <CardDescription>
                Laundry detergents and cleaning agents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InventoryTable
                items={inventoryItems?.filter((item) => item.category.toLowerCase() === "detergent")}
                isLoading={isLoading}
                error={error}
                onEdit={handleEditItem}
                onDelete={handleDeleteItem}
              />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="disinfectant">
          <Card>
            <CardHeader>
              <CardTitle>Disinfectants</CardTitle>
              <CardDescription>
                Hospital-grade disinfection solutions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InventoryTable
                items={inventoryItems?.filter((item) => item.category.toLowerCase() === "disinfectant")}
                isLoading={isLoading}
                error={error}
                onEdit={handleEditItem}
                onDelete={handleDeleteItem}
              />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="softener">
          <Card>
            <CardHeader>
              <CardTitle>Fabric Softeners</CardTitle>
              <CardDescription>
                Fabric conditioning solutions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InventoryTable
                items={inventoryItems?.filter((item) => item.category.toLowerCase() === "softener")}
                isLoading={isLoading}
                error={error}
                onEdit={handleEditItem}
                onDelete={handleDeleteItem}
              />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="bleach">
          <Card>
            <CardHeader>
              <CardTitle>Bleach Products</CardTitle>
              <CardDescription>
                Bleaching and whitening agents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InventoryTable
                items={inventoryItems?.filter((item) => item.category.toLowerCase() === "bleach")}
                isLoading={isLoading}
                error={error}
                onEdit={handleEditItem}
                onDelete={handleDeleteItem}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isAddItemDialogOpen} onOpenChange={setIsAddItemDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Edit Inventory Item" : "Add New Inventory Item"}
            </DialogTitle>
            <DialogDescription>
              {editingItem
                ? "Update inventory item details"
                : "Add a new item to the inventory system"}
            </DialogDescription>
          </DialogHeader>
          <InventoryForm
            item={editingItem}
            onClose={handleInventoryFormClose}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
