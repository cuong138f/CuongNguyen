import { Router } from "express";
import { getAuth } from "@clerk/express";
import { db, usersTable, lessonsTable, userLessonsTable, activityLogTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "../lib/auth";

const router = Router();

router.get("/", requireAuth, async (req, res) => {
  const { userId } = getAuth(req);
  const user = await db.select().from(usersTable).where(eq(usersTable.clerkId, userId!)).limit(1);

  const { level, category } = req.query;
  let allLessons = await db.select().from(lessonsTable);
  if (level) allLessons = allLessons.filter(l => l.level === level);
  if (category) allLessons = allLessons.filter(l => l.category === category);

  allLessons.sort((a, b) => a.order - b.order);

  if (!user[0]) { res.json(allLessons.map(l => ({ ...l, isCompleted: false }))); return; }

  const completedIds = new Set(
    (await db.select().from(userLessonsTable).where(eq(userLessonsTable.userId, user[0].id)))
      .map(ul => ul.lessonId)
  );

  res.json(allLessons.map(l => ({ ...l, isCompleted: completedIds.has(l.id) })));
});

router.get("/:id", requireAuth, async (req, res) => {
  const { userId } = getAuth(req);
  const user = await db.select().from(usersTable).where(eq(usersTable.clerkId, userId!)).limit(1);

  const lesson = await db.select().from(lessonsTable).where(eq(lessonsTable.id, parseInt(req.params.id))).limit(1);
  if (!lesson[0]) { res.status(404).json({ error: "Lesson not found" }); return; }

  let isCompleted = false;
  if (user[0]) {
    const done = await db.select().from(userLessonsTable)
      .where(and(eq(userLessonsTable.userId, user[0].id), eq(userLessonsTable.lessonId, lesson[0].id)))
      .limit(1);
    isCompleted = done.length > 0;
  }

  res.json({ ...lesson[0], isCompleted });
});

router.post("/:id/complete", requireAuth, async (req, res) => {
  const { userId } = getAuth(req);
  const user = await db.select().from(usersTable).where(eq(usersTable.clerkId, userId!)).limit(1);
  if (!user[0]) { res.status(404).json({ error: "User not found" }); return; }

  const lesson = await db.select().from(lessonsTable).where(eq(lessonsTable.id, parseInt(req.params.id))).limit(1);
  if (!lesson[0]) { res.status(404).json({ error: "Lesson not found" }); return; }

  const { score = 100, timeSpentSeconds = 0 } = req.body;
  const xpEarned = Math.round((lesson[0].xpReward * score) / 100);

  await db.insert(userLessonsTable).values({
    userId: user[0].id, lessonId: lesson[0].id, score, timeSpentSeconds,
    completedAt: new Date(),
  });

  await db.update(usersTable).set({ xp: user[0].xp + xpEarned }).where(eq(usersTable.id, user[0].id));

  await db.insert(activityLogTable).values({
    userId: user[0].id,
    type: "lesson_completed",
    description: `Completed lesson: ${lesson[0].title}`,
    xpEarned,
  });

  res.json({ xpEarned, newLevel: null, newBadges: [], currentStreak: user[0].streak });
});

export default router;
