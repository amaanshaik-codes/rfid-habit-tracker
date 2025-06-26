import { useQuery } from "@tanstack/react-query";
import { HabitEntry } from "@shared/schema";
import GlassCard from "@/components/glass-card";
import ActivityLogItem from "@/components/activity-log-item";

export default function Log() {
  const { data: entries = [], isLoading } = useQuery<HabitEntry[]>({
    queryKey: ['/api/entries', { limit: 100 }]
  });

  if (isLoading) {
    return (
      <div className="px-4 pt-8">
        <GlassCard className="rounded-2xl p-5">
          <h3 className="font-medium mb-4 text-lg">Activity Log</h3>
          <div className="space-y-4 animate-pulse">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-white/10 rounded-xl"></div>
            ))}
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="px-4 pt-8">
      <GlassCard className="rounded-2xl p-5">
        <h3 className="font-medium mb-4 text-lg">Activity Log</h3>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {entries.map((entry) => (
            <ActivityLogItem key={entry.id} entry={entry} />
          ))}
          {entries.length === 0 && (
            <div className="text-center py-8">
              <p className="text-white/50 text-sm">
                No activity logged yet. Start using your RFID cards to track habits!
              </p>
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  );
}
