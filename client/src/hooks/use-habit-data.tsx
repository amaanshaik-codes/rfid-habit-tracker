import { useQuery } from "@tanstack/react-query";
import { HabitSummary, DailyProgress, HabitWithCards } from "@shared/schema";

export function useHabitData() {
  const summariesQuery = useQuery<HabitSummary[]>({
    queryKey: ['/api/analytics/summaries']
  });

  const dailyProgressQuery = useQuery<DailyProgress[]>({
    queryKey: ['/api/analytics/daily-progress', { days: 35 }]
  });

  const weeklyProgressQuery = useQuery<Array<{
    habitId: number;
    habitName: string;
    totalMinutes: number;
    color: string;
  }>>({
    queryKey: ['/api/analytics/weekly-progress']
  });

  const habitsQuery = useQuery<HabitWithCards[]>({
    queryKey: ['/api/habits']
  });

  return {
    summaries: summariesQuery.data || [],
    dailyProgress: dailyProgressQuery.data || [],
    weeklyProgress: weeklyProgressQuery.data || [],
    habits: habitsQuery.data || [],
    isLoading: summariesQuery.isLoading || dailyProgressQuery.isLoading || weeklyProgressQuery.isLoading || habitsQuery.isLoading,
    error: summariesQuery.error || dailyProgressQuery.error || weeklyProgressQuery.error || habitsQuery.error
  };
}
