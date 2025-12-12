import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CreditCard, Shield, CheckCircle, Loader2 } from "lucide-react";
import { usePaystackPayment } from "react-paystack";
import { useToast } from "@/hooks/use-toast";
import { PaystackProps } from "react-paystack/dist/types";

interface PaystackCheckoutProps {
  amount: number;
  email: string;
  planName: string;
  onSuccess: (reference: string) => void;
  onClose?: () => void;
}

export function PaystackCheckout({ amount, email, planName, onSuccess, onClose }: PaystackCheckoutProps) {
  const { toast } = useToast();
  const [isSuccess, setIsSuccess] = useState(false);

  const config: PaystackProps = {
    reference: `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    email: email,
    amount: amount * 100, 
    publicKey: "pk_test_80bb43d7d72d46674060d9605602ba82cd523119", 
  };

  const initializePayment = usePaystackPayment(config);

  const handleSuccess = (reference: any) => {
    setIsSuccess(true);
    toast({
      title: "Payment Successful!",
      description: `Your payment for ${planName} was processed successfully.`,
    });
    onSuccess(reference.reference);
  };

  const handleClose = () => {
    if (onClose) onClose();
    toast({
      title: "Payment Cancelled",
      description: "You have cancelled the payment process.",
      variant: "default",
    });
  };

  if (isSuccess) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-8 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">Payment Successful!</h3>
          <p className="text-muted-foreground">Your subscription has been activated.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto border-border">
      <CardHeader className="text-center border-b border-border pb-4">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
            <CreditCard className="w-4 h-4 text-primary" />
          </div>
          <span className="font-semibold text-lg">Paystack Secure Payment</span>
        </div>
        <CardTitle className="text-foreground">{planName}</CardTitle>
        <CardDescription>
          Amount: <span className="font-bold text-foreground">GHS {amount.toFixed(2)}</span>
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={email} disabled className="bg-muted" />
        </div>

        <div className="rounded-md bg-muted/50 p-4 text-sm text-muted-foreground">
          <p>You will be redirected to Paystack's secure checkout page to complete your payment.</p>
        </div>

        <Button
          onClick={() => {
            initializePayment({ onSuccess: handleSuccess, onClose: handleClose });
          }}
          className="w-full bg-primary hover:bg-primary/90"
        >
          Pay GHS {amount.toFixed(2)}
        </Button>

        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-2">
          <Shield className="w-3 h-3" />
          <span>Secured by Paystack</span>
        </div>

        {onClose && (
          <Button variant="ghost" onClick={onClose} className="w-full">
            Cancel
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
