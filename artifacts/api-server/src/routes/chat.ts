import { Router } from "express";
import { db, chatSessionsTable, chatMessagesTable, activityLogTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { getGuestUser } from "../lib/auth";

const router = Router();

const MOCK_RESPONSES = [
  {
    content: "That's a great effort! Your English is improving. Let me help you with a few corrections.",
    errors: [{ original: "I goed to store", corrected: "I went to the store", explanation: "Use the past tense 'went' instead of 'goed'.", explanationVi: "Dùng thì quá khứ 'went' thay vì 'goed'. 'Go' là động từ bất quy tắc." }],
    suggestions: ["Could you tell me more about what you bought?", "What time did you go to the store?", "Do you enjoy shopping?"],
  },
  {
    content: "Excellent! You expressed yourself very clearly. Here are some ways to make it sound even more natural.",
    errors: [],
    suggestions: ["Can you describe the experience in more detail?", "How did that make you feel?", "What would you do differently next time?"],
  },
  {
    content: "Good attempt! I noticed a few grammar points we can work on together.",
    errors: [{ original: "She don't like", corrected: "She doesn't like", explanation: "With third person singular (she/he/it), use 'doesn't'.", explanationVi: "Với ngôi thứ ba số ít (she/he/it), dùng 'doesn't' thay vì 'don't'." }],
    suggestions: ["Tell me more about this person.", "What does she like instead?", "How long have you known her?"],
  },
];

router.get("/sessions", async (req, res) => {
  const user = await getGuestUser();
  const sessions = await db.select().from(chatSessionsTable)
    .where(eq(chatSessionsTable.userId, user.id));
  res.json(sessions);
});

router.post("/sessions", async (req, res) => {
  const user = await getGuestUser();
  const { topic } = req.body;
  const [session] = await db.insert(chatSessionsTable).values({
    userId: user.id, topic, messageCount: 0,
  }).returning();
  res.status(201).json(session);
});

router.get("/sessions/:id/messages", async (req, res) => {
  const messages = await db.select().from(chatMessagesTable)
    .where(eq(chatMessagesTable.sessionId, parseInt(req.params.id)));
  res.json(messages);
});

router.post("/sessions/:id/messages", async (req, res) => {
  const user = await getGuestUser();
  const sessionId = parseInt(req.params.id);
  const { content } = req.body;

  const mock = MOCK_RESPONSES[Math.floor(Math.random() * MOCK_RESPONSES.length)];

  const [userMsg] = await db.insert(chatMessagesTable).values({
    sessionId, role: "user", content,
    grammarErrors: mock.errors.length > 0 ? mock.errors : null,
    suggestions: null,
  }).returning();

  const [aiMsg] = await db.insert(chatMessagesTable).values({
    sessionId, role: "assistant", content: mock.content,
    grammarErrors: null,
    suggestions: mock.suggestions,
  }).returning();

  await db.update(chatSessionsTable)
    .set({ messageCount: (await db.select().from(chatMessagesTable).where(eq(chatMessagesTable.sessionId, sessionId))).length })
    .where(eq(chatSessionsTable.id, sessionId));

  await db.insert(activityLogTable).values({
    userId: user.id, type: "chat_session",
    description: "Practiced English in AI chat", xpEarned: 5,
  });

  res.json({ userMessage: userMsg, assistantMessage: aiMsg });
});

export default router;
