import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Package, ShoppingCart, Users, Loader2, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { ORDER_STATUSES } from "@shared/constants";

const statusIcons: Record<string, any> = { pending: Clock, processing: AlertCircle, completed: CheckCircle, cancelled: XCircle };
const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  processing: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  completed: "bg-green-500/20 text-green-400 border-green-500/30",
  cancelled: "bg-red-500/20 text-red-400 border-red-500/30",
};

export default function AdminDashboard() {
  const stats = trpc.admin.stats.useQuery();

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Overview of your store performance</p>
        </div>

        {stats.isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : stats.data ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Total Revenue", value: `$${Number(stats.data.totalRevenue).toFixed(2)}`, icon: DollarSign, color: "text-green-400" },
                { label: "Total Orders", value: stats.data.totalOrders, icon: ShoppingCart, color: "text-blue-400" },
                { label: "Products", value: stats.data.totalProducts, icon: Package, color: "text-primary" },
                { label: "Users", value: stats.data.totalUsers, icon: Users, color: "text-purple-400" },
              ].map((stat, i) => (
                <Card key={i} className="bg-card/50 border-border/50">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground">{stat.label}</p>
                        <p className="text-2xl font-bold mt-1">{stat.value}</p>
                      </div>
                      <stat.icon className={`w-8 h-8 ${stat.color} opacity-50`} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-4">Recent Orders</h2>
              {stats.data.recentOrders.length > 0 ? (
                <div className="space-y-3">
                  {stats.data.recentOrders.map((order: any) => {
                    const StatusIcon = statusIcons[order.status] || Clock;
                    const statusInfo = ORDER_STATUSES[order.status as keyof typeof ORDER_STATUSES];
                    return (
                      <Card key={order.id} className="bg-card/50 border-border/50">
                        <CardContent className="p-4 flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm">Order #{order.id}</p>
                            <p className="text-xs text-muted-foreground">{order.userName || "Unknown"} - {new Date(order.createdAt).toLocaleDateString()}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className={statusColors[order.status] || ""}>
                              <StatusIcon className="w-3 h-3 mr-1" /> {statusInfo?.labelEn || order.status}
                            </Badge>
                            <span className="font-bold text-primary">${order.totalAmount}</span>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No orders yet.</p>
              )}
            </div>
          </>
        ) : null}
      </div>
    </AdminLayout>
  );
}
