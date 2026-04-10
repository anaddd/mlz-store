import { useCallback } from "react";
import { useFirebaseAuth } from "@/contexts/FirebaseAuthContext";
import { signInWithGoogle } from "@/lib/firebase";
import { toast } from "sonner";

export function useGoogleSignIn() {
  const { isAuthenticated } = useFirebaseAuth();

  const requireAuth = useCallback(async () => {
    if (isAuthenticated) {
      return true;
    }

    try {
      // Show Google Sign-In popup
      const user = await signInWithGoogle();
      if (user) {
        return true;
      }
      return false;
    } catch (error) {
      console.error("Sign-in failed:", error);
      toast.error("فشل تسجيل الدخول. حاول مرة أخرى.");
      return false;
    }
  }, [isAuthenticated]);

  return { isAuthenticated, requireAuth };
}
