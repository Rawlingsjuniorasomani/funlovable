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
import { socket, connectSocket, disconnectSocket } from "@/services/socket";

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
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);


  const [showWhiteboard, setShowWhiteboard] = useState(false);
  const [showPolls, setShowPolls] = useState(false);
  const [showBreakoutRooms, setShowBreakoutRooms] = useState(false);
  const [showRecording, setShowRecording] = useState(false);
  const [showHandRaise, setShowHandRaise] = useState(false);
  const [showAnnotation, setShowAnnotation] = useState(false);
  const [activePanel, setActivePanel] = useState<'chat' | 'participants' | 'tools'>('chat');


  const [isWaiting, setIsWaiting] = useState(false);
  const [waitingStudents, setWaitingStudents] = useState<{ socketId: string, user: any }[]>([]);
  const peersRef = useRef<{ [key: string]: RTCPeerConnection }>({});
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);


  // Re-attach stream to video element when it becomes available
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream, showWhiteboard, isVideoOn]);

  useEffect(() => {
    connectSocket();

    const initStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
        setLocalStream(stream);
        return stream;
      } catch (error) {
        console.log("Camera/mic access denied or unavailable");
        toast.error("Could not access camera/microphone. Please check permissions.");
        return null;
      }
    };

    let currentStream: MediaStream | null = null;
    initStream().then(stream => {
      currentStream = stream;

      socket.emit('join-class', {
        classId,
        user: { id: socket.id, name: userName, role: isHost ? 'teacher' : 'student' }
      });
    });

    socket.on('waiting', () => {
      setIsWaiting(true);
      toast.info("Waiting for teacher to admit you...");
    });

    socket.on('waiting-list', (list) => {
      if (isHost) {
        setWaitingStudents(list);
        if (list.length > 0 && !showParticipants) {
          toast.info(`${list.length} students waiting in the lobby`);
        }
      }
    });

    socket.on('joined', ({ isHost: hostStatus }) => {
      setIsWaiting(false);
      toast.success("Joined the class!");
    });

    socket.on('student-waiting', (student) => {
      if (isHost) {
        setWaitingStudents(prev => {
          if (prev.find(s => s.socketId === student.socketId)) return prev;
          return [...prev, student];
        });
        toast("New student waiting: " + student.user.name);
      }
    });

    socket.on('user-connected', async ({ socketId, user }) => {
      // Remove from waiting list if present
      setWaitingStudents(prev => prev.filter(s => s.socketId !== socketId));

      const peer = createPeer(socketId, socket.id, currentStream);
      peersRef.current[socketId] = peer;


      setParticipants(prev => {
        if (!prev.find(p => p.id === socketId)) {
          return [...prev, {
            id: socketId,
            name: user.name,
            role: user.role,
            isMuted: false,
            isVideoOff: false,
            isHandRaised: false,
            avatar: user.name[0]?.toUpperCase() || '?'
          }];
        }
        return prev;
      });
    });

    socket.on('offer', async (payload) => {
      const peer = addPeer(payload.caller, socket.id, payload.sdp, currentStream);
      peersRef.current[payload.caller] = peer;
    });

    socket.on('answer', (payload) => {
      const peer = peersRef.current[payload.caller];
      if (peer) {
        peer.setRemoteDescription(new RTCSessionDescription(payload.sdp));
      }
    });

    socket.on('ice-candidate', (payload) => {
      const peer = peersRef.current[payload.caller];
      if (peer && payload.candidate) {
        peer.addIceCandidate(new RTCIceCandidate(payload.candidate));
      }
    });

    return () => {
      disconnectSocket();
      Object.values(peersRef.current).forEach(p => p.close());
      if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [classId, isHost, userName]);



  const createPeer = (targetSocketId: string, callerSocketId: string, stream: MediaStream | null) => {
    const peer = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
    if (stream) {
      stream.getTracks().forEach(track => peer.addTrack(track, stream));
    }

    peer.onicecandidate = (e) => {
      if (e.candidate) {
        socket.emit('ice-candidate', { target: targetSocketId, candidate: e.candidate, caller: callerSocketId });
      }
    };

    peer.ontrack = (e) => {
      const remoteStream = e.streams[0];

      let audio = audioRefs.current[targetSocketId];
      if (!audio) {
        audio = new Audio();
        audio.autoplay = true;
        audioRefs.current[targetSocketId] = audio;
      }
      audio.srcObject = remoteStream;
    };

    peer.createOffer().then(offer => {
      peer.setLocalDescription(offer);
      socket.emit('offer', { target: targetSocketId, caller: callerSocketId, sdp: offer });
    });

    return peer;
  };

  const addPeer = (callerSocketId: string, receiverSocketId: string, offer: any, stream: MediaStream | null) => {
    const peer = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
    if (stream) {
      stream.getTracks().forEach(track => peer.addTrack(track, stream));
    }

    peer.onicecandidate = (e) => {
      if (e.candidate) {
        socket.emit('ice-candidate', { target: callerSocketId, candidate: e.candidate, caller: receiverSocketId });
      }
    };

    peer.ontrack = (e) => {
      const remoteStream = e.streams[0];
      let audio = audioRefs.current[callerSocketId];
      if (!audio) {
        audio = new Audio();
        audio.autoplay = true;
        audioRefs.current[callerSocketId] = audio;
      }
      audio.srcObject = remoteStream;
    };

    peer.setRemoteDescription(new RTCSessionDescription(offer));
    peer.createAnswer().then(answer => {
      peer.setLocalDescription(answer);
      socket.emit('answer', { target: callerSocketId, caller: receiverSocketId, sdp: answer });
    });

    return peer;
  };

  const handleAdmitAll = () => {
    waitingStudents.forEach(s => {
      socket.emit('admit-student', { classId, socketId: s.socketId });
    });
    setWaitingStudents([]);
    toast.success("Admitting all students...");
  };

  const handleAdmit = (socketId: string) => {
    socket.emit('admit-student', { classId, socketId });
    setWaitingStudents(prev => prev.filter(s => s.socketId !== socketId));
    toast.success("Student admitted");
  };


  const toggleVideo = useCallback(async () => {
    if (!isVideoOn) {

      if (localStream && localStream.getVideoTracks().length > 0) {
        const track = localStream.getVideoTracks()[0];
        if (track.readyState === 'ended') {
          try {
            const newStream = await navigator.mediaDevices.getUserMedia({ video: true });
            const newTrack = newStream.getVideoTracks()[0];
            localStream.getVideoTracks().forEach(t => t.stop());
            localStream.removeTrack(track);
            localStream.addTrack(newTrack);
            if (localVideoRef.current) localVideoRef.current.srcObject = localStream;


            Object.values(peersRef.current).forEach(peer => {
              const senders = peer.getSenders();
              const sender = senders.find(s => s.track?.kind === 'video');
              if (sender) sender.replaceTrack(newTrack);
            });

          } catch (e) {
            toast.error("Could not restart camera");
            return;
          }
        } else {
          track.enabled = true;
        }
      } else {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
          if (localStream) {
            const videoTrack = stream.getVideoTracks()[0];
            localStream.addTrack(videoTrack);

            Object.values(peersRef.current).forEach(peer => {
              peer.addTrack(videoTrack, localStream);
            });
          } else {
            setLocalStream(stream);
            if (localVideoRef.current) localVideoRef.current.srcObject = stream;
          }
        } catch (e) {
          toast.error("Could not access camera");
          return;
        }
      }
      setIsVideoOn(true);
    } else {

      if (localStream) {
        localStream.getVideoTracks().forEach(track => {
          track.enabled = false;
          track.stop();
        });
      }
      setIsVideoOn(false);
    }
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
      // Create logic to stop sharing and revert to camera
      if (localStream) {
        const cameraTrack = localStream.getVideoTracks()[0];
        Object.values(peersRef.current).forEach(peer => {
          const senders = peer.getSenders();
          const sender = senders.find(s => s.track?.kind === 'video');
          if (sender && cameraTrack) sender.replaceTrack(cameraTrack);
        });
      }
      setIsScreenSharing(false);
      toast.info("Screen sharing stopped");
    } else {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true
        });
        const screenTrack = screenStream.getVideoTracks()[0];

        setIsScreenSharing(true);
        toast.success("Screen sharing started");

        // Replace track for all peers
        Object.values(peersRef.current).forEach(peer => {
          const senders = peer.getSenders();
          const sender = senders.find(s => s.track?.kind === 'video');
          if (sender) sender.replaceTrack(screenTrack);
        });

        screenTrack.onended = () => {
          // Revert to camera on stop
          if (localStream) {
            const cameraTrack = localStream.getVideoTracks()[0];
            Object.values(peersRef.current).forEach(peer => {
              const senders = peer.getSenders();
              const sender = senders.find(s => s.track?.kind === 'video');
              if (sender && cameraTrack) sender.replaceTrack(cameraTrack);
            });
          }
          setIsScreenSharing(false);
          toast.info("Screen sharing stopped");
        };
      } catch (error) {
        console.error(error);
        toast.error("Could not share screen");
      }
    }
  }, [isScreenSharing, localStream]);

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
    disconnectSocket();
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

  if (isWaiting) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-12rem)] bg-background border border-border rounded-xl">
        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4 animate-pulse">
          <Users className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-xl font-bold mb-2">Waiting for Host</h2>
        <p className="text-muted-foreground">The teacher will let you in shortly.</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "flex flex-col bg-background rounded-xl overflow-hidden border border-border",
        isFullscreen ? "fixed inset-0 z-50 rounded-none" : "h-[calc(100vh-12rem)]"
      )}
    >
      { }
      {isHost && waitingStudents.length > 0 && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 bg-card border border-border shadow-lg rounded-lg p-4 flex flex-col gap-3 min-w-[300px] animate-in slide-in-from-top-2">
          <div className="flex items-center justify-between">
            <p className="font-bold text-sm bg-primary/10 text-primary px-2 py-1 rounded-full flex items-center gap-2">
              <Users className="w-3 h-3" />
              {waitingStudents.length} Waiting
            </p>
            <div className="flex gap-2">
              {/* Expand logic if needed, simplify for now */}
              <Button size="sm" onClick={handleAdmitAll}>Admit All</Button>
            </div>
          </div>
          <div className="max-h-[200px] overflow-y-auto space-y-2 pr-1">
            {waitingStudents.map((s) => (
              <div key={s.socketId} className="flex items-center justify-between bg-muted/30 p-2 rounded-md border border-border/50">
                <div className="flex items-center gap-2">
                  <Avatar className="w-7 h-7 border border-border">
                    <AvatarFallback className="text-xs bg-background">{s.user.name[0]}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium truncate max-w-[140px]">{s.user.name}</span>
                </div>
                <Button size="sm" variant="secondary" className="h-7 px-3 text-xs" onClick={() => handleAdmit(s.socketId)}>Admit</Button>
              </div>
            ))}
          </div>
        </div>
      )}

      { }
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

      { }
      <div className="flex-1 flex overflow-hidden">
        { }
        <div className="flex-1 p-4 bg-muted/30">
          {showWhiteboard ? (
            <Whiteboard isHost={isHost} onClose={() => setShowWhiteboard(false)} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 h-full">
              { }
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

              { }
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

        { }
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

      { }
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

      { }
      <Dialog open={showPolls} onOpenChange={setShowPolls}>
        <DialogContent className="max-w-md max-h-[80vh] p-0">
          <LivePolls isHost={isHost} />
        </DialogContent>
      </Dialog>

      { }
      <Dialog open={showBreakoutRooms} onOpenChange={setShowBreakoutRooms}>
        <DialogContent className="max-w-lg max-h-[80vh] p-0">
          <BreakoutRooms isHost={isHost} />
        </DialogContent>
      </Dialog>

      { }
      <Dialog open={showRecording} onOpenChange={setShowRecording}>
        <DialogContent className="max-w-md max-h-[80vh] p-0">
          <RecordingControls isHost={isHost} stream={localStream} />
        </DialogContent>
      </Dialog>

      { }
      <Dialog open={showHandRaise} onOpenChange={setShowHandRaise}>
        <DialogContent className="max-w-md max-h-[80vh] p-0">
          <HandRaiseQueue isHost={isHost} currentUserName={userName} />
        </DialogContent>
      </Dialog>

      { }
      <ScreenAnnotation isActive={showAnnotation} onClose={() => setShowAnnotation(false)} />
    </div>
  );
}
