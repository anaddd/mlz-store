import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2, Clock, CheckCircle, XCircle, AlertCircle, ShoppingCart, CreditCard, Building2 } from "lucide-react";
import { toast } from "sonner";
import AdminLayout from "@/components/AdminLayout";
import { ORDER_STATUSES } from "@shared/constants";

const statusIcons: Record<string, any> = { pending: Clock, processing: AlertCircle, completed: CheckCircle, cancelled: XCircle };
const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  processing: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  completed: "bg-green-500/20 text-green-400 border-green-500/30",
  cancelled: "bg-red-500/20 text-red-400 border-red-500/30",
};

const paymentStatusColors: Record<string, string> = {
  unpaid: "bg-red-500/20 text-red-400 border-red-500/30",
  pending_verification: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  paid: "bg-green-500/20 text-green-400 border-green-500/30",
};

const paymentStatusLabels: Record<string, string> = {
  unpaid: "Unpaid",
  pending_verification: "Pending Verification",
  paid: "Paid",
};

export default function AdminOrders() {
  const orders = trpc.orders.listAll.useQuery();
  const updateStatus = trpc.orders.updateStatus.useMutation();
  const updatePaymentStatus = trpc.orders.updatePaymentStatus.useMutation();
  const utils = trpc.useUtils();

  const handleStatusChange = async (id: number, status: string) => {
    try {
      await updateStatus.mutateAsync({ id, status: status as any });
      utils.orders.listAll.invalidate();
      toast.success("Order status updated");
    } catch { toast.error("Failed to update status"); }
  };

  const handlePaymentStatusChange = async (id: number, paymentStatus: string) => {
    try {
      await updatePaymentStatus.mutateAsync({ id, paymentStatus: paymentStatus as any });
      utils.orders.listAll.invalidate();
      toast.success("Payment status updated");
    } catch { toast.error("Failed to update payment status"); }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Orders</h1>
          <p className="text-sm text-muted-foreground">Manage customer orders and payment verification</p>
        </div>

        {orders.isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : orders.data && orders.data.length > 0 ? (
          <div className="space-y-4">
            {orders.data.map((order: any) => {
              const StatusIcon = statusIcons[order.status] || Clock;
              return (
                <Card key={order.id} className="bg-card/50 border-border/50">
                  <CardContent className="p-4">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-semibold">Order #{order.id}</h3>
                          <Badge variant="outline" className={paymentStatusColors[order.paymentStatus] || ""}>
                            {paymentStatusLabels[order.paymentStatus] || order.paymentStatus}
                          </Badge>
                          <Badge variant="outline" className="bg-muted/20 text-muted-foreground border-border/50">
                            {order.paymentMethod === "bank_transfer" ? (
                              <><Building2 className="w-3 h-3 mr-1" /> Bank Transfer</>
                            ) : (
                              <><CreditCard className="w-3 h-3 mr-1" /> PayPal</>
                            )}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {order.userName || order.userEmail || "Unknown"} - {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                        {order.discordUsername && <p className="text-xs text-muted-foreground">Discord: <span className="text-foreground">{order.discordUsername}</span></p>}
                      </div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Order Status</label>
                          <Select value={order.status} onValueChange={(v) => handleStatusChange(order.id, v)}>
                            <SelectTrigger className="w-36 h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(ORDER_STATUSES).map(([key, val]) => (
                                <SelectItem key={key} value={key}>{val.labelEn}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Payment</label>
                          <Select value={order.paymentStatus || "unpaid"} onValueChange={(v) => handlePaymentStatusChange(order.id, v)}>
                            <SelectTrigger className="w-44 h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="unpaid">Unpaid</SelectItem>
                              <SelectItem value="pending_verification">Pending Verification</SelectItem>
                              <SelectItem value="paid">Paid</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <span className="font-bold text-primary text-lg">${order.totalAmount}</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      {order.items?.map((item: any) => (
                        <div key={item.id} className="flex justify-between text-xs text-muted-foreground">
                          <span>{item.productName} x{item.quantity}</span>
                          <span>${(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    {order.notes && <p className="text-xs text-muted-foreground mt-2 italic">Note: {order.notes}</p>}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <ShoppingCart className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Orders Yet</h3>
            <p className="text-sm text-muted-foreground">Orders will appear here when customers make purchases.</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
