import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Users as UsersIcon, Shield, User } from "lucide-react";
import { toast } from "sonner";
import AdminLayout from "@/components/AdminLayout";

export default function AdminUsers() {
  const users = trpc.admin.users.useQuery();
  const updateRole = trpc.admin.updateUserRole.useMutation();
  const utils = trpc.useUtils();

  const handleRoleChange = async (id: number, role: string) => {
    try {
      await updateRole.mutateAsync({ id, role: role as any });
      utils.admin.users.invalidate();
      toast.success("User role updated");
    } catch {
      toast.error("Failed to update role");
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Users</h1>
          <p className="text-sm text-muted-foreground">Manage user accounts and roles</p>
        </div>

        {users.isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : users.data && users.data.length > 0 ? (
          <div className="space-y-3">
            {users.data.map((user) => (
              <Card key={user.id} className="bg-card/50 border-border/50">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    {user.role === "admin" ? (
                      <Shield className="w-5 h-5 text-primary" />
                    ) : (
                      <User className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm">{user.name || "Unnamed User"}</h3>
                      <Badge variant="outline" className={
                        user.role === "admin"
                          ? "bg-primary/20 text-primary border-primary/30 text-xs"
                          : "text-xs"
                      }>
                        {user.role}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {user.email || "No email"} | Joined: {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Select value={user.role} onValueChange={(v) => handleRoleChange(user.id, v)}>
                    <SelectTrigger className="w-28 h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <UsersIcon className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Users Yet</h3>
            <p className="text-sm text-muted-foreground">Users will appear here when they sign up.</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
