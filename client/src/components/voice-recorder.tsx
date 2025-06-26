import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface VoiceRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void;
  onCancel?: () => void;
}

export default function VoiceRecorder({ onRecordingComplete, onCancel }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

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
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start(100); // Collect data every 100ms
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

  const saveRecording = () => {
    if (chunksRef.current.length > 0) {
      const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm;codecs=opus' });
      onRecordingComplete(audioBlob);
    }
  };

  const discardRecording = () => {
    setAudioUrl(null);
    setRecordingTime(0);
    chunksRef.current = [];
    if (onCancel) {
      onCancel();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="glass rounded-2xl p-6 space-y-4">
      <div className="text-center">
        <h3 className="font-medium text-lg mb-2">Voice Note</h3>
        <div className="text-2xl font-mono text-ios-blue">
          {formatTime(recordingTime)}
        </div>
      </div>

      {!isRecording && !audioUrl && (
        <div className="flex justify-center">
          <Button
            onClick={startRecording}
            className="w-16 h-16 rounded-full bg-error hover:bg-error/80 p-0"
          >
            <i className="fas fa-microphone text-xl"></i>
          </Button>
        </div>
      )}

      {isRecording && (
        <div className="flex justify-center">
          <Button
            onClick={stopRecording}
            className="w-16 h-16 rounded-full bg-error hover:bg-error/80 p-0 animate-pulse"
          >
            <i className="fas fa-stop text-xl"></i>
          </Button>
        </div>
      )}

      {audioUrl && !isRecording && (
        <div className="space-y-4">
          <audio controls className="w-full" src={audioUrl} />
          <div className="flex gap-2">
            <Button
              onClick={saveRecording}
              className="flex-1 bg-success hover:bg-success/80"
            >
              <i className="fas fa-check mr-2"></i>
              Save
            </Button>
            <Button
              onClick={discardRecording}
              variant="outline"
              className="flex-1 border-white/20 bg-transparent"
            >
              <i className="fas fa-times mr-2"></i>
              Discard
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}