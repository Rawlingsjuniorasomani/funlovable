import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, CreditCard, Shield, Clock, AlertCircle, Calendar } from "lucide-react";
import { toast } from "sonner";
import { paymentsAPI, plansAPI, subscriptionsAPI } from "@/config/api";
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

interface Subscription {
    id: string;
    planId: string;
    planName: string;
    status: 'active' | 'expired' | 'cancelled' | 'inactive';
    amount: number;
    startsAt: string;
    expiresAt: string;
}

interface SubscriptionData {
    subscription: Subscription | null;
}

export function StudentSubscription() {
    const { user } = useAuthContext();
    const [plans, setPlans] = useState<Plan[]>([]);
    const [currentSubscription, setCurrentSubscription] = useState<SubscriptionData | null>(null);
    const [loading, setLoading] = useState<string | null>(null);
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setFetching(true);
            const [plansData, subData] = await Promise.all([
                plansAPI.getAll(),
                subscriptionsAPI.getMySubscription()
            ]);
            setPlans(Array.isArray(plansData) ? plansData : []);
            setCurrentSubscription(subData);
        } catch (error) {
            console.error("Failed to load data:", error);
            toast.error("Failed to load subscription details");
        } finally {
            setFetching(false);
        }
    };

    const handleSubscribe = async (plan: Plan) => {
        try {
            setLoading(plan.id);
            
            if (currentSubscription?.subscription?.status === 'active') {
                const response = await subscriptionsAPI.upgrade(plan.id);
                if (response.authorization_url) {
                    window.location.href = response.authorization_url;
                } else {
                    toast.error("Failed to initialize upgrade");
                }
            } else {
                
                const response = await paymentsAPI.initialize({
                    amount: plan.price,
                    planId: plan.id,
                    email: user?.email
                });

                if (response.authorization_url) {
                    window.location.href = response.authorization_url;
                } else {
                    toast.error("Failed to initialize payment");
                }
            }
        } catch (error) {
            console.error("Subscription error:", error);
            toast.error("Failed to process request");
        } finally {
            setLoading(null);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const getDaysRemaining = (expiresAt: string) => {
        const now = new Date();
        const expiry = new Date(expiresAt);
        const diff = expiry.getTime() - now.getTime();
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
    };

    if (fetching) {
        return <div className="p-8 text-center">Loading subscription details...</div>;
    }

    const activeSub = currentSubscription?.subscription;
    const isExpired = activeSub?.status === 'expired' || (activeSub?.expiresAt && new Date(activeSub.expiresAt) < new Date());
    const daysRemaining = activeSub?.expiresAt ? getDaysRemaining(activeSub.expiresAt) : 0;

    return (
        <div className="space-y-8 animate-fade-in p-6">
            { }
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div>
                        <h2 className="text-2xl font-bold mb-1">My Subscription</h2>
                        <p className="text-muted-foreground">Manage your learning plan</p>
                    </div>
                    {activeSub && (
                        <div className={`px-4 py-1.5 rounded-full text-sm font-semibold ${activeSub.status === 'active' && !isExpired
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                            }`}>
                            {activeSub.status === 'active' && !isExpired ? 'Active' : 'Expired'}
                        </div>
                    )}
                </div>

                {activeSub ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
                            <div className="flex items-center gap-3 mb-2">
                                <Shield className="w-5 h-5 text-primary" />
                                <span className="font-medium">Current Plan</span>
                            </div>
                            <p className="text-xl font-bold">{activeSub.planName}</p>
                            <p className="text-sm text-muted-foreground mt-1">
                                GH₵{activeSub.amount.toLocaleString()} / {plans.find(p => p.id === activeSub.planId)?.duration.toLowerCase() || 'period'}
                            </p>
                        </div>

                        <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
                            <div className="flex items-center gap-3 mb-2">
                                <Calendar className="w-5 h-5 text-blue-500" />
                                <span className="font-medium">Expiry Date</span>
                            </div>
                            <p className="text-xl font-bold">{formatDate(activeSub.expiresAt)}</p>
                            <p className={`text-sm mt-1 ${daysRemaining < 7 ? 'text-amber-600 font-medium' : 'text-muted-foreground'}`}>
                                {daysRemaining > 0 ? `${daysRemaining} days remaining` : 'Expired'}
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-8 bg-muted/20 rounded-lg border border-dashed">
                        <AlertCircle className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                        <h3 className="text-lg font-medium">No Active Subscription</h3>
                        <p className="text-muted-foreground mb-4">Subscribe to a plan to unlock full access.</p>
                    </div>
                )}
            </div>

            <div className="text-center max-w-2xl mx-auto pt-4">
                <h2 className="text-2xl font-display font-bold mb-2">
                    {activeSub ? 'Upgrade or Renew Plan' : 'Choose Your Learning Plan'}
                </h2>
                <p className="text-muted-foreground">
                    {activeSub ? 'Switch to a different plan or renew your current one.' : 'Select the best plan for your education.'}
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
                                disabled={!!loading || (activeSub?.planId === plan.id && !isExpired)}
                            >
                                {loading === plan.id ? "Processing..." :
                                    activeSub?.planId === plan.id && !isExpired ? "Current Plan" :
                                        activeSub?.planId === plan.id && isExpired ? "Renew Now" :
                                            "Upgrade"}
                                {!loading && activeSub?.planId !== plan.id && <CreditCard className="w-4 h-4 ml-2" />}
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
