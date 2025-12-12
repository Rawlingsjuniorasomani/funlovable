import { useState } from "react";
import { Hand, X, ChevronUp, ChevronDown, Check, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface HandRaiseEntry {
  id: string;
  participantId: string;
  participantName: string;
  avatar: string;
  raisedAt: Date;
  status: 'waiting' | 'acknowledged' | 'answered';
  question?: string;
}

interface HandRaiseQueueProps {
  isHost?: boolean;
  currentUserId?: string;
  currentUserName?: string;
}

export function HandRaiseQueue({ 
  isHost = false, 
  currentUserId = 'student1',
  currentUserName = 'Student'
}: HandRaiseQueueProps) {
  const [queue, setQueue] = useState<HandRaiseEntry[]>([
    { id: '1', participantId: 'p1', participantName: 'Ama Mensah', avatar: 'AM', raisedAt: new Date(Date.now() - 120000), status: 'waiting' },
    { id: '2', participantId: 'p2', participantName: 'Kofi Owusu', avatar: 'KO', raisedAt: new Date(Date.now() - 60000), status: 'acknowledged' },
  ]);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [question, setQuestion] = useState('');
  const [showQuestionInput, setShowQuestionInput] = useState(false);

  const raiseHand = () => {
    if (isHandRaised) {
      // Lower hand
      setQueue(queue.filter(e => e.participantId !== currentUserId));
      setIsHandRaised(false);
      toast.info('Hand lowered');
    } else {
      // Raise hand
      const newEntry: HandRaiseEntry = {
        id: Date.now().toString(),
        participantId: currentUserId,
        participantName: currentUserName,
        avatar: currentUserName.split(' ').map(n => n[0]).join('').toUpperCase(),
        raisedAt: new Date(),
        status: 'waiting',
        question: question || undefined
      };
      setQueue([...queue, newEntry]);
      setIsHandRaised(true);
      setQuestion('');
      setShowQuestionInput(false);
      toast.success('Hand raised! You are in the queue.');
    }
  };

  const acknowledgeHand = (entryId: string) => {
    setQueue(queue.map(e => 
      e.id === entryId ? { ...e, status: 'acknowledged' as const } : e
    ));
    toast.success('Student acknowledged');
  };

  const answerStudent = (entryId: string) => {
    setQueue(queue.map(e => 
      e.id === entryId ? { ...e, status: 'answered' as const } : e
    ));
    toast.success('Marked as answered');
  };

  const removeFromQueue = (entryId: string) => {
    const entry = queue.find(e => e.id === entryId);
    setQueue(queue.filter(e => e.id !== entryId));
    if (entry?.participantId === currentUserId) {
      setIsHandRaised(false);
    }
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newQueue = [...queue];
    [newQueue[index], newQueue[index - 1]] = [newQueue[index - 1], newQueue[index]];
    setQueue(newQueue);
  };

  const moveDown = (index: number) => {
    if (index === queue.length - 1) return;
    const newQueue = [...queue];
    [newQueue[index], newQueue[index + 1]] = [newQueue[index + 1], newQueue[index]];
    setQueue(newQueue);
  };

  const formatWaitTime = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m`;
  };

  const waitingCount = queue.filter(e => e.status === 'waiting').length;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Hand className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Hand Raise Queue</h3>
          {waitingCount > 0 && (
            <Badge variant="secondary">{waitingCount} waiting</Badge>
          )}
        </div>
      </div>

      {/* Student's raise hand button */}
      {!isHost && (
        <div className="p-4 border-b border-border">
          <Button 
            onClick={raiseHand}
            variant={isHandRaised ? "destructive" : "default"}
            className="w-full gap-2"
          >
            <Hand className={cn("w-4 h-4", isHandRaised && "animate-bounce")} />
            {isHandRaised ? 'Lower Hand' : 'Raise Hand'}
          </Button>
          {isHandRaised && (
            <p className="text-sm text-center text-muted-foreground mt-2">
              Position in queue: {queue.findIndex(e => e.participantId === currentUserId) + 1}
            </p>
          )}
        </div>
      )}

      {/* Queue List */}
      <ScrollArea className="flex-1 p-4">
        {queue.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <Hand className="w-12 h-12 mx-auto mb-2 opacity-20" />
            <p>No hands raised</p>
            {!isHost && <p className="text-sm">Raise your hand to ask a question!</p>}
          </div>
        ) : (
          <div className="space-y-2">
            {queue.map((entry, index) => (
              <div 
                key={entry.id}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border transition-colors",
                  entry.status === 'waiting' && "bg-star/5 border-star/20",
                  entry.status === 'acknowledged' && "bg-primary/5 border-primary/20",
                  entry.status === 'answered' && "bg-secondary/5 border-secondary/20 opacity-60"
                )}
              >
                {/* Position */}
                <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                  {index + 1}
                </div>

                {/* Avatar */}
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                    {entry.avatar}
                  </AvatarFallback>
                </Avatar>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm truncate">{entry.participantName}</p>
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "text-xs",
                        entry.status === 'waiting' && "text-star border-star/30",
                        entry.status === 'acknowledged' && "text-primary border-primary/30",
                        entry.status === 'answered' && "text-secondary border-secondary/30"
                      )}
                    >
                      {entry.status === 'waiting' && <><Clock className="w-3 h-3 mr-1" /> Waiting</>}
                      {entry.status === 'acknowledged' && <><Check className="w-3 h-3 mr-1" /> Acknowledged</>}
                      {entry.status === 'answered' && <><Check className="w-3 h-3 mr-1" /> Answered</>}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{formatWaitTime(entry.raisedAt)} ago</span>
                    {entry.question && <span>• "{entry.question}"</span>}
                  </div>
                </div>

                {/* Host Actions */}
                {isHost && (
                  <div className="flex items-center gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7"
                      onClick={() => moveUp(index)}
                      disabled={index === 0}
                    >
                      <ChevronUp className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7"
                      onClick={() => moveDown(index)}
                      disabled={index === queue.length - 1}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                    {entry.status === 'waiting' && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => acknowledgeHand(entry.id)}
                      >
                        Acknowledge
                      </Button>
                    )}
                    {entry.status === 'acknowledged' && (
                      <Button 
                        variant="default" 
                        size="sm"
                        onClick={() => answerStudent(entry.id)}
                      >
                        Answered
                      </Button>
                    )}
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7 text-destructive"
                      onClick={() => removeFromQueue(entry.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Stats for host */}
      {isHost && queue.length > 0 && (
        <div className="p-3 border-t border-border bg-muted/30">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Total: {queue.length} • Waiting: {waitingCount} • Answered: {queue.filter(e => e.status === 'answered').length}
            </span>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setQueue(queue.filter(e => e.status !== 'answered'))}
            >
              Clear Answered
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
