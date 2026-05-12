import { Router } from "express";
import { db, usersTable, lessonsTable, userLessonsTable, activityLogTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { getGuestUser } from "../lib/auth";

const router = Router();

router.get("/", async (req, res) => {
  const user = await getGuestUser();
  const { level, category } = req.query;
  let allLessons = await db.select().from(lessonsTable);
  if (level) allLessons = allLessons.filter(l => l.level === level);
  if (category) allLessons = allLessons.filter(l => l.category === category);
  allLessons.sort((a, b) => a.order - b.order);

  const completedIds = new Set(
    (await db.select().from(userLessonsTable).where(eq(userLessonsTable.userId, user.id)))
      .map(ul => ul.lessonId)
  );

  res.json(allLessons.map(l => ({ ...l, isCompleted: completedIds.has(l.id) })));
});

router.get("/:id", async (req, res) => {
  const user = await getGuestUser();
  const lesson = await db.select().from(lessonsTable)
    .where(eq(lessonsTable.id, parseInt(req.params.id))).limit(1);
  if (!lesson[0]) { res.status(404).json({ error: "Lesson not found" }); return; }

  const done = await db.select().from(userLessonsTable)
    .where(and(eq(userLessonsTable.userId, user.id), eq(userLessonsTable.lessonId, lesson[0].id)))
    .limit(1);

  res.json({ ...lesson[0], isCompleted: done.length > 0 });
});

router.post("/:id/complete", async (req, res) => {
  const user = await getGuestUser();
  const lesson = await db.select().from(lessonsTable)
    .where(eq(lessonsTable.id, parseInt(req.params.id))).limit(1);
  if (!lesson[0]) { res.status(404).json({ error: "Lesson not found" }); return; }

  const { score = 100, timeSpentSeconds = 0 } = req.body;
  const xpEarned = Math.round((lesson[0].xpReward * score) / 100);

  await db.insert(userLessonsTable).values({
    userId: user.id, lessonId: lesson[0].id, score, timeSpentSeconds,
    completedAt: new Date(),
  });

  await db.update(usersTable)
    .set({ xp: user.xp + xpEarned })
    .where(eq(usersTable.id, user.id));

  await db.insert(activityLogTable).values({
    userId: user.id,
    type: "lesson_completed",
    description: `Completed lesson: ${lesson[0].title}`,
    xpEarned,
  });

  res.json({ xpEarned, newLevel: null, newBadges: [], currentStreak: user.streak });
});

export default router;
