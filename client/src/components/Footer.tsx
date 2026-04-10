import { DISCORD_SERVER } from "@shared/constants";

export default function Footer() {
  return (
    <footer className="border-t border-border/50 bg-background/50 mt-auto">
      <div className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-creepster text-xl text-primary text-glow-red mb-3">MLZ STORE</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your ultimate Dead by Daylight gaming store. Premium products and services for the DbD community.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-3">Quick Links</h4>
            <div className="space-y-2">
              <a href="/products" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Products</a>
              <a href="/orders" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">My Orders</a>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-3">Community</h4>
            <div className="space-y-2">
              <a href={DISCORD_SERVER} target="_blank" rel="noopener noreferrer"
                className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                Join our Discord Server
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-border/50 mt-6 pt-6 text-center">
          <p className="text-xs text-muted-foreground">&copy; {new Date().getFullYear()} MLZ Store. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
