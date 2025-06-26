import { HabitEntry } from "@shared/schema";
import GlassCard from "./glass-card";
import { formatTime, formatDuration } from "@/lib/habit-utils";

interface ActivityLogItemProps {
  entry: HabitEntry;
}

const habitIcons: Record<string, string> = {
  Study: "fas fa-book",
  Exercise: "fas fa-dumbbell",
  Water: "fas fa-glass-water",
  Reading: "fas fa-book-open",
  Meditation: "fas fa-om",
};

const habitColors: Record<string, string> = {
  Study: "#007AFF",
  Exercise: "#30D158",
  Water: "#FF9F0A",
  Reading: "#AF52DE",
  Meditation: "#FF2D92",
};

export default function ActivityLogItem({ entry }: ActivityLogItemProps) {
  const icon = habitIcons[entry.habitName] || "fas fa-circle";
  const color = habitColors[entry.habitName] || "#007AFF";
  const isCheckOut = entry.action === "Check-out";

  return (
    <div className="flex items-center space-x-4 p-3 glass rounded-xl">
      <div 
        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: `${color}20` }}
      >
        <i 
          className={`${icon} text-sm`}
          style={{ color }}
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-sm">{entry.habitName}</h4>
          <span className="text-xs text-white/50">{formatTime(entry.time)}</span>
        </div>
        <div className="flex items-center space-x-2 mt-1">
          <span 
            className={`text-xs px-2 py-1 rounded-full ${
              isCheckOut 
                ? "bg-success/20 text-success" 
                : "text-ios-blue"
            }`}
            style={!isCheckOut ? { backgroundColor: `${color}20`, color } : {}}
          >
            {entry.action}
          </span>
          {entry.duration && (
            <span className="text-xs text-white/70">
              Duration: {formatDuration(entry.duration)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
