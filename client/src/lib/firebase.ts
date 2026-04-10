import { initializeApp } from "firebase/app"
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut } from "firebase/auth"

const firebaseConfig = {
  apiKey: "AIzaSyAQgCwiqIaFIh0bfAXynsUX-YxfjK-oaBM",
  authDomain: "store-fedc1.firebaseapp.com",
  projectId: "store-fedc1",
  storageBucket: "store-fedc1.firebasestorage.app",
  messagingSenderId: "109794141844",
  appId: "1:109794141844:web:c43bd6a917356aa7fe7681",
  measurementId: "G-24MRQD4273",
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider)
    return result.user
  } catch (error) {
    console.error("Error signing in with Google:", error)
    throw error
  }
}

export const signOut = async () => {
  try {
    await firebaseSignOut(auth)
  } catch (error) {
    console.error("Error signing out:", error)
    throw error
  }
}
