import { Router } from "express";
import { getAuth } from "@clerk/express";
import { db, usersTable, vocabularyTable } from "@workspace/db";
import { eq, and, lt } from "drizzle-orm";
import { requireAuth } from "../lib/auth";

const router = Router();

function sm2(easeFactor: number, interval: number, quality: number) {
  const newEf = Math.max(130, easeFactor + (10 * (3 - quality) * (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))));
  let newInterval = quality < 3 ? 1 : interval === 1 ? 6 : Math.round(interval * (newEf / 100));
  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + newInterval);
  const status = quality >= 4 ? "mastered" : quality >= 2 ? "learning" : "difficult";
  return { easeFactor: Math.round(newEf), interval: newInterval, nextReviewAt: nextReview, status };
}

router.get("/", requireAuth, async (req, res) => {
  const { userId } = getAuth(req);
  const user = await db.select().from(usersTable).where(eq(usersTable.clerkId, userId!)).limit(1);
  if (!user[0]) { res.json([]); return; }

  const { status, limit = "50", offset = "0" } = req.query;
  let query = db.select().from(vocabularyTable).where(eq(vocabularyTable.userId, user[0].id));
  const words = await db.select().from(vocabularyTable)
    .where(and(
      eq(vocabularyTable.userId, user[0].id),
      ...(status ? [eq(vocabularyTable.status, status as string)] : [])
    ))
    .limit(parseInt(limit as string))
    .offset(parseInt(offset as string));
  res.json(words);
});

router.post("/", requireAuth, async (req, res) => {
  const { userId } = getAuth(req);
  const user = await db.select().from(usersTable).where(eq(usersTable.clerkId, userId!)).limit(1);
  if (!user[0]) { res.status(404).json({ error: "User not found" }); return; }

  const { word, definition, partOfSpeech = "noun", exampleSentence, pronunciation } = req.body;
  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + 1);

  const [created] = await db.insert(vocabularyTable).values({
    userId: user[0].id, word, definition, partOfSpeech, exampleSentence, pronunciation,
    status: "new", reviewCount: 0, easeFactor: 250, interval: 1, nextReviewAt: nextReview,
  }).returning();
  res.status(201).json(created);
});

router.patch("/:id", requireAuth, async (req, res) => {
  const { userId } = getAuth(req);
  const user = await db.select().from(usersTable).where(eq(usersTable.clerkId, userId!)).limit(1);
  if (!user[0]) { res.status(404).json({ error: "User not found" }); return; }

  const { status, definition, exampleSentence } = req.body;
  const [updated] = await db.update(vocabularyTable)
    .set({ ...(status && { status }), ...(definition && { definition }), ...(exampleSentence && { exampleSentence }) })
    .where(and(eq(vocabularyTable.id, parseInt(req.params.id)), eq(vocabularyTable.userId, user[0].id)))
    .returning();
  res.json(updated);
});

router.delete("/:id", requireAuth, async (req, res) => {
  const { userId } = getAuth(req);
  const user = await db.select().from(usersTable).where(eq(usersTable.clerkId, userId!)).limit(1);
  if (!user[0]) { res.status(404).json({ error: "User not found" }); return; }

  await db.delete(vocabularyTable)
    .where(and(eq(vocabularyTable.id, parseInt(req.params.id)), eq(vocabularyTable.userId, user[0].id)));
  res.status(204).send();
});

router.get("/quiz", requireAuth, async (req, res) => {
  const { userId } = getAuth(req);
  const user = await db.select().from(usersTable).where(eq(usersTable.clerkId, userId!)).limit(1);
  if (!user[0]) { res.json([]); return; }

  const limit = parseInt(req.query.limit as string) || 10;
  const now = new Date();
  const due = await db.select().from(vocabularyTable)
    .where(and(eq(vocabularyTable.userId, user[0].id), lt(vocabularyTable.nextReviewAt, now)))
    .limit(limit);
  res.json(due);
});

router.post("/:id/review", requireAuth, async (req, res) => {
  const { userId } = getAuth(req);
  const user = await db.select().from(usersTable).where(eq(usersTable.clerkId, userId!)).limit(1);
  if (!user[0]) { res.status(404).json({ error: "User not found" }); return; }

  const word = await db.select().from(vocabularyTable)
    .where(and(eq(vocabularyTable.id, parseInt(req.params.id)), eq(vocabularyTable.userId, user[0].id)))
    .limit(1);
  if (!word[0]) { res.status(404).json({ error: "Word not found" }); return; }

  const { quality } = req.body;
  const { easeFactor, interval, nextReviewAt, status } = sm2(word[0].easeFactor, word[0].interval, quality);

  const [updated] = await db.update(vocabularyTable)
    .set({ easeFactor, interval, nextReviewAt, status, reviewCount: word[0].reviewCount + 1 })
    .where(eq(vocabularyTable.id, word[0].id))
    .returning();
  res.json(updated);
});

export default router;
