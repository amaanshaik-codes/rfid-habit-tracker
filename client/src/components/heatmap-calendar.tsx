import { DailyProgress } from "@shared/schema";

interface HeatmapCalendarProps {
  dailyProgress: DailyProgress[];
}

export default function HeatmapCalendar({ dailyProgress }: HeatmapCalendarProps) {
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - 34); // 5 weeks back

  const dates = [];
  for (let i = 0; i < 35; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    dates.push(date.toISOString().split('T')[0]);
  }

  const getIntensity = (date: string): number => {
    const dayProgress = dailyProgress.find(p => p.date === date);
    if (!dayProgress) return 0;
    
    const totalMinutes = dayProgress.habits.reduce((sum, habit) => sum + habit.totalMinutes, 0);
    if (totalMinutes === 0) return 0;
    if (totalMinutes < 30) return 1;
    if (totalMinutes < 60) return 2;
    if (totalMinutes < 120) return 3;
    return 4;
  };

  return (
    <div className="mb-4">
      <div className="grid grid-cols-7 gap-1 text-xs text-white/50 mb-2">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
          <div key={index} className="text-center">{day}</div>
        ))}
      </div>
      
      <div className="calendar-grid mb-4">
        {dates.map((date, index) => {
          const intensity = getIntensity(date);
          return (
            <div
              key={index}
              className={`habit-calendar-day day-${intensity}`}
              title={`${date}: ${
                dailyProgress.find(p => p.date === date)?.habits.reduce((sum, h) => sum + h.totalMinutes, 0) || 0
              } minutes`}
            />
          );
        })}
      </div>
      
      <div className="flex items-center justify-between text-xs text-white/50">
        <span>Less</span>
        <div className="flex space-x-1">
          {[0, 1, 2, 3, 4].map((intensity) => (
            <div key={intensity} className={`w-2 h-2 rounded-sm day-${intensity}`} />
          ))}
        </div>
        <span>More</span>
      </div>
    </div>
  );
}
