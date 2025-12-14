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
import { Eye, EyeOff, Users, Mail, Lock, User, Phone, CreditCard, Check, ArrowRight, ArrowLeft } from "lucide-react";
import { z } from "zod";

// --- Schemas ---

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerDetailsSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Please enter a valid email").max(255),
  phone: z.string().optional(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// --- Constants ---

const plans = [
  { id: 'single', name: 'Single Child', price: 300, description: 'Perfect for one child', features: ['1 child account', 'All subjects access', 'Progress tracking', 'Parent dashboard'] },
  { id: 'family', name: 'Family Plan', price: 1300, description: 'Best value for families', features: ['Up to 4 children', 'All subjects access', 'Progress tracking', 'Priority support'] },
];

type AuthView = 'login' | 'register';
type RegisterStep = 1 | 2 | 3; // 1: Details, 2: Plan, 3: Payment

// --- Component ---

export default function ParentAuth() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { login, register, updateSubscription } = useAuthContext();
  const { registerParent, createSubscription, addPayment } = useParentData();
  const { addNotification } = useAdminNotifications();

  // State
  const [view, setView] = useState<AuthView>('login');
  const [step, setStep] = useState<RegisterStep>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Data State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [selectedPlan, setSelectedPlan] = useState<typeof plans[0] | null>(null);
  const [registeredUser, setRegisteredUser] = useState<{ email: string; name: string; phone?: string; id?: string } | null>(null);

  // --- Handlers ---

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});
    try {
      loginSchema.parse({ email: formData.email, password: formData.password });
      const result = await login(formData.email, formData.password);
      if (result.success) {
        toast({ title: "Welcome back!", description: "Login successful." });
        const storedUser = localStorage.getItem('lovable_auth');
        if (storedUser) {
          const user = JSON.parse(storedUser);
          if (!user.is_onboarded && !user.onboardingComplete) navigate('/onboarding');
          else navigate('/parent/dashboard');
        }
      } else {
        setErrors({ email: result.error || 'Login failed' });
      }
    } catch (error) {
      handleZodError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});
    try {
      registerDetailsSchema.parse(formData);

      // Attempt registration logic here to create the user, or step 2 usually creates logic? 
      // User request flow: Account -> Plan -> Payment.
      // Usually we register user first so we have an ID to attach payment to.

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

        // Notifications
        addNotification({
          type: 'new_parent',
          title: 'New Parent Registration',
          description: `${formData.name} just registered as a parent`,
          relatedId: result.user?.id,
        });

        if (formData.phone) await sendWelcomeSMS(formData.phone, formData.name);

        setRegisteredUser({
          email: formData.email,
          name: formData.name,
          phone: formData.phone || undefined,
          id: result.user?.id
        });

        toast({ title: "Account Created!", description: "Now please select your subscription plan." });
        setStep(2); // Move to Plan Selection
      } else {
        const errorMsg = result.error || 'Registration failed';
        setErrors({ email: errorMsg });
        toast({
          variant: "destructive",
          title: "Registration Failed",
          description: errorMsg
        });
      }

    } catch (error) {
      handleZodError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePlanSelect = (plan: typeof plans[0]) => {
    setSelectedPlan(plan);
    setStep(3); // Move to Payment
  };

  const handlePaymentSuccess = async (reference: string) => {
    if (!selectedPlan || !registeredUser) return;

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);

    // Create subscription
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

    updateSubscription(selectedPlan.id as 'single' | 'family', 'active');

    // Notifications
    addNotification({ type: 'new_subscription', title: 'New Subscription', description: `${registeredUser.name} subscribed to ${selectedPlan.name}` });
    addNotification({ type: 'new_payment', title: 'Payment Received', description: `GHS ${selectedPlan.price} payment from ${registeredUser.name}` });

    if (registeredUser.phone) {
      await sendSubscriptionSMS(registeredUser.phone, registeredUser.name, selectedPlan.name);
      await sendPaymentConfirmationSMS(registeredUser.phone, registeredUser.name, selectedPlan.price, reference);
    }

    toast({ title: "Subscription Activated!", description: "You're all set!" });
    navigate('/onboarding');
  };

  const handleZodError = (error: any) => {
    if (error instanceof z.ZodError) {
      const fieldErrors: Record<string, string> = {};
      error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
    }
  };

  // --- Render Helpers ---

  const renderStepper = () => (
    <div className="flex items-center justify-center mb-8 w-full">
      <div className="flex items-center w-full max-w-sm relative">
        {/* Progress Line */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-secondary/20 -z-10" />
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary -z-10 transition-all duration-300"
          style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}
        />

        {/* Steps */}
        <div className="flex justify-between w-full">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex flex-col items-center bg-background px-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${step >= s ? "border-primary bg-primary text-white" : "border-muted-foreground text-muted-foreground bg-background"
                  }`}
              >
                {step > s ? <Check className="w-4 h-4" /> : s}
              </div>
              <span className={`text-xs mt-1 font-medium ${step >= s ? "text-primary" : "text-muted-foreground"}`}>
                {s === 1 ? "Account" : s === 2 ? "Plan" : "Payment"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 dark:from-violet-950/20 dark:via-purple-950/20 dark:to-fuchsia-950/20 flex items-center justify-center px-4 py-8">
      <div className={`w-full ${view === 'register' && step === 2 ? 'max-w-4xl' : 'max-w-md'}`}>

        {/* Back Link View Logic */}
        {view === 'register' && step === 1 && (
          <Button variant="ghost" onClick={() => setView('login')} className="mb-4 text-muted-foreground pl-0 hover:bg-transparent">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Login
          </Button>
        )}

        <div className="bg-card rounded-3xl p-8 border border-border shadow-lg transition-all duration-300">

          {/* Header */}
          <div className="text-center mb-6">
            {view === 'register' ? (
              <>
                <h1 className="font-display text-2xl font-bold">Create Account</h1>
                <p className="text-muted-foreground mb-6">Join our learning community</p>
                {renderStepper()}
              </>
            ) : (
              <>
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Users className="w-10 h-10 text-white" />
                </div>
                <h1 className="font-display text-2xl font-bold">Parent Login</h1>
                <p className="text-muted-foreground">Monitor your children's progress</p>
              </>
            )}
          </div>

          {/* LOGIN VIEW */}
          {view === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input id="email" name="email" type="email" placeholder="parent@email.com" value={formData.email} onChange={handleChange} className={`pl-10 ${errors.email ? "border-destructive" : ""}`} />
                </div>
                {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input id="password" name="password" type={showPassword ? "text" : "password"} placeholder="Enter your password" value={formData.password} onChange={handleChange} className={`pl-10 pr-10 ${errors.password ? "border-destructive" : ""}`} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
              </div>

              <div className="flex items-center justify-end">
                <a href="#" className="text-sm text-primary hover:underline">Forgot password?</a>
              </div>

              <Button type="submit" className="w-full bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white py-6 text-lg font-semibold" disabled={isSubmitting}>
                {isSubmitting ? "Signing in..." : "Sign In"}
              </Button>

              <div className="text-center mt-6">
                <p className="text-muted-foreground text-sm">
                  New here? <button type="button" onClick={() => setView('register')} className="text-primary hover:underline font-semibold">Create Account</button>
                </p>
              </div>
            </form>
          )}

          {/* REGISTER STEP 1: DETAILS */}
          {view === 'register' && step === 1 && (
            <form onSubmit={handleRegisterStep1} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input id="name" name="name" placeholder="Enter your full name" value={formData.name} onChange={handleChange} className={`pl-10 ${errors.name ? "border-destructive" : ""}`} />
                </div>
                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input id="phone" name="phone" type="tel" placeholder="+233 XX XXX XXXX" value={formData.phone} onChange={handleChange} className="pl-10" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input id="email" name="email" type="email" placeholder="parent@email.com" value={formData.email} onChange={handleChange} className={`pl-10 ${errors.email ? "border-destructive" : ""}`} />
                </div>
                {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input id="password" name="password" type={showPassword ? "text" : "password"} placeholder="Create a password" value={formData.password} onChange={handleChange} className={`pl-10 pr-10 ${errors.password ? "border-destructive" : ""}`} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input id="confirmPassword" name="confirmPassword" type={showConfirmPassword ? "text" : "password"} placeholder="Confirm password" value={formData.confirmPassword} onChange={handleChange} className={`pl-10 pr-10 ${errors.confirmPassword ? "border-destructive" : ""}`} />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
              </div>

              <Button type="submit" className="w-full mt-4" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Continue to Plan Selection"} <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </form>
          )}

          {/* REGISTER STEP 2: PLANS */}
          {view === 'register' && step === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-semibold mb-2">Select a Plan</h2>
                <p className="text-muted-foreground text-sm">Choose the best learning path for your family.</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`bg-card rounded-xl p-6 border-2 cursor-pointer transition-all hover:shadow-md ${selectedPlan?.id === plan.id || plan.id === 'family' ? 'border-primary bg-primary/5' : 'border-border'
                      }`}
                    onClick={() => handlePlanSelect(plan)}
                  >
                    {plan.id === 'family' && (
                      <div className="text-[10px] uppercase tracking-wider font-bold text-primary mb-2">Recommended</div>
                    )}
                    <h3 className="text-lg font-bold text-foreground">{plan.name}</h3>
                    <div className="text-2xl font-bold text-foreground my-2">
                      GHS {plan.price}<span className="text-sm font-normal text-muted-foreground">/year</span>
                    </div>
                    <ul className="space-y-1.5 mb-4">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Check className="w-3 h-3 text-primary" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button size="sm" className="w-full" variant={plan.id === 'family' ? 'default' : 'outline'}>
                      Select {plan.name}
                    </Button>
                  </div>
                ))}
              </div>
              <div className="text-center pt-2">
                <Button variant="ghost" size="sm" onClick={() => navigate('/onboarding')}>Skip for now</Button>
              </div>
            </div>
          )}

          {/* REGISTER STEP 3: PAYMENT */}
          {view === 'register' && step === 3 && selectedPlan && registeredUser && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-semibold">Secure Payment</h2>
                <p className="text-muted-foreground text-sm mb-4">Complete your subscription via Paystack</p>

                <div className="bg-muted/50 p-4 rounded-lg mb-6 max-w-xs mx-auto">
                  <p className="font-medium text-foreground">{selectedPlan.name}</p>
                  <p className="text-2xl font-bold text-primary">GHS {selectedPlan.price}</p>
                </div>
              </div>

              <PaystackCheckout
                amount={selectedPlan.price}
                email={registeredUser.email}
                planName={selectedPlan.name}
                onSuccess={handlePaymentSuccess}
                onClose={() => setStep(2)}
              />

              <div className="text-center">
                <Button variant="link" size="sm" onClick={() => setStep(2)}>
                  Change Plan
                </Button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
