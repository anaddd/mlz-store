import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, CheckCircle, ShoppingBag, Copy, ExternalLink, CreditCard, Building2, MessageCircle } from "lucide-react";
import { useState } from "react";
import { useLocation, Link } from "wouter";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { PAYMENT_METHODS, DISCORD_SERVER } from "@shared/constants";

type PaymentMethod = "paypal" | "bank_transfer";

function CopyButton({ text }: { text: string }) {
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); toast.success("Copied!"); }}
      className="ml-2 text-muted-foreground hover:text-primary transition-colors inline-flex items-center">
      <Copy className="w-3.5 h-3.5" />
    </button>
  );
}

export default function Checkout() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const cart = trpc.cart.list.useQuery(undefined, { enabled: isAuthenticated });
  const createOrder = trpc.orders.create.useMutation();
  const [discordUsername, setDiscordUsername] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("paypal");
  const [orderId, setOrderId] = useState<number | null>(null);
  const [orderTotal, setOrderTotal] = useState<string>("");

  const total = cart.data?.reduce((sum, item) => sum + parseFloat(item.product.price) * item.quantity, 0) || 0;

  const handleCheckout = async () => {
    try {
      const result = await createOrder.mutateAsync({ discordUsername, notes, paymentMethod });
      setOrderId(result.orderId);
      setOrderTotal(result.totalAmount);
      toast.success("Order placed! Please complete payment.");
    } catch (e: any) {
      toast.error(e.message || "Failed to place order");
    }
  };

  // Order confirmation + payment instructions
  if (orderId) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="container py-8 flex-1 max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold">Order #{orderId} Created!</h2>
            <p className="text-muted-foreground mt-2">Please complete payment to process your order.</p>
          </div>

          {/* Step 1: Payment */}
          <Card className="bg-card/50 border-border/50 mb-6">
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold">1</span>
                Complete Payment - ${orderTotal}
              </h3>

              {paymentMethod === "paypal" ? (
                <div className="space-y-4">
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                    <p className="text-sm font-medium text-blue-400 mb-2">Pay via PayPal</p>
                    <p className="text-sm text-muted-foreground mb-3">
                      Send <span className="font-bold text-foreground">${orderTotal}</span> to the following PayPal link:
                    </p>
                    <a href={PAYMENT_METHODS.paypal.url} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                      <ExternalLink className="w-4 h-4" /> Open PayPal
                    </a>
                    <p className="text-xs text-muted-foreground mt-2">Link: {PAYMENT_METHODS.paypal.url} <CopyButton text={PAYMENT_METHODS.paypal.url} /></p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                    <p className="text-sm font-medium text-green-400 mb-3">Bank Transfer Details (Al Rajhi)</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Account Name:</span>
                        <span className="font-medium">{PAYMENT_METHODS.bank.accountName} <CopyButton text={PAYMENT_METHODS.bank.accountName} /></span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Account Number:</span>
                        <span className="font-mono font-medium">{PAYMENT_METHODS.bank.accountNumber} <CopyButton text={PAYMENT_METHODS.bank.accountNumber} /></span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">IBAN:</span>
                        <span className="font-mono font-medium text-xs">{PAYMENT_METHODS.bank.iban} <CopyButton text={PAYMENT_METHODS.bank.iban.replace(/\s/g, "")} /></span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Bank:</span>
                        <span className="font-medium">{PAYMENT_METHODS.bank.bankNameAr}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Amount:</span>
                        <span className="font-bold text-primary">${orderTotal}</span>
                      </div>
                    </div>
                    <p className="text-xs text-yellow-400 mt-3">Please include Order #{orderId} in the transfer notes.</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Step 2: Discord Ticket */}
          <Card className="bg-card/50 border-border/50 mb-6">
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold">2</span>
                Open a Ticket on Discord
              </h3>
              <div className="bg-[#5865F2]/10 border border-[#5865F2]/20 rounded-lg p-4 space-y-3">
                <p className="text-sm text-muted-foreground">
                  After completing payment, join our Discord server and open a ticket with the following info:
                </p>
                <div className="bg-background/50 rounded-md p-3 text-sm font-mono space-y-1">
                  <p>Order Number: <span className="text-primary font-bold">#{orderId}</span></p>
                  <p>Payment Method: <span className="text-foreground">{paymentMethod === "paypal" ? "PayPal" : "Bank Transfer"}</span></p>
                  <p>Amount: <span className="text-foreground">${orderTotal}</span></p>
                  <p className="text-yellow-400">+ Attach payment receipt/screenshot</p>
                </div>
                <a href={DISCORD_SERVER} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#5865F2] hover:bg-[#4752C4] text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                  <MessageCircle className="w-4 h-4" /> Join Discord & Open Ticket
                </a>
              </div>
            </CardContent>
          </Card>

          {/* Step 3: Wait */}
          <Card className="bg-card/50 border-border/50 mb-6">
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold">3</span>
                Receive Your Order
              </h3>
              <p className="text-sm text-muted-foreground">
                Once we verify your payment, we will deliver your order through the Discord ticket. You can track your order status on the <Link href="/orders" className="text-primary hover:underline">My Orders</Link> page.
              </p>
            </CardContent>
          </Card>

          <div className="flex gap-4 justify-center">
            <Link href="/orders"><Button className="bg-primary hover:bg-primary/80">View My Orders</Button></Link>
            <Link href="/products"><Button variant="outline">Continue Shopping</Button></Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="container py-8 flex-1 max-w-3xl mx-auto">
        <h1 className="font-creepster text-3xl text-primary text-glow-red mb-8">Checkout</h1>

        {cart.isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : cart.data && cart.data.length > 0 ? (
          <div className="space-y-6">
            {/* Order Summary */}
            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Order Items</h3>
                <div className="space-y-3">
                  {cart.data.map((item) => (
                    <div key={item.id} className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-muted/30 rounded overflow-hidden">
                          {item.product.imageUrl ? (
                            <img src={item.product.imageUrl} alt="" className="w-full h-full object-cover" />
                          ) : <div className="w-full h-full flex items-center justify-center"><ShoppingBag className="w-4 h-4 text-muted-foreground/30" /></div>}
                        </div>
                        <span>{item.product.name} <span className="text-muted-foreground">x{item.quantity}</span></span>
                      </div>
                      <span className="font-medium">${(parseFloat(item.product.price) * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-border/50 mt-4 pt-4 flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-primary">${total.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method Selection */}
            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Payment Method</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={() => setPaymentMethod("paypal")}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      paymentMethod === "paypal"
                        ? "border-blue-500 bg-blue-500/10"
                        : "border-border/50 bg-background/30 hover:border-border"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <CreditCard className={`w-6 h-6 ${paymentMethod === "paypal" ? "text-blue-400" : "text-muted-foreground"}`} />
                      <div>
                        <p className="font-medium text-sm">PayPal</p>
                        <p className="text-xs text-muted-foreground">Fast & secure</p>
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={() => setPaymentMethod("bank_transfer")}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      paymentMethod === "bank_transfer"
                        ? "border-green-500 bg-green-500/10"
                        : "border-border/50 bg-background/30 hover:border-border"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Building2 className={`w-6 h-6 ${paymentMethod === "bank_transfer" ? "text-green-400" : "text-muted-foreground"}`} />
                      <div>
                        <p className="font-medium text-sm">Bank Transfer</p>
                        <p className="text-xs text-muted-foreground">Al Rajhi Bank</p>
                      </div>
                    </div>
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Additional Info */}
            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-6 space-y-4">
                <h3 className="font-semibold">Additional Information</h3>
                <div>
                  <Label htmlFor="discord">Discord Username</Label>
                  <Input id="discord" placeholder="e.g. username" value={discordUsername}
                    onChange={(e) => setDiscordUsername(e.target.value)} className="bg-background/50 mt-1" />
                  <p className="text-xs text-muted-foreground mt-1">Required to deliver your order via Discord ticket.</p>
                </div>
                <div>
                  <Label htmlFor="notes">Order Notes (optional)</Label>
                  <Textarea id="notes" placeholder="Any special instructions..." value={notes}
                    onChange={(e) => setNotes(e.target.value)} className="bg-background/50 mt-1" rows={3} />
                </div>
              </CardContent>
            </Card>

            <Button size="lg" className="w-full bg-primary hover:bg-primary/80" onClick={handleCheckout} disabled={createOrder.isPending}>
              {createOrder.isPending ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Processing...</> : <>Place Order - ${total.toFixed(2)}</>}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              After placing your order, you will receive payment instructions. Your order will be processed once payment is verified.
            </p>
          </div>
        ) : (
          <div className="text-center py-20">
            <ShoppingBag className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Your Cart is Empty</h3>
            <Link href="/products"><Button className="bg-primary hover:bg-primary/80">Browse Products</Button></Link>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
