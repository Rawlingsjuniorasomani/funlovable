import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  FileText, Clock, CheckCircle, AlertCircle, Filter,
  Search, ChevronRight, BookOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { assignmentsAPI, subjectsAPI } from "@/config/api";
import { StudentAssignmentDetails } from "@/components/student/StudentAssignmentDetails";

// Main component for listing student assignments
export function StudentAssignments() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);

  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    try {
      setLoading(true);
      const data = await assignmentsAPI.getAll();
      setAssignments(data);
    } catch (error) {
      console.error("Failed to load assignments", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAssignments = assignments.filter(a => {
    const matchesSearch = a.title.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" ||
      (filter === "pending" && !a.submission_status) ||
      (filter === "submitted" && a.submission_status === 'submitted') ||
      (filter === "graded" && a.submission_status === 'graded');
    return matchesSearch && matchesFilter;
  });

  if (selectedAssignment) {
    return (
      <StudentAssignmentDetails
        assignment={selectedAssignment}
        onBack={() => {
          setSelectedAssignment(null);
          loadAssignments();
        }}
      />
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold font-display">My Assignments</h1>
          <p className="text-muted-foreground">Track and submit your homework</p>
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search assignments..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[140px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">To Do</SelectItem>
              <SelectItem value="submitted">Submitted</SelectItem>
              <SelectItem value="graded">Graded</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4">
        {filteredAssignments.map((assignment) => {
          // Helper to determine status badge
          let statusBadge = <Badge variant="outline">Pending</Badge>;

          if (assignment.submission_status === 'graded') {
            statusBadge = <Badge className="bg-green-500 hover:bg-green-600">Graded</Badge>;
          } else if (assignment.submission_status === 'submitted') {
            statusBadge = <Badge className="bg-blue-500 hover:bg-blue-600">Submitted</Badge>;
          } else if (assignment.submission_status === 'draft') {
            statusBadge = <Badge variant="secondary" className="text-yellow-600 bg-yellow-100">Draft</Badge>;
          } else if (new Date(assignment.due_date) < new Date()) {
            statusBadge = <Badge variant="destructive">Overdue</Badge>;
          }

          return (
            <Card
              key={assignment.id}
              className="card-hover cursor-pointer border-l-4 border-l-primary"
              onClick={() => setSelectedAssignment(assignment)}
            >
              <CardContent className="p-4 flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <FileText className="h-6 w-6 text-primary" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold truncate">{assignment.title}</h3>
                    {statusBadge}
                  </div>
                  <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                    <span className="flex items-center gap-1">
                      <BookOpen className="h-3 w-3" />
                      {assignment.subject_name || 'Subject'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Due {format(new Date(assignment.due_date), 'MMM d, h:mm a')}
                    </span>
                  </div>
                </div>

                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </CardContent>
            </Card>
          );
        })}

        {filteredAssignments.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p>No assignments found matching your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
