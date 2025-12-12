import { useState } from "react";
import { Search, Download, CreditCard, TrendingUp, DollarSign, Users, RefreshCw, MoreVertical, CheckCircle, Clock, XCircle, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useParentData, ParentPayment } from "@/data/parentDataStore";
import { ScrollArea } from "@/components/ui/scroll-area";

const plans = [
  { id: "single", name: "Single Child", price: 80, description: "For one child" },
  { id: "family", name: "Family Plan", price: 150, description: "Up to 4 children" },
];

export function AdminPayments() {
  const { toast } = useToast();
  const { subscriptions, payments, linkedChildren, linkedTeachers, updatePayment, cancelSubscription, getParentChildren, getParentTeachers } = useParentData();
  
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isRefundOpen, setIsRefundOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<ParentPayment | null>(null);
  const [isViewChildrenOpen, setIsViewChildrenOpen] = useState(false);
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);

  const totalRevenue = payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0);
  const monthlyRevenue = payments.filter(p => p.status === 'completed' && new Date(p.date).getMonth() === new Date().getMonth()).reduce((sum, p) => sum + p.amount, 0);
  const activeSubscriptions = subscriptions.filter(s => s.status === 'active').length;
  const totalCustomers = new Set(payments.map(p => p.parentEmail)).size;

  const stats = [
    { label: "Total Revenue", value: `$${totalRevenue.toLocaleString()}`, icon: DollarSign, color: "text-secondary" },
    { label: "Monthly Revenue", value: `$${monthlyRevenue.toLocaleString()}`, icon: TrendingUp, color: "text-primary" },
    { label: "Active Subscriptions", value: activeSubscriptions.toString(), icon: CreditCard, color: "text-tertiary" },
    { label: "Students Added", value: linkedChildren.length.toString(), icon: Users, color: "text-accent" },
  ];

  const handleRefund = () => {
    if (!selectedPayment) return;
    updatePayment(selectedPayment.id, { status: 'refunded' });
    setIsRefundOpen(false);
    toast({ title: "Refund Processed", description: `$${selectedPayment.amount} refunded to ${selectedPayment.parentName}` });
  };

  const handleRetryPayment = (paymentId: string) => {
    updatePayment(paymentId, { status: 'completed' });
    toast({ title: "Payment Retried", description: "Payment has been marked as completed" });
  };

  const viewChildren = (parentId: string) => {
    setSelectedParentId(parentId);
    setIsViewChildrenOpen(true);
  };

  const filteredPayments = payments.filter((p) => {
    const matchesSearch = p.parentName.toLowerCase().includes(search.toLowerCase()) || p.parentEmail.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredSubscriptions = subscriptions.filter((s) => {
    const matchesSearch = s.parentName.toLowerCase().includes(search.toLowerCase()) || s.parentEmail.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  const selectedParentChildren = selectedParentId ? getParentChildren(selectedParentId) : [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return <Badge className="bg-secondary/10 text-secondary border-secondary/30"><CheckCircle className="w-3 h-3 mr-1" /> Completed</Badge>;
      case 'pending': return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/30"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
      case 'failed': return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" /> Failed</Badge>;
      case 'refunded': return <Badge variant="secondary"><RefreshCw className="w-3 h-3 mr-1" /> Refunded</Badge>;
      case 'active': return <Badge className="bg-secondary/10 text-secondary border-secondary/30"><CheckCircle className="w-3 h-3 mr-1" /> Active</Badge>;
      case 'expired': return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" /> Expired</Badge>;
      case 'cancelled': return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" /> Cancelled</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Payments & Subscriptions</h1>
          <p className="text-muted-foreground">Track parent subscriptions, payments, and linked students/teachers</p>
        </div>
        <Button variant="outline"><Download className="w-4 h-4 mr-2" /> Export Report</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {plans.map(plan => (
          <Card key={plan.id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">{plan.name}</h3>
                  <p className="text-muted-foreground text-sm">{plan.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">${plan.price}</p>
                  <p className="text-xs text-muted-foreground">/year</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="subscriptions">
        <TabsList>
          <TabsTrigger value="subscriptions">Subscriptions ({subscriptions.length})</TabsTrigger>
          <TabsTrigger value="payments">Payments ({payments.length})</TabsTrigger>
          <TabsTrigger value="children">Students Added ({linkedChildren.length})</TabsTrigger>
          <TabsTrigger value="teachers">Teachers Linked ({linkedTeachers.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="subscriptions" className="space-y-4">
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Parent</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Started</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Auto Renew</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubscriptions.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{sub.parentName}</p>
                        <p className="text-xs text-muted-foreground">{sub.parentEmail}</p>
                      </div>
                    </TableCell>
                    <TableCell>{sub.planName}</TableCell>
                    <TableCell>{getStatusBadge(sub.status)}</TableCell>
                    <TableCell>{sub.startDate}</TableCell>
                    <TableCell>{sub.expiresAt}</TableCell>
                    <TableCell><Badge variant={sub.autoRenew ? "default" : "secondary"}>{sub.autoRenew ? "Yes" : "No"}</Badge></TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="w-4 h-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => viewChildren(sub.parentId)}><Eye className="w-4 h-4 mr-2" /> View Children</DropdownMenuItem>
                          {sub.status === 'active' && <DropdownMenuItem onClick={() => cancelSubscription(sub.id)} className="text-destructive"><XCircle className="w-4 h-4 mr-2" /> Cancel</DropdownMenuItem>}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search payments..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Parent</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{payment.parentName}</p>
                        <p className="text-xs text-muted-foreground">{payment.parentEmail}</p>
                      </div>
                    </TableCell>
                    <TableCell>{payment.plan}</TableCell>
                    <TableCell className="font-semibold">${payment.amount}</TableCell>
                    <TableCell>{getStatusBadge(payment.status)}</TableCell>
                    <TableCell>{new Date(payment.date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="w-4 h-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {payment.status === 'failed' && <DropdownMenuItem onClick={() => handleRetryPayment(payment.id)}><RefreshCw className="w-4 h-4 mr-2" /> Retry</DropdownMenuItem>}
                          {payment.status === 'completed' && <DropdownMenuItem onClick={() => { setSelectedPayment(payment); setIsRefundOpen(true); }}><RefreshCw className="w-4 h-4 mr-2" /> Refund</DropdownMenuItem>}
                          <DropdownMenuItem><Download className="w-4 h-4 mr-2" /> Receipt</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="children" className="space-y-4">
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Grade/Class</TableHead>
                  <TableHead>Added By (Parent)</TableHead>
                  <TableHead>Linked Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {linkedChildren.map((child) => (
                  <TableRow key={child.id}>
                    <TableCell className="font-medium">{child.childName}</TableCell>
                    <TableCell>{child.childEmail}</TableCell>
                    <TableCell>{child.grade} {child.class}</TableCell>
                    <TableCell>{linkedChildren.find(c => c.parentId === child.parentId)?.parentId}</TableCell>
                    <TableCell>{new Date(child.linkedAt).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="teachers" className="space-y-4">
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Teacher Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Linked For</TableHead>
                  <TableHead>Linked Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {linkedTeachers.map((teacher) => (
                  <TableRow key={teacher.id}>
                    <TableCell className="font-medium">{teacher.teacherName}</TableCell>
                    <TableCell>{teacher.teacherEmail}</TableCell>
                    <TableCell>{teacher.subject || 'N/A'}</TableCell>
                    <TableCell>{teacher.linkedFor}</TableCell>
                    <TableCell>{new Date(teacher.linkedAt).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={isRefundOpen} onOpenChange={setIsRefundOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Process Refund</DialogTitle></DialogHeader>
          <div className="py-4">
            <p>Are you sure you want to refund <strong>${selectedPayment?.amount}</strong> to <strong>{selectedPayment?.parentName}</strong>?</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRefundOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleRefund}>Process Refund</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isViewChildrenOpen} onOpenChange={setIsViewChildrenOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Children Linked to Parent</DialogTitle></DialogHeader>
          <ScrollArea className="max-h-[300px]">
            {selectedParentChildren.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No children linked</p>
            ) : (
              <div className="space-y-2">
                {selectedParentChildren.map(child => (
                  <div key={child.id} className="p-3 bg-muted rounded-lg">
                    <p className="font-medium">{child.childName}</p>
                    <p className="text-sm text-muted-foreground">{child.childEmail} • {child.grade} {child.class}</p>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
