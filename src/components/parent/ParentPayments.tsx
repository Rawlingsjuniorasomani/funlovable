import { useState, useEffect } from "react";
import { CreditCard, Receipt, Download, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAuthContext } from "@/contexts/AuthContext";
import { paymentsAPI } from "@/config/api";
import { useToast } from "@/hooks/use-toast";

interface Payment {
  id: string;
  description: string; 
  amount: number;
  created_at: string;
  status: "success" | "pending" | "failed"; 
  payment_method: string;
  reference: string;
}

const statusConfig = {
  success: { icon: CheckCircle, color: "bg-secondary/10 text-secondary", label: "Paid" },
  pending: { icon: Clock, color: "bg-accent/10 text-accent", label: "Pending" },
  failed: { icon: AlertCircle, color: "bg-destructive/10 text-destructive", label: "Failed" },
};

export function ParentPayments() {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const data = await paymentsAPI.getAll();
        setPayments(data);
      } catch (error) {
        console.error("Failed to fetch payments:", error);
        toast({
          title: "Error",
          description: "Could not load payment history.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPayments();
  }, [toast]);

  const totalSpent = payments
    .filter((p) => p.status === "success")
    .reduce((acc, p) => acc + Number(p.amount), 0);

  
  
  const currentPlan = user?.subscription ? {
    name: user.subscription.plan === 'family' ? 'Family Plan' : 'Single Child',
    price: user.subscription.plan === 'family' ? 1300 : 300,
    period: 'year', 
    children: user.children?.length || 0,
    nextBilling: user.subscription.expiresAt || new Date().toISOString(),
    features: ["Unlimited quizzes", "All subjects", "Progress reports"],
    isActive: user.subscription.status === 'active'
  } : null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-display font-bold text-foreground">Payments & Billing</h2>
        <p className="text-muted-foreground">Manage your subscription and view payment history</p>
      </div>

      { }
      {currentPlan && currentPlan.isActive ? (
        <div className="bg-gradient-to-r from-primary to-tertiary rounded-xl p-6 text-primary-foreground animate-fade-in">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="text-sm opacity-80 mb-1">Current Plan</p>
              <h3 className="text-2xl font-bold mb-2">{currentPlan.name}</h3>
              <p className="text-sm opacity-80">{currentPlan.children} children enrolled</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold">GH₵{currentPlan.price}<span className="text-sm font-normal opacity-80">/{currentPlan.period}</span></p>
              <p className="text-sm opacity-80">Expires: {new Date(currentPlan.nextBilling).toLocaleDateString()}</p>
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
              Renew / Upgrade
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-destructive/50 p-6">
          <h3 className="text-xl font-bold text-destructive mb-2">No Active Subscription</h3>
          <p className="text-muted-foreground mb-4">Please subscribe to a plan to access all features.</p>
          <Button variant="default" onClick={() => window.location.href = '/pricing'}>Subscribe Now</Button>
        </div>
      )}

      { }
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl border border-border p-4 animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <CreditCard className="w-5 h-5 text-primary mb-2" />
          <p className="text-2xl font-bold text-foreground">GH₵{totalSpent.toFixed(2)}</p>
          <p className="text-sm text-muted-foreground">Total Spent</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 animate-fade-in" style={{ animationDelay: "0.15s" }}>
          <Receipt className="w-5 h-5 text-secondary mb-2" />
          <p className="text-2xl font-bold text-foreground">{payments.length}</p>
          <p className="text-sm text-muted-foreground">Transactions</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <CheckCircle className="w-5 h-5 text-tertiary mb-2" />
          <p className="text-2xl font-bold text-foreground">{payments.filter(p => p.status === "success").length}</p>
          <p className="text-sm text-muted-foreground">Successful</p>
        </div>
      </div>

      { }
      <div className="bg-card rounded-xl border border-border overflow-hidden animate-fade-in" style={{ animationDelay: "0.3s" }}>
        <div className="p-4 bg-muted/30 border-b border-border flex items-center justify-between">
          <h3 className="font-semibold text-foreground">Payment History</h3>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">Loading payments...</div>
          ) : payments.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">No payment history found.</div>
          ) : (
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
                {payments.map((payment) => {
                  const status = statusConfig[payment.status] || statusConfig.pending;
                  const StatusIcon = status.icon;
                  return (
                    <tr key={payment.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-4">
                        <p className="font-medium text-foreground">Subscription Payment</p>
                        <p className="text-xs text-muted-foreground">Ref: {payment.reference?.substring(0, 10)}...</p>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {new Date(payment.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">{payment.payment_method || 'Card'}</td>
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
          )}
        </div>
      </div>
    </div>
  );
}
