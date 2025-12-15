import { useState } from "react";
import {
  CreditCard, DollarSign, Calendar, CheckCircle, AlertCircle,
  Download, Clock, ArrowUpRight, Shield, Star
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { PaystackCheckout } from "@/components/payments/PaystackCheckout";
import { useAuthContext } from "@/contexts/AuthContext";
import { recordPayment } from "@/data/parentDataStore";

interface PaymentHistory {
  id: string;
  date: string;
  description: string;
  amount: number;
  status: "completed" | "pending" | "failed";
  method: string;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  period: string;
  features: string[];
  recommended?: boolean;
}

const paymentHistory: PaymentHistory[] = [];

const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: "basic",
    name: "Basic",
    price: 0,
    period: "Free",
    features: ["Access to basic lessons", "Limited quizzes", "Community support"],
  },
  {
    id: "standard",
    name: "Standard",
    price: 19.99,
    period: "month",
    features: ["All subjects access", "Unlimited quizzes", "Progress tracking", "Email support"],
  },
  {
    id: "premium",
    name: "Premium",
    price: 29.99,
    period: "month",
    recommended: true,
    features: ["Everything in Standard", "Live classes", "1-on-1 tutoring", "Priority support", "Download materials"],
  },
];

export function EnhancedParentPayments() {
  const { user } = useAuthContext();
  const [currentPlan] = useState("premium");
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [selectedPlanForPayment, setSelectedPlanForPayment] = useState<SubscriptionPlan | null>(null);

  const nextBillingDate = new Date();
  nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
  nextBillingDate.setDate(1);

  const daysUntilRenewal = Math.ceil((nextBillingDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  const handleDownloadInvoice = (paymentId: string) => {
    toast.success("Invoice downloaded successfully");
  };

  const handleUpdatePayment = () => {
    toast.info("Payment method update feature coming soon");
  };

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    if (plan.price === 0) {
      toast.success(`Switched to ${plan.name} plan`);
      setShowUpgrade(false);
      return;
    }
    setSelectedPlanForPayment(plan);
    setShowPayment(true);
    setShowUpgrade(false);
  };


  const handlePaymentSuccess = (reference: string) => {
    toast.success(`Subscription to ${selectedPlanForPayment?.name} successful! Ref: ${reference}`);

    if (user && selectedPlanForPayment) {
      recordPayment({
        id: `pay_${Date.now()}`,
        parentId: user.id,
        parentName: user.name,
        parentEmail: user.email,
        subscriptionId: 'sub_new', // Simplified
        plan: selectedPlanForPayment.name,
        amount: selectedPlanForPayment.price,
        status: 'completed',
        date: new Date().toISOString()
      });
    }

    setShowPayment(false);
    setSelectedPlanForPayment(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">Payments & Subscription</h2>
          <p className="text-muted-foreground">Manage your subscription and billing</p>
        </div>
      </div>

      {/* Current Subscription */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 bg-gradient-to-br from-primary/10 via-background to-secondary/10 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <Badge className="bg-primary text-primary-foreground mb-3">Current Plan</Badge>
                <h3 className="text-2xl font-bold text-foreground mb-1">Premium Plan</h3>
                <p className="text-muted-foreground">$29.99/month • Auto-renews monthly</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-primary">$29.99</p>
                <p className="text-sm text-muted-foreground">per month</p>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-border">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Next billing date</span>
                </div>
                <span className="font-medium">{nextBillingDate.toLocaleDateString()}</span>
              </div>

              <div className="mb-2">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Days until renewal</span>
                  <span>{daysUntilRenewal} days</span>
                </div>
                <Progress value={(30 - daysUntilRenewal) / 30 * 100} className="h-2" />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <Dialog open={showUpgrade} onOpenChange={setShowUpgrade}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <ArrowUpRight className="w-4 h-4 mr-2" />
                    Change Plan
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl">
                  <DialogHeader>
                    <DialogTitle>Choose a Plan</DialogTitle>
                    <DialogDescription>
                      Select the plan that best fits your needs
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    {subscriptionPlans.map((plan) => (
                      <Card
                        key={plan.id}
                        className={`relative ${plan.recommended ? "border-primary ring-2 ring-primary/20" : ""}`}
                      >
                        {plan.recommended && (
                          <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-primary">
                            <Star className="w-3 h-3 mr-1" />
                            Recommended
                          </Badge>
                        )}
                        <CardContent className="p-4 pt-6">
                          <h4 className="font-semibold text-lg">{plan.name}</h4>
                          <div className="mt-2 mb-4">
                            <span className="text-3xl font-bold">${plan.price}</span>
                            {plan.price > 0 && <span className="text-muted-foreground">/{plan.period}</span>}
                          </div>
                          <ul className="space-y-2 text-sm">
                            {plan.features.map((feature, i) => (
                              <li key={i} className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-secondary" />
                                {feature}
                              </li>
                            ))}
                          </ul>
                          <Button
                            className="w-full mt-4"
                            variant={plan.id === currentPlan ? "outline" : "default"}
                            onClick={() => handleSelectPlan(plan)}
                            disabled={plan.id === currentPlan}
                          >
                            {plan.id === currentPlan ? "Current Plan" : "Select Plan"}
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
              <Button variant="ghost" onClick={() => toast.info("Cancellation flow coming soon")}>
                Cancel Subscription
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Payment Method */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-primary" />
              Payment Method
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 mb-4">
              <div className="w-10 h-7 bg-gradient-to-r from-blue-600 to-blue-800 rounded flex items-center justify-center text-white text-xs font-bold">
                VISA
              </div>
              <div>
                <p className="font-medium text-sm">Visa ending in 4242</p>
                <p className="text-xs text-muted-foreground">Expires 12/25</p>
              </div>
            </div>

            <Button variant="outline" className="w-full" onClick={handleUpdatePayment}>
              Update Payment Method
            </Button>

            <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
              <Shield className="w-3 h-3" />
              Secured by 256-bit SSL encryption
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-tertiary" />
            Payment History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Invoice</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paymentHistory.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>{new Date(payment.date).toLocaleDateString()}</TableCell>
                  <TableCell>{payment.description}</TableCell>
                  <TableCell>{payment.method}</TableCell>
                  <TableCell className="font-medium">${payment.amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge
                      variant={payment.status === "completed" ? "default" : payment.status === "pending" ? "secondary" : "destructive"}
                      className={payment.status === "completed" ? "bg-secondary text-secondary-foreground" : ""}
                    >
                      {payment.status === "completed" && <CheckCircle className="w-3 h-3 mr-1" />}
                      {payment.status === "pending" && <Clock className="w-3 h-3 mr-1" />}
                      {payment.status === "failed" && <AlertCircle className="w-3 h-3 mr-1" />}
                      {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownloadInvoice(payment.id)}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Billing Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <p className="text-2xl font-bold">$119.96</p>
                <p className="text-sm text-muted-foreground">Total Spent (Year)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">4</p>
                <p className="text-sm text-muted-foreground">Successful Payments</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-tertiary/20 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-tertiary" />
              </div>
              <div>
                <p className="text-2xl font-bold">Sep 2024</p>
                <p className="text-sm text-muted-foreground">Member Since</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Dialog */}
      <Dialog open={showPayment} onOpenChange={setShowPayment}>
        <DialogContent className="sm:max-w-md p-0 bg-transparent border-none shadow-none">
          {selectedPlanForPayment && (
            <PaystackCheckout
              amount={selectedPlanForPayment.price}
              email={user?.email || "parent@example.com"}
              planName={selectedPlanForPayment.name}
              onSuccess={handlePaymentSuccess}
              onClose={() => setShowPayment(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
