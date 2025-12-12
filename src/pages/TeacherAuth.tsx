import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuthContext } from "@/contexts/AuthContext";
import { Eye, EyeOff, School, Mail, Lock, User, Phone, Clock, AlertCircle } from "lucide-react";
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

type AuthMode = 'login' | 'register';

export default function TeacherAuth() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { login, register } = useAuthContext();
  
  const [mode, setMode] = useState<AuthMode>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPendingMessage, setShowPendingMessage] = useState(false);
  
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
          navigate('/teacher');
        } else {
          setErrors({ email: result.error || 'Login failed' });
        }
      } else {
        registerSchema.parse(formData);
        
        const result = await register({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: 'teacher',
          phone: formData.phone || undefined,
        });
        
        if (result.success) {
          setShowPendingMessage(true);
          toast({ 
            title: "Registration Submitted!", 
            description: "Your account is pending admin approval.",
            duration: 5000,
          });
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

  if (showPendingMessage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-950/20 dark:via-teal-950/20 dark:to-cyan-950/20 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-card rounded-3xl p-8 border border-border shadow-lg text-center">
            <div className="w-20 h-20 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-6">
              <Clock className="w-10 h-10 text-amber-500" />
            </div>
            <h1 className="font-display text-2xl font-bold mb-2">Registration Pending</h1>
            <p className="text-muted-foreground mb-6">
              Your teacher account has been submitted for review. An administrator will approve your account shortly.
            </p>
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                <p className="text-sm text-amber-700 dark:text-amber-400 text-left">
                  You will be able to login once an admin approves your account. This usually takes 24-48 hours.
                </p>
              </div>
            </div>
            <Button 
              onClick={() => { setShowPendingMessage(false); setMode('login'); }}
              variant="outline"
              className="w-full"
            >
              Back to Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-950/20 dark:via-teal-950/20 dark:to-cyan-950/20 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-3xl p-8 border border-border shadow-lg">
          {/* Logo */}
          <div className="text-center mb-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
              <School className="w-10 h-10 text-white" />
            </div>
            <h1 className="font-display text-2xl font-bold">
              {mode === 'login' ? 'Teacher Login' : 'Teacher Registration'}
            </h1>
            <p className="text-muted-foreground">
              {mode === 'login' ? 'Access your teaching dashboard' : 'Join our teaching community'}
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

          {mode === 'register' && (
            <div className="bg-teal-500/10 border border-teal-500/30 rounded-xl p-3 mb-6">
              <p className="text-sm text-teal-700 dark:text-teal-400 text-center">
                <Clock className="w-4 h-4 inline mr-1" />
                Teacher accounts require admin approval before access
              </p>
            </div>
          )}

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
                  <Label htmlFor="phone">Phone Number (optional)</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="For notifications"
                      value={formData.phone}
                      onChange={handleChange}
                      className="pl-10"
                    />
                  </div>
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
                  placeholder="teacher@school.com"
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
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white py-6 text-lg font-semibold"
              disabled={isSubmitting}
            >
              {isSubmitting ? (mode === 'login' ? "Signing in..." : "Submitting...") : (mode === 'login' ? "Sign In" : "Submit for Approval")}
            </Button>
          </form>

          <div className="text-center mt-6 space-y-2">
            <p className="text-muted-foreground text-sm">
              Not a teacher?{" "}
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
