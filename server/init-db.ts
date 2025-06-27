import { db } from "./db";

export async function initializeDatabase() {
  try {
    // Create default user
    const defaultUser = {
      id: 1,
      username: "amaan",
      password: "password123"
    };
    await db.appendSheetData(
      ["id", "username", "password"],
      [defaultUser.id, defaultUser.username, defaultUser.password],
      "Users!A1:C1"
    );

    const userId = defaultUser.id;

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

    for (const habit of defaultHabits) {
      await db.appendSheetData(
        ["name", "icon", "color", "dailyGoalMinutes", "checkoutEnabled", "userId"],
        [
          habit.name,
          habit.icon,
          habit.color,
          habit.dailyGoalMinutes,
          habit.checkoutEnabled,
          habit.userId
        ],
        "Habits!A1:F1"
      );
    }

    // Create default RFID cards
    const defaultCards = [
      {
        cardId: "A1B2C3D4",
        habitName: "Study",
        userId
      },
      {
        cardId: "E5F6G7H8",
        habitName: "Exercise",
        userId
      },
      {
        cardId: "I9J0K1L2",
        habitName: "Water",
        userId
      }
    ];

    for (const card of defaultCards) {
      await db.appendSheetData(
        ["cardId", "habitName", "userId"],
        [card.cardId, card.habitName, card.userId],
        "RFIDCards!A1:C1"
      );
    }

    // Create default settings
    await db.appendSheetData(
      ["userId", "googleSheetsUrl", "autoSync", "idleReminders", "checkoutMode"],
      [userId, "", true, false, true],
      "Settings!A1:E1"
    );

    console.log("Google Sheet initialized with default data");
  } catch (error) {
    console.error("Error initializing Google Sheet:", error);
  }
}