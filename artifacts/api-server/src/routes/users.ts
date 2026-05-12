import { Router } from "express";
import { db, usersTable, activityLogTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { getGuestUser } from "../lib/auth";

const router = Router();

router.get("/me", async (req, res) => {
  const user = await getGuestUser();
  res.json(user);
});

router.patch("/me", async (req, res) => {
  const user = await getGuestUser();
  const { displayName, targetLanguageLevel } = req.body;
  const [updated] = await db.update(usersTable)
    .set({ ...(displayName && { displayName }), ...(targetLanguageLevel && { targetLanguageLevel }) })
    .where(eq(usersTable.id, user.id))
    .returning();
  res.json(updated);
});

router.get("/me/stats", async (req, res) => {
  const user = await getGuestUser();
  const today = new Date();
  const weeklyProgress = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    weeklyProgress.push({ date: dateStr, xp: Math.floor(Math.random() * 80), lessonsCompleted: Math.floor(Math.random() * 3) });
  }

  res.json({
    totalWordsLearned: user.xp > 0 ? Math.floor(user.xp / 10) : 12,
    totalLessonsCompleted: Math.floor(user.xp / 50),
    totalChatMessages: Math.floor(user.xp / 15),
    totalSpeakingSessions: Math.floor(user.xp / 40),
    currentStreak: user.streak,
    longestStreak: user.longestStreak,
    totalXp: user.xp,
    level: user.level,
    skillBreakdown: { vocabulary: 65, grammar: 45, speaking: 30, listening: 55, reading: 70 },
    weeklyProgress,
  });
});

router.get("/me/activity", async (req, res) => {
  const user = await getGuestUser();
  const limit = parseInt(req.query.limit as string) || 20;
  const activities = await db.select().from(activityLogTable)
    .where(eq(activityLogTable.userId, user.id))
    .orderBy(desc(activityLogTable.createdAt))
    .limit(limit);
  res.json(activities);
});

export default router;
