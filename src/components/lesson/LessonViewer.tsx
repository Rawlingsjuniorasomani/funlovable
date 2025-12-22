import { useState, useEffect } from "react";
import { Play, Pause, CheckCircle, Clock, BookOpen, ChevronLeft, ChevronRight, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useNotifications } from "@/hooks/useNotifications";
import { cn } from "@/lib/utils";

export interface LessonSection {
  id: string;
  title: string;
  type: "video" | "text" | "interactive";
  content: string;
  duration: number; 
}

export interface LessonData {
  id: string;
  title: string;
  subject: string;
  description: string;
  sections: LessonSection[];
  objectives: string[];
}

interface LessonViewerProps {
  lesson: LessonData;
  onComplete?: () => void;
  onClose?: () => void;
}



export function LessonViewer({ lesson, onComplete, onClose }: LessonViewerProps) {
  const { addNotification } = useNotifications();
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [completedSections, setCompletedSections] = useState<Set<string>>(new Set());
  const [isPlaying, setIsPlaying] = useState(false);
  const [sectionProgress, setSectionProgress] = useState(0);
  const [showCompletion, setShowCompletion] = useState(false);

  const currentSection = lesson.sections[currentSectionIndex];
  const overallProgress = (completedSections.size / lesson.sections.length) * 100;
  const totalDuration = lesson.sections.reduce((acc, s) => acc + s.duration, 0);

  
  
  useEffect(() => {
    
    
  }, [lesson.id]);

  
  
  const saveProgress = (completed: Set<string>, sectionIndex: number) => {
    
    
  };

  
  useEffect(() => {
    if (!isPlaying || completedSections.has(currentSection.id)) return;

    const interval = setInterval(() => {
      setSectionProgress((prev) => {
        const newProgress = prev + (100 / currentSection.duration);
        if (newProgress >= 100) {
          markSectionComplete();
          setIsPlaying(false);
          return 100;
        }
        return newProgress;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, currentSection]);

  const markSectionComplete = () => {
    const newCompleted = new Set(completedSections);
    newCompleted.add(currentSection.id);
    setCompletedSections(newCompleted);
    saveProgress(newCompleted, currentSectionIndex);

    
    if (newCompleted.size === lesson.sections.length) {
      setShowCompletion(true);
      addNotification({
        type: "achievement",
        title: "Lesson Completed! 🎉",
        description: `You finished "${lesson.title}"`,
        actionUrl: "/student/lessons",
      });
      onComplete?.();
    }
  };

  const handlePrevious = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(currentSectionIndex - 1);
      setSectionProgress(0);
      setIsPlaying(false);
    }
  };

  const handleNext = () => {
    if (currentSectionIndex < lesson.sections.length - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1);
      setSectionProgress(0);
      setIsPlaying(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  
  if (showCompletion) {
    return (
      <div className="bg-card rounded-2xl border border-border p-8 max-w-2xl mx-auto animate-scale-in text-center">
        <div className="w-24 h-24 rounded-full bg-secondary/20 mx-auto mb-6 flex items-center justify-center">
          <Award className="w-12 h-12 text-secondary animate-bounce-gentle" />
        </div>
        <h2 className="text-3xl font-display font-bold text-foreground mb-2">
          Lesson Complete! 🎉
        </h2>
        <p className="text-muted-foreground mb-6">{lesson.title}</p>

        <div className="bg-muted/50 rounded-xl p-6 mb-8">
          <h3 className="font-semibold text-foreground mb-4">What you learned:</h3>
          <ul className="space-y-2 text-left">
            {lesson.objectives.map((obj, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="w-4 h-4 text-secondary shrink-0" />
                {obj}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex gap-4">
          <Button variant="outline" className="flex-1" onClick={() => setShowCompletion(false)}>
            Review Lesson
          </Button>
          <Button className="flex-1" onClick={onClose}>
            Continue Learning
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden max-w-4xl mx-auto">
      { }
      <div className="bg-gradient-to-r from-tertiary to-primary p-6 text-primary-foreground">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm opacity-80">{lesson.subject}</p>
            <h2 className="text-xl font-display font-bold">{lesson.title}</h2>
          </div>
          <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-medium">{formatDuration(totalDuration)}</span>
          </div>
        </div>

        { }
        <div className="flex items-center gap-4">
          <Progress value={overallProgress} className="h-2 flex-1 [&>div]:bg-white/80" />
          <span className="text-sm font-medium">{Math.round(overallProgress)}% complete</span>
        </div>
      </div>

      <div className="flex">
        { }
        <div className="w-64 border-r border-border bg-muted/30 p-4 hidden md:block">
          <h3 className="text-sm font-semibold text-foreground mb-4">Sections</h3>
          <div className="space-y-2">
            {lesson.sections.map((section, index) => {
              const isComplete = completedSections.has(section.id);
              const isCurrent = index === currentSectionIndex;

              return (
                <button
                  key={section.id}
                  onClick={() => {
                    setCurrentSectionIndex(index);
                    setSectionProgress(isComplete ? 100 : 0);
                    setIsPlaying(false);
                  }}
                  className={cn(
                    "w-full text-left p-3 rounded-lg transition-all",
                    isCurrent && "bg-primary/10 border border-primary/30",
                    !isCurrent && "hover:bg-muted"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0",
                      isComplete && "bg-secondary text-secondary-foreground",
                      isCurrent && !isComplete && "bg-primary text-primary-foreground",
                      !isCurrent && !isComplete && "bg-muted text-muted-foreground"
                    )}>
                      {isComplete ? <CheckCircle className="w-4 h-4" /> : index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "text-sm font-medium truncate",
                        isCurrent ? "text-foreground" : "text-muted-foreground"
                      )}>
                        {section.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDuration(section.duration)}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        { }
        <div className="flex-1 p-8">
          <div className="animate-fade-in" key={currentSection.id}>
            { }
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{currentSection.title}</h3>
                <p className="text-sm text-muted-foreground capitalize">{currentSection.type} • {formatDuration(currentSection.duration)}</p>
              </div>
            </div>

            { }
            <div className="bg-muted/30 rounded-xl p-6 mb-6 min-h-[300px]">
              {currentSection.type === "video" && (
                <div className="aspect-video bg-background rounded-lg flex items-center justify-center mb-4">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3">
                      {isPlaying ? (
                        <Pause className="w-8 h-8 text-primary" />
                      ) : (
                        <Play className="w-8 h-8 text-primary ml-1" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">Video placeholder</p>
                  </div>
                </div>
              )}

              <div className="prose prose-sm max-w-none text-foreground">
                <p>{currentSection.content}</p>
              </div>
            </div>

            { }
            {!completedSections.has(currentSection.id) && (
              <div className="mb-6">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Section progress</span>
                  <span className="text-foreground font-medium">{Math.round(sectionProgress)}%</span>
                </div>
                <Progress value={sectionProgress} className="h-2 [&>div]:bg-primary" />
              </div>
            )}

            { }
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentSectionIndex === 0}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>

              <div className="flex items-center gap-4">
                {!completedSections.has(currentSection.id) ? (
                  <Button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="btn-bounce"
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="w-4 h-4 mr-2" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        {sectionProgress > 0 ? "Continue" : "Start"}
                      </>
                    )}
                  </Button>
                ) : (
                  <span className="flex items-center gap-2 text-secondary font-medium">
                    <CheckCircle className="w-5 h-5" />
                    Completed
                  </span>
                )}
              </div>

              <Button
                variant="outline"
                onClick={handleNext}
                disabled={currentSectionIndex === lesson.sections.length - 1}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
