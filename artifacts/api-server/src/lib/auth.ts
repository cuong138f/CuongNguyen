import { Request, Response, NextFunction } from "express";
import { getAuth } from "@clerk/express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const auth = getAuth(req);
  if (!auth.userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}

export async function getOrCreateUser(clerkId: string, fallback: { email: string; displayName: string; avatarUrl?: string }) {
  const existing = await db.select().from(usersTable).where(eq(usersTable.clerkId, clerkId)).limit(1);
  if (existing.length > 0) return existing[0];

  const [created] = await db.insert(usersTable).values({
    clerkId,
    email: fallback.email,
    displayName: fallback.displayName,
    avatarUrl: fallback.avatarUrl ?? null,
  }).returning();
  return created;
}
