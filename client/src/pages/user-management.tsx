import { useState } from "react";
import { Helmet } from "react-helmet";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { User } from "@shared/schema";
import { UserTable } from "@/components/user-management/user-table";
import { UserForm } from "@/components/user-management/user-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function UserManagement() {
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: users, isLoading, error, refetch } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      await apiRequest("DELETE", `/api/users/${userId}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "User deleted",
        description: "The user has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete user: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      });
    },
  });

  const handleAddUser = () => {
    setEditingUser(null);
    setIsAddUserDialogOpen(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setIsAddUserDialogOpen(true);
  };

  const handleDeleteUser = (userId: number) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      deleteUserMutation.mutate(userId);
    }
  };

  const handleUserFormClose = () => {
    setIsAddUserDialogOpen(false);
    setEditingUser(null);
  };

  return (
    <>
      <Helmet>
        <title>User Management | LMS-React</title>
      </Helmet>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">Manage laundry staff and user access</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => refetch()} className="gap-1" disabled={isLoading}>
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={handleAddUser} className="gap-1">
            <PlusCircle className="h-4 w-4" />
            Add User
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Users</TabsTrigger>
          <TabsTrigger value="admin">Admins</TabsTrigger>
          <TabsTrigger value="staff">Staff</TabsTrigger>
          <TabsTrigger value="department">Department Users</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>User Directory</CardTitle>
              <CardDescription>
                View and manage all users in the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UserTable
                users={users}
                isLoading={isLoading}
                error={error}
                onEdit={handleEditUser}
                onDelete={handleDeleteUser}
              />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="admin">
          <Card>
            <CardHeader>
              <CardTitle>Administrators</CardTitle>
              <CardDescription>
                System administrators with full access
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UserTable
                users={users?.filter((user) => user.role === "admin")}
                isLoading={isLoading}
                error={error}
                onEdit={handleEditUser}
                onDelete={handleDeleteUser}
              />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="staff">
          <Card>
            <CardHeader>
              <CardTitle>Laundry Staff</CardTitle>
              <CardDescription>
                Staff members responsible for laundry operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UserTable
                users={users?.filter((user) => user.role === "staff")}
                isLoading={isLoading}
                error={error}
                onEdit={handleEditUser}
                onDelete={handleDeleteUser}
              />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="department">
          <Card>
            <CardHeader>
              <CardTitle>Department Users</CardTitle>
              <CardDescription>
                Hospital department representatives
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UserTable
                users={users?.filter((user) => user.role === "department")}
                isLoading={isLoading}
                error={error}
                onEdit={handleEditUser}
                onDelete={handleDeleteUser}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>{editingUser ? "Edit User" : "Add New User"}</DialogTitle>
            <DialogDescription>
              {editingUser
                ? "Update user information and role"
                : "Fill in the details to create a new user"}
            </DialogDescription>
          </DialogHeader>
          <UserForm
            user={editingUser}
            onClose={handleUserFormClose}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
