import { useState, useRef, useEffect, useCallback } from "react";
import { 
  Video, VideoOff, Mic, MicOff, Phone, PhoneOff, 
  Users, MessageSquare, Settings, Maximize, Minimize,
  MonitorUp, Hand, MoreVertical, Copy, Share2,
  PenTool, BarChart3, Users2, Circle, Edit3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Whiteboard } from "./Whiteboard";
import { LivePolls } from "./LivePolls";
import { BreakoutRooms } from "./BreakoutRooms";
import { RecordingControls } from "./RecordingControls";
import { ScreenAnnotation } from "./ScreenAnnotation";
import { HandRaiseQueue } from "./HandRaiseQueue";

interface Participant {
  id: string;
  name: string;
  role: "teacher" | "student";
  avatar?: string;
  isMuted: boolean;
  isVideoOff: boolean;
  isHandRaised: boolean;
  stream?: MediaStream;
}

interface ChatMessage {
  id: string;
  sender: string;
  content: string;
  timestamp: Date;
}

interface VideoConferenceProps {
  classId?: string;
  className?: string;
  isHost?: boolean;
  userName?: string;
  onLeave?: () => void;
}

const mockParticipants: Participant[] = [
  { id: "1", name: "Mr. Adjei", role: "teacher", avatar: "A", isMuted: false, isVideoOff: false, isHandRaised: false },
  { id: "2", name: "Kwame Asante", role: "student", avatar: "K", isMuted: true, isVideoOff: false, isHandRaised: false },
  { id: "3", name: "Ama Mensah", role: "student", avatar: "A", isMuted: true, isVideoOff: true, isHandRaised: true },
  { id: "4", name: "Kofi Owusu", role: "student", avatar: "K", isMuted: true, isVideoOff: false, isHandRaised: false },
];

