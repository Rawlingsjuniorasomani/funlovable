import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { useAuthContext } from "@/contexts/AuthContext";
import { Eye, EyeOff, GraduationCap, Mail, Lock, User, Phone, Users, BookOpen, School, Clock } from "lucide-react";
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
  role: z.enum(['student', 'teacher', 'parent']),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type AuthMode = 'login' | 'register';
type RoleOption = 'student' | 'teacher' | 'parent';

const roleOptions = [
  { value: 'student', label: 'Student', icon: BookOpen, description: 'I want to learn' },
  { value: 'teacher', label: 'Teacher', icon: School, description: 'I want to teach' },
  { value: 'parent', label: 'Parent', icon: Users, description: 'Managing my children' },
];

export default function AuthPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register } = useAuthContext();

  const [mode, setMode] = useState<AuthMode>('login');
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
    role: "parent" as RoleOption,
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

          if (result.user) {
            const user = result.user;
            const isOnboarded = user.is_onboarded ?? user.onboardingComplete ?? false;

            if (user.role === 'parent' && !isOnboarded) {
              navigate('/onboarding');
            } else if (user.role === 'student') {
              navigate('/student');
            } else if (user.role === 'teacher') {
              navigate('/teacher');
            } else if (user.role === 'admin') {
              navigate(user.is_super_admin ? '/super-admin' : '/sys-admin');
            } else {
              navigate('/');
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
          role: formData.role,
          phone: formData.phone || undefined,
        });

        if (result.success) {

          if (formData.role === 'teacher') {
            toast({
              title: "Registration Submitted!",
              description: "Your account is pending admin approval. You'll be notified once approved.",
              duration: 5000,
            });
            setMode('login');
            setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
          } else {
            toast({ title: "Account created!", description: "Welcome to Lovable Learning." });


            if (formData.role === 'parent') {
              navigate('/onboarding');
            } else if (formData.role === 'student') {
              navigate('/student');
            } else if (formData.role === 'teacher') {

              navigate('/');
            } else {
              navigate('/');
            }
          }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-tertiary/5 to-secondary/5">
      <Header />
      <main className="pt-20 min-h-screen flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="bg-card rounded-3xl p-8 border border-border shadow-lg">
            { }
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary via-tertiary to-secondary flex items-center justify-center mx-auto mb-4">
                <GraduationCap className="w-8 h-8 text-primary-foreground" />
              </div>
              <h1 className="font-display text-2xl font-bold">
                {mode === 'login' ? 'Welcome Back!' : 'Create Account'}
              </h1>
              <p className="text-muted-foreground">
                {mode === 'login' ? 'Sign in to continue learning' : 'Join our learning community'}
              </p>
            </div>

            { }
            <div className="flex bg-muted rounded-lg p-1 mb-6">
              <button
                type="button"
                onClick={() => setMode('login')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${mode === 'login' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'
                  }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setMode('register')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${mode === 'register' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'
                  }`}
              >
                Sign Up
              </button>
            </div>

            { }
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <>
                  { }
                  <div className="space-y-2">
                    <Label>I am a...</Label>
                    <RadioGroup
                      value={formData.role}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, role: value as RoleOption }))}
                      className="grid grid-cols-2 md:grid-cols-4 gap-2"
                    >
                      {roleOptions.map((option) => {
                        const Icon = option.icon;
                        return (
                          <div key={option.value}>
                            <RadioGroupItem value={option.value} id={option.value} className="peer sr-only" />
                            <Label
                              htmlFor={option.value}
                              className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary cursor-pointer transition-colors"
                            >
                              <Icon className="w-5 h-5 mb-1" />
                              <span className="text-xs font-medium">{option.label}</span>
                            </Label>
                          </div>
                        );
                      })}
                    </RadioGroup>
                  </div>

                  { }
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

                  { }
                  {formData.role === 'parent' && (
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number (optional)</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          placeholder="For SMS notifications"
                          value={formData.phone}
                          onChange={handleChange}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  )}
                </>
              )}

              { }
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    className={`pl-10 ${errors.email ? "border-destructive" : ""}`}
                  />
                </div>
                {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
              </div>

              { }
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

              { }
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
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded border-border" />
                    <span className="text-sm text-muted-foreground">Remember me</span>
                  </label>
                  <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>
              )}

              <Button
                type="submit"
                className="w-full btn-bounce bg-gradient-to-r from-primary to-tertiary hover:opacity-90 py-6 text-lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? (mode === 'login' ? "Signing in..." : "Creating account...") : (mode === 'login' ? "Sign In" : "Create Account")}
              </Button>
            </form>

            { }
            <div className="text-center mt-6">
              <p className="text-muted-foreground">
                {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
                <button
                  type="button"
                  onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                  className="text-primary hover:underline font-semibold"
                >
                  {mode === 'login' ? "Sign Up" : "Sign In"}
                </button>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
