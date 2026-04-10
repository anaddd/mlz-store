import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, ShoppingBag, Loader2 } from "lucide-react";
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Products() {
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<string>("all");
  const categories = trpc.categories.list.useQuery();
  const products = trpc.products.list.useQuery({
    search: search || undefined,
    categoryId: categoryId !== "all" ? parseInt(categoryId) : undefined,
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="container py-8 flex-1">
        <div className="mb-8">
          <h1 className="font-creepster text-3xl text-primary text-glow-red mb-2">Products</h1>
          <p className="text-sm text-muted-foreground">Browse our collection of Dead by Daylight products</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-card/50 border-border/50"
            />
          </div>
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger className="w-full sm:w-48 bg-card/50 border-border/50">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.data?.map((cat) => (
                <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Products Grid */}
        {products.isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : products.data && products.data.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.data.map((product) => (
              <Link key={product.id} href={`/products/${product.slug}`}>
                <Card className="bg-card/50 border-border/50 hover:border-primary/30 transition-all duration-300 group overflow-hidden h-full">
                  <div className="aspect-square bg-muted/30 overflow-hidden">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag className="w-12 h-12 text-muted-foreground/30" />
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-sm truncate mb-1">{product.name}</h3>
                    {product.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{product.description}</p>
                    )}
                    <div className="flex items-center gap-2">
                      <span className="text-primary font-bold">${product.price}</span>
                      {product.comparePrice && (
                        <span className="text-xs text-muted-foreground line-through">${product.comparePrice}</span>
                      )}
                    </div>
                    {product.stock <= 0 && (
                      <span className="text-xs text-destructive font-medium mt-1 block">Out of Stock</span>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <ShoppingBag className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Products Found</h3>
            <p className="text-sm text-muted-foreground">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
