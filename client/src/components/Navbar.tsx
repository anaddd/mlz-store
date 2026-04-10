import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ShoppingCart, User, LogOut, Package, Shield, Menu, X } from "lucide-react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { CDN_IMAGES } from "@shared/constants";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const [, navigate] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const cartQuery = trpc.cart.list.useQuery(undefined, { enabled: isAuthenticated });
  const cartCount = cartQuery.data?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-creepster text-2xl text-primary text-glow-red tracking-wider">MLZ</span>
          <span className="text-xs text-muted-foreground hidden sm:block">STORE</span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Home</Link>
          <Link href="/products" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Products</Link>
          {isAuthenticated && (
            <Link href="/orders" className="text-sm text-muted-foreground hover:text-foreground transition-colors">My Orders</Link>
          )}
          {user?.role === "admin" && (
            <Link href="/admin" className="text-sm text-primary hover:text-primary/80 transition-colors flex items-center gap-1">
              <Shield className="w-3.5 h-3.5" /> Admin
            </Link>
          )}
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated && (
            <Link href="/cart" className="relative">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {cartCount}
                  </span>
                )}
              </Button>
            </Link>
          )}

          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{user?.name || "User"}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/profile")}>
                  <User className="w-4 h-4 mr-2" /> Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/orders")}>
                  <Package className="w-4 h-4 mr-2" /> My Orders
                </DropdownMenuItem>
                {user?.role === "admin" && (
                  <DropdownMenuItem onClick={() => navigate("/admin")}>
                    <Shield className="w-4 h-4 mr-2" /> Admin Panel
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  <LogOut className="w-4 h-4 mr-2" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button size="sm" className="bg-primary hover:bg-primary/80" onClick={() => window.location.href = "/login"}>
              Sign In
            </Button>
          )}

          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-xl p-4 space-y-3">
          <Link href="/" className="block text-sm py-2" onClick={() => setMobileOpen(false)}>Home</Link>
          <Link href="/products" className="block text-sm py-2" onClick={() => setMobileOpen(false)}>Products</Link>
          {isAuthenticated && <Link href="/orders" className="block text-sm py-2" onClick={() => setMobileOpen(false)}>My Orders</Link>}
          {user?.role === "admin" && <Link href="/admin" className="block text-sm text-primary py-2" onClick={() => setMobileOpen(false)}>Admin Panel</Link>}
        </div>
      )}
    </nav>
  );
}
