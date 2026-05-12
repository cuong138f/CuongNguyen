import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const vocabularyTable = pgTable("vocabulary", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  word: text("word").notNull(),
  definition: text("definition").notNull(),
  partOfSpeech: text("part_of_speech").notNull().default("noun"),
  exampleSentence: text("example_sentence"),
  pronunciation: text("pronunciation"),
  status: text("status").notNull().default("new"), // new | learning | mastered | difficult
  reviewCount: integer("review_count").notNull().default(0),
  easeFactor: integer("ease_factor").notNull().default(250), // SM-2 ease factor * 100
  interval: integer("interval").notNull().default(1), // days
  nextReviewAt: timestamp("next_review_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertVocabularySchema = createInsertSchema(vocabularyTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertVocabulary = z.infer<typeof insertVocabularySchema>;
export type Vocabulary = typeof vocabularyTable.$inferSelect;
