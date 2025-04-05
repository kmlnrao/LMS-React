import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  
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
  
  return (
    <div className="space-y-6">
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
                            <Button variant="outline" size="sm">Edit</Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              disabled={item.status === 'maintenance'}
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
                                  <Button size="sm">Start Maintenance</Button>
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
                                  <Button size="sm" variant="outline">Reschedule</Button>
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