import { useState } from "react";
import { Send, Search, User, Clock, Check, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  from: "parent" | "teacher";
  content: string;
  timestamp: string;
  read: boolean;
}

interface Teacher {
  id: string;
  name: string;
  subject: string;
  avatar: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unread: number;
}

const mockTeachers: Teacher[] = [
  { id: "t1", name: "Mr. Adjei", subject: "Mathematics", avatar: "A", lastMessage: "Kwame is doing great in class!", lastMessageTime: "2h ago", unread: 1 },
  { id: "t2", name: "Mrs. Osei", subject: "English", avatar: "O", lastMessage: "Please review the homework assignment", lastMessageTime: "1d ago", unread: 0 },
  { id: "t3", name: "Mr. Mensah", subject: "Science", avatar: "M", lastMessage: "Quiz results are ready", lastMessageTime: "2d ago", unread: 0 },
];

const mockConversations: Record<string, Message[]> = {
  t1: [
    { id: "1", from: "teacher", content: "Good afternoon Mrs. Asante! I wanted to update you on Kwame's progress in Mathematics.", timestamp: "10:30 AM", read: true },
    { id: "2", from: "parent", content: "Thank you for reaching out. How is he doing?", timestamp: "10:35 AM", read: true },
    { id: "3", from: "teacher", content: "He's doing great! His quiz scores have improved significantly. He scored 9/10 on the last fractions quiz.", timestamp: "10:40 AM", read: true },
    { id: "4", from: "parent", content: "That's wonderful news! We've been practicing at home.", timestamp: "10:45 AM", read: true },
    { id: "5", from: "teacher", content: "Keep up the good work! I'll be sending home some extra practice worksheets this week.", timestamp: "10:50 AM", read: false },
  ],
  t2: [
    { id: "1", from: "teacher", content: "Hello Mrs. Asante, please remind Kwame to complete his reading comprehension homework by Friday.", timestamp: "Yesterday", read: true },
    { id: "2", from: "parent", content: "I'll make sure he completes it. Thank you for the reminder.", timestamp: "Yesterday", read: true },
  ],
  t3: [
    { id: "1", from: "teacher", content: "The Science quiz results are now available. Kwame scored 8/10.", timestamp: "2 days ago", read: true },
  ],
};

export function ParentMessages() {
  const { toast } = useToast();
  const [selectedTeacher, setSelectedTeacher] = useState<string | null>("t1");
  const [newMessage, setNewMessage] = useState("");
  const [conversations, setConversations] = useState(mockConversations);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredTeachers = mockTeachers.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentTeacher = mockTeachers.find(t => t.id === selectedTeacher);
  const currentMessages = selectedTeacher ? conversations[selectedTeacher] || [] : [];

  const handleSend = () => {
    if (!newMessage.trim() || !selectedTeacher) return;

    const message: Message = {
      id: `msg-${Date.now()}`,
      from: "parent",
      content: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: true,
    };

    setConversations(prev => ({
      ...prev,
      [selectedTeacher]: [...(prev[selectedTeacher] || []), message],
    }));
    setNewMessage("");
    toast({ title: "Message sent" });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-display font-bold text-foreground">Messages</h2>
        <p className="text-muted-foreground">Communicate with your children's teachers</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 h-[600px]">
        {/* Teachers List */}
        <div className="bg-card rounded-xl border border-border overflow-hidden flex flex-col">
          <div className="p-4 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search teachers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex-1 overflow-auto divide-y divide-border">
            {filteredTeachers.map((teacher) => (
              <button
                key={teacher.id}
                onClick={() => setSelectedTeacher(teacher.id)}
                className={cn(
                  "w-full p-4 text-left hover:bg-muted/50 transition-colors",
                  selectedTeacher === teacher.id && "bg-muted/50"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-tertiary flex items-center justify-center text-primary-foreground font-bold">
                      {teacher.avatar}
                    </div>
                    {teacher.unread > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground rounded-full text-xs flex items-center justify-center">
                        {teacher.unread}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <h4 className="font-medium text-foreground">{teacher.name}</h4>
                      <span className="text-xs text-muted-foreground">{teacher.lastMessageTime}</span>
                    </div>
                    <p className="text-xs text-primary mb-1">{teacher.subject}</p>
                    <p className="text-sm text-muted-foreground truncate">{teacher.lastMessage}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-border overflow-hidden flex flex-col">
          {selectedTeacher && currentTeacher ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-border bg-muted/30 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-tertiary flex items-center justify-center text-primary-foreground font-bold">
                  {currentTeacher.avatar}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{currentTeacher.name}</h3>
                  <p className="text-xs text-muted-foreground">{currentTeacher.subject} Teacher</p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-auto p-4 space-y-4">
                {currentMessages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex",
                      message.from === "parent" ? "justify-end" : "justify-start"
                    )}
                  >
                    <div className={cn(
                      "max-w-[70%] rounded-2xl px-4 py-2",
                      message.from === "parent" 
                        ? "bg-primary text-primary-foreground rounded-br-sm" 
                        : "bg-muted text-foreground rounded-bl-sm"
                    )}>
                      <p className="text-sm">{message.content}</p>
                      <div className={cn(
                        "flex items-center justify-end gap-1 mt-1",
                        message.from === "parent" ? "text-primary-foreground/60" : "text-muted-foreground"
                      )}>
                        <span className="text-xs">{message.timestamp}</span>
                        {message.from === "parent" && (
                          message.read ? <CheckCheck className="w-3 h-3" /> : <Check className="w-3 h-3" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-border">
                <div className="flex gap-2">
                  <Input
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSend()}
                    className="flex-1"
                  />
                  <Button onClick={handleSend} disabled={!newMessage.trim()}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Select a teacher to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
