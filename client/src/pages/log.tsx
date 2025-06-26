import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { HabitEntry } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import GlassCard from "@/components/glass-card";
import ActivityLogItem from "@/components/activity-log-item";
import VoiceRecorder from "@/components/voice-recorder";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function Log() {
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const { toast } = useToast();
  
  const { data: entries = [], isLoading } = useQuery<HabitEntry[]>({
    queryKey: ['/api/entries', { limit: 100 }]
  });

  const voiceNoteMutation = useMutation({
    mutationFn: async (audioBlob: Blob) => {
      // Convert blob to base64 for storage
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(audioBlob);
      });
      
      return apiRequest('POST', '/api/entries', {
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().split(' ')[0],
        cardId: 'voice-note',
        habitName: 'Voice Note',
        action: 'Voice Note',
        notes: 'Voice recording',
        voiceNoteUrl: base64
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/entries'] });
      setShowVoiceRecorder(false);
      toast({
        title: "Voice note saved",
        description: "Your voice note has been added to the log.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save voice note. Please try again.",
        variant: "destructive",
      });
    }
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
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium text-lg">Activity Log</h3>
          <Dialog open={showVoiceRecorder} onOpenChange={setShowVoiceRecorder}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                className="bg-ios-blue hover:bg-ios-blue/80"
              >
                <i className="fas fa-microphone mr-2"></i>
                Voice Note
              </Button>
            </DialogTrigger>
            <DialogContent className="glass border-white/20">
              <DialogHeader>
                <DialogTitle>Record Voice Note</DialogTitle>
              </DialogHeader>
              <VoiceRecorder
                onRecordingComplete={(blob) => voiceNoteMutation.mutate(blob)}
                onCancel={() => setShowVoiceRecorder(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
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
