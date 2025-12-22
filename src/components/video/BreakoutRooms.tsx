import { useState } from "react";
import {
  Plus, Users, ArrowRight, Shuffle, DoorOpen,
  DoorClosed, Clock, MessageSquare, Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface Participant {
  id: string;
  name: string;
  avatar: string;
}

interface BreakoutRoom {
  id: string;
  name: string;
  participants: Participant[];
  status: 'waiting' | 'active' | 'closed';
  duration?: number;
}

interface BreakoutRoomsProps {
  isHost?: boolean;
  participants?: Participant[];
  onJoinRoom?: (roomId: string) => void;
}

export function BreakoutRooms({
  isHost = true,
  participants = [],
  onJoinRoom
}: BreakoutRoomsProps) {
  const [rooms, setRooms] = useState<BreakoutRoom[]>([]);
  const [unassigned, setUnassigned] = useState<Participant[]>(participants);
  const [newRoomName, setNewRoomName] = useState('');
  const [duration, setDuration] = useState(10);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);

  const createRoom = () => {
    const roomName = newRoomName.trim() || `Room ${rooms.length + 1}`;
    const newRoom: BreakoutRoom = {
      id: Date.now().toString(),
      name: roomName,
      participants: [],
      status: 'waiting'
    };
    setRooms([...rooms, newRoom]);
    setNewRoomName('');
  };

  const deleteRoom = (roomId: string) => {
    const room = rooms.find(r => r.id === roomId);
    if (room) {
      setUnassigned([...unassigned, ...room.participants]);
      setRooms(rooms.filter(r => r.id !== roomId));
    }
  };

  const assignToRoom = (participantId: string, roomId: string) => {
    const participant = unassigned.find(p => p.id === participantId);
    if (!participant) return;

    setUnassigned(unassigned.filter(p => p.id !== participantId));
    setRooms(rooms.map(r =>
      r.id === roomId
        ? { ...r, participants: [...r.participants, participant] }
        : r
    ));
  };

  const removeFromRoom = (participantId: string, roomId: string) => {
    const room = rooms.find(r => r.id === roomId);
    const participant = room?.participants.find(p => p.id === participantId);
    if (!participant) return;

    setRooms(rooms.map(r =>
      r.id === roomId
        ? { ...r, participants: r.participants.filter(p => p.id !== participantId) }
        : r
    ));
    setUnassigned([...unassigned, participant]);
  };

  const autoAssign = () => {
    if (rooms.length === 0 || unassigned.length === 0) return;

    const shuffled = [...unassigned].sort(() => Math.random() - 0.5);
    const updatedRooms = rooms.map(r => ({ ...r, participants: [...r.participants] }));

    shuffled.forEach((participant, i) => {
      const roomIndex = i % updatedRooms.length;
      updatedRooms[roomIndex].participants.push(participant);
    });

    setRooms(updatedRooms);
    setUnassigned([]);
  };

  const startBreakouts = () => {
    setRooms(rooms.map(r => ({ ...r, status: 'active', duration })));
  };

  const endBreakouts = () => {
    const allParticipants = rooms.flatMap(r => r.participants);
    setRooms([]);
    setUnassigned([...participants]);
    setActiveRoomId(null);
  };

  const joinRoom = (roomId: string) => {
    setActiveRoomId(roomId);
    onJoinRoom?.(roomId);
  };

  const hasActiveRooms = rooms.some(r => r.status === 'active');

  return (
    <div className="flex flex-col h-full">
      { }
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Breakout Rooms</h3>
        </div>
        {isHost && (
          <div className="flex gap-2">
            {hasActiveRooms ? (
              <Button size="sm" variant="destructive" onClick={endBreakouts}>
                <DoorClosed className="w-4 h-4 mr-1" /> End All
              </Button>
            ) : rooms.length > 0 && (
              <Button size="sm" onClick={startBreakouts}>
                <DoorOpen className="w-4 h-4 mr-1" /> Start
              </Button>
            )}
          </div>
        )}
      </div>

      <ScrollArea className="flex-1 p-4">
        { }
        {isHost && !hasActiveRooms && (
          <div className="flex gap-2 mb-4">
            <Input
              placeholder="Room name..."
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
              className="flex-1"
            />
            <Button size="icon" onClick={createRoom}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        )}

        { }
        {isHost && !hasActiveRooms && unassigned.length > 0 && (
          <Card className="mb-4">
            <CardHeader className="py-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Unassigned ({unassigned.length})</CardTitle>
                {rooms.length > 0 && (
                  <Button size="sm" variant="outline" onClick={autoAssign}>
                    <Shuffle className="w-4 h-4 mr-1" /> Auto-assign
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-wrap gap-2">
                {unassigned.map(p => (
                  <div
                    key={p.id}
                    className="flex items-center gap-2 p-2 bg-muted rounded-lg cursor-move"
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData('participantId', p.id)}
                  >
                    <Avatar className="w-6 h-6">
                      <AvatarFallback className="text-xs">{p.avatar}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{p.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        { }
        {isHost && rooms.length > 0 && !hasActiveRooms && (
          <div className="flex items-center gap-2 mb-4 p-3 bg-muted rounded-lg">
            <Clock className="w-4 h-4" />
            <span className="text-sm">Duration:</span>
            <Input
              type="number"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value) || 10)}
              className="w-20"
              min={1}
              max={60}
            />
            <span className="text-sm text-muted-foreground">minutes</span>
          </div>
        )}

        { }
        <div className="space-y-3">
          {rooms.map(room => (
            <Card
              key={room.id}
              className={cn(
                room.status === 'active' && "border-secondary",
                activeRoomId === room.id && "ring-2 ring-primary"
              )}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                const participantId = e.dataTransfer.getData('participantId');
                if (participantId) assignToRoom(participantId, room.id);
              }}
            >
              <CardHeader className="py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-sm">{room.name}</CardTitle>
                    {room.status === 'active' && (
                      <Badge variant="default" className="bg-secondary">
                        Active • {room.duration}min
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-1">
                    {room.status === 'active' && !isHost && (
                      <Button size="sm" onClick={() => joinRoom(room.id)}>
                        <DoorOpen className="w-4 h-4 mr-1" /> Join
                      </Button>
                    )}
                    {isHost && room.status !== 'active' && (
                      <Button size="icon" variant="ghost" onClick={() => deleteRoom(room.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {room.participants.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    {isHost ? 'Drag participants here' : 'No participants yet'}
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {room.participants.map(p => (
                      <div
                        key={p.id}
                        className={cn(
                          "flex items-center gap-2 p-2 rounded-lg",
                          isHost && room.status !== 'active'
                            ? "bg-muted cursor-pointer hover:bg-muted/80"
                            : "bg-secondary/10"
                        )}
                        onClick={() => isHost && room.status !== 'active' && removeFromRoom(p.id, room.id)}
                      >
                        <Avatar className="w-6 h-6">
                          <AvatarFallback className="text-xs bg-secondary text-secondary-foreground">
                            {p.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{p.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {rooms.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            <Users className="w-12 h-12 mx-auto mb-2 opacity-20" />
            <p>No breakout rooms</p>
            {isHost && <p className="text-sm">Create rooms to split your class into groups!</p>}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
