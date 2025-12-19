import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Download, Filter, DollarSign, CreditCard, Calendar, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { API_URL } from "@/config/api";
import { useAuth } from "@/hooks/useAuth";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export function AdminPayments() {
  // Payments state
  const [payments, setPayments] = useState<any[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(true);
  const [paymentSearchTerm, setPaymentSearchTerm] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");

  // Subscriptions state
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [subsLoading, setSubsLoading] = useState(true);
  const [subSearchTerm, setSubSearchTerm] = useState("");
  const [subStatusFilter, setSubStatusFilter] = useState("all");
  const [subPlanFilter, setSubPlanFilter] = useState("all");

  // Edit state
  const [editingSubscription, setEditingSubscription] = useState<any>(null);
  const [editForm, setEditForm] = useState({ plan: 'single', status: 'active', expiresAt: '' });

  // Get auth context (token handled via HTTP-only cookies/headers)
  const authContext = useAuth();

  // Fetch payments
  const fetchPayments = async () => {
    try {
      setPaymentsLoading(true);
      const query = new URLSearchParams();
      if (paymentStatusFilter !== 'all') query.append('status', paymentStatusFilter);

      // Auth via HTTP-only cookies or session (not localStorage token)
      const response = await fetch(`${API_URL}/admin/payments?${query}`, {
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Failed to fetch payments');
      const data = await response.json();
      setPayments(data.payments || []);
    } catch (error) {
      console.error("Failed to fetch payments:", error);
    } finally {
      setPaymentsLoading(false);
    }
  };

  // Fetch subscriptions
  const fetchSubscriptions = async () => {
    try {
      setSubsLoading(true);
      const query = new URLSearchParams();
      if (subStatusFilter !== 'all') query.append('status', subStatusFilter);
      if (subPlanFilter !== 'all') query.append('plan', subPlanFilter);

      // Auth via HTTP-only cookies or session (not localStorage token)
      const response = await fetch(`${API_URL}/admin/subscriptions?${query}`, {
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Failed to fetch subscriptions');
      const data = await response.json();
      setSubscriptions(data.subscriptions || []);
    } catch (error) {
      console.error("Failed to fetch subscriptions:", error);
    } finally {
      setSubsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [paymentStatusFilter]);

  useEffect(() => {
    fetchSubscriptions();
  }, [subStatusFilter, subPlanFilter]);

  // Filter payments
  const filteredPayments = payments.filter(payment => {
    const matchesSearch =
      payment.user_name?.toLowerCase().includes(paymentSearchTerm.toLowerCase()) ||
      payment.user_email?.toLowerCase().includes(paymentSearchTerm.toLowerCase()) ||
      payment.payment_id?.toLowerCase().includes(paymentSearchTerm.toLowerCase());
    return matchesSearch;
  });

  // Filter subscriptions
  const filteredSubscriptions = subscriptions.filter(sub => {
    const matchesSearch =
      sub.user_name?.toLowerCase().includes(subSearchTerm.toLowerCase()) ||
      sub.user_email?.toLowerCase().includes(subSearchTerm.toLowerCase());
    return matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'success':
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'failed':
      case 'expired':
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleEditClick = (subscription: any) => {
    setEditingSubscription(subscription);
    setEditForm({
      plan: subscription.plan || 'single',
      status: subscription.status || 'active',
      expiresAt: subscription.expires_at ? new Date(subscription.expires_at).toISOString().split('T')[0] : ''
    });
  };

  const handleSave = async () => {
    if (!editingSubscription) return;

    try {
      const response = await fetch(`${API_URL}/admin/subscriptions/${editingSubscription.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(editForm)
      });

      if (response.ok) {
        setEditingSubscription(null);
        fetchSubscriptions();
      } else {
        console.error("Failed to update subscription");
      }
    } catch (error) {
      console.error("Error updating subscription:", error);
    }
  };

  const stats = {
    totalRevenue: payments
      .filter(p => p.payment_status === 'success')
      .reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0),
    activeSubscriptions: subscriptions.filter(s => s.status === 'active').length,
    totalSubscriptions: subscriptions.length,
    pendingPayments: payments.filter(p => p.payment_status === 'pending').length
  };

  const exportToPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Payment History", 14, 22);
    doc.setFontSize(11);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

    const tableData = filteredPayments.map(p => [
      p.reference?.substring(0, 12),
      p.user_name,
      p.user_email,
      p.user_role,
      `${p.currency} ${parseFloat(p.amount).toFixed(2)}`,
      p.payment_status,
      new Date(p.payment_date).toLocaleDateString(),
      p.plan || '-'
    ]);

    autoTable(doc, {
      head: [['Ref', 'Name', 'Email', 'Role', 'Amount', 'Status', 'Date', 'Plan']],
      body: tableData,
      startY: 40,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [66, 66, 66] }
    });

    doc.save("payments.pdf");
  };

  const exportToCSV = () => {
    const headers = ['Reference', 'Name', 'Email', 'Role', 'Amount', 'Currency', 'Status', 'Date', 'Plan'];
    const csvContent = [
      headers.join(','),
      ...filteredPayments.map(p => [
        p.reference,
        `"${p.user_name}"`,
        p.user_email,
        p.user_role,
        p.amount,
        p.currency,
        p.payment_status,
        new Date(p.payment_date).toLocaleDateString(),
        p.plan || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'payments.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">GHS {stats.totalRevenue.toFixed(2)}</p>
              </div>

            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Subscriptions</p>
                <p className="text-2xl font-bold">{stats.activeSubscriptions}</p>
              </div>
              <CreditCard className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Subscriptions</p>
                <p className="text-2xl font-bold">{stats.totalSubscriptions}</p>
              </div>
              <Calendar className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Payments</p>
                <p className="text-2xl font-bold">{stats.pendingPayments}</p>
              </div>
              <Filter className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Payments and Subscriptions */}
      <Tabs defaultValue="payments" className="space-y-4">
        <TabsList>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
        </TabsList>

        {/* Payments Tab */}
        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>View all payments received from parents and students</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4 flex-wrap">
                <div className="flex-1 min-w-[200px] relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, email, or reference..."
                    value={paymentSearchTerm}
                    onChange={(e) => setPaymentSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={paymentStatusFilter} onValueChange={setPaymentStatusFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={exportToPDF}>
                      Export as PDF
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={exportToCSV}>
                      Export as Excel (CSV)
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="rounded-md border overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Reference</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Subscription Plan</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paymentsLoading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                        </TableCell>
                      </TableRow>
                    ) : filteredPayments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No payments found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredPayments.map((payment) => (
                        <TableRow key={payment.payment_id}>
                          <TableCell className="font-mono text-xs">{payment.reference?.substring(0, 12)}</TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">{payment.user_name}</span>
                              <span className="text-xs text-muted-foreground">{payment.user_email}</span>
                            </div>
                          </TableCell>
                          <TableCell className="capitalize text-xs">{payment.user_role}</TableCell>
                          <TableCell className="font-medium">{payment.currency} {parseFloat(payment.amount).toFixed(2)}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={getStatusColor(payment.payment_status)}>
                              {payment.payment_status}
                            </Badge>
                          </TableCell>
                          <TableCell>{new Date(payment.payment_date).toLocaleDateString()}</TableCell>
                          <TableCell className="capitalize">{payment.plan || '-'}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Subscriptions Tab */}
        <TabsContent value="subscriptions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Subscription Management</CardTitle>
              <CardDescription>Manage active and inactive subscriptions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4 flex-wrap">
                <div className="flex-1 min-w-[200px] relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or email..."
                    value={subSearchTerm}
                    onChange={(e) => setSubSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={subStatusFilter} onValueChange={setSubStatusFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={subPlanFilter} onValueChange={setSubPlanFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Filter by plan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Plans</SelectItem>
                    <SelectItem value="single">Single Child</SelectItem>
                    <SelectItem value="family">Family Plan</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-md border overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Starts</TableHead>
                      <TableHead>Expires</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subsLoading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                        </TableCell>
                      </TableRow>
                    ) : filteredSubscriptions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No subscriptions found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredSubscriptions.map((sub) => (
                        <TableRow key={sub.id}>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">{sub.user_name}</span>
                              <span className="text-xs text-muted-foreground">{sub.user_email}</span>
                            </div>
                          </TableCell>
                          <TableCell className="capitalize">{sub.plan}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={getStatusColor(sub.status)}>
                              {sub.status}
                            </Badge>
                          </TableCell>
                          <TableCell>GHS {parseFloat(sub.amount).toFixed(2)}</TableCell>
                          <TableCell>{sub.starts_at ? new Date(sub.starts_at).toLocaleDateString() : '-'}</TableCell>
                          <TableCell>{sub.expires_at ? new Date(sub.expires_at).toLocaleDateString() : '-'}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="outline" size="sm" onClick={() => handleEditClick(sub)}>
                              Edit
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      {editingSubscription && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4 animate-in fade-in zoom-in-95 duration-200">
            <CardHeader>
              <CardTitle>Edit Subscription</CardTitle>
              <CardDescription>Update details for {editingSubscription.user_name}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Plan</label>
                <Select
                  value={editForm.plan}
                  onValueChange={(val) => setEditForm(prev => ({ ...prev, plan: val }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Plan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single Child</SelectItem>
                    <SelectItem value="family">Family Plan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select
                  value={editForm.status}
                  onValueChange={(val) => setEditForm(prev => ({ ...prev, status: val }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Expires At</label>
                <Input
                  type="date"
                  value={editForm.expiresAt}
                  onChange={(e) => setEditForm(prev => ({ ...prev, expiresAt: e.target.value }))}
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <Button variant="outline" onClick={() => setEditingSubscription(null)}>Cancel</Button>
                <Button onClick={handleSave}>Save Changes</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
