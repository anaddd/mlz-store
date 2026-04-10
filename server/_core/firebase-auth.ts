import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import type { Request } from "express";
import { ForbiddenError } from "@shared/_core/errors";
import type { User } from "../../drizzle/schema";
import * as db from "../db";
import { ENV } from "./env";
import { COOKIE_NAME } from "@shared/const";

// Firebase Admin SDK initialization
let firebaseApp: any;
let firebaseAuth: any;

function initializeFirebase() {
  if (firebaseApp) return;

  try {
    // Use environment variables for Firebase configuration
    const serviceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID || "store-fedc1",
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    };

    // If we have service account credentials, use them
    if (serviceAccount.clientEmail && serviceAccount.privateKey) {
      firebaseApp = initializeApp({
        credential: cert(serviceAccount as any),
      });
    } else {
      // Fallback: use default credentials
      firebaseApp = initializeApp();
    }

    firebaseAuth = getAuth(firebaseApp);
    console.log("[Firebase] Initialized successfully");
  } catch (error) {
    console.error("[Firebase] Initialization failed:", error);
    throw error;
  }
}

export async function verifyFirebaseToken(token: string): Promise<any> {
  try {
    initializeFirebase();
    const decodedToken = await firebaseAuth.verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    console.error("[Firebase] Token verification failed:", error);
    throw error;
  }
}

export async function authenticateFirebaseRequest(req: Request): Promise<User> {
  try {
    // Get Firebase token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw ForbiddenError("Missing or invalid authorization header");
    }

    const token = authHeader.substring(7);
    const decodedToken = await verifyFirebaseToken(token);

    const firebaseUid = decodedToken.uid;
    const email = decodedToken.email;
    const name = decodedToken.name || "";
    const photoUrl = decodedToken.picture || null;

    const signedInAt = new Date();

    // Check if user exists in database
    let user = await db.getUserByOpenId(firebaseUid);

    // If user not in DB, create them
    if (!user) {
      await db.upsertUser({
        openId: firebaseUid,
        name: name || null,
        email: email || null,
        loginMethod: "google",
        lastSignedIn: signedInAt,
      });
      user = await db.getUserByOpenId(firebaseUid);
    } else {
      // Update last signed in time
      await db.upsertUser({
        openId: firebaseUid,
        lastSignedIn: signedInAt,
      });
    }

    if (!user) {
      throw ForbiddenError("User not found after creation");
    }

    return user;
  } catch (error) {
    console.error("[Firebase Auth] Authentication failed:", error);
    throw error;
  }
}

export async function createSessionCookie(token: string, expiresIn: number = 86400000) {
  try {
    initializeFirebase();
    const sessionCookie = await firebaseAuth.createSessionCookie(token, {
      expiresIn,
    });
    return sessionCookie;
  } catch (error) {
    console.error("[Firebase] Session cookie creation failed:", error);
    throw error;
  }
}

export async function verifySessionCookie(sessionCookie: string): Promise<any> {
  try {
    initializeFirebase();
    const decodedClaims = await firebaseAuth.verifySessionCookie(sessionCookie, true);
    return decodedClaims;
  } catch (error) {
    console.error("[Firebase] Session cookie verification failed:", error);
    throw error;
  }
}
