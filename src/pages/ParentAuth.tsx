import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuthContext } from "@/contexts/AuthContext";
import { useParentData } from "@/data/parentDataStore";
import { useAdminNotifications } from "@/hooks/useAdminNotifications";
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight } from "lucide-react";
import { z } from "zod";
import { AuthLayout } from "@/components/auth/AuthLayout";
import authHeroOriginal from "@/assets/auth-hero.jpg";

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
  const { login } = useAuthContext();
  const { registerParent } = useParentData();
  const { addNotification } = useAdminNotifications();

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
        if (result.user) {
          const user = result.user;
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

      toast({
        title: 'Payment Required',
        description: 'Parent accounts are created only after payment. Please choose a plan to continue.',
        variant: 'default'
      });
      navigate('/pricing');

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

  return (
    <AuthLayout
      title={view === 'login' ? "Welcome Back" : "Parent Registration"}
      subtitle={view === 'login' ? "Sign in to your dashboard" : "Join our learning community"}
      image={authHeroOriginal}
    >
      {view === 'login' && (
        <>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="sr-only">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input id="email" name="email" type="email" placeholder="Email" value={formData.email} onChange={handleChange} className={`pl-10 h-12 ${errors.email ? "border-destructive" : ""}`} />
              </div>
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="sr-only">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input id="password" name="password" type={showPassword ? "text" : "password"} placeholder="Password" value={formData.password} onChange={handleChange} className={`pl-10 h-12 pr-10 ${errors.password ? "border-destructive" : ""}`} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="remember" className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4" />
                <label htmlFor="remember" className="text-sm text-muted-foreground font-medium">Remember me</label>
              </div>
              <Link to="/forgot-password" className="text-sm text-primary font-medium hover:underline">Forgot Password?</Link>
            </div>

            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12 text-base font-semibold" disabled={isSubmitting}>
              {isSubmitting ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="text-center mt-6">
            <p className="text-muted-foreground text-sm">
              Don't have an account? <button onClick={() => setView('register')} className="text-primary hover:underline font-semibold">Sign Up</button>
            </p>
          </div>
        </>
      )}

      {view === 'register' && (
        <>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input id="name" name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} className={`pl-10 h-12 ${errors.name ? "border-destructive" : ""}`} />
              </div>
              {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input id="phone" name="phone" type="tel" placeholder="Phone Number" value={formData.phone} onChange={handleChange} className="pl-10 h-12" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input id="email" name="email" type="email" placeholder="Email" value={formData.email} onChange={handleChange} className={`pl-10 h-12 ${errors.email ? "border-destructive" : ""}`} />
              </div>
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input id="password" name="password" type={showPassword ? "text" : "password"} placeholder="Password" value={formData.password} onChange={handleChange} className={`pl-10 h-12 pr-10 ${errors.password ? "border-destructive" : ""}`} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
            </div>

            <div className="space-y-2">
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input id="confirmPassword" name="confirmPassword" type={showConfirmPassword ? "text" : "password"} placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleChange} className={`pl-10 h-12 pr-10 ${errors.confirmPassword ? "border-destructive" : ""}`} />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
            </div>

            <Button type="submit" className="w-full h-12 font-semibold mt-4" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Account & Continue"} <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>

          <div className="text-center mt-4">
            <button type="button" onClick={() => setView('login')} className="text-sm text-muted-foreground hover:text-foreground">
              Already have an account? Log in
            </button>
          </div>
        </>
      )}
    </AuthLayout>
  );
}
