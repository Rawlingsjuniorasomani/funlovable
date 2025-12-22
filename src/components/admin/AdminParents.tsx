import { useState, useEffect } from "react";
import { Search, MoreVertical, Edit, Trash2, Eye, Users2, Mail, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuthContext } from "@/contexts/AuthContext";
import { User } from "@/hooks/useAuth";
import { messagingAPI } from "@/config/api";

export function AdminParents() {
  const { toast } = useToast();
  const { getAllUsers, deleteUser, updateUserByAdmin } = useAuthContext();
  const [parents, setParents] = useState<User[]>([]);
  const [search, setSearch] = useState("");

  const [selectedParent, setSelectedParent] = useState<User | null>(null);

  // Dialog States
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isMessageOpen, setIsMessageOpen] = useState(false);

  // Form States
  const [editForm, setEditForm] = useState({ name: "", email: "", phone: "" });
  const [msgForm, setMsgForm] = useState({ subject: "", body: "" });

  useEffect(() => {
    loadParents();
  }, []);

  const loadParents = async () => {
    try {
      const users = await getAllUsers();
      const userArray = Array.isArray(users) ? users : [];
      const parentUsers = userArray.filter(u => u.role === 'parent');
      setParents(parentUsers);
    } catch (error) {
      console.error("Failed to load parents:", error);
      toast({ title: "Error", description: "Failed to load parents", variant: "destructive" });
    }
  };

  const handleDelete = async (parentId: string) => {
    if (confirm("Are you sure you want to delete this parent? This action is irreversible.")) {
      await deleteUser(parentId);
      loadParents();
      toast({ title: "Parent Removed", variant: "destructive" });
    }
  };

  const handleEditOpen = (parent: User) => {
    setSelectedParent(parent);
    setEditForm({ name: parent.name, email: parent.email, phone: parent.phone || "" });
    setIsEditOpen(true);
  };

  const handleEditSubmit = async () => {
    if (!selectedParent) return;
    try {
      await updateUserByAdmin(selectedParent.id, editForm);
      setIsEditOpen(false);
      loadParents();
      toast({ title: "Success", description: "Parent details updated." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to update parent.", variant: "destructive" });
    }
  };

  const handleMessageOpen = (parent: User) => {
    setSelectedParent(parent);
    setMsgForm({ subject: "", body: "" });
    setIsMessageOpen(true);
  };

  const handleMessageSubmit = async () => {
    if (!selectedParent || !msgForm.subject || !msgForm.body) return;
    try {
      await messagingAPI.send({
        recipient_id: selectedParent.id,
        subject: msgForm.subject,
        message: msgForm.body
      });
      setIsMessageOpen(false);
      toast({ title: "Sent", description: "Message sent successfully." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to send message.", variant: "destructive" });
    }
  };

  const handleViewOpen = (parent: User) => {
    setSelectedParent(parent);
    setIsViewOpen(true);
  };

  const filteredParents = parents.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Parents Management</h1>
          <p className="text-muted-foreground">Manage all parent accounts</p>
        </div>
        <Badge variant="secondary" className="text-sm px-3 py-1">
          {parents.length} Total Parents
        </Badge>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search parents..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
      </div>

      {filteredParents.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <Users2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-semibold text-foreground mb-2">No Parents Found</h3>
          <p className="text-muted-foreground">Parents will appear here when they register.</p>
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Children</TableHead>
                <TableHead>Subscription</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredParents.map((parent) => (
                <TableRow key={parent.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                        {parent.avatar || parent.name.charAt(0)}
                      </div>
                      {parent.name}
                    </div>
                  </TableCell>
                  <TableCell>{parent.email}</TableCell>
                  <TableCell>{parent.phone || '-'}</TableCell>
                  <TableCell>{parent.children?.length || 0}</TableCell>
                  <TableCell>
                    <Badge variant={parent.subscription?.status === 'active' ? 'default' : 'secondary'}>
                      {(() => {
                        const plan = parent.subscription?.plan;
                        if (!plan) return 'None';
                        const lowerPlan = plan.toLowerCase();
                        if (lowerPlan === 'standard plan' || lowerPlan === 'single child' || lowerPlan === 'single plan') return 'Single Plan';
                        if (lowerPlan === 'premium plan' || lowerPlan === 'family plan') return 'Family Plan';
                        return plan;
                      })()}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(parent.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon"><MoreVertical className="w-4 h-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewOpen(parent)}><Eye className="w-4 h-4 mr-2" /> View Details</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditOpen(parent)}><Edit className="w-4 h-4 mr-2" /> Edit Details</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleMessageOpen(parent)}><Mail className="w-4 h-4 mr-2" /> Send Message</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleDelete(parent.id)} className="text-destructive">
                          <Trash2 className="w-4 h-4 mr-2" /> Delete Account
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* View Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Parent Details</DialogTitle>
          </DialogHeader>
          {selectedParent && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold">
                  {selectedParent.avatar || selectedParent.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{selectedParent.name}</h3>
                  <p className="text-muted-foreground">{selectedParent.email}</p>
                  <p className="text-sm text-muted-foreground mt-1">{selectedParent.phone || "No phone number"}</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Subscription</h4>
                <div className="p-3 bg-muted rounded-md flex justify-between items-center">
                  <span>{selectedParent.subscription?.plan || "No Plan"}</span>
                  <Badge>{selectedParent.subscription?.status || "Inactive"}</Badge>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Children ({selectedParent.children?.length || 0})</h4>
                <div className="space-y-2">
                  {selectedParent.children && selectedParent.children.length > 0 ? (
                    selectedParent.children.map((child: any) => (
                      <div key={child.id} className="p-3 border rounded-md flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-secondary/10 rounded-full flex items-center justify-center text-secondary text-xs">
                            {child.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{child.name}</p>
                            <p className="text-xs text-muted-foreground">{child.student_class} • {child.school}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No children linked.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Parent</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input value={editForm.phone} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button onClick={handleEditSubmit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Message Dialog */}
      <Dialog open={isMessageOpen} onOpenChange={setIsMessageOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Message {selectedParent?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Subject</Label>
              <Input value={msgForm.subject} onChange={e => setMsgForm({ ...msgForm, subject: e.target.value })} placeholder="Message Subject" />
            </div>
            <div className="space-y-2">
              <Label>Message</Label>
              <Textarea value={msgForm.body} onChange={e => setMsgForm({ ...msgForm, body: e.target.value })} placeholder="Type your message here..." rows={5} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsMessageOpen(false)}>Cancel</Button>
            <Button onClick={handleMessageSubmit}><Mail className="w-4 h-4 mr-2" /> Send</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
