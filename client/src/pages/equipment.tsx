import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Loader2, Plus, Calendar, AlertTriangle, Search } from "lucide-react";
import { Equipment } from "@shared/schema";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

export default function EquipmentPage() {
  const { toast } = useToast();
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isMaintenanceDialogOpen, setIsMaintenanceDialogOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [maintenanceDate, setMaintenanceDate] = useState<string>("");
  const [maintenanceNotes, setMaintenanceNotes] = useState<string>("");
  
  const { data: equipment, isLoading } = useQuery<Equipment[]>({
    queryKey: ['/api/equipment'],
  });
  
  // Filter equipment based on status and search term
  const filteredEquipment = equipment?.filter(item => {
    const matchesStatus = filterStatus === "all" || item.status === filterStatus;
    const matchesSearch = !searchTerm || 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      item.type.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'maintenance':
        return 'bg-red-100 text-red-800';
      case 'available':
        return 'bg-blue-100 text-blue-800';
      case 'in_queue':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Calculate if maintenance is overdue
  const isMaintenanceOverdue = (nextMaintenance: Date | null) => {
    if (!nextMaintenance) return false;
    return new Date(nextMaintenance) < new Date();
  };
  
  // Mutation to update equipment
  const updateEquipmentMutation = useMutation({
    mutationFn: async (data: Partial<Equipment>) => {
      if (!selectedEquipment) return null;
      const response = await apiRequest(
        "PATCH", 
        `/api/equipment/${selectedEquipment.id}`, 
        data
      );
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/equipment'] });
      toast({
        title: "Equipment updated",
        description: "The equipment has been updated successfully",
      });
      setIsEditDialogOpen(false);
      setIsMaintenanceDialogOpen(false);
      setSelectedEquipment(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update equipment: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      });
    }
  });
  
  // Handle edit button click
  const handleEditClick = (equipment: Equipment) => {
    setSelectedEquipment(equipment);
    setIsEditDialogOpen(true);
  };
  
  // Handle schedule maintenance button click
  const handleScheduleMaintenanceClick = (equipment: Equipment) => {
    setSelectedEquipment(equipment);
    setMaintenanceDate("");
    setMaintenanceNotes("");
    setIsMaintenanceDialogOpen(true);
  };
  
  // Handle start maintenance button click
  const handleStartMaintenanceClick = (equipment: Equipment) => {
    setSelectedEquipment(equipment);
    if (window.confirm(`Start maintenance for ${equipment.name}?`)) {
      updateEquipmentMutation.mutate({
        status: "maintenance",
        lastMaintenance: new Date().toISOString() as unknown as Date
      });
    }
  };
  
  // Handle schedule maintenance form submission
  const handleScheduleMaintenanceSubmit = () => {
    if (!maintenanceDate) {
      toast({
        title: "Validation error",
        description: "Please select a maintenance date",
        variant: "destructive",
      });
      return;
    }
    
    // Convert string date to ISO string
    const nextMaintenanceDate = new Date(maintenanceDate);
    
    updateEquipmentMutation.mutate({
      nextMaintenance: nextMaintenanceDate.toISOString() as unknown as Date,
      notes: maintenanceNotes || undefined
    });
  };
  
  // Handle edit form submission
  const handleEditSubmit = (formData: Partial<Equipment>) => {
    updateEquipmentMutation.mutate(formData);
  };
  
  // Implement edit dialog content
  const renderEditDialog = () => {
    return (
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>Edit Equipment</DialogTitle>
            <DialogDescription>
              Update details for {selectedEquipment?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">Name</Label>
              <Input 
                id="edit-name" 
                placeholder="Washing Machine A-1" 
                className="col-span-3"
                defaultValue={selectedEquipment?.name}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-type" className="text-right">Type</Label>
              <Select defaultValue={selectedEquipment?.type}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select equipment type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Washer">Washer</SelectItem>
                  <SelectItem value="Dryer">Dryer</SelectItem>
                  <SelectItem value="Ironer">Ironer</SelectItem>
                  <SelectItem value="Folder">Folder</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-status" className="text-right">Status</Label>
              <Select defaultValue={selectedEquipment?.status}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="maintenance">Under Maintenance</SelectItem>
                  <SelectItem value="in_queue">In Queue</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-notes" className="text-right">Notes</Label>
              <Textarea 
                id="edit-notes" 
                placeholder="Optional notes about the equipment" 
                className="col-span-3"
                defaultValue={selectedEquipment?.notes || ""}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={() => {
              // Simple approach just for demo, in a real app would use form validation
              const name = document.getElementById("edit-name") as HTMLInputElement;
              const notes = document.getElementById("edit-notes") as HTMLTextAreaElement;
              
              handleEditSubmit({
                name: name.value,
                notes: notes.value || undefined
              });
            }}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };
  
  // Implement maintenance scheduling dialog
  const renderMaintenanceDialog = () => {
    return (
      <Dialog open={isMaintenanceDialogOpen} onOpenChange={setIsMaintenanceDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Schedule Maintenance</DialogTitle>
            <DialogDescription>
              Schedule maintenance for {selectedEquipment?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="maintenance-date" className="text-right">Date</Label>
              <div className="col-span-3">
                <Input 
                  id="maintenance-date" 
                  type="date" 
                  value={maintenanceDate} 
                  onChange={(e) => setMaintenanceDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="maintenance-notes" className="text-right">Notes</Label>
              <Textarea 
                id="maintenance-notes" 
                placeholder="Maintenance details" 
                className="col-span-3"
                value={maintenanceNotes}
                onChange={(e) => setMaintenanceNotes(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsMaintenanceDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleScheduleMaintenanceSubmit}>Schedule</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="space-y-6">
      {renderEditDialog()}
      {renderMaintenanceDialog()}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Equipment Management</h2>
          <p className="text-muted-foreground">
            Manage and monitor all laundry equipment
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Equipment
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[625px]">
            <DialogHeader>
              <DialogTitle>Add New Equipment</DialogTitle>
              <DialogDescription>
                Fill in the details to add new laundry equipment to the system
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input id="name" placeholder="Washing Machine A-1" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="type" className="text-right">
                  Type
                </Label>
                <Select>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select equipment type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="washer">Washer</SelectItem>
                    <SelectItem value="dryer">Dryer</SelectItem>
                    <SelectItem value="ironer">Ironer</SelectItem>
                    <SelectItem value="folder">Folder</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="capacity" className="text-right">
                  Capacity (kg)
                </Label>
                <Input id="capacity" type="number" min="0" step="0.1" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">
                  Status
                </Label>
                <Select>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="maintenance">Under Maintenance</SelectItem>
                    <SelectItem value="in_queue">In Queue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="location" className="text-right">
                  Location
                </Label>
                <Input id="location" placeholder="Laundry Room 1, Floor 2" className="col-span-3" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline">Cancel</Button>
              <Button>Add Equipment</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex-1 rounded-lg border p-2 bg-white shadow-sm flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground ml-2" />
          <Input
            placeholder="Search equipment..."
            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="maintenance">Under Maintenance</SelectItem>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="in_queue">In Queue</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance Schedule</TabsTrigger>
        </TabsList>
        
        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Last Maintenance</TableHead>
                    <TableHead>Next Maintenance</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                      </TableCell>
                    </TableRow>
                  ) : filteredEquipment?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center">
                        No equipment found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredEquipment?.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>{item.type}</TableCell>
                        <TableCell>{item.type.includes('Washer') ? '30' : '25'} kg</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(item.status)}>
                            {item.status.charAt(0).toUpperCase() + item.status.slice(1).replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>Laundry Room {Math.floor(Math.random() * 3) + 1}</TableCell>
                        <TableCell>
                          {item.lastMaintenance 
                            ? format(new Date(item.lastMaintenance), "MMM d, yyyy") 
                            : "Not recorded"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {item.nextMaintenance 
                              ? format(new Date(item.nextMaintenance), "MMM d, yyyy") 
                              : "Not scheduled"}
                            {item.nextMaintenance && isMaintenanceOverdue(item.nextMaintenance) && (
                              <AlertTriangle className="h-4 w-4 text-red-500" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEditClick(item)}
                            >
                              Edit
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              disabled={item.status === 'maintenance'}
                              onClick={() => handleScheduleMaintenanceClick(item)}
                            >
                              Schedule Maintenance
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="maintenance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Maintenance Schedule</CardTitle>
              <CardDescription>
                Overview of upcoming and overdue maintenance for all equipment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Separator />
                
                <div>
                  <h3 className="font-semibold text-red-700 flex items-center mb-2">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Overdue Maintenance
                  </h3>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Equipment</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Scheduled Date</TableHead>
                          <TableHead>Days Overdue</TableHead>
                          <TableHead>Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {isLoading ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-4">
                              <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                            </TableCell>
                          </TableRow>
                        ) : equipment?.filter(item => 
                            item.nextMaintenance && isMaintenanceOverdue(item.nextMaintenance)
                          ).length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-4">
                              No overdue maintenance
                            </TableCell>
                          </TableRow>
                        ) : (
                          equipment?.filter(item => 
                            item.nextMaintenance && isMaintenanceOverdue(item.nextMaintenance)
                          ).map(item => {
                            const daysOverdue = item.nextMaintenance 
                              ? Math.floor((new Date().getTime() - new Date(item.nextMaintenance).getTime()) / (1000 * 3600 * 24))
                              : 0;
                            
                            return (
                              <TableRow key={`overdue-${item.id}`}>
                                <TableCell className="font-medium">{item.name}</TableCell>
                                <TableCell>{item.type}</TableCell>
                                <TableCell>{item.nextMaintenance ? format(new Date(item.nextMaintenance), "MMM d, yyyy") : "-"}</TableCell>
                                <TableCell className="text-red-600 font-medium">{daysOverdue} days</TableCell>
                                <TableCell>
                                  <Button 
                                    size="sm"
                                    onClick={() => handleStartMaintenanceClick(item)}
                                  >
                                    Start Maintenance
                                  </Button>
                                </TableCell>
                              </TableRow>
                            );
                          })
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="font-semibold text-amber-700 flex items-center mb-2">
                    <Calendar className="h-4 w-4 mr-2" />
                    Upcoming Maintenance
                  </h3>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Equipment</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Scheduled Date</TableHead>
                          <TableHead>Days Remaining</TableHead>
                          <TableHead>Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {isLoading ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-4">
                              <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                            </TableCell>
                          </TableRow>
                        ) : equipment?.filter(item => 
                            item.nextMaintenance && !isMaintenanceOverdue(item.nextMaintenance)
                          ).length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-4">
                              No upcoming maintenance scheduled
                            </TableCell>
                          </TableRow>
                        ) : (
                          equipment?.filter(item => 
                            item.nextMaintenance && !isMaintenanceOverdue(item.nextMaintenance)
                          ).map(item => {
                            const daysRemaining = item.nextMaintenance 
                              ? Math.floor((new Date(item.nextMaintenance).getTime() - new Date().getTime()) / (1000 * 3600 * 24))
                              : 0;
                            
                            return (
                              <TableRow key={`upcoming-${item.id}`}>
                                <TableCell className="font-medium">{item.name}</TableCell>
                                <TableCell>{item.type}</TableCell>
                                <TableCell>{item.nextMaintenance ? format(new Date(item.nextMaintenance), "MMM d, yyyy") : "-"}</TableCell>
                                <TableCell>{daysRemaining} days</TableCell>
                                <TableCell>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => handleScheduleMaintenanceClick(item)}
                                  >
                                    Reschedule
                                  </Button>
                                </TableCell>
                              </TableRow>
                            );
                          })
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}