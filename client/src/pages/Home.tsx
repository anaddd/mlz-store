import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { trpc } from "@/lib/trpc";
import { CDN_IMAGES, DISCORD_SERVER } from "@shared/constants";
import { ShoppingBag, Shield, Zap, Users } from "lucide-react";
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Home() {
  const { isAuthenticated } = useAuth();
  const featured = trpc.products.featured.useQuery();
  const categories = trpc.categories.list.useQuery();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={CDN_IMAGES.hero} alt="Dead by Daylight" className="w-full h-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
        </div>
        <div className="relative container py-24 md:py-36 text-center">
          <h1 className="font-creepster text-5xl md:text-7xl text-primary text-glow-red mb-4 tracking-wider">
            MLZ STORE
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            متجرك المتكامل لكل ما يخص لعبة ديد باي دايلايت. منتجات وخدمات مميزة لكل من السيرفايفل والكيلر على حد سواء.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/products">
              <Button size="lg" className="bg-primary hover:bg-primary/80 text-primary-foreground font-semibold px-8">
                <ShoppingBag className="w-5 h-5 mr-2" /> Browse Products
              </Button>
            </Link>
            <a href={DISCORD_SERVER} target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="outline" className="border-primary/50 text-primary hover:bg-primary/10 px-8">
                <Users className="w-5 h-5 mr-2" /> Join Discord
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: Shield, title: "Secure Payments", desc: "Safe and encrypted payment processing via Stripe." },
            { icon: Zap, title: "Instant Delivery", desc: "Fast processing and delivery for all digital products." },
            { icon: Users, title: "Community", desc: "Join our Discord community for support and updates." },
          ].map((f, i) => (
            <Card key={i} className="bg-card/50 border-border/50 hover:border-primary/30 transition-all duration-300">
              <CardContent className="p-6 text-center">
                <f.icon className="w-10 h-10 text-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground" style={{fontSize: '12px'}}>{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      {featured.data && featured.data.length > 0 && (
        <section className="container py-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-creepster text-3xl text-primary text-glow-red">Featured Products</h2>
              <p className="text-sm text-muted-foreground mt-1">Hand-picked items for you</p>
            </div>
            <Link href="/products">
              <Button variant="outline" className="border-primary/50 text-primary hover:bg-primary/10">View All</Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.data.map((product) => (
              <Link key={product.id} href={`/products/${product.slug}`}>
                <Card className="bg-card/50 border-border/50 hover:border-primary/30 transition-all duration-300 group overflow-hidden">
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
                    <h3 className="font-semibold text-sm truncate">{product.name}</h3>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-primary font-bold">${product.price}</span>
                      {product.comparePrice && (
                        <span className="text-xs text-muted-foreground line-through">${product.comparePrice}</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Categories */}
      {categories.data && categories.data.length > 0 && (
        <section className="container py-16">
          <h2 className="font-creepster text-3xl text-primary text-glow-red mb-8 text-center">Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.data.map((cat) => (
              <Link key={cat.id} href={`/products?category=${cat.id}`}>
                <Card className="bg-card/50 border-border/50 hover:border-primary/30 transition-all duration-300 group">
                  <CardContent className="p-6 text-center">
                    <h3 className="font-semibold">{cat.name}</h3>
                    {cat.description && <p className="text-xs text-muted-foreground mt-1">{cat.description}</p>}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={CDN_IMAGES.characters} alt="" className="w-full h-full object-cover opacity-15" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background" />
        </div>
        <div className="relative container py-20 text-center">
          <h2 className="font-creepster text-3xl md:text-4xl text-primary text-glow-red mb-4">Ready to Enter the Fog?</h2>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
            Sign in to start shopping and join the MLZ community today.
          </p>
          {!isAuthenticated ? (
            <Button size="lg" className="bg-primary hover:bg-primary/80 px-8" onClick={() => window.location.href = "/login"}>
              Sign In Now
            </Button>
          ) : (
            <Link href="/products">
              <Button size="lg" className="bg-primary hover:bg-primary/80 px-8">
                Start Shopping
              </Button>
            </Link>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
