import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertHabitSchema, insertRfidCardSchema, insertHabitEntrySchema, insertSettingsSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  const DEFAULT_USER_ID = 1; // For simplicity, using a default user

  // Habit routes
  app.get("/api/habits", async (req, res) => {
    try {
      const habits = await storage.getHabitsWithCards(DEFAULT_USER_ID);
      res.json(habits);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch habits" });
    }
  });

  app.post("/api/habits", async (req, res) => {
    try {
      const habitData = insertHabitSchema.parse({
        ...req.body,
        userId: DEFAULT_USER_ID
      });
      const habit = await storage.createHabit(habitData);
      res.json(habit);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid habit data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create habit" });
      }
    }
  });

  app.put("/api/habits/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = insertHabitSchema.partial().parse(req.body);
      const habit = await storage.updateHabit(id, updateData);
      
      if (!habit) {
        res.status(404).json({ message: "Habit not found" });
        return;
      }
      
      res.json(habit);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid habit data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update habit" });
      }
    }
  });

  app.delete("/api/habits/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteHabit(id);
      
      if (!deleted) {
        res.status(404).json({ message: "Habit not found" });
        return;
      }
      
      res.json({ message: "Habit deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete habit" });
    }
  });

  // RFID Card routes
  app.get("/api/cards", async (req, res) => {
    try {
      const cards = await storage.getRfidCards(DEFAULT_USER_ID);
      res.json(cards);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch RFID cards" });
    }
  });

  app.post("/api/cards", async (req, res) => {
    try {
      const cardData = insertRfidCardSchema.parse({
        ...req.body,
        userId: DEFAULT_USER_ID
      });
      const card = await storage.createRfidCard(cardData);
      res.json(card);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid card data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create RFID card" });
      }
    }
  });

  app.put("/api/cards/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = insertRfidCardSchema.partial().parse(req.body);
      const card = await storage.updateRfidCard(id, updateData);
      
      if (!card) {
        res.status(404).json({ message: "RFID card not found" });
        return;
      }
      
      res.json(card);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid card data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update RFID card" });
      }
    }
  });

  app.delete("/api/cards/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteRfidCard(id);
      
      if (!deleted) {
        res.status(404).json({ message: "RFID card not found" });
        return;
      }
      
      res.json({ message: "RFID card deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete RFID card" });
    }
  });

  // Habit Entry routes
  app.get("/api/entries", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const entries = await storage.getHabitEntries(DEFAULT_USER_ID, limit);
      res.json(entries);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch habit entries" });
    }
  });

  app.post("/api/entries", async (req, res) => {
    try {
      const entryData = insertHabitEntrySchema.parse({
        ...req.body,
        userId: DEFAULT_USER_ID
      });
      const entry = await storage.createHabitEntry(entryData);
      res.json(entry);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid entry data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create habit entry" });
      }
    }
  });

  // Analytics routes
  app.get("/api/analytics/summaries", async (req, res) => {
    try {
      const summaries = await storage.getHabitSummaries(DEFAULT_USER_ID);
      res.json(summaries);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch habit summaries" });
    }
  });

  app.get("/api/analytics/daily-progress", async (req, res) => {
    try {
      const days = req.query.days ? parseInt(req.query.days as string) : 35;
      const progress = await storage.getDailyProgress(DEFAULT_USER_ID, days);
      res.json(progress);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch daily progress" });
    }
  });

  app.get("/api/analytics/weekly-progress", async (req, res) => {
    try {
      const progress = await storage.getWeeklyProgress(DEFAULT_USER_ID);
      res.json(progress);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch weekly progress" });
    }
  });

  // Settings routes
  app.get("/api/settings", async (req, res) => {
    try {
      const settings = await storage.getSettings(DEFAULT_USER_ID);
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  app.put("/api/settings", async (req, res) => {
    try {
      const settingsData = insertSettingsSchema.partial().parse(req.body);
      const settings = await storage.updateSettings(DEFAULT_USER_ID, settingsData);
      res.json(settings);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid settings data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update settings" });
      }
    }
  });

  // Google Sheets webhook route for RFID data
  app.post("/api/webhook/rfid", async (req, res) => {
    try {
      const { uid, activity, status, device, notes } = req.body;
      
      if (!uid || !activity || !status) {
        res.status(400).json({ message: "Missing required fields: uid, activity, status" });
        return;
      }

      // Find the RFID card
      const card = await storage.getRfidCardByCardId(uid);
      if (!card) {
        res.status(404).json({ message: "RFID card not found" });
        return;
      }

      // Create habit entry
      const now = new Date();
      const date = now.toISOString().split('T')[0];
      const time = now.toTimeString().split(' ')[0];

      let duration: number | undefined;
      if (status === "Check-out") {
        // Calculate duration from last check-in
        const todayEntries = await storage.getHabitEntriesForDate(card.userId, date);
        const lastCheckIn = todayEntries
          .filter(entry => entry.cardId === uid && entry.action === "Check-in")
          .sort((a, b) => b.time.localeCompare(a.time))[0];
        
        if (lastCheckIn) {
          const checkInTime = new Date(`${date}T${lastCheckIn.time}`);
          const checkOutTime = new Date(`${date}T${time}`);
          duration = Math.round((checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60));
        }
      }

      const entry = await storage.createHabitEntry({
        date,
        time,
        cardId: uid,
        habitName: activity,
        action: status,
        duration,
        device,
        notes,
        userId: card.userId
      });

      res.json({ message: "Entry created successfully", entry });
    } catch (error) {
      console.error("Webhook error:", error);
      res.status(500).json({ message: "Failed to process RFID data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
