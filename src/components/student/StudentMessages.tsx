import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

export function StudentMessages() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Messages</h1>
        <p className="text-muted-foreground">Chat with teachers and classmates</p>
      </div>

      {/* Empty State */}
      <div className="bg-card rounded-xl border border-border p-12 text-center">
        <MessageSquare className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
        <h3 className="font-display text-xl font-semibold mb-2">No Messages</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          You don't have any messages yet. Messages from teachers will appear here.
        </p>
      </div>
    </div>
  );
}
