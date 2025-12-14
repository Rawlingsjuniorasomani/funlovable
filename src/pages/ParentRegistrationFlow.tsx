import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuthContext } from "@/contexts/AuthContext";
import { parentsAPI } from "@/config/api";
import { useParentData } from "@/data/parentDataStore";
import { useAdminNotifications } from "@/hooks/useAdminNotifications";
import { PaystackCheckout } from "@/components/payments/PaystackCheckout";
import { sendWelcomeSMS, sendSubscriptionSMS, sendPaymentConfirmationSMS, sendChildAddedSMS } from "@/utils/smsService";
import { Check, ChevronRight, CreditCard, User, Sparkles, Lock, Mail, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import { z } from "zod";

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

const steps = [
    { id: 1, name: 'Create Account', icon: User },
    { id: 2, name: 'Add Child', icon: User },
    { id: 3, name: 'Payment', icon: CreditCard },
    { id: 4, name: 'Complete', icon: Sparkles },
];

const grades = [
    'Nursery 1', 'Nursery 2', 'KG 1', 'KG 2',
    'Primary 1', 'Primary 2', 'Primary 3', 'Primary 4', 'Primary 5', 'Primary 6',
    'JHS 1', 'JHS 2', 'JHS 3',
];

const allSubjects = [
    { id: 'math', name: 'Mathematics', emoji: '🔢' },
    { id: 'english', name: 'English', emoji: '📖' },
    { id: 'science', name: 'Science', emoji: '🔬' },
    { id: 'social', name: 'Social Studies', emoji: '🌍' },
    { id: 'ict', name: 'ICT', emoji: '💻' },
    { id: 'french', name: 'French', emoji: '🇫🇷' },
    { id: 'creative', name: 'Creative Arts', emoji: '🎨' },
    { id: 'rme', name: 'RME', emoji: '📿' },
];

export default function ParentRegistrationFlow() {
    const navigate = useNavigate();
    const location = useLocation();
    const { toast } = useToast();
    const { user, register, addChild, updateSubscription, completeOnboarding, logout } = useAuthContext();
    const { registerParent, createSubscription, addPayment, linkChild } = useParentData();
    const { addNotification } = useAdminNotifications();

    // Get plan from Pricing page navigation state
    const preSelectedPlan = location.state?.selectedPlan;

    const [currentStep, setCurrentStep] = useState(1);
    const [showPaystack, setShowPaystack] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Step 1: Registration State
    const [regData, setRegData] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
    });
    const [regErrors, setRegErrors] = useState<Record<string, string>>({});

    // Step 2: Child State
    const [childData, setChildData] = useState({
        name: '',
        age: '',
        grade: '',
        subjects: [] as string[],
    });

    const handleRegChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setRegData((prev) => ({ ...prev, [name]: value }));
        if (regErrors[name]) setRegErrors((prev) => ({ ...prev, [name]: "" }));
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setRegErrors({});

        try {
            registerSchema.parse(regData);
            // Move to next step without creating account yet
            toast({ title: "Details Saved", description: "Now let's add your child." });
            setCurrentStep(2);
        } catch (error) {
            if (error instanceof z.ZodError) {
                const fieldErrors: Record<string, string> = {};
                error.errors.forEach((err) => {
                    if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
                });
                setRegErrors(fieldErrors);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubjectToggle = (subjectId: string) => {
        setChildData(prev => ({
            ...prev,
            subjects: prev.subjects.includes(subjectId)
                ? prev.subjects.filter(s => s !== subjectId)
                : [...prev.subjects, subjectId],
        }));
    };

    const handleAddChild = async () => {
        if (!childData.name || !childData.age || !childData.grade || childData.subjects.length === 0) {
            toast({ title: "Missing fields", description: "Please fill in all child details.", variant: "destructive" });
            return;
        }
        // Just move to next step, data is already in state
        toast({ title: "Child Details Saved", description: "Proceeding to payment." });
        setCurrentStep(3);
    };

    const handlePaymentSuccess = async (reference: string) => {
        setIsSubmitting(true);
        try {
            // 1. Create User Account
            const regResult = await register({
                name: regData.name,
                email: regData.email,
                password: regData.password,
                role: 'parent',
                phone: regData.phone || undefined,
            });

            if (!regResult.success || !regResult.user) {
                toast({ title: "Registration Failed", description: regResult.error, variant: "destructive" });
                setIsSubmitting(false);
                return;
            }

            const newUser = regResult.user;

            // 2. Register Parent Profile
            registerParent({
                name: regData.name,
                email: regData.email,
                phone: regData.phone || undefined,
            });

            addNotification({
                type: 'new_parent',
                title: 'New Parent Registration',
                description: `${regData.name} registered via onboarding flow`,
                relatedId: newUser.id,
            });

            if (regData.phone) await sendWelcomeSMS(regData.phone, regData.name);

            // 3. Add Child
            const childPayload = {
                name: childData.name,
                email: `${childData.name.toLowerCase().replace(/\s/g, '.')}@student.edu`,
                age: parseInt(childData.age),
                grade: childData.grade,
                subjects: childData.subjects
            };

            // @ts-ignore - API types might be partial but backend accepts full payload
            const response = await parentsAPI.addChild(childPayload);
            const newChild = response.child;

            if (newChild) {
                linkChild({
                    parentId: newUser.id,
                    childId: newChild.id,
                    childName: newChild.name,
                    childEmail: response.studentCredentials?.email || `${newChild.name.toLowerCase().replace(/\s/g, '.')}@student.edu`,
                    role: 'student',
                    grade: childData.grade,
                    class: 'A',
                });

                addNotification({
                    type: 'new_student',
                    title: 'New Student Added',
                    description: `${newUser.name} added ${newChild.name}`,
                    relatedId: newChild.id,
                });

                if (newUser.phone) await sendChildAddedSMS(newUser.phone, newUser.name, newChild.name);
            }

            // 4. Create Subscription & Payment
            const planName = preSelectedPlan?.name || "Single Child";
            const planId = preSelectedPlan?.id || "single";
            const planPrice = preSelectedPlan?.priceVal || 300;

            const now = new Date();
            const expiresAt = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);

            createSubscription({
                parentId: newUser.id,
                parentName: newUser.name,
                parentEmail: newUser.email,
                plan: planId,
                planName: planName,
                amount: planPrice,
                status: 'active',
                startDate: now.toISOString().split('T')[0],
                expiresAt: expiresAt.toISOString().split('T')[0],
                paymentMethod: 'Paystack',
                autoRenew: true,
            });

            addPayment({
                parentId: newUser.id,
                parentName: newUser.name,
                parentEmail: newUser.email,
                plan: planName,
                amount: planPrice,
                status: 'completed',
                date: now.toISOString(),
                paymentMethod: 'Paystack',
            });

            updateSubscription(planId, 'active');

            addNotification({
                type: 'new_payment',
                title: 'Payment Received',
                description: `GHS ${planPrice} from ${newUser.name}`,
            });

            if (newUser.phone) {
                await sendSubscriptionSMS(newUser.phone, newUser.name, planName);
                await sendPaymentConfirmationSMS(newUser.phone, newUser.name, planPrice, reference);
            }

            setShowPaystack(false);
            setCurrentStep(4);
        } catch (error) {
            console.error("Error during completion:", error);
            toast({ title: "Error", description: "Something went wrong during account creation.", variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleComplete = () => {
        completeOnboarding();
        logout();
        toast({ title: "Registration Complete", description: "Please log in to continue." });
        navigate('/parent/auth');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary/5 via-tertiary/5 to-secondary/5">
            <Header />
            <main className="pt-20 min-h-screen">
                <div className="container mx-auto px-4 py-8">

                    {/* Progress Steps */}
                    <div className="max-w-3xl mx-auto mb-8">
                        <div className="flex items-center justify-between">
                            {steps.map((step, index) => {
                                const Icon = step.icon;
                                const isCompleted = currentStep > step.id;
                                const isCurrent = currentStep === step.id;
                                return (
                                    <div key={step.id} className="flex items-center">
                                        <div className="flex flex-col items-center">
                                            <div className={cn(
                                                "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors",
                                                isCompleted ? "bg-secondary border-secondary text-secondary-foreground" :
                                                    isCurrent ? "bg-primary border-primary text-primary-foreground" :
                                                        "bg-muted border-border text-muted-foreground"
                                            )}>
                                                {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                                            </div>
                                            <span className={cn(
                                                "text-xs mt-2 font-medium",
                                                isCurrent ? "text-primary" : "text-muted-foreground"
                                            )}>
                                                {step.name}
                                            </span>
                                        </div>
                                        {index < steps.length - 1 && (
                                            <div className={cn(
                                                "h-0.5 w-16 md:w-24 mx-2",
                                                isCompleted ? "bg-secondary" : "bg-border"
                                            )} />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="max-w-2xl mx-auto">
                        {/* Step 1: Create Account */}
                        {currentStep === 1 && (
                            <div className="bg-card rounded-3xl p-8 border border-border shadow-lg animate-fade-in">
                                <h2 className="font-display text-2xl font-bold mb-2 text-center">Create Parent Account</h2>
                                <p className="text-muted-foreground text-center mb-8">First, let's create your account to manage everything.</p>

                                <form onSubmit={handleRegister} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Full Name</Label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                            <Input id="name" name="name" placeholder="John Doe" value={regData.name} onChange={handleRegChange} className="pl-10" />
                                        </div>
                                        {regErrors.name && <p className="text-sm text-destructive">{regErrors.name}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Phone Number</Label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                            <Input id="phone" name="phone" type="tel" placeholder="+233..." value={regData.phone} onChange={handleRegChange} className="pl-10" />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                            <Input id="email" name="email" type="email" placeholder="john@example.com" value={regData.email} onChange={handleRegChange} className="pl-10" />
                                        </div>
                                        {regErrors.email && <p className="text-sm text-destructive">{regErrors.email}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="password">Password</Label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                            <Input id="password" name="password" type="password" placeholder="******" value={regData.password} onChange={handleRegChange} className="pl-10" />
                                        </div>
                                        {regErrors.password && <p className="text-sm text-destructive">{regErrors.password}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                            <Input id="confirmPassword" name="confirmPassword" type="password" placeholder="******" value={regData.confirmPassword} onChange={handleRegChange} className="pl-10" />
                                        </div>
                                        {regErrors.confirmPassword && <p className="text-sm text-destructive">{regErrors.confirmPassword}</p>}
                                    </div>

                                    <Button type="submit" className="w-full py-6 text-lg mt-4" disabled={isSubmitting}>
                                        {isSubmitting ? "Creating Account..." : "Create Account & Continue"}
                                    </Button>
                                </form>
                            </div>
                        )}

                        {/* Step 2: Add Child */}
                        {currentStep === 2 && (
                            <div className="bg-card rounded-3xl p-8 border border-border shadow-lg animate-fade-in">
                                <h2 className="font-display text-2xl font-bold mb-2 text-center">Add Your First Child</h2>
                                <p className="text-muted-foreground text-center mb-8">You must add at least one child before payment.</p>

                                <div className="space-y-6">
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Child's Name</Label>
                                            <Input value={childData.name} onChange={(e) => setChildData({ ...childData, name: e.target.value })} placeholder="Child Name" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Age</Label>
                                            <Input type="number" value={childData.age} onChange={(e) => setChildData({ ...childData, age: e.target.value })} placeholder="Age" />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Class</Label>
                                        <div className="relative">
                                            <select
                                                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                value={childData.grade}
                                                onChange={(e) => setChildData({ ...childData, grade: e.target.value })}
                                            >
                                                <option value="" disabled>Select class</option>
                                                {grades.map((g) => (
                                                    <option key={g} value={g}>{g}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Select Subjects</Label>
                                        <div className="space-y-3">
                                            <select
                                                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                onChange={(e) => {
                                                    if (e.target.value) {
                                                        handleSubjectToggle(e.target.value);
                                                        e.target.value = ""; // Reset
                                                    }
                                                }}
                                            >
                                                <option value="" disabled selected>Add a Subject...</option>
                                                {allSubjects.filter(s => !childData.subjects.includes(s.id)).map((s) => (
                                                    <option key={s.id} value={s.id}>
                                                        {s.emoji} {s.name}
                                                    </option>
                                                ))}
                                            </select>

                                            <div className="flex flex-wrap gap-2 min-h-[40px] p-2 rounded-md border border-dashed border-border bg-muted/30">
                                                {childData.subjects.length === 0 && <span className="text-sm text-muted-foreground p-1">No subjects selected</span>}
                                                {childData.subjects.map(sid => {
                                                    const s = allSubjects.find(sub => sub.id === sid);
                                                    if (!s) return null;
                                                    return (
                                                        <span key={s.id} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary/10 text-secondary border border-secondary/20 text-sm">
                                                            {s.emoji} {s.name}
                                                            <button type="button" onClick={() => handleSubjectToggle(s.id)} className="ml-1 hover:text-destructive">×</button>
                                                        </span>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>

                                    <Button onClick={handleAddChild} className="w-full py-6 text-lg bg-gradient-to-r from-primary to-tertiary">
                                        Add Child & Proceed to Payment <ChevronRight className="ml-2 w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Payment */}
                        {currentStep === 3 && (
                            <div className="bg-card rounded-3xl p-8 border border-border shadow-lg animate-fade-in text-center">
                                {!showPaystack ? (
                                    <>
                                        <h2 className="font-display text-2xl font-bold mb-4">Confirm Payment</h2>
                                        <div className="bg-muted p-6 rounded-xl mb-6">
                                            <p className="text-lg font-medium">{preSelectedPlan?.name || "Subscription Plan"}</p>
                                            <p className="text-3xl font-bold text-primary my-2">GHS {preSelectedPlan?.priceVal || 400}</p>
                                            <p className="text-sm text-muted-foreground">Includes full access for {childData.name}</p>
                                        </div>
                                        <Button onClick={() => setShowPaystack(true)} className="w-full py-6 text-lg bg-secondary text-secondary-foreground hover:bg-secondary/90">
                                            Pay Now with Paystack
                                        </Button>
                                    </>
                                ) : (
                                    (
                                        <PaystackCheckout
                                            amount={preSelectedPlan?.priceVal || 400}
                                            email={regData.email}
                                            planName={preSelectedPlan?.name || "Subscription"}
                                            onSuccess={handlePaymentSuccess}
                                            onClose={() => setShowPaystack(false)}
                                        />
                                    )
                                )}
                            </div>
                        )}

                        {/* Step 4: Complete */}
                        {currentStep === 4 && (
                            <div className="bg-card rounded-3xl p-8 border border-border shadow-lg animate-fade-in text-center">
                                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Sparkles className="w-10 h-10 text-green-600" />
                                </div>
                                <h2 className="font-display text-2xl font-bold mb-4">All Done!</h2>
                                <p className="text-muted-foreground mb-8">Your account and child profile are ready.</p>
                                <Button onClick={handleComplete} className="w-full py-6 text-lg">
                                    Go to Dashboard <ChevronRight className="w-5 h-5 ml-2" />
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </main >
        </div >
    );
}
