import { useAuth } from "@/_core/hooks/useAuth";
import { useGoogleSignIn } from "@/_core/hooks/useGoogleSignIn";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { Trash2, Plus, Minus, ShoppingBag, Loader2, ArrowRight } from "lucide-react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Cart() {
  const { isAuthenticated } = useAuth();
  const { requireAuth } = useGoogleSignIn();
  const [, navigate] = useLocation();
  const cart = trpc.cart.list.useQuery(undefined, { enabled: isAuthenticated });
  const updateItem = trpc.cart.update.useMutation();
  const removeItem = trpc.cart.remove.useMutation();
  const utils = trpc.useUtils();

  const handleSignIn = async () => {
    const authenticated = await requireAuth();
    if (authenticated) {
      await cart.refetch();
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="flex-1 flex items-center justify-center flex-col gap-4">
          <ShoppingBag className="w-16 h-16 text-muted-foreground/30" />
          <h2 className="text-xl font-semibold">Sign in to view your cart</h2>
          <Button className="bg-primary hover:bg-primary/80" onClick={handleSignIn}>Sign In with Google</Button>
        </div>
      </div>
    );
  }

  const handleUpdate = async (id: number, quantity: number) => {
    try {
      await updateItem.mutateAsync({ id, quantity });
      utils.cart.list.invalidate();
    } catch { toast.error("Failed to update"); }
  };

  const handleRemove = async (id: number) => {
    try {
      await removeItem.mutateAsync({ id });
      utils.cart.list.invalidate();
      toast.success("Removed from cart");
    } catch { toast.error("Failed to remove"); }
  };

  const total = cart.data?.reduce((sum, item) => sum + parseFloat(item.product.price) * item.quantity, 0) || 0;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="container py-8 flex-1">
        <h1 className="font-creepster text-3xl text-primary text-glow-red mb-8">Shopping Cart</h1>

        {cart.isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : cart.data && cart.data.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {cart.data.map((item) => (
                <Card key={item.id} className="bg-card/50 border-border/50">
                  <CardContent className="p-4 flex gap-4">
                    <div className="w-20 h-20 bg-muted/30 rounded-md overflow-hidden flex-shrink-0">
                      {item.product.imageUrl ? (
                        <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"><ShoppingBag className="w-6 h-6 text-muted-foreground/30" /></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <Link href={`/products/${item.product.slug}`}>
                        <h3 className="font-semibold text-sm hover:text-primary transition-colors">{item.product.name}</h3>
                      </Link>
                      <p className="text-primary font-bold mt-1">${item.product.price}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleUpdate(item.id, item.quantity - 1)} disabled={updateItem.isPending}>
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                      <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleUpdate(item.id, item.quantity + 1)} disabled={updateItem.isPending}>
                        <Plus className="w-3 h-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleRemove(item.id)} disabled={removeItem.isPending}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div>
              <Card className="bg-card/50 border-border/50 sticky top-20">
                <CardContent className="p-6 space-y-4">
                  <h3 className="font-semibold text-lg">Order Summary</h3>
                  <div className="space-y-2">
                    {cart.data.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-muted-foreground truncate mr-2">{item.product.name} x{item.quantity}</span>
                        <span>${(parseFloat(item.product.price) * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-border/50 pt-4 flex justify-between font-bold">
                    <span>Total</span>
                    <span className="text-primary">${total.toFixed(2)}</span>
                  </div>
                  <Button className="w-full bg-primary hover:bg-primary/80" onClick={() => navigate("/checkout")}>
                    Proceed to Checkout <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <div className="text-center py-20">
            <ShoppingBag className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Your Cart is Empty</h3>
            <p className="text-sm text-muted-foreground mb-4">Start adding products to your cart.</p>
            <Link href="/products"><Button className="bg-primary hover:bg-primary/80">Browse Products</Button></Link>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
