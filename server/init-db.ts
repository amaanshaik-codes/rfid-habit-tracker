import { db } from "./db";
import { users, habits, rfidCards, settings } from "@shared/schema";

export async function initializeDatabase() {
  try {
    // Create default user
    const [defaultUser] = await db
      .insert(users)
      .values({
        username: "amaan",
        password: "password123"
      })
      .onConflictDoNothing()
      .returning();

    const userId = defaultUser?.id || 1;

    // Create default habits
    const defaultHabits = [
      {
        name: "Study",
        icon: "fas fa-book",
        color: "#007AFF",
        dailyGoalMinutes: 180,
        checkoutEnabled: true,
        userId
      },
      {
        name: "Exercise", 
        icon: "fas fa-dumbbell",
        color: "#30D158",
        dailyGoalMinutes: 60,
        checkoutEnabled: true,
        userId
      },
      {
        name: "Water",
        icon: "fas fa-glass-water", 
        color: "#FF9F0A",
        dailyGoalMinutes: 0,
        checkoutEnabled: false,
        userId
      }
    ];

    const createdHabits = await db
      .insert(habits)
      .values(defaultHabits)
      .onConflictDoNothing()
      .returning();

    // Create default RFID cards
    if (createdHabits.length > 0) {
      const defaultCards = [
        {
          cardId: "A1B2C3D4",
          habitId: createdHabits[0].id,
          userId
        },
        {
          cardId: "E5F6G7H8", 
          habitId: createdHabits[1].id,
          userId
        },
        {
          cardId: "I9J0K1L2",
          habitId: createdHabits[2].id,
          userId
        }
      ];

      await db
        .insert(rfidCards)
        .values(defaultCards)
        .onConflictDoNothing();
    }

    // Create default settings
    await db
      .insert(settings)
      .values({
        userId,
        googleSheetsUrl: null,
        autoSync: true,
        idleReminders: false,
        checkoutMode: true
      })
      .onConflictDoNothing();

    console.log("Database initialized with default data");
  } catch (error) {
    console.error("Error initializing database:", error);
  }
}