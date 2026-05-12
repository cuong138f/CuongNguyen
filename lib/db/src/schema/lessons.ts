import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const lessonsTable = pgTable("lessons", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  level: text("level").notNull().default("beginner"), // beginner | intermediate | advanced
  category: text("category").notNull(),
  xpReward: integer("xp_reward").notNull().default(50),
  estimatedMinutes: integer("estimated_minutes").notNull().default(10),
  order: integer("order").notNull().default(0),
  coverEmoji: text("cover_emoji"),
  content: text("content").notNull().default(""),
  exercises: json("exercises").$type<Exercise[]>().notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Exercise = {
  id: number;
  type: "multiple_choice" | "fill_blank" | "translation" | "reorder";
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
};

export const insertLessonSchema = createInsertSchema(lessonsTable).omit({ id: true, createdAt: true });
export type InsertLesson = z.infer<typeof insertLessonSchema>;
export type Lesson = typeof lessonsTable.$inferSelect;

export const userLessonsTable = pgTable("user_lessons", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  lessonId: integer("lesson_id").notNull(),
  score: integer("score").notNull().default(0),
  timeSpentSeconds: integer("time_spent_seconds").notNull().default(0),
  completedAt: timestamp("completed_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertUserLessonSchema = createInsertSchema(userLessonsTable).omit({ id: true });
export type InsertUserLesson = z.infer<typeof insertUserLessonSchema>;
export type UserLesson = typeof userLessonsTable.$inferSelect;
