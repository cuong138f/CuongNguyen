import { Router } from "express";
import { getAuth } from "@clerk/express";
import { db, usersTable, userBadgesTable, badgesTable, vocabularyTable, userLessonsTable } from "@workspace/db";
import { eq, and, lt, gte, count } from "drizzle-orm";
import { requireAuth, getOrCreateUser } from "../lib/auth";

const router = Router();

router.get("/summary", requireAuth, async (req, res) => {
  const { userId } = getAuth(req);
  const clerkUser = req.auth?.sessionClaims;
  const email = (clerkUser?.email as string) ?? "";
  const displayName = (clerkUser?.name as string) ?? email.split("@")[0] ?? "Learner";
  const avatarUrl = (clerkUser?.picture as string) ?? null;

  const user = await getOrCreateUser(userId!, { email, displayName, avatarUrl: avatarUrl ?? undefined });

  const now = new Date();
  const wordsDueReview = await db.select({ count: count() }).from(vocabularyTable)
    .where(and(eq(vocabularyTable.userId, user.id), lt(vocabularyTable.nextReviewAt, now)));

  const wordsLearned = await db.select({ count: count() }).from(vocabularyTable)
    .where(and(eq(vocabularyTable.userId, user.id)));

  const earnedBadges = await db.select({ badge: badgesTable, earnedAt: userBadgesTable.earnedAt })
    .from(userBadgesTable)
    .innerJoin(badgesTable, eq(badgesTable.id, userBadgesTable.badgeId))
    .where(eq(userBadgesTable.userId, user.id))
    .limit(3);

  const lessonsCompleted = await db.select({ count: count() }).from(userLessonsTable)
    .where(eq(userLessonsTable.userId, user.id));

  const xpToNextLevel = user.level * 500;

  res.json({
    user,
    currentStreak: user.streak,
    totalXp: user.xp,
    level: user.level,
    xpToNextLevel,
    wordsLearned: wordsLearned[0].count,
    wordsDueReview: wordsDueReview[0].count,
    lessonsCompleted: lessonsCompleted[0].count,
    todayXp: Math.floor(user.xp * 0.05),
    recentBadges: earnedBadges.map(b => ({
      ...b.badge,
      isEarned: true,
      earnedAt: b.earnedAt,
    })),
    topLeaderboardRank: null,
  });
});

export default router;