export function VideoConference({ 
  classId = "class-123",
  className = "Primary 5 Mathematics",
  isHost = true,
  userName = "Mr. Adjei",
  onLeave
}: VideoConferenceProps) {
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>(mockParticipants);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: "1", sender: "Kwame Asante", content: "Good morning, sir!", timestamp: new Date(Date.now() - 60000) },
    { id: "2", sender: "Mr. Adjei", content: "Good morning class! Today we'll be learning about fractions.", timestamp: new Date(Date.now() - 30000) },
  ]);
  const [newMessage, setNewMessage] = useState("");
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  
  // Enhanced features state
  const [showWhiteboard, setShowWhiteboard] = useState(false);
  const [showPolls, setShowPolls] = useState(false);
  const [showBreakoutRooms, setShowBreakoutRooms] = useState(false);
  const [showRecording, setShowRecording] = useState(false);
  const [showHandRaise, setShowHandRaise] = useState(false);
  const [showAnnotation, setShowAnnotation] = useState(false);
  const [activePanel, setActivePanel] = useState<'chat' | 'participants' | 'tools'>('chat');
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize local video stream
  useEffect(() => {
    const initStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.log("Camera/mic access denied or unavailable");
        toast.error("Could not access camera/microphone. Please check permissions.");
      }
    };
    
    initStream();
    
    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const toggleVideo = useCallback(() => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
    }
    setIsVideoOn(!isVideoOn);
  }, [localStream, isVideoOn]);

  const toggleMute = useCallback(() => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
    }
    setIsMuted(!isMuted);
  }, [localStream, isMuted]);

  const toggleScreenShare = useCallback(async () => {
    if (isScreenSharing) {
      setIsScreenSharing(false);
      toast.info("Screen sharing stopped");
    } else {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true
        });
        setIsScreenSharing(true);
        toast.success("Screen sharing started");
        
        screenStream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false);
          toast.info("Screen sharing stopped");
        };
      } catch (error) {
        toast.error("Could not share screen");
      }
    }
  }, [isScreenSharing]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  const handleLeave = useCallback(() => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    toast.info("You left the meeting");
    onLeave?.();
  }, [localStream, onLeave]);

  const sendMessage = () => {
    if (!newMessage.trim()) return;
    
    const message: ChatMessage = {
      id: Date.now().toString(),
      sender: userName,
      content: newMessage,
      timestamp: new Date(),
    };
    setChatMessages(prev => [...prev, message]);
    setNewMessage("");
  };

  const copyMeetingLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/live/${classId}`);
    toast.success("Meeting link copied to clipboard!");
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const closePanels = () => {
    setShowChat(false);
    setShowParticipants(false);
  };

  const togglePanel = (panel: 'chat' | 'participants') => {
    if (panel === 'chat') {
      setShowChat(!showChat);
      setShowParticipants(false);
    } else {
      setShowParticipants(!showParticipants);
      setShowChat(false);
    }
  };

  return (
    <div 
      ref={containerRef}
      className={cn(
        "flex flex-col bg-background rounded-xl overflow-hidden border border-border",
        isFullscreen ? "fixed inset-0 z-50 rounded-none" : "h-[calc(100vh-12rem)]"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-destructive rounded-full animate-pulse" />
          <div>
            <h3 className="font-semibold text-foreground">{className}</h3>
            <p className="text-xs text-muted-foreground">
              {participants.length} participants • Live
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={copyMeetingLink} className="hidden sm:flex gap-2">
            <Share2 className="w-4 h-4" />
            Share
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleFullscreen}
          >
            {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Video Grid / Whiteboard */}
        <div className="flex-1 p-4 bg-muted/30">
          {showWhiteboard ? (
            <Whiteboard isHost={isHost} onClose={() => setShowWhiteboard(false)} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 h-full">
              {/* Local Video (Main) */}
              <div className="relative col-span-1 sm:col-span-2 lg:col-span-2 row-span-2 bg-card rounded-xl overflow-hidden border border-border">
                {isVideoOn ? (
                  <video
                    ref={localVideoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted">
                    <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-4xl font-bold text-primary">
                        {userName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                )}
                <div className="absolute bottom-4 left-4 flex items-center gap-2">
                  <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
                    {userName} {isHost && "(Host)"}
                  </Badge>
                  {isMuted && <MicOff className="w-4 h-4 text-destructive" />}
                </div>
                {isScreenSharing && (
                  <Badge className="absolute top-4 left-4 bg-destructive">
                    Sharing Screen
                  </Badge>
                )}
              </div>

              {/* Participant Videos */}
              {participants.slice(1, 4).map((participant) => (
                <div 
                  key={participant.id}
                  className="relative bg-card rounded-xl overflow-hidden border border-border aspect-video"
                >
                  {!participant.isVideoOff ? (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                      <Avatar className="w-16 h-16">
                        <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                          {participant.avatar}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted">
                      <Avatar className="w-16 h-16">
                        <AvatarFallback className="text-2xl bg-muted-foreground/20">
                          {participant.avatar}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  )}
                  <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                    <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm text-xs truncate max-w-[80%]">
                      {participant.name}
                    </Badge>
                    <div className="flex items-center gap-1">
                      {participant.isHandRaised && <Hand className="w-3 h-3 text-star" />}
                      {participant.isMuted && <MicOff className="w-3 h-3 text-destructive" />}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Side Panel */}
        {(showChat || showParticipants) && (
          <div className="w-80 border-l border-border bg-card flex flex-col">
            <Tabs value={activePanel} onValueChange={(v) => setActivePanel(v as any)} className="flex-1 flex flex-col">
              <TabsList className="w-full rounded-none border-b border-border">
                <TabsTrigger value="chat" className="flex-1">Chat</TabsTrigger>
                <TabsTrigger value="participants" className="flex-1">
                  People ({participants.length})
                </TabsTrigger>
                <TabsTrigger value="tools" className="flex-1">Tools</TabsTrigger>
              </TabsList>

              <TabsContent value="chat" className="flex-1 flex flex-col m-0">
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {chatMessages.map((msg) => (
                      <div key={msg.id} className="animate-fade-in">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm text-foreground">{msg.sender}</span>
                          <span className="text-xs text-muted-foreground">{formatTime(msg.timestamp)}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{msg.content}</p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                <div className="p-4 border-t border-border">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Send a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    />
                    <Button onClick={sendMessage} size="icon">
                      <MessageSquare className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="participants" className="flex-1 m-0">
                <ScrollArea className="h-full p-4">
                  <div className="space-y-2">
                    {participants.map((p) => (
                      <div key={p.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className={cn(
                            "text-sm",
                            p.role === "teacher" ? "bg-tertiary text-tertiary-foreground" : "bg-primary text-primary-foreground"
                          )}>
                            {p.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-foreground truncate">
                            {p.name}
                            {p.role === "teacher" && <Badge variant="outline" className="ml-2 text-xs">Host</Badge>}
                          </p>
                          <p className="text-xs text-muted-foreground capitalize">{p.role}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          {p.isHandRaised && <Hand className="w-4 h-4 text-star" />}
                          {p.isMuted ? <MicOff className="w-4 h-4 text-muted-foreground" /> : <Mic className="w-4 h-4 text-secondary" />}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="tools" className="flex-1 m-0 p-4">
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start gap-3"
                    onClick={() => { setShowWhiteboard(!showWhiteboard); closePanels(); }}
                  >
                    <PenTool className="w-4 h-4" />
                    {showWhiteboard ? 'Close Whiteboard' : 'Open Whiteboard'}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start gap-3"
                    onClick={() => setShowPolls(true)}
                  >
                    <BarChart3 className="w-4 h-4" />
                    Live Polls
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start gap-3"
                    onClick={() => setShowHandRaise(true)}
                  >
                    <Hand className="w-4 h-4" />
                    Hand Raise Queue
                  </Button>
                  {isHost && (
                    <>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start gap-3"
                        onClick={() => setShowBreakoutRooms(true)}
                      >
                        <Users2 className="w-4 h-4" />
                        Breakout Rooms
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start gap-3"
                        onClick={() => setShowRecording(true)}
                      >
                        <Circle className="w-4 h-4" />
                        Recording
                      </Button>
                      {isScreenSharing && (
                        <Button 
                          variant="outline" 
                          className="w-full justify-start gap-3"
                          onClick={() => setShowAnnotation(true)}
                        >
                          <Edit3 className="w-4 h-4" />
                          Screen Annotation
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="p-4 border-t border-border bg-card">
        <div className="flex items-center justify-center gap-2 sm:gap-4">
          <Button
            variant={isMuted ? "destructive" : "secondary"}
            size="icon"
            onClick={toggleMute}
            className="w-12 h-12 rounded-full"
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </Button>
          
          <Button
            variant={!isVideoOn ? "destructive" : "secondary"}
            size="icon"
            onClick={toggleVideo}
            className="w-12 h-12 rounded-full"
          >
            {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </Button>

          <Button
            variant={isScreenSharing ? "default" : "secondary"}
            size="icon"
            onClick={toggleScreenShare}
            className="w-12 h-12 rounded-full hidden sm:flex"
          >
            <MonitorUp className="w-5 h-5" />
          </Button>

          <Button
            variant={showWhiteboard ? "default" : "secondary"}
            size="icon"
            onClick={() => setShowWhiteboard(!showWhiteboard)}
            className="w-12 h-12 rounded-full hidden sm:flex"
          >
            <PenTool className="w-5 h-5" />
          </Button>

          <Button
            variant={showChat || showParticipants ? "default" : "secondary"}
            size="icon"
            onClick={() => togglePanel('chat')}
            className="w-12 h-12 rounded-full"
          >
            <MessageSquare className="w-5 h-5" />
          </Button>

          <Button
            variant={showParticipants ? "default" : "secondary"}
            size="icon"
            onClick={() => togglePanel('participants')}
            className="w-12 h-12 rounded-full"
          >
            <Users className="w-5 h-5" />
          </Button>

          <Button
            variant="destructive"
            size="icon"
            onClick={handleLeave}
            className="w-12 h-12 rounded-full"
          >
            <PhoneOff className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Live Polls Dialog */}
      <Dialog open={showPolls} onOpenChange={setShowPolls}>
        <DialogContent className="max-w-md max-h-[80vh] p-0">
          <LivePolls isHost={isHost} />
        </DialogContent>
      </Dialog>

      {/* Breakout Rooms Dialog */}
      <Dialog open={showBreakoutRooms} onOpenChange={setShowBreakoutRooms}>
        <DialogContent className="max-w-lg max-h-[80vh] p-0">
          <BreakoutRooms isHost={isHost} />
        </DialogContent>
      </Dialog>

      {/* Recording Dialog */}
      <Dialog open={showRecording} onOpenChange={setShowRecording}>
        <DialogContent className="max-w-md max-h-[80vh] p-0">
          <RecordingControls isHost={isHost} stream={localStream} />
        </DialogContent>
      </Dialog>

      {/* Hand Raise Queue Dialog */}
      <Dialog open={showHandRaise} onOpenChange={setShowHandRaise}>
        <DialogContent className="max-w-md max-h-[80vh] p-0">
          <HandRaiseQueue isHost={isHost} currentUserName={userName} />
        </DialogContent>
      </Dialog>

      {/* Screen Annotation Overlay */}
      <ScreenAnnotation isActive={showAnnotation} onClose={() => setShowAnnotation(false)} />
    </div>
  );
}
