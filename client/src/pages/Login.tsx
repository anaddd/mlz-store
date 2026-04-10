import { useState } from "react"
import { useLocation } from "wouter"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Chrome, Loader2 } from "lucide-react"
import { signInWithGoogle } from "@/lib/firebase"
import { toast } from "sonner"

export default function Login() {
  const [loading, setLoading] = useState(false)
  const [, setLocation] = useLocation()

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true)
      await signInWithGoogle()
      // FirebaseAuthContext will handle the redirect and session creation
    } catch (error) {
      console.error("Login error:", error)
      toast.error("فشل تسجيل الدخول. حاول مرة أخرى.")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-primary/20 bg-card/50 backdrop-blur">
        <CardHeader className="text-center space-y-2">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-primary mb-2">MLZ</h1>
            <p className="text-sm text-muted-foreground">STORE</p>
          </div>
          <CardTitle className="text-2xl">تسجيل الدخول</CardTitle>
          <CardDescription>
            استخدم حسابك على Google للدخول إلى المتجر
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 text-white h-12 text-base"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                جاري التحميل...
              </>
            ) : (
              <>
                <Chrome className="mr-2 h-5 w-5" />
                Sign in with Google
              </>
            )}
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            سيتم إنشاء حساب جديد تلقائياً عند أول دخول
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
