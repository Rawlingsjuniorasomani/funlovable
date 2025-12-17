import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuthContext } from "@/contexts/AuthContext";
import { useParentData } from "@/data/parentDataStore";
import { useAdminNotifications } from "@/hooks/useAdminNotifications";
import { PaystackCheckout } from "@/components/payments/PaystackCheckout";
import { sendSubscriptionSMS, sendPaymentConfirmationSMS, sendChildAddedSMS } from "@/utils/smsService";
import { Check, ChevronRight, CreditCard, User, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const steps = [
  { id: 1, name: 'Add Child', icon: User },
  { id: 2, name: 'Choose Plan', icon: CreditCard },
  { id: 3, name: 'Payment', icon: CreditCard },
  { id: 4, name: 'Complete', icon: Sparkles },
];

const plans = [
  {
    id: 'single',
    name: 'Single Child',
    price: 300,
    displayPrice: 'GH₵300',
    period: 'per year',
    features: ['1 child account', 'All subjects', 'Live classes', 'Progress tracking'],
  },
  {
    id: 'family',
    name: 'Family Plan',
    price: 1300,
    displayPrice: 'GH₵1300',
    period: 'per year',
    features: ['Up to 4 children', 'All subjects', 'Live classes', 'Priority support'],
    popular: true,
  },
];

const grades = [
  'Nursery 1', 'Nursery 2', 'KG 1', 'KG 2',
  'Primary 1', 'Primary 2', 'Primary 3', 'Primary 4', 'Primary 5', 'Primary 6',
  'JHS 1', 'JHS 2', 'JHS 3',
];

const allSubjects = [
  { id: 'math', name: 'Mathematics', },
  { id: 'english', name: 'English', },
  { id: 'science', name: 'Science', },
  { id: 'social', name: 'Social Studies', },
  { id: 'ict', name: 'ICT', },
  { id: 'french', name: 'French', },
  { id: 'creative', name: 'Creative Arts', },
  { id: 'rme', name: 'RME', },
];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, addChild, updateSubscription, completeOnboarding } = useAuthContext();
  const { createSubscription, addPayment, linkChild } = useParentData();
  const { addNotification } = useAdminNotifications();

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState<typeof plans[0]>(plans[0]);
  const [showPaystack, setShowPaystack] = useState(false);

  const [childData, setChildData] = useState({
    name: '',
    age: '',
    grade: '',
    subjects: [] as string[],
  });

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
      toast({ title: "Please fill all fields", description: "All child information is required.", variant: "destructive" });
      return;
    }

    const newChild = await addChild({
      name: childData.name,
      age: parseInt(childData.age),
      grade: childData.grade,
      subjects: childData.subjects,
      email: `${childData.name.toLowerCase().replace(/\s/g, '.')}@student.edu`,
    });

    if (newChild && user) {
      // Link child in parent data store for admin visibility
      linkChild({
        parentId: user.id,
        childId: newChild.id,
        childName: newChild.name,
        childEmail: newChild.name ? `${newChild.name.toLowerCase().replace(/\s/g, '.')}@student.edu` : 'student@edu.com',
        role: 'student',
        grade: childData.grade,
        class: 'A',
      });

      // Notify admin
      addNotification({
        type: 'new_student',
        title: 'New Student Added',
        description: `${user.name} added ${newChild.name} as a student`,
        relatedId: newChild.id,
      });

      // Send SMS
      if (user.phone) {
        await sendChildAddedSMS(user.phone, user.name, newChild.name);
      }
    }

    if (newChild) {
      toast({ title: "Child added!", description: `${childData.name} has been added to your account.` });
      // Move to Plan Selection
      setCurrentStep(2);
    } else {
      toast({ title: "Error", description: "Could not add child. Please try again.", variant: "destructive" });
    }
  };

  const handlePaymentSuccess = async (reference: string) => {
    if (!user) return;

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);

    // Create subscription
    createSubscription({
      parentId: user.id,
      parentName: user.name,
      parentEmail: user.email,
      plan: selectedPlan.id as 'single' | 'family',
      planName: selectedPlan.name,
      amount: selectedPlan.price,
      status: 'active',
      startDate: now.toISOString().split('T')[0],
      expiresAt: expiresAt.toISOString().split('T')[0],
      paymentMethod: 'Paystack',
      autoRenew: true,
    });

    // Add payment record
    addPayment({
      parentId: user.id,
      parentName: user.name,
      parentEmail: user.email,
      plan: selectedPlan.name,
      amount: selectedPlan.price,
      status: 'completed',
      date: now.toISOString(),
      paymentMethod: 'Paystack',
    });

    // Update user subscription
    updateSubscription(selectedPlan.id as 'single' | 'family', 'active');

    // Add admin notifications
    addNotification({
      type: 'new_subscription',
      title: 'New Subscription',
      description: `${user.name} subscribed to ${selectedPlan.name}`,
    });

    addNotification({
      type: 'new_payment',
      title: 'Payment Received',
      description: `GHS ${selectedPlan.price} payment from ${user.name}`,
    });

    // Send SMS notifications
    if (user.phone) {
      await sendSubscriptionSMS(user.phone, user.name, selectedPlan.name);
      await sendPaymentConfirmationSMS(user.phone, user.name, selectedPlan.price, reference);
    }

    setShowPaystack(false);
    setCurrentStep(4);
  };

  const handleComplete = async () => {
    await completeOnboarding();
    navigate('/parent');
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

          {/* Step Content */}
          <div className="max-w-2xl mx-auto">
            {/* Step 1: Add Child */}
            {currentStep === 1 && (
              <div className="bg-card rounded-3xl p-8 border border-border shadow-lg animate-fade-in">
                <h2 className="font-display text-2xl font-bold mb-2 text-center">Add Your Child</h2>
                <p className="text-muted-foreground text-center mb-8">Enter your child's details to get started</p>

                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="childName">Child's Name</Label>
                      <Input
                        id="childName"
                        placeholder="Enter name"
                        value={childData.name}
                        onChange={(e) => setChildData(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="childAge">Age</Label>
                      <Input
                        id="childAge"
                        type="number"
                        min="3"
                        max="18"
                        placeholder="Enter age"
                        value={childData.age}
                        onChange={(e) => setChildData(prev => ({ ...prev, age: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Class</Label>
                    <select
                      className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={childData.grade}
                      onChange={(e) => setChildData(prev => ({ ...prev, grade: e.target.value }))}
                    >
                      <option value="" disabled>Select Grade</option>
                      {grades.map((grade) => (
                        <option key={grade} value={grade}>{grade}</option>
                      ))}
                    </select>
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
                            {s.name}
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
                              {s.name}
                              <button type="button" onClick={() => handleSubjectToggle(s.id)} className="ml-1 hover:text-destructive">×</button>
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 mt-8">
                  <Button
                    onClick={handleAddChild}
                    className="w-full btn-bounce bg-gradient-to-r from-primary to-tertiary"
                  >
                    Add Child & Continue <ChevronRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Choose Plan */}
            {currentStep === 2 && (
              <div className="bg-card rounded-3xl p-8 border border-border shadow-lg animate-fade-in">
                <h2 className="font-display text-2xl font-bold mb-2 text-center">Choose Your Plan</h2>
                <p className="text-muted-foreground text-center mb-8">Select the best plan for your family</p>

                <div className="grid md:grid-cols-2 gap-4 mb-8">
                  {plans.map((plan) => (
                    <button
                      key={plan.id}
                      onClick={() => setSelectedPlan(plan)}
                      className={cn(
                        "relative p-6 rounded-2xl border-2 text-left transition-all",
                        selectedPlan.id === plan.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-muted-foreground"
                      )}
                    >
                      {plan.popular && (
                        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-secondary text-secondary-foreground text-xs px-3 py-1 rounded-full font-medium">
                          Best Value
                        </span>
                      )}
                      <h3 className="font-display text-lg font-bold mb-1">{plan.name}</h3>
                      <div className="flex items-baseline gap-1 mb-4">
                        <span className="text-3xl font-bold">{plan.displayPrice}</span>
                        <span className="text-muted-foreground text-sm">{plan.period}</span>
                      </div>
                      <ul className="space-y-2">
                        {plan.features.map((feature) => (
                          <li key={feature} className="flex items-center gap-2 text-sm">
                            <Check className="w-4 h-4 text-secondary" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </button>
                  ))}
                </div>

                <Button
                  onClick={() => setCurrentStep(3)}
                  className="w-full btn-bounce bg-gradient-to-r from-primary to-tertiary py-6 text-lg"
                >
                  Continue <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            )}



            {/* Step 3: Payment */}
            {currentStep === 3 && !showPaystack && (
              <div className="bg-card rounded-3xl p-8 border border-border shadow-lg animate-fade-in">
                <h2 className="font-display text-2xl font-bold mb-2 text-center">Complete Payment</h2>
                <p className="text-muted-foreground text-center mb-8">Secure payment via Paystack</p>

                <div className="bg-muted/50 rounded-xl p-6 mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-medium">Selected Plan</span>
                    <span className="font-bold">{selectedPlan.name}</span>
                  </div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-medium">Children Added</span>
                    <span>{user?.children?.length || 1}</span>
                  </div>
                  <div className="border-t border-border pt-4">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-lg">Total</span>
                      <span className="font-bold text-2xl text-primary">
                        GHS {selectedPlan.price}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button variant="outline" onClick={() => setCurrentStep(2)} className="flex-1">
                    Back
                  </Button>
                  <Button
                    onClick={() => setShowPaystack(true)}
                    className="flex-1 btn-bounce bg-secondary hover:bg-secondary/90"
                  >
                    Pay with Paystack
                  </Button>
                </div>
              </div>
            )}

            {/* Paystack Checkout */}
            {currentStep === 3 && showPaystack && user && (
              <PaystackCheckout
                amount={selectedPlan.price}
                email={user.email}
                planName={selectedPlan.name}
                onSuccess={handlePaymentSuccess}
                onClose={() => setShowPaystack(false)}
              />
            )}

            {/* Step 4: Complete */}
            {currentStep === 4 && (
              <div className="bg-card rounded-3xl p-8 border border-border shadow-lg animate-fade-in text-center">
                <div className="w-20 h-20 rounded-full bg-secondary/20 flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="w-10 h-10 text-secondary" />
                </div>
                <h2 className="font-display text-2xl font-bold mb-2">You're All Set! 🎉</h2>
                <p className="text-muted-foreground mb-8">
                  Your account is ready. Start exploring your child's learning journey now!
                </p>

                <Button
                  onClick={handleComplete}
                  className="btn-bounce bg-gradient-to-r from-primary to-tertiary py-6 px-12 text-lg"
                >
                  Go to Dashboard <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
