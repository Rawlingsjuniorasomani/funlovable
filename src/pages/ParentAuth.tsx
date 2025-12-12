import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuthContext } from "@/contexts/AuthContext";
import { useParentData } from "@/data/parentDataStore";
import { useAdminNotifications } from "@/hooks/useAdminNotifications";
import { PaystackCheckout } from "@/components/payments/PaystackCheckout";
import { sendWelcomeSMS, sendSubscriptionSMS, sendPaymentConfirmationSMS } from "@/utils/smsService";
import { Eye, EyeOff, Users, Mail, Lock, User, Phone, CreditCard } from "lucide-react";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Please enter a valid email").max(255),
  phone: z.string().optional(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type AuthMode = 'login' | 'register' | 'plan_selection' | 'payment';

const plans = [
  { id: 'single', name: 'Single Child', price: 80, description: 'Perfect for one child', features: ['1 child account', 'All subjects access', 'Progress tracking', 'Parent dashboard'] },
  { id: 'family', name: 'Family Plan', price: 150, description: 'Best value for families', features: ['Up to 4 children', 'All subjects access', 'Progress tracking', 'Priority support'] },
];

export default function ParentAuth() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { login, register, updateSubscription } = useAuthContext();
  const { registerParent, createSubscription, addPayment } = useParentData();
  const { addNotification } = useAdminNotifications();
  
  const [mode, setMode] = useState<AuthMode>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedPlan, setSelectedPlan] = useState<typeof plans[0] | null>(null);
  const [registeredUser, setRegisteredUser] = useState<{ email: string; name: string; phone?: string } | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      if (mode === 'login') {
        loginSchema.parse({ email: formData.email, password: formData.password });
        
        const result = await login(formData.email, formData.password);
        
        if (result.success) {
          toast({ title: "Welcome back!", description: "Login successful." });
          const storedUser = localStorage.getItem('lovable_auth');
          if (storedUser) {
            const user = JSON.parse(storedUser);
            if (!user.onboardingComplete) {
              navigate('/onboarding');
            } else {
              navigate('/parent');
            }
          }
        } else {
          setErrors({ email: result.error || 'Login failed' });
        }
      } else {
        registerSchema.parse(formData);
        
        const result = await register({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: 'parent',
          phone: formData.phone || undefined,
        });
        
        if (result.success) {
          // Register in parent data store for admin visibility
          registerParent({
            name: formData.name,
            email: formData.email,
            phone: formData.phone || undefined,
          });

          // Add admin notification
          addNotification({
            type: 'new_parent',
            title: 'New Parent Registration',
            description: `${formData.name} just registered as a parent`,
            relatedId: result.user?.id,
          });

          // Send welcome SMS
          if (formData.phone) {
            await sendWelcomeSMS(formData.phone, formData.name);
          }

          setRegisteredUser({
            email: formData.email,
            name: formData.name,
            phone: formData.phone || undefined,
          });

          toast({ title: "Account created!", description: "Now choose your subscription plan." });
          setMode('plan_selection');
        } else {
          setErrors({ email: result.error || 'Registration failed' });
        }
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePlanSelect = (plan: typeof plans[0]) => {
    setSelectedPlan(plan);
    setMode('payment');
  };

  const handlePaymentSuccess = async (reference: string) => {
    if (!selectedPlan || !registeredUser) return;

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);

    // Create subscription in data store
    createSubscription({
      parentId: registeredUser.email,
      parentName: registeredUser.name,
      parentEmail: registeredUser.email,
      plan: selectedPlan.id as 'single' | 'family',
      planName: selectedPlan.name,
      amount: selectedPlan.price,
      status: 'active',
      startDate: now.toISOString().split('T')[0],
      expiresAt: expiresAt.toISOString().split('T')[0],
      paymentMethod: 'Paystack',
      autoRenew: true,
    });

    // Add payment record
    addPayment({
      parentId: registeredUser.email,
      parentName: registeredUser.name,
      parentEmail: registeredUser.email,
      plan: selectedPlan.name,
      amount: selectedPlan.price,
      status: 'completed',
      date: now.toISOString(),
      paymentMethod: 'Paystack',
    });

    // Update user subscription
    updateSubscription(selectedPlan.id as 'single' | 'family', 'active');

    // Add admin notifications
    addNotification({
      type: 'new_subscription',
      title: 'New Subscription',
      description: `${registeredUser.name} subscribed to ${selectedPlan.name}`,
    });

    addNotification({
      type: 'new_payment',
      title: 'Payment Received',
      description: `GHS ${selectedPlan.price} payment from ${registeredUser.name}`,
    });

    // Send SMS notifications
    if (registeredUser.phone) {
      await sendSubscriptionSMS(registeredUser.phone, registeredUser.name, selectedPlan.name);
      await sendPaymentConfirmationSMS(registeredUser.phone, registeredUser.name, selectedPlan.price, reference);
    }

    toast({
      title: "Subscription Activated!",
      description: "You can now add your children and start learning.",
    });

    navigate('/onboarding');
  };

  // Plan Selection View
  if (mode === 'plan_selection') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 dark:from-violet-950/20 dark:via-purple-950/20 dark:to-fuchsia-950/20 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-8">
            <h1 className="font-display text-2xl font-bold text-foreground mb-2">Choose Your Plan</h1>
            <p className="text-muted-foreground">Select the best plan for your family</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`bg-card rounded-2xl p-6 border-2 cursor-pointer transition-all hover:shadow-lg ${
                  plan.id === 'family' ? 'border-primary' : 'border-border'
                }`}
                onClick={() => handlePlanSelect(plan)}
              >
                {plan.id === 'family' && (
                  <div className="text-xs font-semibold text-primary mb-2">MOST POPULAR</div>
                )}
                <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                <p className="text-muted-foreground text-sm mb-4">{plan.description}</p>
                <div className="text-3xl font-bold text-foreground mb-4">
                  GHS {plan.price}<span className="text-sm font-normal text-muted-foreground">/year</span>
                </div>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button className="w-full" variant={plan.id === 'family' ? 'default' : 'outline'}>
                  <CreditCard className="w-4 h-4 mr-2" />
                  Select {plan.name}
                </Button>
              </div>
            ))}
          </div>

          <div className="text-center mt-6">
            <Button variant="ghost" onClick={() => navigate('/onboarding')}>
              Skip for now
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Payment View
  if (mode === 'payment' && selectedPlan && registeredUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 dark:from-violet-950/20 dark:via-purple-950/20 dark:to-fuchsia-950/20 flex items-center justify-center px-4 py-8">
        <PaystackCheckout
          amount={selectedPlan.price}
          email={registeredUser.email}
          planName={selectedPlan.name}
          onSuccess={handlePaymentSuccess}
          onClose={() => setMode('plan_selection')}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 dark:from-violet-950/20 dark:via-purple-950/20 dark:to-fuchsia-950/20 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-3xl p-8 border border-border shadow-lg">
          {/* Logo */}
          <div className="text-center mb-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Users className="w-10 h-10 text-white" />
            </div>
            <h1 className="font-display text-2xl font-bold">
              {mode === 'login' ? 'Parent Login' : 'Parent Registration'}
            </h1>
            <p className="text-muted-foreground">
              {mode === 'login' ? 'Monitor your children\'s progress' : 'Start managing your family\'s learning'}
            </p>
          </div>

          {/* Mode Toggle */}
          <div className="flex bg-muted rounded-lg p-1 mb-6">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                mode === 'login' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setMode('register')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                mode === 'register' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'
              }`}
            >
              Register
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="name"
                      name="name"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`pl-10 ${errors.name ? "border-destructive" : ""}`}
                    />
                  </div>
                  {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number (for SMS alerts)</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="+233 XX XXX XXXX"
                      value={formData.phone}
                      onChange={handleChange}
                      className="pl-10"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Receive SMS alerts via Arkesel</p>
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="parent@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  className={`pl-10 ${errors.email ? "border-destructive" : ""}`}
                />
              </div>
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`pl-10 pr-10 ${errors.password ? "border-destructive" : ""}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
            </div>

            {mode === 'register' && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`pl-10 pr-10 ${errors.confirmPassword ? "border-destructive" : ""}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
              </div>
            )}

            {mode === 'login' && (
              <div className="flex items-center justify-end">
                <a href="#" className="text-sm text-primary hover:underline">
                  Forgot password?
                </a>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white py-6 text-lg font-semibold"
              disabled={isSubmitting}
            >
              {isSubmitting ? (mode === 'login' ? "Signing in..." : "Creating account...") : (mode === 'login' ? "Sign In" : "Create Account")}
            </Button>
          </form>

          <div className="text-center mt-6 space-y-2">
            <p className="text-muted-foreground text-sm">
              Not a parent?{" "}
              <Link to="/login" className="text-primary hover:underline font-semibold">
                General Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
