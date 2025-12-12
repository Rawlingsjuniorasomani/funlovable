import { RealtimeChat } from "@/components/chat/RealtimeChat";

export function TeacherChatPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-display font-bold text-foreground">Messages</h2>
        <p className="text-muted-foreground">Chat with students and parents in real-time</p>
      </div>
      <RealtimeChat currentUserId="t1" currentUserRole="teacher" />
    </div>
  );
}
