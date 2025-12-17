import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuthContext } from "@/contexts/AuthContext";
import { Eye, EyeOff, GraduationCap, Mail, Lock, User, Sparkles, Phone, School, Calendar, ArrowRight, CheckCircle2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { z } from "zod";

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
type RegisterStep = 1 | 2 | 3; // 1: Details, 2: OTP, 3: Success

export default function StudentAuth() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { login, register } = useAuthContext();

  const [mode, setMode] = useState<AuthMode>('login');
  const [registerStep, setRegisterStep] = useState<RegisterStep>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [otp, setOtp] = useState("");

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

    // Proceed to register
    try {
      const generatedEmail = `${formData.phone}@edulearn.com`;
      const result = await register({
        name: formData.name,
        email: generatedEmail,
        phone: formData.phone,
        password: formData.password,
        role: 'student',
        school: formData.school,
        age: Number(formData.age),
        studentClass: formData.studentClass,
      });

      if (result.success) {
        // Redirect to onboarding/payment workflow instead of just success message
        // Since we are now logged in (token stored in useAuth logic), we can navigate
        toast({ title: "Registration Successful", description: "Please complete your subscription." });
        navigate('/onboarding');
      } else {
        setErrors({ email: result.error || 'Registration failed' });
        // Go back to step 1 if meaningful error? Or stay here?
        // Staying here might imply OTP issue but error could be 'Email taken'.
        // If email taken (phone taken), probably should go back.
        if (result.error?.includes('registered')) {
          toast({ variant: "destructive", title: "Registration Failed", description: "This phone number is already registered." });
          setRegisterStep(1);
        }
      }
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Error", description: "Something went wrong." });
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
        // Ensure we navigate to student, but if result.user says otherwise, we have a problem.
        // For StudentAuth, we expect student.
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-sky-50 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-sky-950/20 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-3xl p-8 border border-border shadow-lg">
          {/* Logo */}
          <div className="text-center mb-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-500 to-sky-500 flex items-center justify-center mx-auto mb-4 shadow-lg relative">
              <GraduationCap className="w-10 h-10 text-white" />
              <Sparkles className="w-5 h-5 text-yellow-300 absolute -top-1 -right-1" />
            </div>
            <h1 className="font-display text-2xl font-bold">
              {mode === 'login' ? 'Student Login' : 'Student Registration'}
            </h1>
            <p className="text-muted-foreground">
              {mode === 'login' ? 'Continue your learning journey' :
                registerStep === 1 ? 'Step 1: Personal Details' :
                  registerStep === 2 ? 'Step 2: Verify Phone' : 'Registration Complete!'}
            </p>
          </div>

          {/* Mode Toggle */}
          {registerStep !== 3 && (
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
                onClick={() => { setMode('register'); setRegisterStep(1); }}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${mode === 'register' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'
                  }`}
              >
                Register
              </button>
            </div>
          )}

          {/* Login Form */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="student@email.com"
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
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
              </div>
              {mode === 'login' && (
                <div className="flex items-center justify-end">
                  <a href="#" className="text-sm text-primary hover:underline">
                    Forgot password?
                  </a>
                </div>
              )}
              <Button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white py-6 text-lg font-semibold" disabled={isSubmitting}>
                {isSubmitting ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          )}

          {/* Register Flow */}
          {mode === 'register' && registerStep === 1 && (
            <form onSubmit={handleRegisterStep1} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input id="name" name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} className={`pl-10 ${errors.name ? "border-destructive" : ""}`} />
                </div>
                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input id="phone" name="phone" placeholder="024XXXXXXX" value={formData.phone} onChange={handleChange} className={`pl-10 ${errors.phone ? "border-destructive" : ""}`} />
                </div>
                {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="school">School</Label>
                <div className="relative">
                  <School className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input id="school" name="school" placeholder="School Name" value={formData.school} onChange={handleChange} className={`pl-10 ${errors.school ? "border-destructive" : ""}`} />
                </div>
                {errors.school && <p className="text-sm text-destructive">{errors.school}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input id="age" name="age" placeholder="Age" value={formData.age} onChange={handleChange} className={`pl-10 ${errors.age ? "border-destructive" : ""}`} />
                  </div>
                  {errors.age && <p className="text-sm text-destructive">{errors.age}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="studentClass">Class</Label>
                  <Select value={formData.studentClass} onValueChange={(v) => handleSelectChange('studentClass', v)}>
                    <SelectTrigger className={errors.studentClass ? "border-destructive" : ""}><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      {['Primary 4', 'Primary 5', 'Primary 6', 'JHS 1', 'JHS 2', 'JHS 3'].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  {errors.studentClass && <p className="text-sm text-destructive">{errors.studentClass}</p>}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Create Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input id="password" name="password" type={showPassword ? "text" : "password"} placeholder="Password" value={formData.password} onChange={handleChange} className={`pl-10 pr-10 ${errors.password ? "border-destructive" : ""}`} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">{showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button>
                </div>
                {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input id="confirmPassword" name="confirmPassword" type={showConfirmPassword ? "text" : "password"} placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleChange} className={`pl-10 pr-10 ${errors.confirmPassword ? "border-destructive" : ""}`} />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">{showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button>
                </div>
                {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
              </div>
              <Button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-6 text-lg font-semibold">
                Next <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </form>
          )}

          {/* OTP Step */}
          {mode === 'register' && registerStep === 2 && (
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
              <Button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-6 text-lg font-semibold" disabled={isSubmitting}>
                {isSubmitting ? "Verifying..." : "Verify & Create Account"}
              </Button>
              <Button type="button" variant="ghost" className="w-full" onClick={() => setRegisterStep(1)}>Back to Details</Button>
            </form>
          )}

          {/* Success Step */}
          {mode === 'register' && registerStep === 3 && (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-xl font-bold">Registration Successful!</h2>
              <p className="text-muted-foreground">Your student account is now active.</p>
              <div className="bg-muted p-4 rounded-lg text-left">
                <p className="font-semibold text-sm">Login with:</p>
                <p className="text-sm text-muted-foreground">Phone: {formData.phone}</p>
                <p className="text-sm text-muted-foreground">Password: *******</p>
                <p className="text-xs text-yellow-600 mt-2 font-medium">Note: For now, please use email: {`${formData.phone}@edulearn.com`} to login.</p>
              </div>
              <Button onClick={() => { setMode('login'); setFormData(prev => ({ ...prev, email: `${formData.phone}@edulearn.com` })); setRegisterStep(1); }} className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-6 text-lg font-semibold">
                Log In Now
              </Button>
            </div>
          )}

          {/* Footer */}
          {mode === 'login' && (
            <div className="text-center mt-6 space-y-2">
              <p className="text-muted-foreground text-sm">
                Not a student?{" "}
                <Link to="/login" className="text-primary hover:underline font-semibold">General Login</Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
