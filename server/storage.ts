import { 
  users, habits, rfidCards, habitEntries, settings,
  type User, type Habit, type RfidCard, type HabitEntry, type Settings,
  type InsertUser, type InsertHabit, type InsertRfidCard, type InsertHabitEntry, type InsertSettings,
  type HabitWithCards, type HabitSummary, type DailyProgress
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Habit methods
  getHabits(userId: number): Promise<Habit[]>;
  getHabitsWithCards(userId: number): Promise<HabitWithCards[]>;
  createHabit(habit: InsertHabit): Promise<Habit>;
  updateHabit(id: number, habit: Partial<InsertHabit>): Promise<Habit | undefined>;
  deleteHabit(id: number): Promise<boolean>;

  // RFID Card methods
  getRfidCards(userId: number): Promise<RfidCard[]>;
  getRfidCardByCardId(cardId: string): Promise<RfidCard | undefined>;
  createRfidCard(card: InsertRfidCard): Promise<RfidCard>;
  updateRfidCard(id: number, card: Partial<InsertRfidCard>): Promise<RfidCard | undefined>;
  deleteRfidCard(id: number): Promise<boolean>;

  // Habit Entry methods
  getHabitEntries(userId: number, limit?: number): Promise<HabitEntry[]>;
  getHabitEntriesForDate(userId: number, date: string): Promise<HabitEntry[]>;
  getHabitEntriesForDateRange(userId: number, startDate: string, endDate: string): Promise<HabitEntry[]>;
  createHabitEntry(entry: InsertHabitEntry): Promise<HabitEntry>;
  
  // Analytics methods
  getHabitSummaries(userId: number): Promise<HabitSummary[]>;
  getDailyProgress(userId: number, days: number): Promise<DailyProgress[]>;
  getWeeklyProgress(userId: number): Promise<{ habitId: number; habitName: string; totalMinutes: number; color: string }[]>;

  // Settings methods
  getSettings(userId: number): Promise<Settings | undefined>;
  updateSettings(userId: number, settings: Partial<InsertSettings>): Promise<Settings>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private habits: Map<number, Habit>;
  private rfidCards: Map<number, RfidCard>;
  private habitEntries: Map<number, HabitEntry>;
  private settings: Map<number, Settings>;
  private currentId: number;

  constructor() {
    this.users = new Map();
    this.habits = new Map();
    this.rfidCards = new Map();
    this.habitEntries = new Map();
    this.settings = new Map();
    this.currentId = 1;

    // Initialize with a default user and some sample data
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Create default user
    const defaultUser: User = {
      id: 1,
      username: "amaan",
      password: "password123"
    };
    this.users.set(1, defaultUser);

    // Create default habits
    const studyHabit: Habit = {
      id: 1,
      name: "Study",
      icon: "fas fa-book",
      color: "#007AFF",
      dailyGoalMinutes: 180,
      checkoutEnabled: true,
      userId: 1
    };

    const exerciseHabit: Habit = {
      id: 2,
      name: "Exercise",
      icon: "fas fa-dumbbell",
      color: "#30D158",
      dailyGoalMinutes: 60,
      checkoutEnabled: true,
      userId: 1
    };

    const waterHabit: Habit = {
      id: 3,
      name: "Water",
      icon: "fas fa-glass-water",
      color: "#FF9F0A",
      dailyGoalMinutes: 0,
      checkoutEnabled: false,
      userId: 1
    };

    this.habits.set(1, studyHabit);
    this.habits.set(2, exerciseHabit);
    this.habits.set(3, waterHabit);

    // Create default RFID cards
    const studyCard: RfidCard = {
      id: 1,
      cardId: "A1B2C3D4",
      habitId: 1,
      userId: 1
    };

    const exerciseCard: RfidCard = {
      id: 2,
      cardId: "E5F6G7H8",
      habitId: 2,
      userId: 1
    };

    const waterCard: RfidCard = {
      id: 3,
      cardId: "I9J0K1L2",
      habitId: 3,
      userId: 1
    };

    this.rfidCards.set(1, studyCard);
    this.rfidCards.set(2, exerciseCard);
    this.rfidCards.set(3, waterCard);

    // Create default settings
    const defaultSettings: Settings = {
      id: 1,
      userId: 1,
      googleSheetsUrl: null,
      autoSync: true,
      idleReminders: false,
      checkoutMode: true
    };
    this.settings.set(1, defaultSettings);

    this.currentId = 4;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getHabits(userId: number): Promise<Habit[]> {
    return Array.from(this.habits.values()).filter(habit => habit.userId === userId);
  }

  async getHabitsWithCards(userId: number): Promise<HabitWithCards[]> {
    const userHabits = await this.getHabits(userId);
    const userCards = await this.getRfidCards(userId);
    
    return userHabits.map(habit => ({
      ...habit,
      cards: userCards.filter(card => card.habitId === habit.id)
    }));
  }

  async createHabit(insertHabit: InsertHabit): Promise<Habit> {
    const id = this.currentId++;
    const habit: Habit = { ...insertHabit, id, userId: insertHabit.userId || 1 };
    this.habits.set(id, habit);
    return habit;
  }

  async updateHabit(id: number, updateData: Partial<InsertHabit>): Promise<Habit | undefined> {
    const habit = this.habits.get(id);
    if (!habit) return undefined;
    
    const updatedHabit = { ...habit, ...updateData };
    this.habits.set(id, updatedHabit);
    return updatedHabit;
  }

  async deleteHabit(id: number): Promise<boolean> {
    return this.habits.delete(id);
  }

  async getRfidCards(userId: number): Promise<RfidCard[]> {
    return Array.from(this.rfidCards.values()).filter(card => card.userId === userId);
  }

  async getRfidCardByCardId(cardId: string): Promise<RfidCard | undefined> {
    return Array.from(this.rfidCards.values()).find(card => card.cardId === cardId);
  }

  async createRfidCard(insertCard: InsertRfidCard): Promise<RfidCard> {
    const id = this.currentId++;
    const card: RfidCard = { ...insertCard, id };
    this.rfidCards.set(id, card);
    return card;
  }

  async updateRfidCard(id: number, updateData: Partial<InsertRfidCard>): Promise<RfidCard | undefined> {
    const card = this.rfidCards.get(id);
    if (!card) return undefined;
    
    const updatedCard = { ...card, ...updateData };
    this.rfidCards.set(id, updatedCard);
    return updatedCard;
  }

  async deleteRfidCard(id: number): Promise<boolean> {
    return this.rfidCards.delete(id);
  }

  async getHabitEntries(userId: number, limit: number = 50): Promise<HabitEntry[]> {
    return Array.from(this.habitEntries.values())
      .filter(entry => entry.userId === userId)
      .sort((a, b) => {
        const dateTimeA = `${a.date} ${a.time}`;
        const dateTimeB = `${b.date} ${b.time}`;
        return dateTimeB.localeCompare(dateTimeA);
      })
      .slice(0, limit);
  }

  async getHabitEntriesForDate(userId: number, date: string): Promise<HabitEntry[]> {
    return Array.from(this.habitEntries.values())
      .filter(entry => entry.userId === userId && entry.date === date)
      .sort((a, b) => a.time.localeCompare(b.time));
  }

  async getHabitEntriesForDateRange(userId: number, startDate: string, endDate: string): Promise<HabitEntry[]> {
    return Array.from(this.habitEntries.values())
      .filter(entry => 
        entry.userId === userId && 
        entry.date >= startDate && 
        entry.date <= endDate
      )
      .sort((a, b) => {
        const dateTimeA = `${a.date} ${a.time}`;
        const dateTimeB = `${b.date} ${b.time}`;
        return dateTimeA.localeCompare(dateTimeB);
      });
  }

  async createHabitEntry(insertEntry: InsertHabitEntry): Promise<HabitEntry> {
    const id = this.currentId++;
    const entry: HabitEntry = { ...insertEntry, id };
    this.habitEntries.set(id, entry);
    return entry;
  }

  async getHabitSummaries(userId: number): Promise<HabitSummary[]> {
    const habits = await this.getHabits(userId);
    const today = new Date().toISOString().split('T')[0];
    const todayEntries = await this.getHabitEntriesForDate(userId, today);
    
    return habits.map(habit => {
      const habitEntries = todayEntries.filter(entry => entry.habitName === habit.name);
      const checkIns = habitEntries.filter(entry => entry.action === "Check-in");
      const checkOuts = habitEntries.filter(entry => entry.action === "Check-out");
      
      let totalMinutes = 0;
      let isActive = false;
      let activeSessionStart: string | undefined;

      // Calculate total minutes and check if currently active
      if (habit.checkoutEnabled) {
        totalMinutes = checkOuts.reduce((sum, entry) => sum + (entry.duration || 0), 0);
        isActive = checkIns.length > checkOuts.length;
        if (isActive && checkIns.length > 0) {
          activeSessionStart = checkIns[checkIns.length - 1].time;
        }
      } else {
        totalMinutes = checkIns.length * 5; // Assume 5 minutes per tap for non-checkout habits
      }

      return {
        habitId: habit.id,
        habitName: habit.name,
        icon: habit.icon,
        color: habit.color,
        totalMinutes,
        streak: this.calculateStreak(userId, habit.name),
        isActive,
        activeSessionStart
      };
    });
  }

  private calculateStreak(userId: number, habitName: string): number {
    // Simple streak calculation - count consecutive days with entries
    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < 30; i++) { // Check last 30 days
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];
      
      const dayEntries = Array.from(this.habitEntries.values())
        .filter(entry => 
          entry.userId === userId && 
          entry.habitName === habitName && 
          entry.date === dateStr
        );
      
      if (dayEntries.length > 0) {
        streak++;
      } else if (i > 0) { // Don't break on today if no entries yet
        break;
      }
    }
    
    return streak;
  }

  async getDailyProgress(userId: number, days: number): Promise<DailyProgress[]> {
    const result: DailyProgress[] = [];
    const today = new Date();
    
    for (let i = 0; i < days; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];
      
      const dayEntries = await this.getHabitEntriesForDate(userId, dateStr);
      const habits = await this.getHabits(userId);
      
      const habitProgress = habits.map(habit => {
        const habitEntries = dayEntries.filter(entry => entry.habitName === habit.name);
        let totalMinutes = 0;
        
        if (habit.checkoutEnabled) {
          totalMinutes = habitEntries
            .filter(entry => entry.action === "Check-out")
            .reduce((sum, entry) => sum + (entry.duration || 0), 0);
        } else {
          totalMinutes = habitEntries.filter(entry => entry.action === "Check-in").length * 5;
        }
        
        return {
          habitId: habit.id,
          habitName: habit.name,
          totalMinutes,
          sessions: habitEntries.filter(entry => entry.action === "Check-in").length
        };
      });
      
      result.push({
        date: dateStr,
        habits: habitProgress
      });
    }
    
    return result.reverse(); // Return in chronological order
  }

  async getWeeklyProgress(userId: number): Promise<{ habitId: number; habitName: string; totalMinutes: number; color: string }[]> {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Start of week (Sunday)
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6); // End of week (Saturday)
    
    const startDate = weekStart.toISOString().split('T')[0];
    const endDate = weekEnd.toISOString().split('T')[0];
    
    const weekEntries = await this.getHabitEntriesForDateRange(userId, startDate, endDate);
    const habits = await this.getHabits(userId);
    
    return habits.map(habit => {
      const habitEntries = weekEntries.filter(entry => entry.habitName === habit.name);
      let totalMinutes = 0;
      
      if (habit.checkoutEnabled) {
        totalMinutes = habitEntries
          .filter(entry => entry.action === "Check-out")
          .reduce((sum, entry) => sum + (entry.duration || 0), 0);
      } else {
        totalMinutes = habitEntries.filter(entry => entry.action === "Check-in").length * 5;
      }
      
      return {
        habitId: habit.id,
        habitName: habit.name,
        totalMinutes,
        color: habit.color
      };
    });
  }

  async getSettings(userId: number): Promise<Settings | undefined> {
    return Array.from(this.settings.values()).find(setting => setting.userId === userId);
  }

  async updateSettings(userId: number, updateData: Partial<InsertSettings>): Promise<Settings> {
    let settings = await this.getSettings(userId);
    
    if (!settings) {
      const id = this.currentId++;
      settings = { ...updateData, id, userId } as Settings;
      this.settings.set(id, settings);
    } else {
      const updatedSettings = { ...settings, ...updateData };
      this.settings.set(settings.id, updatedSettings);
      settings = updatedSettings;
    }
    
    return settings;
  }
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getHabits(userId: number): Promise<Habit[]> {
    return await db.select().from(habits).where(eq(habits.userId, userId));
  }

  async getHabitsWithCards(userId: number): Promise<HabitWithCards[]> {
    const userHabits = await this.getHabits(userId);
    const userCards = await this.getRfidCards(userId);
    
    return userHabits.map(habit => ({
      ...habit,
      cards: userCards.filter(card => card.habitId === habit.id)
    }));
  }

  async createHabit(insertHabit: InsertHabit): Promise<Habit> {
    const [habit] = await db
      .insert(habits)
      .values(insertHabit)
      .returning();
    return habit;
  }

  async updateHabit(id: number, updateData: Partial<InsertHabit>): Promise<Habit | undefined> {
    const [habit] = await db
      .update(habits)
      .set(updateData)
      .where(eq(habits.id, id))
      .returning();
    return habit || undefined;
  }

  async deleteHabit(id: number): Promise<boolean> {
    const result = await db.delete(habits).where(eq(habits.id, id));
    return result.rowCount > 0;
  }

  async getRfidCards(userId: number): Promise<RfidCard[]> {
    return await db.select().from(rfidCards).where(eq(rfidCards.userId, userId));
  }

  async getRfidCardByCardId(cardId: string): Promise<RfidCard | undefined> {
    const [card] = await db.select().from(rfidCards).where(eq(rfidCards.cardId, cardId));
    return card || undefined;
  }

  async createRfidCard(insertCard: InsertRfidCard): Promise<RfidCard> {
    const [card] = await db
      .insert(rfidCards)
      .values(insertCard)
      .returning();
    return card;
  }

  async updateRfidCard(id: number, updateData: Partial<InsertRfidCard>): Promise<RfidCard | undefined> {
    const [card] = await db
      .update(rfidCards)
      .set(updateData)
      .where(eq(rfidCards.id, id))
      .returning();
    return card || undefined;
  }

  async deleteRfidCard(id: number): Promise<boolean> {
    const result = await db.delete(rfidCards).where(eq(rfidCards.id, id));
    return result.rowCount > 0;
  }

  async getHabitEntries(userId: number, limit: number = 50): Promise<HabitEntry[]> {
    return await db
      .select()
      .from(habitEntries)
      .where(eq(habitEntries.userId, userId))
      .orderBy(desc(habitEntries.date), desc(habitEntries.time))
      .limit(limit);
  }

  async getHabitEntriesForDate(userId: number, date: string): Promise<HabitEntry[]> {
    return await db
      .select()
      .from(habitEntries)
      .where(and(eq(habitEntries.userId, userId), eq(habitEntries.date, date)))
      .orderBy(habitEntries.time);
  }

  async getHabitEntriesForDateRange(userId: number, startDate: string, endDate: string): Promise<HabitEntry[]> {
    return await db
      .select()
      .from(habitEntries)
      .where(
        and(
          eq(habitEntries.userId, userId),
          gte(habitEntries.date, startDate),
          lte(habitEntries.date, endDate)
        )
      )
      .orderBy(habitEntries.date, habitEntries.time);
  }

  async createHabitEntry(insertEntry: InsertHabitEntry): Promise<HabitEntry> {
    const [entry] = await db
      .insert(habitEntries)
      .values(insertEntry)
      .returning();
    return entry;
  }

  async getHabitSummaries(userId: number): Promise<HabitSummary[]> {
    const userHabits = await this.getHabits(userId);
    const today = new Date().toISOString().split('T')[0];
    const todayEntries = await this.getHabitEntriesForDate(userId, today);
    
    return userHabits.map(habit => {
      const habitEntries = todayEntries.filter(entry => entry.habitName === habit.name);
      const checkIns = habitEntries.filter(entry => entry.action === "Check-in");
      const checkOuts = habitEntries.filter(entry => entry.action === "Check-out");
      
      let totalMinutes = 0;
      let isActive = false;
      let activeSessionStart: string | undefined;

      if (habit.checkoutEnabled) {
        totalMinutes = checkOuts.reduce((sum, entry) => sum + (entry.duration || 0), 0);
        isActive = checkIns.length > checkOuts.length;
        if (isActive && checkIns.length > 0) {
          activeSessionStart = checkIns[checkIns.length - 1].time;
        }
      } else {
        totalMinutes = checkIns.length * 5;
      }

      return {
        habitId: habit.id,
        habitName: habit.name,
        icon: habit.icon,
        color: habit.color,
        totalMinutes,
        streak: 0, // Will implement streak calculation separately
        isActive,
        activeSessionStart
      };
    });
  }

  async getDailyProgress(userId: number, days: number): Promise<DailyProgress[]> {
    const result: DailyProgress[] = [];
    const today = new Date();
    
    for (let i = 0; i < days; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];
      
      const dayEntries = await this.getHabitEntriesForDate(userId, dateStr);
      const userHabits = await this.getHabits(userId);
      
      const habitProgress = userHabits.map(habit => {
        const habitEntries = dayEntries.filter(entry => entry.habitName === habit.name);
        let totalMinutes = 0;
        
        if (habit.checkoutEnabled) {
          totalMinutes = habitEntries
            .filter(entry => entry.action === "Check-out")
            .reduce((sum, entry) => sum + (entry.duration || 0), 0);
        } else {
          totalMinutes = habitEntries.filter(entry => entry.action === "Check-in").length * 5;
        }
        
        return {
          habitId: habit.id,
          habitName: habit.name,
          totalMinutes,
          sessions: habitEntries.filter(entry => entry.action === "Check-in").length
        };
      });
      
      result.push({
        date: dateStr,
        habits: habitProgress
      });
    }
    
    return result.reverse();
  }

  async getWeeklyProgress(userId: number): Promise<{ habitId: number; habitName: string; totalMinutes: number; color: string }[]> {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    
    const startDate = weekStart.toISOString().split('T')[0];
    const endDate = weekEnd.toISOString().split('T')[0];
    
    const weekEntries = await this.getHabitEntriesForDateRange(userId, startDate, endDate);
    const userHabits = await this.getHabits(userId);
    
    return userHabits.map(habit => {
      const habitEntries = weekEntries.filter(entry => entry.habitName === habit.name);
      let totalMinutes = 0;
      
      if (habit.checkoutEnabled) {
        totalMinutes = habitEntries
          .filter(entry => entry.action === "Check-out")
          .reduce((sum, entry) => sum + (entry.duration || 0), 0);
      } else {
        totalMinutes = habitEntries.filter(entry => entry.action === "Check-in").length * 5;
      }
      
      return {
        habitId: habit.id,
        habitName: habit.name,
        totalMinutes,
        color: habit.color
      };
    });
  }

  async getSettings(userId: number): Promise<Settings | undefined> {
    const [userSettings] = await db.select().from(settings).where(eq(settings.userId, userId));
    return userSettings || undefined;
  }

  async updateSettings(userId: number, updateData: Partial<InsertSettings>): Promise<Settings> {
    const existingSettings = await this.getSettings(userId);
    
    if (!existingSettings) {
      const [newSettings] = await db
        .insert(settings)
        .values({ ...updateData, userId })
        .returning();
      return newSettings;
    } else {
      const [updatedSettings] = await db
        .update(settings)
        .set(updateData)
        .where(eq(settings.userId, userId))
        .returning();
      return updatedSettings;
    }
  }
}

export const storage = new DatabaseStorage();
