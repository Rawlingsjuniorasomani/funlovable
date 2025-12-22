import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { paymentsAPI } from "@/config/api";
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



type AuthView = 'login' | 'register';



export default function ParentAuth() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { login } = useAuthContext();
  const { registerParent } = useParentData();
  const { addNotification } = useAdminNotifications();


  const [view, setView] = useState<AuthView>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});


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


  const location = useLocation();
  const selectedPlan = location.state?.selectedPlan;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});
    try {
      registerDetailsSchema.parse(formData);

      if (!selectedPlan) {
        toast({
          title: 'Payment Required',
          description: 'Parent accounts are created only after payment. Please choose a plan to continue.',
          variant: 'default'
        });


        navigate('/pricing');
        return;
      }


      const { authorization_url } = await paymentsAPI.initializeRegistration({
        email: formData.email,
        role: 'parent',
        planId: selectedPlan.id,
        payload: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,

        }
      });


      window.location.href = authorization_url;

    } catch (error) {
      console.error("Registration/Payment Init Error:", error);
      handleZodError(error);
      if (!(error instanceof z.ZodError)) {
        toast({
          title: 'Registration Failed',
          description: (error as any).message || 'Could not initialize payment.',
          variant: 'destructive'
        });
      }
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
    <div className="min-h-screen bg-background flex">
      { }
      <div className="hidden lg:block lg:w-1/2 relative bg-gray-900">
        <img
          src={authHeroOriginal}
          alt="Parent and child learning"
          className="absolute inset-0 w-full h-full object-cover opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-12 left-12 right-12 text-white">
          <h2 className="text-4xl font-bold mb-4 font-display text-white">Start Your Learning Journey</h2>
          <p className="text-lg text-white/90">Join thousands of parents and students in our interactive learning platform.</p>
        </div>
      </div>

      { }
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16 bg-gradient-to-br from-white via-orange-50 to-amber-50 overflow-y-auto">
        <div className="w-full max-w-md space-y-8">
          <div className="text-left space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              {view === 'login' ? "Welcome Back" : "Create Account"}
            </h1>
            <p className="text-gray-500">
              {view === 'login' ? "Sign in to your dashboard" : "Join our learning community"}
            </p>
          </div>

          {view === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`pl-10 h-12 bg-gray-50 border-gray-200 focus:bg-white transition-colors ${errors.email ? "border-destructive" : ""}`}
                    />
                  </div>
                  {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`pl-10 pr-10 h-12 bg-gray-50 border-gray-200 focus:bg-white transition-colors ${errors.password ? "border-destructive" : ""}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-orange-500 focus:ring-orange-500 w-4 h-4 cursor-pointer"
                  />
                  <span className="text-sm text-gray-500 group-hover:text-gray-700">Remember me</span>
                </label>
                <Link to="/forgot-password" className="text-sm text-orange-500 hover:text-orange-600 font-medium">
                  Forgot Password?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold h-12 rounded-lg text-base shadow-lg shadow-orange-500/20 active:scale-[0.98] transition-all"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Signing in..." : "Sign In"}
              </Button>

              <div className="text-center pt-2">
                <p className="text-sm text-gray-500">
                  Don't have an account?{" "}
                  <Link to="/parent/register-flow" className="text-orange-500 hover:text-orange-600 font-medium">
                    Sign Up
                  </Link>
                </p>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="name"
                      name="name"
                      placeholder="Full Name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`pl-10 h-12 bg-gray-50 border-gray-200 focus:bg-white transition-colors ${errors.name ? "border-destructive" : ""}`}
                    />
                  </div>
                  {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="Phone Number"
                      value={formData.phone}
                      onChange={handleChange}
                      className="pl-10 h-12 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`pl-10 h-12 bg-gray-50 border-gray-200 focus:bg-white transition-colors ${errors.email ? "border-destructive" : ""}`}
                    />
                  </div>
                  {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`pl-10 pr-10 h-12 bg-gray-50 border-gray-200 focus:bg-white transition-colors ${errors.password ? "border-destructive" : ""}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                </div>

                <div className="space-y-2">
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm Password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`pl-10 pr-10 h-12 bg-gray-50 border-gray-200 focus:bg-white transition-colors ${errors.confirmPassword ? "border-destructive" : ""}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold h-12 rounded-lg text-base shadow-lg shadow-orange-500/20 active:scale-[0.98] transition-all mt-6"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating..." : "Create Account & Continue"} <ArrowRight className="w-4 h-4 ml-2" />
              </Button>

              <div className="text-center pt-2">
                <p className="text-sm text-gray-500">
                  Already have an account?{" "}
                  <button type="button" onClick={() => setView('login')} className="text-orange-500 hover:text-orange-600 font-medium">
                    Log in
                  </button>
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
