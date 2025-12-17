import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuthContext } from "@/contexts/AuthContext";
import { useParentData } from "@/data/parentDataStore";
import { useAdminNotifications } from "@/hooks/useAdminNotifications";
import { sendWelcomeSMS } from "@/utils/smsService";
import { Eye, EyeOff, Users, Mail, Lock, User, Phone, Check, ArrowRight, ArrowLeft } from "lucide-react";
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

type AuthView = 'login' | 'register';

// --- Component ---

export default function ParentAuth() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { login, register, updateSubscription } = useAuthContext();
  const { registerParent, createSubscription, addPayment } = useParentData();
  const { addNotification } = useAdminNotifications();

  // State
  // State
  const [view, setView] = useState<AuthView>('login');
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
          const isOnboarded = user.is_onboarded ?? user.onboardingComplete ?? false;
          if (!isOnboarded) navigate('/onboarding');
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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});
    try {
      registerDetailsSchema.parse(formData);

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

        toast({ title: "Account Created!", description: "Continuing to onboarding..." });

        // Login Logic Implicit? 
        // register() usually returns user but DOES IT SET AUTH STATE?
        // useAuth.ts register() => setAuthState if token returned.
        // Yes it does.

        navigate('/onboarding');
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



  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 dark:from-violet-950/20 dark:via-purple-950/20 dark:to-fuchsia-950/20 flex items-center justify-center px-4 py-8">
      <div className={`w-full max-w-md`}>

        {/* Back Link View Logic */}
        {view === 'register' && (
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

          {/* REGISTER */}
          {view === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
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
                {isSubmitting ? "Creating..." : "Create Account & Continue"} <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </form>
          )}



        </div>
      </div>
    </div>
  );
}
