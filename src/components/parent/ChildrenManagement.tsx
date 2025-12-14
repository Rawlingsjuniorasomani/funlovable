import { useState } from "react";
import { Plus, Edit2, Trash2, BookOpen, User, School, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuthContext } from "@/contexts/AuthContext";
// useParentData removed

export function ChildrenManagement() {
  const { toast } = useToast();
  const { user, addChild, removeChild } = useAuthContext(); // Use addChild/removeChild from context
  const [isLoading, setIsLoading] = useState(false);

  const [isAddOpen, setIsAddOpen] = useState(false);
  // Use children from user context if available, otherwise fallback (or empty)
  // The 'user' from useAuthContext should have children now if populated
  const children = user?.children || [];

  // Form State
  const [newChild, setNewChild] = useState({
    name: "",
    email: "",
    grade: "",
    class: "",
    school: "",
    age: "",
    phone: ""
  });

  const handleAddChild = async () => {
    if (!newChild.name && !newChild.phone) {
      // Allow just phone if linking? User request: "Student Name, Phone or ID, School, Age, Class"
      // I'll require name and phone at least for new child, or appropriate logic.
      // For linking, backend checks phone.
      // Let's require Name at minimum.
    }

    if (!newChild.name) {
      toast({ title: "Validation Error", description: "Name is required", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const result = await addChild({
        name: newChild.name,
        email: "", // Backend will generate if empty
        grade: newChild.grade || 'Primary 1',
        studentClass: newChild.class,
        school: newChild.school,
        age: newChild.age ? Number(newChild.age) : 0,
        phone: newChild.phone,
        subjects: [],
      });

      if (result) {
        toast({ title: "Success", description: "Child added successfully!" });
        setIsAddOpen(false);
        setNewChild({ name: "", email: "", grade: "", class: "", school: "", age: "", phone: "" });
      } else {
        toast({ title: "Error", description: "Failed to add child. Check phone number if linking.", variant: "destructive" });
      }
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Something went wrong", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to remove ${name}?`)) {
      await removeChild(id);
      toast({
        title: "Child Removed",
        description: `${name} has been removed.`
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Children Management</h1>
          <p className="text-muted-foreground">Add, edit, or remove children from your account</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="btn-bounce bg-gradient-to-r from-primary to-tertiary">
              <Plus className="w-4 h-4 mr-2" /> Add Child
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Child</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Student Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="name"
                    placeholder="e.g. Kwame Mensah"
                    className="pl-9"
                    value={newChild.name}
                    onChange={(e) => setNewChild({ ...newChild, name: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Student Phone or ID (to link existing)</Label>
                <div className="relative">
                  <Input
                    id="phone"
                    placeholder="Enter phone number if child already registered"
                    value={newChild.phone}
                    onChange={(e) => setNewChild({ ...newChild, phone: e.target.value })}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground">If valid phone provided, we will link the existing account.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="school">School</Label>
                <div className="relative">
                  <School className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="school"
                    placeholder="School Name"
                    className="pl-9"
                    value={newChild.school}
                    onChange={(e) => setNewChild({ ...newChild, school: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    placeholder="Age"
                    value={newChild.age}
                    onChange={(e) => setNewChild({ ...newChild, age: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="grade">Grade/Level</Label>
                  <Select
                    value={newChild.grade}
                    onValueChange={(val) => setNewChild({ ...newChild, grade: val })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Primary 1">Primary 1</SelectItem>
                      <SelectItem value="Primary 2">Primary 2</SelectItem>
                      <SelectItem value="Primary 3">Primary 3</SelectItem>
                      <SelectItem value="Primary 4">Primary 4</SelectItem>
                      <SelectItem value="Primary 5">Primary 5</SelectItem>
                      <SelectItem value="Primary 6">Primary 6</SelectItem>
                      <SelectItem value="JHS 1">JHS 1</SelectItem>
                      <SelectItem value="JHS 2">JHS 2</SelectItem>
                      <SelectItem value="JHS 3">JHS 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="class">Class</Label>
                  <Input
                    id="class"
                    placeholder="e.g. A"
                    value={newChild.class}
                    onChange={(e) => setNewChild({ ...newChild, class: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddChild} disabled={isLoading}>
                {isLoading ? "Adding..." : "Add Child"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {children.length === 0 ? (
        /* Empty State */
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-display text-xl font-semibold mb-2">No Children Added</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Add your children to start tracking their learning progress.
          </p>
          <Button onClick={() => setIsAddOpen(true)}>
            <Plus className="w-4 h-4 mr-2" /> Add Your First Child
          </Button>
        </div>
      ) : (
        /* List State */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {children.map((child) => (
            <Card key={child.id} className="relative group overflow-hidden border-border hover:border-primary/50 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                    {child.name.charAt(0)}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(child.id, child.name)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <h3 className="font-bold text-lg mb-1">{child.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{child.email}</p>

                <div className="flex items-center gap-4 text-sm mb-4">
                  <div className="flex items-center gap-1.5 bg-secondary/10 text-secondary px-2.5 py-1 rounded-md">
                    <School className="w-3.5 h-3.5" />
                    <span className="font-medium">{child.grade}</span>
                  </div>
                  <div className="text-muted-foreground">
                    Class {child.studentClass || 'A'}
                  </div>
                </div>

                <Button variant="outline" className="w-full" onClick={() => {
                  sessionStorage.setItem('viewAsChildId', child.id);
                  window.location.href = '/student';
                }}>
                  View Dashboard
                </Button>
              </CardContent>
            </Card>
          ))}

          {/* Add New Card */}
          <button
            onClick={() => setIsAddOpen(true)}
            className="flex flex-col items-center justify-center p-6 rounded-xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-muted/50 transition-all h-full min-h-[200px]"
          >
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3 group-hover:bg-primary/10 transition-colors">
              <Plus className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <span className="font-medium text-foreground">Add Another Child</span>
          </button>
        </div>
      )}
    </div>
  );
}
