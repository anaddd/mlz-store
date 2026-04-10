import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Shield, Calendar } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Profile() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="container py-8 flex-1 max-w-2xl mx-auto">
        <h1 className="font-creepster text-3xl text-primary text-glow-red mb-8">Profile</h1>

        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-6 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                <User className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold">{user.name || "User"}</h2>
                <Badge variant="outline" className={user.role === "admin" ? "bg-primary/20 text-primary border-primary/30" : ""}>
                  <Shield className="w-3 h-3 mr-1" /> {user.role === "admin" ? "Admin" : "Member"}
                </Badge>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm">{user.email || "Not provided"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Member Since</p>
                  <p className="text-sm">{new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
}
