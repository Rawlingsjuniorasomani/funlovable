import { useState } from "react";
import { Plus, Vote, Check, BarChart3, Trash2, Play, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PollOption {
  id: string;
  text: string;
  votes: number;
}

interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  status: 'draft' | 'active' | 'closed';
  totalVotes: number;
}

interface LivePollsProps {
  isHost?: boolean;
}

export function LivePolls({ isHost = true }: LivePollsProps) {
  const [polls, setPolls] = useState<Poll[]>([
    {
      id: '1',
      question: 'Did you understand today\'s lesson?',
      options: [
        { id: '1', text: 'Yes, completely!', votes: 8 },
        { id: '2', text: 'Mostly, need some review', votes: 4 },
        { id: '3', text: 'Need more explanation', votes: 2 },
      ],
      status: 'closed',
      totalVotes: 14
    }
  ]);
  const [newQuestion, setNewQuestion] = useState('');
  const [newOptions, setNewOptions] = useState(['', '', '', '']);
  const [isCreating, setIsCreating] = useState(false);
  const [votedPolls, setVotedPolls] = useState<Set<string>>(new Set());

  const createPoll = () => {
    if (!newQuestion.trim()) return;
    const validOptions = newOptions.filter(o => o.trim());
    if (validOptions.length < 2) return;

    const newPoll: Poll = {
      id: Date.now().toString(),
      question: newQuestion,
      options: validOptions.map((text, i) => ({ id: i.toString(), text, votes: 0 })),
      status: 'draft',
      totalVotes: 0
    };

    setPolls([newPoll, ...polls]);
    setNewQuestion('');
    setNewOptions(['', '', '', '']);
    setIsCreating(false);
  };

  const launchPoll = (pollId: string) => {
    setPolls(polls.map(p => 
      p.id === pollId ? { ...p, status: 'active' } : p
    ));
  };

  const closePoll = (pollId: string) => {
    setPolls(polls.map(p => 
      p.id === pollId ? { ...p, status: 'closed' } : p
    ));
  };

  const deletePoll = (pollId: string) => {
    setPolls(polls.filter(p => p.id !== pollId));
  };

  const vote = (pollId: string, optionId: string) => {
    if (votedPolls.has(pollId)) return;
    
    setPolls(polls.map(p => {
      if (p.id !== pollId) return p;
      return {
        ...p,
        totalVotes: p.totalVotes + 1,
        options: p.options.map(o => 
          o.id === optionId ? { ...o, votes: o.votes + 1 } : o
        )
      };
    }));
    setVotedPolls(new Set([...votedPolls, pollId]));
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Live Polls</h3>
        </div>
        {isHost && !isCreating && (
          <Button size="sm" onClick={() => setIsCreating(true)}>
            <Plus className="w-4 h-4 mr-1" /> Create Poll
          </Button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {/* Create Poll Form */}
        {isCreating && isHost && (
          <Card className="border-primary">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">New Poll</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                placeholder="Enter your question..."
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
              />
              <div className="space-y-2">
                {newOptions.map((option, i) => (
                  <Input
                    key={i}
                    placeholder={`Option ${i + 1}${i >= 2 ? ' (optional)' : ''}`}
                    value={option}
                    onChange={(e) => {
                      const updated = [...newOptions];
                      updated[i] = e.target.value;
                      setNewOptions(updated);
                    }}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={createPoll}>Create</Button>
                <Button size="sm" variant="ghost" onClick={() => setIsCreating(false)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Polls List */}
        {polls.map(poll => (
          <Card key={poll.id} className={cn(
            poll.status === 'active' && "border-secondary animate-pulse-subtle"
          )}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-sm">{poll.question}</CardTitle>
                  <Badge 
                    variant={
                      poll.status === 'active' ? 'default' : 
                      poll.status === 'closed' ? 'secondary' : 'outline'
                    }
                    className="mt-1"
                  >
                    {poll.status === 'active' ? 'Live' : poll.status}
                  </Badge>
                </div>
                {isHost && (
                  <div className="flex gap-1">
                    {poll.status === 'draft' && (
                      <Button size="icon" variant="ghost" onClick={() => launchPoll(poll.id)}>
                        <Play className="w-4 h-4 text-secondary" />
                      </Button>
                    )}
                    {poll.status === 'active' && (
                      <Button size="icon" variant="ghost" onClick={() => closePoll(poll.id)}>
                        <Square className="w-4 h-4 text-destructive" />
                      </Button>
                    )}
                    <Button size="icon" variant="ghost" onClick={() => deletePoll(poll.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {poll.options.map(option => {
                const percentage = poll.totalVotes > 0 
                  ? Math.round((option.votes / poll.totalVotes) * 100) 
                  : 0;
                const hasVoted = votedPolls.has(poll.id);

                return (
                  <div key={option.id} className="space-y-1">
                    {poll.status === 'active' && !hasVoted && !isHost ? (
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => vote(poll.id, option.id)}
                      >
                        <Vote className="w-4 h-4 mr-2" />
                        {option.text}
                      </Button>
                    ) : (
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="flex items-center gap-1">
                            {hasVoted && <Check className="w-3 h-3 text-secondary" />}
                            {option.text}
                          </span>
                          <span className="text-muted-foreground">
                            {option.votes} ({percentage}%)
                          </span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    )}
                  </div>
                );
              })}
              {poll.totalVotes > 0 && (
                <p className="text-xs text-muted-foreground text-right mt-2">
                  {poll.totalVotes} total votes
                </p>
              )}
            </CardContent>
          </Card>
        ))}

        {polls.length === 0 && !isCreating && (
          <div className="text-center text-muted-foreground py-8">
            <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-20" />
            <p>No polls yet</p>
            {isHost && <p className="text-sm">Create a poll to engage your class!</p>}
          </div>
        )}
      </div>
    </div>
  );
}
