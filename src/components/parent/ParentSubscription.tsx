import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, CreditCard, Shield, Clock } from "lucide-react";
import { toast } from "sonner";
import { paymentsAPI, plansAPI } from "@/config/api";
import { useAuthContext } from "@/contexts/AuthContext";

interface Plan {
    id: string;
    name: string;
    price: number;
    duration: string;
    features: string[];
    recommended: boolean;
    description: string;
}

export function ParentSubscription() {
    const { user } = useAuthContext();
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState<string | null>(null);
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        loadPlans();
    }, []);

    const loadPlans = async () => {
        try {
            setFetching(true);
            const data = await plansAPI.getAll();
            setPlans(data);
        } catch (error) {
            console.error("Failed to load plans:", error);
            toast.error("Failed to load subscription plans");
        } finally {
            setFetching(false);
        }
    };

    const handleSubscribe = async (plan: Plan) => {
        try {
            setLoading(plan.id);
            const response = await paymentsAPI.initialize({
                amount: plan.price,
                planId: plan.id,
                email: user?.email
            });

            // Redirect to Paystack
            if (response.authorization_url) {
                window.location.href = response.authorization_url;
            } else {
                toast.error("Failed to initialize payment");
            }
        } catch (error) {
            console.error("Subscription error:", error);
            toast.error("Failed to process subscription request");
        } finally {
            setLoading(null);
        }
    };

    if (fetching) {
        return <div className="p-8 text-center">Loading plans...</div>;
    }

    return (
        <div className="space-y-8 animate-fade-in p-6">
            <div className="text-center max-w-2xl mx-auto">
                <h2 className="text-3xl font-display font-bold mb-4">Choose Your Learning Plan</h2>
                <p className="text-muted-foreground">
                    Unlock the full potential of your child's education with our flexible subscription plans.
                    Cancel anytime.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {plans.map((plan) => (
                    <Card
                        key={plan.id}
                        className={`relative flex flex-col ${plan.recommended
                            ? "border-primary shadow-lg scale-105 z-10"
                            : "border-border hover:border-primary/50 transition-colors"
                            }`}
                    >
                        {plan.recommended && (
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
                                Most Popular
                            </div>
                        )}
                        <CardHeader>
                            <CardTitle className="text-xl">{plan.name}</CardTitle>
                            <CardDescription>{plan.duration}</CardDescription>
                            <div className="mt-4">
                                <span className="text-4xl font-bold">GH₵{plan.price.toLocaleString()}</span>
                                <span className="text-muted-foreground">/{plan.duration.toLowerCase()}</span>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <ul className="space-y-3">
                                {plan.features?.map((feature, i) => (
                                    <li key={i} className="flex items-center gap-2 text-sm">
                                        <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <Button
                                className="w-full"
                                size="lg"
                                variant={plan.recommended ? "default" : "outline"}
                                onClick={() => handleSubscribe(plan)}
                                disabled={!!loading}
                            >
                                {loading === plan.id ? "Processing..." : "Subscribe Now"}
                                {!loading && <CreditCard className="w-4 h-4 ml-2" />}
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-12 text-center">
                <div className="p-4">
                    <Shield className="w-8 h-8 text-primary mx-auto mb-2" />
                    <h3 className="font-semibold mb-1">Secure Payment</h3>
                    <p className="text-sm text-muted-foreground">Encrypted transactions via Paystack</p>
                </div>
                <div className="p-4">
                    <Clock className="w-8 h-8 text-secondary mx-auto mb-2" />
                    <h3 className="font-semibold mb-1">Cancel Anytime</h3>
                    <p className="text-sm text-muted-foreground">No long-term commitments required</p>
                </div>
                <div className="p-4">
                    <Check className="w-8 h-8 text-tertiary mx-auto mb-2" />
                    <h3 className="font-semibold mb-1">Instant Access</h3>
                    <p className="text-sm text-muted-foreground">Get started immediately after payment</p>
                </div>
            </div>
        </div>
    );
}
