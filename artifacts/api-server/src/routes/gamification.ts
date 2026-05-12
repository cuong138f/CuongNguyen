import { Router } from "express";
import { getAuth } from "@clerk/express";
import { db, usersTable, badgesTable, userBadgesTable, dailyChallengesTable, userDailyChallengesTable, activityLogTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { requireAuth } from "../lib/auth";

const router = Router();

router.get("/badges", requireAuth, async (req, res) => {
  const { userId } = getAuth(req);
  const user = await db.select().from(usersTable).where(eq(usersTable.clerkId, userId!)).limit(1);

  const allBadges = await db.select().from(badgesTable);

  if (!user[0]) {
    res.json(allBadges.map(b => ({ ...b, isEarned: false, earnedAt: null })));
    return;
  }

  const earned = await db.select().from(userBadgesTable).where(eq(userBadgesTable.userId, user[0].id));
  const earnedMap = new Map(earned.map(e => [e.badgeId, e.earnedAt]));

  res.json(allBadges.map(b => ({
    ...b,
    isEarned: earnedMap.has(b.id),
    earnedAt: earnedMap.get(b.id) ?? null,
  })));
});

router.get("/daily-challenge", requireAuth, async (req, res) => {
  const { userId } = getAuth(req);
  const user = await db.select().from(usersTable).where(eq(usersTable.clerkId, userId!)).limit(1);

  const today = new Date().toISOString().split("T")[0];
  let challenge = await db.select().from(dailyChallengesTable).where(eq(dailyChallengesTable.date, today)).limit(1);

  if (!challenge[0]) {
    const types = ["vocabulary", "grammar", "speaking", "chat", "reading"] as const;
    const type = types[Math.floor(Math.random() * types.length)];
    const templates = {
      vocabulary: { title: "Word of the Day", description: "Learn 5 new vocabulary words and use each in a sentence." },
      grammar: { title: "Grammar Challenge", description: "Complete 10 grammar exercises focusing on present perfect tense." },
      speaking: { title: "Speaking Sprint", description: "Record yourself speaking for 2 minutes on the topic: 'My favorite hobby'." },
      chat: { title: "Conversation Practice", description: "Have a 10-message conversation with AI about your daily routine." },
      reading: { title: "Reading Comprehension", description: "Read a short article and answer 5 comprehension questions." },
    };
    const [created] = await db.insert(dailyChallengesTable).values({
      date: today, type, ...templates[type], xpReward: 100, content: null,
    }).returning();
    challenge = [created];
  }

  let isCompleted = false;
  if (user[0]) {
    const done = await db.select().from(userDailyChallengesTable)
      .where(and(eq(userDailyChallengesTable.userId, user[0].id), eq(userDailyChallengesTable.challengeId, challenge[0].id)))
      .limit(1);
    isCompleted = done.length > 0;
  }

  res.json({ ...challenge[0], isCompleted });
});

router.post("/daily-challenge/complete", requireAuth, async (req, res) => {
  const { userId } = getAuth(req);
  const user = await db.select().from(usersTable).where(eq(usersTable.clerkId, userId!)).limit(1);
  if (!user[0]) { res.status(404).json({ error: "User not found" }); return; }

  const today = new Date().toISOString().split("T")[0];
  const challenge = await db.select().from(dailyChallengesTable).where(eq(dailyChallengesTable.date, today)).limit(1);
  if (!challenge[0]) { res.status(404).json({ error: "No challenge today" }); return; }

  const { score = 100 } = req.body;
  const xpEarned = Math.round((challenge[0].xpReward * score) / 100);

  await db.insert(userDailyChallengesTable).values({
    userId: user[0].id, challengeId: challenge[0].id, score, completedAt: new Date(),
  });

  await db.update(usersTable).set({ xp: user[0].xp + xpEarned }).where(eq(usersTable.id, user[0].id));

  await db.insert(activityLogTable).values({
    userId: user[0].id, type: "daily_challenge",
    description: `Completed daily challenge: ${challenge[0].title}`, xpEarned,
  });

  res.json({ xpEarned, newBadges: [] });
});

export default router;
