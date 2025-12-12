import { RealtimeChat } from "@/components/chat/RealtimeChat";

export function ParentChatPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-display font-bold text-foreground">Messages</h2>
        <p className="text-muted-foreground">Chat with your children's teachers</p>
      </div>
      <RealtimeChat currentUserId="p1" currentUserRole="parent" />
    </div>
  );
}
