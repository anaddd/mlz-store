import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { Package, Loader2, Clock, CheckCircle, XCircle, AlertCircle, CreditCard, Building2, MessageCircle, ExternalLink, FileText } from "lucide-react";
import { ORDER_STATUSES, DISCORD_SERVER, PAYMENT_METHODS } from "@shared/constants";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import InvoiceModal from "@/components/InvoiceModal";

const statusIcons = {
  pending: Clock,
  processing: AlertCircle,
  completed: CheckCircle,
  cancelled: XCircle,
};

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

export default function Orders() {
  const { isAuthenticated } = useAuth();
  const orders = trpc.orders.myOrders.useQuery(undefined, { enabled: isAuthenticated });
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [loadingInvoiceId, setLoadingInvoiceId] = useState<number | null>(null);
  const generateInvoiceMutation = trpc.orders.generateInvoice.useQuery({ id: 0 }, { enabled: false });

  const handleViewInvoice = async (orderId: number) => {
    setLoadingInvoiceId(orderId);
    try {
      const result = await generateInvoiceMutation.refetch();
      if (result.data) {
        setSelectedInvoice(result.data);
        setInvoiceOpen(true);
      }
    } finally {
      setLoadingInvoiceId(null);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="flex-1 flex items-center justify-center flex-col gap-4">
          <Package className="w-16 h-16 text-muted-foreground/30" />
          <h2 className="text-xl font-semibold">Sign in to view your orders</h2>
          <Button className="bg-primary hover:bg-primary/80" onClick={() => window.location.href = "/login"}>Sign In</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="container py-8 flex-1">
        <h1 className="font-creepster text-3xl text-primary text-glow-red mb-8">My Orders</h1>

        {orders.isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : orders.data && orders.data.length > 0 ? (
          <div className="space-y-4">
            {orders.data.map((order) => {
              const StatusIcon = statusIcons[order.status as keyof typeof statusIcons] || Clock;
              const statusInfo = ORDER_STATUSES[order.status as keyof typeof ORDER_STATUSES];
              const paymentMethod = (order as any).paymentMethod;
              const paymentStatus = (order as any).paymentStatus;
              const needsPayment = paymentStatus === "unpaid" && order.status !== "cancelled";
              return (
                <Card key={order.id} className="bg-card/50 border-border/50">
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                      <div>
                        <h3 className="font-semibold">Order #{order.id}</h3>
                        <p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <Badge variant="outline" className={statusColors[order.status] || ""}>
                          <StatusIcon className="w-3 h-3 mr-1" /> {statusInfo?.labelEn || order.status}
                        </Badge>
                        {paymentStatus && (
                          <Badge variant="outline" className={paymentStatusColors[paymentStatus] || ""}>
                            {paymentStatusLabels[paymentStatus] || paymentStatus}
                          </Badge>
                        )}
                        <Badge variant="outline" className="bg-muted/20 text-muted-foreground border-border/50">
                          {paymentMethod === "bank_transfer" ? (
                            <><Building2 className="w-3 h-3 mr-1" /> Bank</>
                          ) : (
                            <><CreditCard className="w-3 h-3 mr-1" /> PayPal</>
                          )}
                        </Badge>
                        <span className="font-bold text-primary">${order.totalAmount}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{item.productName} x{item.quantity}</span>
                          <span>${(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    {/* Payment action area */}
                    {needsPayment && (
                      <div className="mt-4 pt-4 border-t border-border/30">
                        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                          <p className="text-sm text-yellow-400 flex-1">
                            Payment pending. Please complete payment and open a Discord ticket.
                          </p>
                          <div className="flex gap-2">
                            {paymentMethod === "paypal" ? (
                              <a href={PAYMENT_METHODS.paypal.url} target="_blank" rel="noopener noreferrer">
                                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                                  <ExternalLink className="w-3 h-3 mr-1" /> Pay via PayPal
                                </Button>
                              </a>
                            ) : null}
                            <a href={DISCORD_SERVER} target="_blank" rel="noopener noreferrer">
                              <Button size="sm" className="bg-[#5865F2] hover:bg-[#4752C4] text-white">
                                <MessageCircle className="w-3 h-3 mr-1" /> Open Ticket
                              </Button>
                            </a>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Invoice action */}
                    {order.status === "completed" && paymentStatus === "paid" && (
                      <div className="mt-4 pt-4 border-t border-border/30">
                        <Button size="sm" variant="outline" onClick={() => handleViewInvoice(order.id)} disabled={loadingInvoiceId === order.id}>
                          <FileText className="w-3 h-3 mr-1" /> {loadingInvoiceId === order.id ? "Loading..." : "Download Invoice"}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <Package className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Orders Yet</h3>
            <p className="text-sm text-muted-foreground mb-4">Start shopping to see your orders here.</p>
            <a href="/products"><Button className="bg-primary hover:bg-primary/80">Browse Products</Button></a>
          </div>
        )}
      </div>
      <Footer />

      {/* Invoice Modal */}
      <InvoiceModal open={invoiceOpen} onOpenChange={setInvoiceOpen} invoice={selectedInvoice} />
    </div>
  );
}
