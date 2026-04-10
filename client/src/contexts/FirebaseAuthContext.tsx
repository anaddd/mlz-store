import React, { createContext, useContext, useEffect, useState } from "react"
import { auth } from "@/lib/firebase"
import { onAuthStateChanged, User } from "firebase/auth"
import { toast } from "sonner"
import { useLocation } from "wouter"

interface FirebaseAuthContextType {
  user: User | null
  loading: boolean
  isAuthenticated: boolean
  logout: () => Promise<void>
}

const FirebaseAuthContext = createContext<FirebaseAuthContextType | undefined>(undefined)

export function FirebaseAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [, setLocation] = useLocation()
  const [previousUser, setPreviousUser] = useState<User | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      // Check if this is a new login (user changed from null to something)
      const isNewLogin = previousUser === null && currentUser !== null

      if (currentUser && isNewLogin) {
        try {
          // Send user data to backend to create session
          const response = await fetch("/api/oauth/callback", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              uid: currentUser.uid,
              email: currentUser.email,
              name: currentUser.displayName,
            }),
          })

          if (!response.ok) {
            const errorData = await response.json()
            console.error("Failed to create session:", errorData)
            toast.error("فشل إنشاء الجلسة")
            await auth.signOut()
            setUser(null)
            setPreviousUser(null)
            setLoading(false)
            return
          }

          setUser(currentUser)
          setPreviousUser(currentUser)
          toast.success("تم تسجيل الدخول بنجاح")
          
          // Redirect to home page after successful login
          setTimeout(() => {
            setLocation("/")
          }, 500)
        } catch (error) {
          console.error("Error during authentication:", error)
          toast.error("حدث خطأ في المصادقة")
          await auth.signOut()
          setUser(null)
          setPreviousUser(null)
        }
      } else if (currentUser && !isNewLogin) {
        // User was already logged in, just update state
        setUser(currentUser)
        setPreviousUser(currentUser)
      } else if (!currentUser) {
        // User logged out
        setUser(null)
        setPreviousUser(null)
      }

      setLoading(false)
    })

    return () => unsubscribe()
  }, [setLocation, previousUser])

  const logout = async () => {
    try {
      // Call backend logout endpoint
      await fetch("/api/oauth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      // Sign out from Firebase
      await auth.signOut()
      setUser(null)
      setPreviousUser(null)
      toast.success("تم تسجيل الخروج بنجاح")
      
      // Redirect to home page after logout
      setLocation("/")
    } catch (error) {
      console.error("Logout error:", error)
      toast.error("فشل تسجيل الخروج")
    }
  }

  const value: FirebaseAuthContextType = {
    user,
    loading,
    isAuthenticated: !!user,
    logout,
  }

  return (
    <FirebaseAuthContext.Provider value={value}>
      {children}
    </FirebaseAuthContext.Provider>
  )
}

export function useFirebaseAuth() {
  const context = useContext(FirebaseAuthContext)
  if (context === undefined) {
    throw new Error("useFirebaseAuth must be used within FirebaseAuthProvider")
  }
  return context
}
