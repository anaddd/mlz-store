import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { parse as parseCookieHeader } from "cookie";
import { COOKIE_NAME } from "@shared/const";
import * as db from "../db";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    // Try to get user from session cookie
    const cookies = parseCookieHeader(opts.req.headers.cookie || "");
    const sessionToken = cookies[COOKIE_NAME];

    if (sessionToken) {
      try {
        // Session token is just the Firebase uid
        const firebaseUid = sessionToken;
        const userFromDb = await db.getUserByOpenId(firebaseUid);

        if (userFromDb) {
          user = userFromDb;
          // Update last signed in
          await db.upsertUser({
            openId: firebaseUid,
            lastSignedIn: new Date(),
          });
        }
      } catch (error) {
        console.warn("[Auth] Session lookup failed:", error);
        user = null;
      }
    }
  } catch (error) {
    console.warn("[Auth] Context creation error:", error);
    user = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
