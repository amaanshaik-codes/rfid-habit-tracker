import { formatDuration } from "@/lib/habit-utils";

interface HabitProgressBarProps {
  habitName: string;
  totalMinutes: number;
  color: string;
  maxMinutes: number;
}

export default function HabitProgressBar({ 
  habitName, 
  totalMinutes, 
  color, 
  maxMinutes 
}: HabitProgressBarProps) {
  const percentage = maxMinutes > 0 ? (totalMinutes / maxMinutes) * 100 : 0;

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm">{habitName}</span>
        <span className="text-xs text-white/70">{formatDuration(totalMinutes)}</span>
      </div>
      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <div 
          className="h-full rounded-full transition-all duration-300"
          style={{ 
            width: `${Math.min(percentage, 100)}%`,
            backgroundColor: color
          }}
        />
      </div>
    </div>
  );
}
