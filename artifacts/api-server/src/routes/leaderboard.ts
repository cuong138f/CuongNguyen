import { Router } from "express";
import { getAuth } from "@clerk/express";
import { db, usersTable } from "@workspace/db";
import { desc } from "drizzle-orm";
import { requireAuth } from "../lib/auth";

const router = Router();

router.get("/", requireAuth, async (req, res) => {
  const { userId } = getAuth(req);
  const limit = parseInt(req.query.limit as string) || 20;

  const users = await db.select().from(usersTable).orderBy(desc(usersTable.xp)).limit(limit);

  const entries = users.map((u, i) => ({
    rank: i + 1,
    userId: u.id,
    displayName: u.displayName,
    avatarUrl: u.avatarUrl,
    xp: u.xp,
    level: u.level,
    streak: u.streak,
    isCurrentUser: u.clerkId === userId,
  }));

  res.json(entries);
});

export default router;
