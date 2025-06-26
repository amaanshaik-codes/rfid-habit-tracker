import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";

export default function FloatingVoiceButton() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const voiceNoteMutation = useMutation({
    mutationFn: async (audioBlob: Blob) => {
      // Convert blob to base64 for storage
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(audioBlob);
      });
      
      // For now, store voice notes as text entries until database schema is updated
      return apiRequest('POST', '/api/entries', {
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().split(' ')[0],
        cardId: 'voice-note',
        habitName: 'Voice Note',
        action: 'Voice Note',
        notes: `Voice recording (${Math.floor(recordingTime / 60)}:${(recordingTime % 60).toString().padStart(2, '0')}) - Audio data: ${base64.substring(0, 50)}...`
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/entries'] });
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

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm;codecs=opus' });
        voiceNoteMutation.mutate(audioBlob);
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start(100);
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({
        title: "Microphone Error",
        description: "Unable to access microphone. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed bottom-24 right-4 z-50">
      {isRecording && (
        <div className="glass rounded-full px-4 py-2 mb-2 animate-pulse">
          <div className="text-sm font-mono text-ios-blue">
            {formatTime(recordingTime)}
          </div>
        </div>
      )}
      
      <Button
        onClick={isRecording ? stopRecording : startRecording}
        disabled={voiceNoteMutation.isPending}
        className={`w-14 h-14 rounded-full shadow-lg ${
          isRecording 
            ? 'bg-error hover:bg-error/80 animate-pulse' 
            : 'bg-ios-blue hover:bg-ios-blue/80'
        }`}
      >
        <i className={`fas ${isRecording ? 'fa-stop' : 'fa-microphone'} text-lg`}></i>
      </Button>
    </div>
  );
}