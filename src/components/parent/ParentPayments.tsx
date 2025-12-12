import { CreditCard, Receipt, Download, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Payment {
  id: string;
  description: string;
  amount: number;
  date: string;
  status: "paid" | "pending" | "failed";
  method: string;
  child?: string;
}

const mockPayments: Payment[] = [
  { id: "p1", description: "Monthly Subscription - December", amount: 150, date: "2024-12-01", status: "paid", method: "MTN MoMo", child: "Kwame & Ama" },
  { id: "p2", description: "Monthly Subscription - November", amount: 150, date: "2024-11-01", status: "paid", method: "Vodafone Cash" },
  { id: "p3", description: "Monthly Subscription - October", amount: 150, date: "2024-10-01", status: "paid", method: "MTN MoMo" },
  { id: "p4", description: "Extra Tutoring Session", amount: 50, date: "2024-10-15", status: "paid", method: "Card" },
  { id: "p5", description: "Monthly Subscription - September", amount: 150, date: "2024-09-01", status: "paid", method: "MTN MoMo" },
];

const currentPlan = {
  name: "Family Plan",
  price: 150,
  period: "month",
  children: 2,
  nextBilling: "2025-01-01",
  features: ["Unlimited quizzes", "All subjects", "Progress reports", "Teacher messaging", "Live classes"],
};

const statusConfig = {
  paid: { icon: CheckCircle, color: "bg-secondary/10 text-secondary", label: "Paid" },
  pending: { icon: Clock, color: "bg-accent/10 text-accent", label: "Pending" },
  failed: { icon: AlertCircle, color: "bg-destructive/10 text-destructive", label: "Failed" },
};

export function ParentPayments() {
  const totalSpent = mockPayments.filter(p => p.status === "paid").reduce((acc, p) => acc + p.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-display font-bold text-foreground">Payments & Billing</h2>
        <p className="text-muted-foreground">Manage your subscription and view payment history</p>
      </div>

      {/* Current Plan */}
      <div className="bg-gradient-to-r from-primary to-tertiary rounded-xl p-6 text-primary-foreground animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="text-sm opacity-80 mb-1">Current Plan</p>
            <h3 className="text-2xl font-bold mb-2">{currentPlan.name}</h3>
            <p className="text-sm opacity-80">{currentPlan.children} children enrolled</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold">GH₵{currentPlan.price}<span className="text-sm font-normal opacity-80">/{currentPlan.period}</span></p>
            <p className="text-sm opacity-80">Next billing: {new Date(currentPlan.nextBilling).toLocaleDateString()}</p>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-white/20">
          <p className="text-sm opacity-80 mb-2">Includes:</p>
          <div className="flex flex-wrap gap-2">
            {currentPlan.features.map(feature => (
              <span key={feature} className="px-2 py-1 rounded-full bg-white/20 text-xs">
                ✓ {feature}
              </span>
            ))}
          </div>
        </div>
        <div className="mt-4 flex gap-3">
          <Button variant="secondary" className="bg-white text-primary hover:bg-white/90">
            Upgrade Plan
          </Button>
          <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
            Manage Subscription
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl border border-border p-4 animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <CreditCard className="w-5 h-5 text-primary mb-2" />
          <p className="text-2xl font-bold text-foreground">GH₵{totalSpent}</p>
          <p className="text-sm text-muted-foreground">Total Spent</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 animate-fade-in" style={{ animationDelay: "0.15s" }}>
          <Receipt className="w-5 h-5 text-secondary mb-2" />
          <p className="text-2xl font-bold text-foreground">{mockPayments.length}</p>
          <p className="text-sm text-muted-foreground">Transactions</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <CheckCircle className="w-5 h-5 text-tertiary mb-2" />
          <p className="text-2xl font-bold text-foreground">{mockPayments.filter(p => p.status === "paid").length}</p>
          <p className="text-sm text-muted-foreground">Successful</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 animate-fade-in" style={{ animationDelay: "0.25s" }}>
          <Clock className="w-5 h-5 text-accent mb-2" />
          <p className="text-2xl font-bold text-foreground">21</p>
          <p className="text-sm text-muted-foreground">Days Until Renewal</p>
        </div>
      </div>

      {/* Payment History */}
      <div className="bg-card rounded-xl border border-border overflow-hidden animate-fade-in" style={{ animationDelay: "0.3s" }}>
        <div className="p-4 bg-muted/30 border-b border-border flex items-center justify-between">
          <h3 className="font-semibold text-foreground">Payment History</h3>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-border bg-muted/20">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Description</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Date</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Method</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-right p-4 text-sm font-medium text-muted-foreground">Amount</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {mockPayments.map((payment) => {
                const status = statusConfig[payment.status];
                const StatusIcon = status.icon;
                return (
                  <tr key={payment.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-4">
                      <p className="font-medium text-foreground">{payment.description}</p>
                      {payment.child && <p className="text-xs text-muted-foreground">{payment.child}</p>}
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {new Date(payment.date).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">{payment.method}</td>
                    <td className="p-4">
                      <Badge variant="outline" className={cn("gap-1", status.color)}>
                        <StatusIcon className="w-3 h-3" />
                        {status.label}
                      </Badge>
                    </td>
                    <td className="p-4 text-right font-medium text-foreground">GH₵{payment.amount}</td>
                    <td className="p-4">
                      <Button variant="ghost" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
