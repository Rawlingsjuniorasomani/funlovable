import { useState, useRef, useEffect } from "react";
import { 
  Circle, Square, Download, Pause, Play, 
  Video, Clock, HardDrive, AlertCircle 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface RecordingControlsProps {
  isHost?: boolean;
  stream?: MediaStream | null;
}

export function RecordingControls({ isHost = true, stream }: RecordingControlsProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [recordings, setRecordings] = useState<{ id: string; blob: Blob; duration: number; timestamp: Date }[]>([]);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startRecording = async () => {
    try {
      let recordStream = stream;
      
      if (!recordStream) {
        // Capture screen + audio if no stream provided
        recordStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true
        });
      }

      const mediaRecorder = new MediaRecorder(recordStream, {
        mimeType: 'video/webm;codecs=vp9'
      });

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        setRecordings(prev => [...prev, {
          id: Date.now().toString(),
          blob,
          duration,
          timestamp: new Date()
        }]);
        toast.success('Recording saved!');
      };

      mediaRecorder.start(1000);
      setIsRecording(true);
      setIsPaused(false);
      setDuration(0);

      timerRef.current = setInterval(() => {
        setDuration(d => d + 1);
      }, 1000);

      toast.success('Recording started');
    } catch (error) {
      toast.error('Could not start recording');
      console.error('Recording error:', error);
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        timerRef.current = setInterval(() => {
          setDuration(d => d + 1);
        }, 1000);
      } else {
        mediaRecorderRef.current.pause();
        if (timerRef.current) clearInterval(timerRef.current);
      }
      setIsPaused(!isPaused);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      if (timerRef.current) clearInterval(timerRef.current);
      setIsRecording(false);
      setIsPaused(false);
    }
  };

  const downloadRecording = (recording: typeof recordings[0]) => {
    const url = URL.createObjectURL(recording.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `class-recording-${recording.timestamp.toISOString().slice(0, 10)}.webm`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  if (!isHost) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <Video className="w-12 h-12 mx-auto mb-2 opacity-20" />
        <p>Recording controls are only available to the host</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Video className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Recording</h3>
        </div>
        {isRecording && (
          <Badge variant="destructive" className="animate-pulse">
            <Circle className="w-2 h-2 mr-1 fill-current" />
            {formatDuration(duration)}
          </Badge>
        )}
      </div>

      {/* Controls */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-center gap-3">
          {!isRecording ? (
            <Button 
              onClick={startRecording}
              className="gap-2"
            >
              <Circle className="w-4 h-4 fill-destructive text-destructive" />
              Start Recording
            </Button>
          ) : (
            <>
              <Button 
                variant="outline"
                size="icon"
                onClick={pauseRecording}
              >
                {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              </Button>
              <Button 
                variant="destructive"
                onClick={stopRecording}
                className="gap-2"
              >
                <Square className="w-4 h-4 fill-current" />
                Stop
              </Button>
            </>
          )}
        </div>

        {isRecording && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1 text-muted-foreground">
                <Clock className="w-4 h-4" />
                Duration
              </span>
              <span className="font-mono">{formatDuration(duration)}</span>
            </div>
            <Progress value={(duration % 60) / 60 * 100} className="h-1" />
            {isPaused && (
              <p className="text-sm text-center text-star">Recording paused</p>
            )}
          </div>
        )}
      </div>

      {/* Recordings List */}
      <div className="flex-1 overflow-auto p-4">
        <h4 className="text-sm font-medium mb-3">Saved Recordings</h4>
        
        {recordings.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <HardDrive className="w-12 h-12 mx-auto mb-2 opacity-20" />
            <p>No recordings yet</p>
            <p className="text-sm">Start recording to capture your class</p>
          </div>
        ) : (
          <div className="space-y-2">
            {recordings.map(rec => (
              <div 
                key={rec.id}
                className="flex items-center justify-between p-3 bg-muted rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Video className="w-8 h-8 text-primary" />
                  <div>
                    <p className="text-sm font-medium">
                      {rec.timestamp.toLocaleDateString()} {rec.timestamp.toLocaleTimeString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDuration(rec.duration)} • {formatSize(rec.blob.size)}
                    </p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => downloadRecording(rec)}
                >
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <p>
              Recordings are saved locally in your browser. Download them before leaving to keep them permanently.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
