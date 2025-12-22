import { useState, useEffect } from "react";
import authHeroOriginal from "@/assets/auth-hero.jpg";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuthContext } from "@/contexts/AuthContext";
import { Eye, EyeOff, School, Mail, Lock, User, Phone, Clock, AlertCircle, MapPin, Briefcase, Check, ArrowRight, ArrowLeft } from "lucide-react";
import { z } from "zod";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { subjectsAPI } from "@/config/api";


const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerAccountSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Please enter a valid email").max(255),
  phone: z.string().optional(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const registerProfessionalSchema = z.object({
  school: z.string().min(2, "School name is required"),
  yearsOfExperience: z.string().regex(/^\d+$/, "Must be a number").transform(Number),
  address: z.string().min(5, "Address must be at least 5 characters"),
  subjectId: z.string().min(1, "Please select a subject"),
});


type AuthView = 'login' | 'register';
type RegisterStep = 1 | 2;

interface Subject {
  id: string;
  name: string;
}


export default function TeacherAuth() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { login, register } = useAuthContext();

  
  const [view, setView] = useState<AuthView>('login');
  const [step, setStep] = useState<RegisterStep>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPendingMessage, setShowPendingMessage] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    school: "",
    yearsOfExperience: "",
    address: "",
    subjectId: "",
  });

  useEffect(() => {
    const loadSubjects = async () => {
      try {
        const data = await subjectsAPI.getAll();
        if (Array.isArray(data)) setSubjects(data);
      } catch (err) {
        console.error("Failed to fetch subjects", err);
      }
    };
    loadSubjects();
  }, []);

  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSelectChange = (value: string, name: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      loginSchema.parse({ email: formData.email, password: formData.password });
      const result = await login(formData.email, formData.password);

      if (result.success) {
        toast({ title: "Welcome back!", description: "Login successful." });
        navigate('/teacher');
      } else {
        setErrors({ email: result.error || 'Login failed' });
      }
    } catch (error) {
      handleZodError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    try {
      registerAccountSchema.parse(formData);
      setStep(2);
    } catch (error) {
      handleZodError(error);
    }
  };

  const handleRegisterStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      const professionalData = registerProfessionalSchema.parse({
        school: formData.school,
        yearsOfExperience: formData.yearsOfExperience,
        address: formData.address,
        subjectId: formData.subjectId,
      });

      const result = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: 'teacher',
        phone: formData.phone || undefined,
        school: professionalData.school,
        yearsOfExperience: professionalData.yearsOfExperience,
        address: professionalData.address,
        subjectId: professionalData.subjectId,
      });

      if (result.success) {
        setShowPendingMessage(true);
        toast({
          title: "Registration Submitted!",
          description: "Your account is pending admin approval.",
        });
      } else {
        const errorMsg = result.error || 'Registration failed';
        setErrors({ email: errorMsg });
        toast({
          variant: "destructive",
          title: "Registration Failed",
          description: errorMsg,
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

  
  const renderStepper = () => (
    <div className="flex items-center justify-center mb-6 w-full">
      <div className="flex items-center gap-4">
        {[1, 2].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${step >= s ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground text-muted-foreground"
              }`}>
              {step > s ? <Check className="w-4 h-4" /> : s}
            </div>
            <span className={`text-sm font-medium ${step >= s ? "text-primary" : "text-muted-foreground"}`}>
              {s === 1 ? "Account" : "Details"}
            </span>
            {s === 1 && <div className="w-12 h-px bg-border" />}
          </div>
        ))}
      </div>
    </div>
  );

  if (showPendingMessage) {
    return (
      <AuthLayout
        title="Registration Pending"
        subtitle="Your account is under review"
      >
        <div className="text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto">
            <Clock className="w-10 h-10 text-amber-500" />
          </div>
          <p className="text-muted-foreground">
            Your teacher account has been submitted for review. An administrator will approve your account shortly.
          </p>
          <div className="bg-amber-50/50 rounded-lg p-4 text-sm text-amber-800">
            This usually takes 24-48 hours. You will be able to login once approved.
          </div>
          <Button onClick={() => { setShowPendingMessage(false); setView('login'); }} variant="outline" className="w-full">
            Back to Login
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title={view === 'login' ? "Welcome Back" : "Teacher Registration"}
      subtitle={view === 'login' ? "Sign in to your dashboard" : "Join our teaching community"}
      image={authHeroOriginal}
      formClassName="bg-gradient-to-br from-white via-emerald-50 to-teal-50"
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
        <div className="space-y-6">
          {renderStepper()}

          {step === 1 && (
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
                </div>
                {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
              </div>

              <div className="flex gap-4 pt-2">
                <Button type="button" variant="outline" onClick={() => setView('login')} className="flex-1 h-12">
                  Previous
                </Button>
                <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground h-12 font-semibold">
                  Next <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>

              <div className="text-center">
                <button type="button" onClick={() => setView('login')} className="text-sm text-muted-foreground hover:text-foreground">
                  Already have an account? Log in
                </button>
              </div>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleRegisterStep2} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <Input id="school" name="school" placeholder="School Name" value={formData.school} onChange={handleChange} className={`h-12 ${errors.school ? "border-destructive" : ""}`} />
                <Input id="yearsOfExperience" name="yearsOfExperience" type="number" placeholder="Years of Exp." value={formData.yearsOfExperience} onChange={handleChange} className={`h-12 ${errors.yearsOfExperience ? "border-destructive" : ""}`} />
              </div>

              <Input id="address" name="address" placeholder="Address" value={formData.address} onChange={handleChange} className={`h-12 ${errors.address ? "border-destructive" : ""}`} />

              <Select onValueChange={(val) => handleSelectChange(val, 'subjectId')} value={formData.subjectId}>
                <SelectTrigger className={`h-12 ${errors.subjectId ? "border-destructive" : ""}`}>
                  <SelectValue placeholder="Primary Subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map(subject => (
                    <SelectItem key={subject.id} value={subject.id}>{subject.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex gap-4 pt-2">
                <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1 h-12">
                  Back
                </Button>
                <Button type="submit" className="flex-[2] bg-primary hover:bg-primary/90 text-primary-foreground h-12 font-semibold" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Complete Registration"}
                </Button>
              </div>
            </form>
          )}
        </div>
      )}
    </AuthLayout>
  );
}
