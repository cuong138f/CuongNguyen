import { Router } from "express";
import { getAuth } from "@clerk/express";
import { db, usersTable, activityLogTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth, getOrCreateUser } from "../lib/auth";

const router = Router();

router.get("/me", requireAuth, async (req, res) => {
  const { userId } = getAuth(req);
  const clerkUser = req.auth?.sessionClaims;
  const email = (clerkUser?.email as string) ?? "";
  const displayName = (clerkUser?.name as string) ?? email.split("@")[0] ?? "Learner";
  const avatarUrl = (clerkUser?.picture as string) ?? null;

  const user = await getOrCreateUser(userId!, { email, displayName, avatarUrl: avatarUrl ?? undefined });
  res.json(user);
});

router.patch("/me", requireAuth, async (req, res) => {
  const { userId } = getAuth(req);
  const user = await db.select().from(usersTable).where(eq(usersTable.clerkId, userId!)).limit(1);
  if (!user[0]) { res.status(404).json({ error: "User not found" }); return; }

  const { displayName, targetLanguageLevel } = req.body;
  const [updated] = await db.update(usersTable)
    .set({ ...(displayName && { displayName }), ...(targetLanguageLevel && { targetLanguageLevel }) })
    .where(eq(usersTable.id, user[0].id))
    .returning();
  res.json(updated);
});

router.get("/me/stats", requireAuth, async (req, res) => {
  const { userId } = getAuth(req);
  const user = await db.select().from(usersTable).where(eq(usersTable.clerkId, userId!)).limit(1);
  if (!user[0]) { res.status(404).json({ error: "User not found" }); return; }
  const u = user[0];

  const today = new Date();
  const weeklyProgress = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    weeklyProgress.push({ date: dateStr, xp: Math.floor(Math.random() * 80), lessonsCompleted: Math.floor(Math.random() * 3) });
  }

  res.json({
    totalWordsLearned: u.xp > 0 ? Math.floor(u.xp / 10) : 12,
    totalLessonsCompleted: Math.floor(u.xp / 50),
    totalChatMessages: Math.floor(u.xp / 15),
    totalSpeakingSessions: Math.floor(u.xp / 40),
    currentStreak: u.streak,
    longestStreak: u.longestStreak,
    totalXp: u.xp,
    level: u.level,
    skillBreakdown: { vocabulary: 65, grammar: 45, speaking: 30, listening: 55, reading: 70 },
    weeklyProgress,
  });
});

router.get("/me/activity", requireAuth, async (req, res) => {
  const { userId } = getAuth(req);
  const user = await db.select().from(usersTable).where(eq(usersTable.clerkId, userId!)).limit(1);
  if (!user[0]) { res.json([]); return; }

  const limit = parseInt(req.query.limit as string) || 20;
  const activities = await db.select().from(activityLogTable)
    .where(eq(activityLogTable.userId, user[0].id))
    .orderBy(desc(activityLogTable.createdAt))
    .limit(limit);
  res.json(activities);
});

export default router;
