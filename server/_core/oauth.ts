import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";

export function registerOAuthRoutes(app: Express) {
  // Firebase callback endpoint - receives user data from frontend
  app.post("/api/oauth/callback", async (req: Request, res: Response) => {
    try {
      const { uid, email, name } = req.body;

      if (!uid) {
        res.status(400).json({ error: "uid is required" });
        return;
      }

      // Upsert user in database
      await db.upsertUser({
        openId: uid,
        name: name || null,
        email: email || null,
        loginMethod: "google",
        lastSignedIn: new Date(),
      });

      // Create a simple session token (just the uid)
      const sessionToken = uid;
      
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { 
        ...cookieOptions, 
        maxAge: ONE_YEAR_MS,
        httpOnly: true,
        secure: true,
        sameSite: "lax"
      });

      res.json({ success: true, message: "Logged in successfully" });
    } catch (error) {
      console.error("[Firebase OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });

  // Logout endpoint
  app.post("/api/oauth/logout", async (req: Request, res: Response) => {
    try {
      const cookieOptions = getSessionCookieOptions(req);
      res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      res.json({ success: true, message: "Logged out successfully" });
    } catch (error) {
      console.error("[Firebase OAuth] Logout failed", error);
      res.status(500).json({ error: "Logout failed" });
    }
  });
}
