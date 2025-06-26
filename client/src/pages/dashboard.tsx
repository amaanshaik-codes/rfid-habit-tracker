import { useQuery } from "@tanstack/react-query";
import { DailyProgress, HabitSummary } from "@shared/schema";
import GlassCard from "@/components/glass-card";
import HeatmapCalendar from "@/components/heatmap-calendar";
import HabitProgressBar from "@/components/habit-progress-bar";

export default function Dashboard() {
  const { data: dailyProgress = [], isLoading: loadingDaily } = useQuery<DailyProgress[]>({
    queryKey: ['/api/analytics/daily-progress', { days: 35 }]
  });

  const { data: weeklyProgress = [], isLoading: loadingWeekly } = useQuery<Array<{
    habitId: number;
    habitName: string;
    totalMinutes: number;
    color: string;
  }>>({
    queryKey: ['/api/analytics/weekly-progress']
  });

  const { data: summaries = [], isLoading: loadingSummaries } = useQuery<HabitSummary[]>({
    queryKey: ['/api/analytics/summaries']
  });

  if (loadingDaily || loadingWeekly || loadingSummaries) {
    return (
      <div className="px-4 pt-8">
        <div className="animate-pulse space-y-6">
          <div className="h-64 bg-white/10 rounded-2xl"></div>
          <div className="h-48 bg-white/10 rounded-2xl"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-24 bg-white/10 rounded-2xl"></div>
            <div className="h-24 bg-white/10 rounded-2xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 pt-8">
      {/* Heatmap Calendar */}
      <GlassCard className="rounded-2xl p-5 mb-6">
        <h3 className="font-medium mb-4 text-lg">Activity Heatmap</h3>
        <HeatmapCalendar dailyProgress={dailyProgress} />
      </GlassCard>

      {/* Weekly Bar Chart */}
      <GlassCard className="rounded-2xl p-5 mb-6">
        <h3 className="font-medium mb-4 text-lg">This Week</h3>
        <div className="space-y-4">
          {weeklyProgress.map((habit) => (
            <HabitProgressBar
              key={habit.habitId}
              habitName={habit.habitName}
              totalMinutes={habit.totalMinutes}
              color={habit.color}
              maxMinutes={Math.max(...weeklyProgress.map(h => h.totalMinutes), 1)}
            />
          ))}
          {weeklyProgress.length === 0 && (
            <p className="text-white/50 text-sm text-center py-4">
              No activity this week yet
            </p>
          )}
        </div>
      </GlassCard>

      {/* Streak Counters */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {summaries
          .filter(s => s.streak > 0)
          .slice(0, 4)
          .map((summary) => (
            <GlassCard key={summary.habitId} className="rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${summary.color}20` }}
                >
                  <i 
                    className={`${summary.icon} text-xs`}
                    style={{ color: summary.color }}
                  ></i>
                </div>
                <span className="text-xs text-white/70">{summary.habitName}</span>
              </div>
              <div 
                className="text-xl font-semibold mb-1"
                style={{ color: summary.color }}
              >
                {summary.streak} days
              </div>
              <div className="text-xs text-white/50">Current streak</div>
            </GlassCard>
          ))}
        
        {summaries.filter(s => s.streak > 0).length === 0 && (
          <div className="col-span-2">
            <GlassCard className="rounded-2xl p-6 text-center">
              <p className="text-white/50 text-sm">
                Start building streaks by using your RFID cards daily!
              </p>
            </GlassCard>
          </div>
        )}
      </div>
    </div>
  );
}
