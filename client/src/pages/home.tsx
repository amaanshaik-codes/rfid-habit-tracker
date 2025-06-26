import { useQuery } from "@tanstack/react-query";
import { HabitSummary } from "@shared/schema";
import GlassCard from "@/components/glass-card";
import { useHabitData } from "@/hooks/use-habit-data";
import { formatDuration, getGreeting } from "@/lib/habit-utils";

export default function Home() {
  const { data: summaries = [], isLoading } = useQuery<HabitSummary[]>({
    queryKey: ['/api/analytics/summaries']
  });

  const currentDate = new Date();
  const greeting = getGreeting();
  const formattedDate = currentDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const activeSummary = summaries.find(s => s.isActive);
  const todayTotal = summaries.reduce((sum, s) => sum + s.totalMinutes, 0);
  const currentStreak = Math.max(...summaries.map(s => s.streak), 0);
  const weeklyGoalProgress = Math.min(Math.round((todayTotal / 300) * 100), 100); // Assuming 5 hours daily goal

  if (isLoading) {
    return (
      <div className="px-4 pt-12">
        <div className="animate-pulse space-y-6">
          <div className="text-center space-y-4">
            <div className="h-8 bg-white/10 rounded-lg mx-auto w-64"></div>
            <div className="h-4 bg-white/10 rounded-lg mx-auto w-48"></div>
          </div>
          <div className="h-40 bg-white/10 rounded-3xl"></div>
          <div className="h-32 bg-white/10 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 pt-12">
      {/* Greeting Section */}
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-medium mb-2">{greeting}, Amaan</h1>
        <p className="text-white/70 text-sm">{formattedDate}</p>
      </div>

      {/* Current Status Card */}
      <GlassCard className="rounded-3xl p-6 mb-8 text-center glow-blue glass-strong">
        <div className="mb-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-ios-blue/20 flex items-center justify-center mb-3">
            {activeSummary ? (
              <i className={`${activeSummary.icon} text-2xl text-ios-blue`}></i>
            ) : (
              <i className="fas fa-moon text-2xl text-white/50"></i>
            )}
          </div>
          <h2 className="text-xl font-medium mb-1">
            {activeSummary ? activeSummary.habitName : "Idle"}
          </h2>
          <p className="text-white/70 text-sm">
            {activeSummary 
              ? `${formatDuration(getCurrentSessionDuration(activeSummary))} active`
              : "No active sessions"
            }
          </p>
        </div>
        <div className="flex justify-center">
          <div className={activeSummary ? "animate-pulse-soft" : ""}>
            <div className={`w-3 h-3 rounded-full ${
              activeSummary ? "bg-success" : "bg-white/30"
            }`}></div>
          </div>
        </div>
      </GlassCard>

      {/* Today's Summary */}
      <GlassCard className="rounded-2xl p-5 mb-6">
        <h3 className="font-medium mb-4 text-lg">Today's Progress</h3>
        <div className="space-y-3">
          {summaries.map((summary) => (
            <div key={summary.habitId} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${summary.color}20` }}
                >
                  <i 
                    className={`${summary.icon} text-xs`}
                    style={{ color: summary.color }}
                  ></i>
                </div>
                <span className="text-sm">{summary.habitName}</span>
              </div>
              <span className="text-sm text-white/70">
                {formatDuration(summary.totalMinutes)}
              </span>
            </div>
          ))}
          {summaries.length === 0 && (
            <p className="text-white/50 text-sm text-center py-4">
              No activity today yet
            </p>
          )}
        </div>
      </GlassCard>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <GlassCard className="rounded-2xl p-4 text-center">
          <div className="text-2xl font-semibold text-ios-blue mb-1">
            {currentStreak}
          </div>
          <div className="text-xs text-white/70">Day Streak</div>
        </GlassCard>
        <GlassCard className="rounded-2xl p-4 text-center">
          <div className="text-2xl font-semibold text-success mb-1">
            {weeklyGoalProgress}%
          </div>
          <div className="text-xs text-white/70">Weekly Goal</div>
        </GlassCard>
      </div>
    </div>
  );
}

function getCurrentSessionDuration(summary: HabitSummary): number {
  if (!summary.isActive || !summary.activeSessionStart) return 0;
  
  const now = new Date();
  const sessionStart = new Date();
  const [hours, minutes, seconds] = summary.activeSessionStart.split(':').map(Number);
  sessionStart.setHours(hours, minutes, seconds, 0);
  
  return Math.round((now.getTime() - sessionStart.getTime()) / (1000 * 60));
}
