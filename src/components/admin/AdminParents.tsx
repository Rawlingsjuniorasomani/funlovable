import { useState, useEffect } from "react";
import { Search, MoreVertical, Edit, Trash2, Eye, Users2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useAuthContext } from "@/contexts/AuthContext";
import { User } from "@/hooks/useAuth";

export function AdminParents() {
  const { toast } = useToast();
  const { getAllUsers, deleteUser } = useAuthContext();
  const [parents, setParents] = useState<User[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadParents();
  }, []);

  const loadParents = async () => {
    try {
      const users = await getAllUsers();
      // Safety check - users might be undefined if error occurs in context
      const userArray = Array.isArray(users) ? users : [];
      const parentUsers = userArray.filter(u => u.role === 'parent');
      console.log('Loaded parents:', parentUsers);
      setParents(parentUsers);
    } catch (error) {
      console.error("Failed to load parents:", error);
      toast({ title: "Error", description: "Failed to load parents", variant: "destructive" });
    }
  };

  const handleDelete = (parentId: string) => {
    deleteUser(parentId);
    loadParents();
    toast({ title: "Parent Removed", variant: "destructive" });
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
                        <DropdownMenuItem><Eye className="w-4 h-4 mr-2" /> View Details</DropdownMenuItem>
                        <DropdownMenuItem><Edit className="w-4 h-4 mr-2" /> Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(parent.id)} className="text-destructive">
                          <Trash2 className="w-4 h-4 mr-2" /> Delete
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
    </div>
  );
}
