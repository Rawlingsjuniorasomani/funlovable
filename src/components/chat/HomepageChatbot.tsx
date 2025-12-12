import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { BRANDING } from "@/config/branding";

interface ChatMessage {
  id: string;
  role: "user" | "bot";
  content: string;
  timestamp: Date;
}

const botResponses: Record<string, string> = {
  hello: `Hello! Welcome to ${BRANDING.schoolName}! How can I help you today?`,
  hi: `Hi there! Welcome to ${BRANDING.schoolName}! I'm here to help you with any questions.`,
  help: `I can help you with:\n• Information about our subjects and courses\n• How to register as a student or parent\n• Understanding our pricing plans\n• Technical support\n• General questions about learning`,
  subjects: `We offer a wide range of subjects including:\n• Mathematics\n• Science\n• English\n• Social Studies\n• ICT\n• French\n• Religious & Moral Education\n\nEach subject has interactive lessons, quizzes, and live classes!`,
  price: `Our pricing plans:\n• Basic: Free - Access to limited content\n• Standard: $19.99/month - Full course access\n• Premium: $29.99/month - All features + live classes\n\nVisit our pricing page for more details!`,
  pricing: `Our pricing plans:\n• Basic: Free - Access to limited content\n• Standard: $19.99/month - Full course access\n• Premium: $29.99/month - All features + live classes\n\nVisit our pricing page for more details!`,
  register: `To register:\n1. Click "Get Started" on our homepage\n2. Choose your role (Student or Parent)\n3. Fill in your details\n4. Verify your email\n5. Start learning!\n\nNeed more help with registration?`,
  signup: `To sign up:\n1. Click "Get Started" on our homepage\n2. Choose your role (Student or Parent)\n3. Fill in your details\n4. Verify your email\n5. Start learning!`,
  contact: `You can reach us at:\n• Email: ${BRANDING.contact.email}\n• Phone: ${BRANDING.contact.phone}\n• Address: ${BRANDING.contact.address}\n\nOr use the contact form on our website!`,
  quiz: `Our quizzes are interactive assessments that help you test your knowledge. Features include:\n• Multiple choice questions\n• True/False questions\n• Instant feedback\n• Score tracking\n• Leaderboards`,
  live: `Live classes allow you to:\n• Join real-time video sessions with teachers\n• Ask questions directly\n• Interact with classmates\n• View shared screens\n• Participate in discussions`,
  teacher: `Our teachers are qualified professionals who:\n• Create engaging lessons\n• Host live classes\n• Grade assignments\n• Provide personalized feedback\n• Award badges and rewards`,
  parent: `As a parent, you can:\n• Monitor your child's progress\n• View grades and assignments\n• Communicate with teachers\n• Manage subscriptions\n• Track learning activity`,
  default: `I'm not sure I understand. Could you please rephrase your question? You can ask me about:\n• Subjects we offer\n• Pricing plans\n• How to register\n• Live classes\n• Quizzes and assignments`,
};

const findBestResponse = (message: string): string => {
  const lowerMessage = message.toLowerCase();
  
  for (const [keyword, response] of Object.entries(botResponses)) {
    if (lowerMessage.includes(keyword)) {
      return response;
    }
  }
  
  return botResponses.default;
};

export function HomepageChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      role: "bot",
      content: `Hello! Welcome to ${BRANDING.schoolName}! 👋\n\nI'm your virtual assistant. How can I help you today?`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Simulate bot response delay
    setTimeout(() => {
      const botResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "bot",
        content: findBestResponse(input),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg z-50 bg-primary hover:bg-primary/90 animate-bounce"
        size="icon"
      >
        <MessageCircle className="w-6 h-6" />
      </Button>
    );
  }

  return (
    <div
      className={cn(
        "fixed bottom-6 right-6 z-50 transition-all duration-300",
        isMinimized ? "w-72" : "w-96"
      )}
    >
      <div className="bg-card rounded-2xl shadow-2xl border border-border overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-secondary p-4 text-primary-foreground">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-background/20 flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold">{BRANDING.schoolShortName} Assistant</h3>
                <p className="text-xs text-primary-foreground/80">Online • Ready to help</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMinimized(!isMinimized)}
                className="text-primary-foreground hover:bg-white/20 w-8 h-8"
              >
                <Minimize2 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="text-primary-foreground hover:bg-white/20 w-8 h-8"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <ScrollArea className="h-80 p-4" ref={scrollRef}>
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex gap-2 animate-fade-in",
                      msg.role === "user" ? "flex-row-reverse" : "flex-row"
                    )}
                  >
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-secondary-foreground"
                      )}
                    >
                      {msg.role === "user" ? (
                        <User className="w-4 h-4" />
                      ) : (
                        <Bot className="w-4 h-4" />
                      )}
                    </div>
                    <div
                      className={cn(
                        "max-w-[80%] rounded-2xl px-4 py-2",
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground rounded-tr-sm"
                          : "bg-muted text-foreground rounded-tl-sm"
                      )}
                    >
                      <p className="text-sm whitespace-pre-line">{msg.content}</p>
                      <p
                        className={cn(
                          "text-xs mt-1",
                          msg.role === "user"
                            ? "text-primary-foreground/70"
                            : "text-muted-foreground"
                        )}
                      >
                        {formatTime(msg.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex gap-2">
                    <div className="w-8 h-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="p-4 border-t border-border">
              <div className="flex gap-2">
                <Input
                  placeholder="Type your question..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  className="flex-1"
                />
                <Button onClick={handleSend} size="icon">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground text-center mt-2">
                Try: "subjects", "pricing", "register", "live classes"
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
