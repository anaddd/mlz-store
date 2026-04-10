import { useAuth } from "@/_core/hooks/useAuth";
import { useGoogleSignIn } from "@/_core/hooks/useGoogleSignIn";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";

import { ShoppingCart, ShoppingBag, ArrowLeft, Loader2, Check } from "lucide-react";
import { useParams, Link } from "wouter";
import { useState } from "react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { isAuthenticated } = useAuth();
  const { requireAuth } = useGoogleSignIn();
  const product = trpc.products.bySlug.useQuery({ slug: slug || "" });
  const addToCart = trpc.cart.add.useMutation();
  const utils = trpc.useUtils();
  const [added, setAdded] = useState(false);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      const authenticated = await requireAuth();
      if (!authenticated) return;
    }
    if (!product.data) return;
    try {
      await addToCart.mutateAsync({ productId: product.data.id });
      utils.cart.list.invalidate();
      setAdded(true);
      toast.success("Added to cart!");
      setTimeout(() => setAdded(false), 2000);
    } catch (e) {
      toast.error("Failed to add to cart");
    }
  };

  if (product.isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!product.data) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="flex-1 flex items-center justify-center flex-col gap-4">
          <h2 className="text-xl font-semibold">Product Not Found</h2>
          <Link href="/products"><Button variant="outline">Back to Products</Button></Link>
        </div>
      </div>
    );
  }

  const p = product.data;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="container py-8 flex-1">
        <Link href="/products" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Products
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="aspect-square bg-card/50 rounded-lg overflow-hidden border border-border/50">
            {p.imageUrl ? (
              <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ShoppingBag className="w-20 h-20 text-muted-foreground/30" />
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">{p.name}</h1>
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-primary">${p.price}</span>
                {p.comparePrice && (
                  <span className="text-lg text-muted-foreground line-through">${p.comparePrice}</span>
                )}
              </div>
            </div>

            {p.description && (
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground leading-relaxed">{p.description}</p>
              </div>
            )}

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Availability:</span>
              {p.stock > 0 ? (
                <span className="text-sm text-green-500 font-medium">In Stock ({p.stock})</span>
              ) : (
                <span className="text-sm text-destructive font-medium">Out of Stock</span>
              )}
            </div>

            <Button
              size="lg"
              className="w-full bg-primary hover:bg-primary/80"
              disabled={p.stock <= 0 || addToCart.isPending}
              onClick={handleAddToCart}
            >
              {added ? (
                <><Check className="w-5 h-5 mr-2" /> Added!</>
              ) : addToCart.isPending ? (
                <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Adding...</>
              ) : (
                <><ShoppingCart className="w-5 h-5 mr-2" /> Add to Cart</>
              )}
            </Button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
