import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuthContext } from "@/contexts/AuthContext";
import { paymentsAPI, plansAPI } from "@/config/api";
import { Eye, EyeOff, Mail, Lock, User, Phone, School, Calendar, ArrowRight, CheckCircle2, Check } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { z } from "zod";
import { AuthLayout } from "@/components/auth/AuthLayout";
import authHeroOriginal from "@/assets/auth-hero.jpg";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerStep1Schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  phone: z.string().min(10, "Phone number required").max(15),
  school: z.string().min(2, "School name is required"),
  age: z.string().regex(/^\d+$/, "Age must be a number").transform(Number).refine(n => n >= 5 && n <= 20, "Age must be between 5 and 20"),
  studentClass: z.string().min(1, "Please select your class"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type AuthMode = 'login' | 'register';
type RegisterStep = 1 | 2 | 3; // 1: Details, 2: OTP, 3: Payment

export default function StudentAuth() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { login } = useAuthContext();

  const [mode, setMode] = useState<AuthMode>('login');
  const [registerStep, setRegisterStep] = useState<RegisterStep>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [otp, setOtp] = useState("");

  const [availablePlans, setAvailablePlans] = useState<any[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    school: "",
    age: "",
    studentClass: "",
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

  useEffect(() => {
    const loadPlans = async () => {
      try {
        const data = await plansAPI.getAll();
        const plans = Array.isArray(data) ? data : [];
        setAvailablePlans(plans);
        if (!selectedPlanId && plans[0]?.id) {
          setSelectedPlanId(plans[0].id);
        }
      } catch {
        setAvailablePlans([]);
      }
    };

    if (mode === 'register') {
      loadPlans();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const handleRegisterStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    try {
      registerStep1Schema.parse(formData);
      // Move to OTP step
      setRegisterStep(2);
      toast({ title: "OTP Sent", description: `A verification code has been sent to ${formData.phone}` });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
        });
        setErrors(fieldErrors);
      }
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (otp.length !== 6) {
      setErrors({ otp: "Invalid verification code." });
      setIsSubmitting(false);
      return;
    }

    try {
      toast({ title: 'OTP Verified', description: 'Now select a plan and complete payment.' });
      setRegisterStep(3);
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Error", description: "Something went wrong." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartStudentPayment = async () => {
    setIsSubmitting(true);
    try {
      if (!selectedPlanId) {
        toast({ title: 'Select Plan', description: 'Please select a plan to continue.', variant: 'destructive' });
        return;
      }

      const generatedEmail = `${formData.phone}@edulearn.com`;

      const payload = {
        name: formData.name,
        email: generatedEmail,
        phone: formData.phone,
        password: formData.password,
        school: formData.school,
        age: Number(formData.age),
        studentClass: formData.studentClass,
      };

      const response = await paymentsAPI.initializeRegistration({
        email: generatedEmail,
        role: 'student',
        planId: selectedPlanId,
        payload,
      });

      if (response?.authorization_url) {
        window.location.href = response.authorization_url;
        return;
      }

      toast({ title: 'Payment Error', description: 'Failed to initialize payment.', variant: 'destructive' });
    } catch (error: any) {
      toast({ title: 'Payment Error', description: error?.message || 'Failed to start payment.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});
    try {
      loginSchema.parse({ email: formData.email, password: formData.password });
      const result = await login(formData.email, formData.password);
      if (result.success) {
        toast({ title: "Welcome back!", description: "Ready to learn!" });
        if (result.user?.role === 'student' && !result.user?.is_onboarded) {
          navigate('/onboarding');
        } else {
          navigate('/student');
        }
      } else {
        setErrors({ email: result.error || 'Login failed' });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
        });
        setErrors(fieldErrors);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepper = () => (
    <div className="flex items-center justify-center mb-6 w-full">
      <div className="flex items-center gap-4">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${registerStep >= s ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground text-muted-foreground"
              }`}>
              {registerStep > s ? <Check className="w-4 h-4" /> : s}
            </div>
            <span className={`text-sm font-medium ${registerStep >= s ? "text-primary" : "text-muted-foreground"}`}>
              {s === 1 ? "Details" : s === 2 ? "Verify" : "Payment"}
            </span>
            {s < 3 && <div className="w-8 h-px bg-border" />}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <AuthLayout
      title={mode === 'login' ? "Welcome Back" : "Student Registration"}
      subtitle={mode === 'login' ? "Sign in to your dashboard" : "Join our learning community"}
      image={authHeroOriginal}
    >
      {/* Mode Toggle */}
      {registerStep !== 3 && (
        <div className="text-center mb-6">
          <p className="text-muted-foreground text-sm">
            {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => {
                setMode(mode === 'login' ? 'register' : 'login');
                setRegisterStep(1);
                setErrors({});
              }}
              className="text-primary hover:underline font-semibold"
            >
              {mode === 'login' ? "Sign Up" : "Sign In"}
            </button>
          </p>
        </div>
      )}

      {/* Login Form */}
      {mode === 'login' && (
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="sr-only">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                className={`pl-10 h-12 ${errors.email ? "border-destructive" : ""}`}
              />
            </div>
            {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="sr-only">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className={`pl-10 h-12 pr-10 ${errors.password ? "border-destructive" : ""}`}
              />
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
            <Link to="/forgot-password" className="text-sm text-primary font-medium hover:underline">
              Forgot Password?
            </Link>
          </div>

          <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12 text-base font-semibold" disabled={isSubmitting}>
            {isSubmitting ? "Signing in..." : "Sign In"}
          </Button>
        </form>
      )}

      {/* Register Flow */}
      {mode === 'register' && (
        <div className="space-y-6">
          {renderStepper()}

          {registerStep === 1 && (
            <form onSubmit={handleRegisterStep1} className="space-y-4">
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
                  <Input id="phone" name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} className={`pl-10 h-12 ${errors.phone ? "border-destructive" : ""}`} />
                </div>
                {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
              </div>
              <div className="space-y-2">
                <div className="relative">
                  <School className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input id="school" name="school" placeholder="School Name" value={formData.school} onChange={handleChange} className={`pl-10 h-12 ${errors.school ? "border-destructive" : ""}`} />
                </div>
                {errors.school && <p className="text-sm text-destructive">{errors.school}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input id="age" name="age" placeholder="Age" value={formData.age} onChange={handleChange} className={`pl-10 h-12 ${errors.age ? "border-destructive" : ""}`} />
                  </div>
                  {errors.age && <p className="text-sm text-destructive">{errors.age}</p>}
                </div>
                <div className="space-y-2">
                  <Select value={formData.studentClass} onValueChange={(v) => handleSelectChange('studentClass', v)}>
                    <SelectTrigger className={`h-12 ${errors.studentClass ? "border-destructive" : ""}`}><SelectValue placeholder="Class" /></SelectTrigger>
                    <SelectContent>
                      {['Primary 4', 'Primary 5', 'Primary 6', 'JHS 1', 'JHS 2', 'JHS 3'].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  {errors.studentClass && <p className="text-sm text-destructive">{errors.studentClass}</p>}
                </div>
              </div>
              <div className="space-y-2">
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input id="password" name="password" type={showPassword ? "text" : "password"} placeholder="Password" value={formData.password} onChange={handleChange} className={`pl-10 h-12 pr-10 ${errors.password ? "border-destructive" : ""}`} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">{showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button>
                </div>
                {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
              </div>
              <div className="space-y-2">
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input id="confirmPassword" name="confirmPassword" type={showConfirmPassword ? "text" : "password"} placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleChange} className={`pl-10 h-12 pr-10 ${errors.confirmPassword ? "border-destructive" : ""}`} />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">{showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button>
                </div>
                {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
              </div>

              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12 font-semibold">
                Next <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </form>
          )}

          {registerStep === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-4">Enter the 6-digit code sent to {formData.phone}</p>
                <Input
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="XXX XXX"
                  className="text-center text-2xl tracking-widest h-14"
                  maxLength={6}
                />
                {errors.otp && <p className="text-sm text-destructive mt-2">{errors.otp}</p>}
              </div>

              <div className="flex gap-3">
                <Button type="button" variant="outline" className="flex-1 h-12" onClick={() => setRegisterStep(1)} disabled={isSubmitting}>
                  Previous
                </Button>
                <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground h-12" disabled={isSubmitting}>
                  {isSubmitting ? "Verifying..." : "Next"}
                </Button>
              </div>
            </form>
          )}

          {registerStep === 3 && (
            <div className="space-y-4">
              <div className="rounded-xl border border-border p-4 bg-muted/30">
                <p className="font-medium">Select Plan</p>
                <p className="text-sm text-muted-foreground">Your student account will be created after payment.</p>
              </div>

              <div className="space-y-2">
                <Label>Plan</Label>
                <select
                  className="flex h-12 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  value={selectedPlanId}
                  onChange={(e) => setSelectedPlanId(e.target.value)}
                >
                  {availablePlans.map((p: any) => (
                    <option key={p.id} value={p.id}>
                      {p.name} - GHS {Number(p.price).toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 h-12"
                  onClick={() => setRegisterStep(2)}
                  disabled={isSubmitting}
                >
                  Previous
                </Button>
                <Button
                  type="button"
                  onClick={handleStartStudentPayment}
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground h-12"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Starting...' : 'Next'}
                  {!isSubmitting && <ArrowRight className="w-4 h-4 ml-2" />}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </AuthLayout>
  );
}
