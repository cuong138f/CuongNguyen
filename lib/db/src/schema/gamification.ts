import { pgTable, text, serial, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const badgesTable = pgTable("badges", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  category: text("category").notNull(), // streak | vocabulary | lessons | speaking | chat | special
  requirement: integer("requirement").notNull().default(1),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertBadgeSchema = createInsertSchema(badgesTable).omit({ id: true, createdAt: true });
export type InsertBadge = z.infer<typeof insertBadgeSchema>;
export type Badge = typeof badgesTable.$inferSelect;

export const userBadgesTable = pgTable("user_badges", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  badgeId: integer("badge_id").notNull(),
  earnedAt: timestamp("earned_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertUserBadgeSchema = createInsertSchema(userBadgesTable).omit({ id: true });
export type InsertUserBadge = z.infer<typeof insertUserBadgeSchema>;
export type UserBadge = typeof userBadgesTable.$inferSelect;

export const dailyChallengesTable = pgTable("daily_challenges", {
  id: serial("id").primaryKey(),
  date: text("date").notNull(), // YYYY-MM-DD
  type: text("type").notNull(), // vocabulary | grammar | speaking | chat | reading
  title: text("title").notNull(),
  description: text("description").notNull(),
  xpReward: integer("xp_reward").notNull().default(50),
  content: text("content"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertDailyChallengeSchema = createInsertSchema(dailyChallengesTable).omit({ id: true, createdAt: true });
export type InsertDailyChallenge = z.infer<typeof insertDailyChallengeSchema>;
export type DailyChallenge = typeof dailyChallengesTable.$inferSelect;

export const userDailyChallengesTable = pgTable("user_daily_challenges", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  challengeId: integer("challenge_id").notNull(),
  score: integer("score").notNull().default(0),
  completedAt: timestamp("completed_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertUserDailyChallengeSchema = createInsertSchema(userDailyChallengesTable).omit({ id: true });
export type InsertUserDailyChallenge = z.infer<typeof insertUserDailyChallengeSchema>;
export type UserDailyChallenge = typeof userDailyChallengesTable.$inferSelect;

export const activityLogTable = pgTable("activity_log", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(),
  description: text("description").notNull(),
  xpEarned: integer("xp_earned").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertActivityLogSchema = createInsertSchema(activityLogTable).omit({ id: true, createdAt: true });
export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;
export type ActivityLog = typeof activityLogTable.$inferSelect;
