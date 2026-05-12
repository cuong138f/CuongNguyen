import { Router } from "express";
import { db, speakingSessionsTable, activityLogTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { getGuestUser } from "../lib/auth";

const router = Router();

function scorePronunciation(target: string, transcript: string) {
  const targetWords = target.toLowerCase().split(/\s+/);
  const transcriptWords = transcript.toLowerCase().split(/\s+/);
  let correct = 0;
  const errors: { word: string; expected: string; got: string }[] = [];

  targetWords.forEach((word, i) => {
    const spoken = transcriptWords[i] ?? "";
    if (word === spoken) {
      correct++;
    } else {
      errors.push({ word, expected: word, got: spoken || "(skipped)" });
    }
  });

  const score = Math.round((correct / targetWords.length) * 100);
  return { score, errors };
}

router.get("/sessions", async (req, res) => {
  const user = await getGuestUser();
  const sessions = await db.select().from(speakingSessionsTable)
    .where(eq(speakingSessionsTable.userId, user.id));
  res.json(sessions);
});

router.post("/sessions", async (req, res) => {
  const user = await getGuestUser();
  const { targetText } = req.body;
  const [session] = await db.insert(speakingSessionsTable).values({
    userId: user.id, targetText,
  }).returning();
  res.status(201).json(session);
});

router.post("/sessions/:id/submit", async (req, res) => {
  const user = await getGuestUser();
  const session = await db.select().from(speakingSessionsTable)
    .where(eq(speakingSessionsTable.id, parseInt(req.params.id))).limit(1);
  if (!session[0]) { res.status(404).json({ error: "Session not found" }); return; }

  const { transcription } = req.body;
  const { score, errors } = scorePronunciation(session[0].targetText, transcription);

  const feedback = score >= 90 ? "Excellent pronunciation! You sound very natural." :
    score >= 70 ? "Good job! A few words need more practice." :
    "Keep practicing — focus on the highlighted words.";

  const suggestions = ["Listen to native speakers and mimic their rhythm.", "Practice slow pronunciation first, then speed up.", "Record yourself and compare with the original."];

  await db.update(speakingSessionsTable)
    .set({ transcription, score, feedback, phonemeErrors: errors, suggestions })
    .where(eq(speakingSessionsTable.id, session[0].id));

  await db.insert(activityLogTable).values({
    userId: user.id, type: "speaking_session",
    description: "Completed a speaking practice session", xpEarned: 10,
  });

  res.json({ score, feedback, phonemeErrors: errors, suggestions });
});

export default router;
