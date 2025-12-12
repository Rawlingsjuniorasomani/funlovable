import { useState } from "react";
import { 
  Play, Pause, Volume2, VolumeX, Maximize, SkipBack, SkipForward,
  CheckCircle, BookOpen, FileText, Gamepad2, ChevronLeft, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface Lesson {
  id: string;
  title: string;
  description: string;
  type: "video" | "text" | "interactive";
  duration: string;
  content?: string;
  videoUrl?: string;
}

interface EnhancedLessonViewerProps {
  lesson: Lesson;
  onComplete: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  isCompleted?: boolean;
  progress?: number;
}

export function EnhancedLessonViewer({
  lesson,
  onComplete,
  onNext,
  onPrevious,
  isCompleted = false,
  progress = 0,
}: EnhancedLessonViewerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [volume, setVolume] = useState(80);
  const [readProgress, setReadProgress] = useState(0);

  const getTypeIcon = () => {
    switch (lesson.type) {
      case "video":
        return <Play className="w-5 h-5" />;
      case "text":
        return <FileText className="w-5 h-5" />;
      case "interactive":
        return <Gamepad2 className="w-5 h-5" />;
    }
  };

  const getTypeLabel = () => {
    switch (lesson.type) {
      case "video":
        return "Video Lesson";
      case "text":
        return "Reading Material";
      case "interactive":
        return "Interactive Activity";
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    const scrollPercentage = (target.scrollTop / (target.scrollHeight - target.clientHeight)) * 100;
    setReadProgress(Math.min(100, scrollPercentage));
    if (scrollPercentage >= 90 && !isCompleted) {
      // Auto-complete when user reaches end of content
    }
  };

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border bg-muted/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              {getTypeIcon()}
            </div>
            <div>
              <h2 className="font-semibold text-foreground">{lesson.title}</h2>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="outline">{getTypeLabel()}</Badge>
                <span>•</span>
                <span>{lesson.duration}</span>
              </div>
            </div>
          </div>
          {isCompleted && (
            <Badge className="bg-secondary text-secondary-foreground">
              <CheckCircle className="w-3 h-3 mr-1" />
              Completed
            </Badge>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="relative">
        {lesson.type === "video" && (
          <div className="aspect-video bg-black relative group">
            {/* Video placeholder */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white/60">
                <Play className="w-16 h-16 mx-auto mb-2 opacity-50" />
                <p>Video Content</p>
                <p className="text-sm">{lesson.title}</p>
              </div>
            </div>

            {/* Video Controls Overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
              {/* Progress Bar */}
              <div className="mb-3">
                <Slider
                  value={[videoProgress]}
                  max={100}
                  step={1}
                  onValueChange={(value) => setVideoProgress(value[0])}
                  className="cursor-pointer"
                />
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="text-white hover:bg-white/20"
                  >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20"
                  >
                    <SkipBack className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20"
                  >
                    <SkipForward className="w-4 h-4" />
                  </Button>
                  <div className="flex items-center gap-2 ml-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsMuted(!isMuted)}
                      className="text-white hover:bg-white/20"
                    >
                      {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </Button>
                    <Slider
                      value={[isMuted ? 0 : volume]}
                      max={100}
                      step={1}
                      onValueChange={(value) => {
                        setVolume(value[0]);
                        setIsMuted(value[0] === 0);
                      }}
                      className="w-24"
                    />
                  </div>
                  <span className="text-white text-sm ml-2">
                    {Math.floor(videoProgress * 0.15)}:00 / 15:00
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20"
                >
                  <Maximize className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {lesson.type === "text" && (
          <div 
            className="p-6 max-h-96 overflow-y-auto"
            onScroll={handleScroll}
          >
            <div className="prose prose-sm max-w-none text-foreground">
              <p className="text-muted-foreground mb-4">{lesson.description}</p>
              
              {lesson.content ? (
                <div dangerouslySetInnerHTML={{ __html: lesson.content }} />
              ) : (
                <>
                  <h3>Introduction</h3>
                  <p>
                    Welcome to this lesson on {lesson.title}. In this section, we'll explore 
                    the key concepts and build a strong foundation for your understanding.
                  </p>
                  
                  <h3>Key Concepts</h3>
                  <ul>
                    <li>Understanding the basics and terminology</li>
                    <li>Applying concepts to real-world scenarios</li>
                    <li>Practice exercises and examples</li>
                    <li>Review and self-assessment</li>
                  </ul>
                  
                  <h3>Main Content</h3>
                  <p>
                    This lesson covers the fundamental principles that you need to master. 
                    Take your time to read through each section carefully and make notes 
                    of important points.
                  </p>
                  
                  <blockquote>
                    <p>
                      "Education is not the learning of facts, but the training of the mind to think." 
                      - Albert Einstein
                    </p>
                  </blockquote>
                  
                  <h3>Summary</h3>
                  <p>
                    By completing this lesson, you've learned the essential concepts that will 
                    help you in future modules. Make sure to complete the quiz to test your understanding.
                  </p>
                </>
              )}
            </div>
            
            {/* Reading Progress */}
            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                <span>Reading Progress</span>
                <span>{Math.round(readProgress)}%</span>
              </div>
              <Progress value={readProgress} className="h-2" />
            </div>
          </div>
        )}

        {lesson.type === "interactive" && (
          <div className="p-6">
            <div className="bg-muted/50 rounded-xl p-8 text-center">
              <Gamepad2 className="w-16 h-16 mx-auto text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">Interactive Activity</h3>
              <p className="text-muted-foreground mb-6">
                {lesson.description}
              </p>
              
              {/* Sample Interactive Content */}
              <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mb-6">
                <Button variant="outline" className="h-20">
                  Option A
                </Button>
                <Button variant="outline" className="h-20">
                  Option B
                </Button>
                <Button variant="outline" className="h-20">
                  Option C
                </Button>
                <Button variant="outline" className="h-20">
                  Option D
                </Button>
              </div>
              
              <p className="text-sm text-muted-foreground">
                Complete the activity to earn points and unlock the next lesson
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border bg-muted/30">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={onPrevious}
            disabled={!onPrevious}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          
          <div className="flex items-center gap-3">
            {!isCompleted && (
              <Button onClick={onComplete} variant="secondary">
                <CheckCircle className="w-4 h-4 mr-2" />
                Mark Complete
              </Button>
            )}
            <Button
              onClick={onNext}
              disabled={!onNext}
            >
              Next Lesson
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
