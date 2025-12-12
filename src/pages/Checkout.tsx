import { useState } from "react";
import { Link } from "react-router-dom";
import { Check, CreditCard, Shield, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const plans = [
  {
    id: "single",
    name: "Single Child",
    price: 400,
    period: "month",
    description: "Perfect for individual learners",
    features: ["1 Student Account", "All Subjects Access", "Progress Tracking", "Parent Dashboard"],
  },
  {
    id: "family",
    name: "Family Plan",
    price: 1500,
    period: "month",
    description: "Best value for families",
    features: ["Up to 4 Student Accounts", "All Subjects Access", "Advanced Analytics", "Priority Support", "Offline Access"],
    popular: true,
  },
];

export default function Checkout() {
  const [selectedPlan, setSelectedPlan] = useState("family");
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
  });
  const { toast } = useToast();

  const selectedPlanData = plans.find((p) => p.id === selectedPlan);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePaystack = async () => {
    if (!formData.email || !formData.firstName || !formData.lastName) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    // Simulate Paystack integration
    await new Promise((resolve) => setTimeout(resolve, 2000));

    toast({
      title: "Demo Mode",
      description: "This is a UI mockup. Paystack integration requires backend setup with Lovable Cloud.",
    });

    setIsProcessing(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-foreground hover:text-primary transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Home</span>
          </Link>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="w-4 h-4 text-secondary" />
            <span>Secure Checkout</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-4xl font-display font-bold text-foreground mb-4">
              Complete Your <span className="gradient-text">Subscription</span>
            </h1>
            <p className="text-muted-foreground">
              Choose your plan and start your child's learning journey today
            </p>
          </div>

          <div className="grid lg:grid-cols-5 gap-8">
            {/* Plan Selection */}
            <div className="lg:col-span-3 space-y-6">
              <div className="bg-card rounded-2xl border border-border p-6 animate-fade-in">
                <h2 className="text-xl font-display font-semibold text-foreground mb-6">
                  1. Select Your Plan
                </h2>
                <RadioGroup value={selectedPlan} onValueChange={setSelectedPlan} className="space-y-4">
                  {plans.map((plan) => (
                    <div
                      key={plan.id}
                      className={cn(
                        "relative rounded-xl border-2 p-6 cursor-pointer transition-all duration-300",
                        selectedPlan === plan.id
                          ? "border-primary bg-primary/5 shadow-lg"
                          : "border-border hover:border-primary/50"
                      )}
                      onClick={() => setSelectedPlan(plan.id)}
                    >
                      {plan.popular && (
                        <span className="absolute -top-3 right-4 bg-secondary text-secondary-foreground text-xs font-bold px-3 py-1 rounded-full">
                          MOST POPULAR
                        </span>
                      )}
                      <div className="flex items-start gap-4">
                        <RadioGroupItem value={plan.id} id={plan.id} className="mt-1" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <Label htmlFor={plan.id} className="text-lg font-semibold text-foreground cursor-pointer">
                              {plan.name}
                            </Label>
                            <div className="text-right">
                              <span className="text-2xl font-bold text-foreground">GH₵{plan.price}</span>
                              <span className="text-muted-foreground">/{plan.period}</span>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                          <ul className="grid grid-cols-2 gap-2">
                            {plan.features.map((feature) => (
                              <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Check className="w-4 h-4 text-secondary" />
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* Customer Information */}
              <div className="bg-card rounded-2xl border border-border p-6 animate-fade-in" style={{ animationDelay: "100ms" }}>
                <h2 className="text-xl font-display font-semibold text-foreground mb-6">
                  2. Your Information
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="Kwame"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="Asante"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="kwame@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+233 24 000 0000"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-2">
              <div className="bg-card rounded-2xl border border-border p-6 sticky top-24 animate-fade-in" style={{ animationDelay: "200ms" }}>
                <h2 className="text-xl font-display font-semibold text-foreground mb-6">
                  Order Summary
                </h2>
                
                {selectedPlanData && (
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between text-foreground">
                      <span>{selectedPlanData.name}</span>
                      <span>GH₵{selectedPlanData.price}</span>
                    </div>
                    <div className="border-t border-border pt-4">
                      <div className="flex justify-between text-lg font-semibold text-foreground">
                        <span>Total (Monthly)</span>
                        <span>GH₵{selectedPlanData.price}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Billed monthly. Cancel anytime.
                      </p>
                    </div>
                  </div>
                )}

                {/* Paystack Button */}
                <Button
                  onClick={handlePaystack}
                  disabled={isProcessing}
                  className="w-full h-14 text-lg font-semibold btn-bounce bg-[#00C3F7] hover:bg-[#00a8d4] text-white"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5 mr-2" />
                      Pay with Paystack
                    </>
                  )}
                </Button>

                {/* Paystack Badge */}
                <div className="mt-4 text-center">
                  <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                    <Shield className="w-4 h-4" />
                    <span>Secured by</span>
                    <span className="font-bold text-[#00C3F7]">Paystack</span>
                  </div>
                </div>

                {/* Features */}
                <div className="mt-6 pt-6 border-t border-border space-y-3">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Check className="w-5 h-5 text-secondary" />
                    <span>7-day free trial included</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Check className="w-5 h-5 text-secondary" />
                    <span>Cancel anytime, no questions asked</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Check className="w-5 h-5 text-secondary" />
                    <span>Instant access after payment</span>
                  </div>
                </div>

                {/* Payment Methods */}
                <div className="mt-6 pt-6 border-t border-border">
                  <p className="text-xs text-muted-foreground mb-3">Accepted payment methods:</p>
                  <div className="flex flex-wrap gap-2">
                    {["MTN MoMo", "Vodafone Cash", "AirtelTigo", "Visa", "Mastercard"].map((method) => (
                      <span
                        key={method}
                        className="text-xs bg-muted px-3 py-1 rounded-full text-muted-foreground"
                      >
                        {method}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
