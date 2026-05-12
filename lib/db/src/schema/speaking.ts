import { pgTable, text, serial, integer, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export type PhonemeError = {
  word: string;
  expected: string;
  got: string;
};

export const speakingSessionsTable = pgTable("speaking_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  targetText: text("target_text").notNull(),
  transcription: text("transcription"),
  score: integer("score"),
  feedback: text("feedback"),
  phonemeErrors: json("phoneme_errors").$type<PhonemeError[]>(),
  suggestions: json("suggestions").$type<string[]>(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertSpeakingSessionSchema = createInsertSchema(speakingSessionsTable).omit({ id: true, createdAt: true });
export type InsertSpeakingSession = z.infer<typeof insertSpeakingSessionSchema>;
export type SpeakingSession = typeof speakingSessionsTable.$inferSelect;
