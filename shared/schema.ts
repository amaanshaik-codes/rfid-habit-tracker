import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const habits = pgTable("habits", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  icon: text("icon").notNull().default("fas fa-circle"),
  color: text("color").notNull().default("#007AFF"),
  dailyGoalMinutes: integer("daily_goal_minutes").default(60),
  checkoutEnabled: boolean("checkout_enabled").notNull().default(true),
  userId: integer("user_id").notNull(),
});

export const rfidCards = pgTable("rfid_cards", {
  id: serial("id").primaryKey(),
  cardId: text("card_id").notNull().unique(),
  habitId: integer("habit_id").notNull(),
  userId: integer("user_id").notNull(),
});

export const habitEntries = pgTable("habit_entries", {
  id: serial("id").primaryKey(),
  date: text("date").notNull(), // YYYY-MM-DD format
  time: text("time").notNull(), // HH:MM:SS format
  cardId: text("card_id").notNull(),
  habitName: text("habit_name").notNull(),
  action: text("action").notNull(), // "Check-in" or "Check-out"
  duration: integer("duration"), // in minutes, only for check-out
  device: text("device"),
  notes: text("notes"),
  voiceNoteUrl: text("voice_note_url"), // URL to stored voice note
  userId: integer("user_id").notNull(),
});

export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  googleSheetsUrl: text("google_sheets_url"),
  autoSync: boolean("auto_sync").notNull().default(true),
  idleReminders: boolean("idle_reminders").notNull().default(false),
  checkoutMode: boolean("checkout_mode").notNull().default(true),
});

export const insertHabitSchema = createInsertSchema(habits).omit({
  id: true,
  userId: true,
});

export const insertRfidCardSchema = createInsertSchema(rfidCards).omit({
  id: true,
  userId: true,
});

export const insertHabitEntrySchema = createInsertSchema(habitEntries).omit({
  id: true,
  userId: true,
});

export const insertSettingsSchema = createInsertSchema(settings).omit({
  id: true,
  userId: true,
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertHabit = z.infer<typeof insertHabitSchema>;
export type InsertRfidCard = z.infer<typeof insertRfidCardSchema>;
export type InsertHabitEntry = z.infer<typeof insertHabitEntrySchema>;
export type InsertSettings = z.infer<typeof insertSettingsSchema>;

export type User = typeof users.$inferSelect;
export type Habit = typeof habits.$inferSelect;
export type RfidCard = typeof rfidCards.$inferSelect;
export type HabitEntry = typeof habitEntries.$inferSelect;
export type Settings = typeof settings.$inferSelect;

// Helper types for frontend
export interface HabitWithCards extends Habit {
  cards: RfidCard[];
}

export interface HabitSummary {
  habitId: number;
  habitName: string;
  icon: string;
  color: string;
  totalMinutes: number;
  streak: number;
  isActive: boolean;
  activeSessionStart?: string;
}

export interface DailyProgress {
  date: string;
  habits: {
    habitId: number;
    habitName: string;
    totalMinutes: number;
    sessions: number;
  }[];
}
