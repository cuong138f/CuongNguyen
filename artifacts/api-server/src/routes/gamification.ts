import { Router } from "express";
import { db, usersTable, badgesTable, userBadgesTable, dailyChallengesTable, userDailyChallengesTable, activityLogTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { getGuestUser } from "../lib/auth";

const router = Router();

router.get("/badges", async (req, res) => {
  const user = await getGuestUser();
  const allBadges = await db.select().from(badgesTable);
  const earned = await db.select().from(userBadgesTable).where(eq(userBadgesTable.userId, user.id));
  const earnedMap = new Map(earned.map(e => [e.badgeId, e.earnedAt]));

  res.json(allBadges.map(b => ({
    ...b,
    isEarned: earnedMap.has(b.id),
    earnedAt: earnedMap.get(b.id) ?? null,
  })));
});

router.get("/daily-challenge", async (req, res) => {
  const user = await getGuestUser();
  const today = new Date().toISOString().split("T")[0];
  let challenge = await db.select().from(dailyChallengesTable)
    .where(eq(dailyChallengesTable.date, today)).limit(1);

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

  const done = await db.select().from(userDailyChallengesTable)
    .where(and(
      eq(userDailyChallengesTable.userId, user.id),
      eq(userDailyChallengesTable.challengeId, challenge[0].id)
    ))
    .limit(1);

  res.json({ ...challenge[0], isCompleted: done.length > 0 });
});

router.post("/daily-challenge/complete", async (req, res) => {
  const user = await getGuestUser();
  const today = new Date().toISOString().split("T")[0];
  const challenge = await db.select().from(dailyChallengesTable)
    .where(eq(dailyChallengesTable.date, today)).limit(1);
  if (!challenge[0]) { res.status(404).json({ error: "No challenge today" }); return; }

  const { score = 100 } = req.body;
  const xpEarned = Math.round((challenge[0].xpReward * score) / 100);

  await db.insert(userDailyChallengesTable).values({
    userId: user.id, challengeId: challenge[0].id, score, completedAt: new Date(),
  });

  await db.update(usersTable).set({ xp: user.xp + xpEarned }).where(eq(usersTable.id, user.id));

  await db.insert(activityLogTable).values({
    userId: user.id, type: "daily_challenge",
    description: `Completed daily challenge: ${challenge[0].title}`, xpEarned,
  });

  res.json({ xpEarned, newBadges: [] });
});

export default router;
