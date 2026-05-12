import { Router } from "express";
import { db, usersTable, userBadgesTable, badgesTable, vocabularyTable, userLessonsTable } from "@workspace/db";
import { eq, and, lt, count } from "drizzle-orm";
import { getGuestUser } from "../lib/auth";

const router = Router();

router.get("/summary", async (req, res) => {
  const user = await getGuestUser();
  const now = new Date();

  const wordsDueReview = await db.select({ count: count() }).from(vocabularyTable)
    .where(and(eq(vocabularyTable.userId, user.id), lt(vocabularyTable.nextReviewAt, now)));

  const wordsLearned = await db.select({ count: count() }).from(vocabularyTable)
    .where(eq(vocabularyTable.userId, user.id));

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
