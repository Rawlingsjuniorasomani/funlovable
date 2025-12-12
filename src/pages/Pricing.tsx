import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Check, Star, X, HelpCircle } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const plans = [
  {
    name: "Single Child",
    price: "GH₵400",
    period: "per child",
    description: "Perfect for families with one child ready to learn",
    features: [
      { name: "Access to all subjects", included: true },
      { name: "Interactive video lessons", included: true },
      { name: "Quizzes & assignments", included: true },
      { name: "Live class sessions", included: true },
      { name: "Progress tracking", included: true },
      { name: "Parent dashboard", included: true },
      { name: "24/7 support", included: true },
      { name: "Certificate of completion", included: true },
      { name: "Offline downloads", included: false },
      { name: "Priority support", included: false },
    ],
    popular: false,
    cta: "Get Started",
  },
  {
    name: "Family Plan",
    price: "GH₵1,500",
    period: "for up to 4 children",
    description: "Best value for families with multiple children",
    features: [
      { name: "Access to all subjects", included: true },
      { name: "Interactive video lessons", included: true },
      { name: "Quizzes & assignments", included: true },
      { name: "Live class sessions", included: true },
      { name: "Progress tracking", included: true },
      { name: "Parent dashboard", included: true },
      { name: "24/7 support", included: true },
      { name: "Certificate of completion", included: true },
      { name: "Offline downloads", included: true },
      { name: "Priority support", included: true },
    ],
    popular: true,
    cta: "Get Family Plan",
  },
];

const testimonials = [
  {
    name: "Akua M.",
    role: "Parent of 2",
    content: "My children love learning with Lovable Learning! The interactive lessons keep them engaged and the progress tracking helps me stay involved.",
    avatar: "👩",
  },
  {
    name: "Kwame A.",
    role: "Parent of 3",
    content: "The Family Plan is incredible value. All my children have access to quality education at an affordable price. Highly recommended!",
    avatar: "👨",
  },
  {
    name: "Ama K.",
    role: "Parent",
    content: "The live classes are fantastic! My daughter gets real-time help from teachers and her grades have improved significantly.",
    avatar: "👩",
  },
];

const faqs = [
  {
    question: "Can I upgrade from Single Child to Family Plan?",
    answer: "Yes! You can upgrade anytime. The price difference will be prorated based on your remaining subscription period.",
  },
  {
    question: "What happens when my subscription ends?",
    answer: "You'll still have access to view your progress and certificates. To continue learning with new content and live classes, you'll need to renew your subscription.",
  },
  {
    question: "Are there any additional fees?",
    answer: "No hidden fees! The price you see includes all features listed in your plan. You get full access to all subjects and features.",
  },
  {
    question: "Can I get a refund if I'm not satisfied?",
    answer: "We offer a 7-day money-back guarantee. If you're not satisfied within the first week, contact us for a full refund.",
  },
  {
    question: "How do I add more children to my Family Plan?",
    answer: "The Family Plan supports up to 4 children. You can add children through your parent dashboard. If you need more than 4, contact us for a custom plan.",
  },
];

const Pricing = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-20">
        {/* Hero */}
        <section className="py-16 bg-gradient-to-br from-primary/5 via-tertiary/5 to-secondary/5">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="font-display text-4xl md:text-5xl font-bold mb-6">
                Simple, <span className="gradient-text">Affordable</span> Pricing
              </h1>
              <p className="text-xl text-muted-foreground">
                Choose the plan that works best for your family. All plans include full access to our learning platform.
              </p>
            </div>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {plans.map((plan) => (
                <div
                  key={plan.name}
                  className={`relative bg-card rounded-3xl p-8 border-2 ${plan.popular ? "border-secondary shadow-lg" : "border-border"
                    }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <div className="flex items-center gap-1 bg-secondary text-secondary-foreground px-4 py-2 rounded-full font-medium">
                        <Star className="w-4 h-4" />
                        Most Popular
                      </div>
                    </div>
                  )}

                  <div className="text-center mb-8">
                    <h3 className="font-display text-2xl font-bold mb-2">{plan.name}</h3>
                    <div className="flex items-baseline justify-center gap-1 mb-2">
                      <span className="text-5xl font-bold">{plan.price}</span>
                    </div>
                    <p className="text-muted-foreground">{plan.period}</p>
                    <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
                  </div>

                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature) => (
                      <li key={feature.name} className="flex items-center gap-3">
                        {feature.included ? (
                          <div className="w-6 h-6 rounded-full bg-secondary/20 text-secondary flex items-center justify-center">
                            <Check className="w-4 h-4" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-muted text-muted-foreground flex items-center justify-center">
                            <X className="w-4 h-4" />
                          </div>
                        )}
                        <span className={feature.included ? "" : "text-muted-foreground"}>
                          {feature.name}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Link to="/parent/register-flow" state={{ selectedPlan: { name: plan.name, priceVal: plan.name === "Single Child" ? 400 : 1500 } }}>
                    <Button
                      className={`w-full btn-bounce text-lg py-6 ${plan.popular
                          ? "bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                          : "bg-primary hover:bg-primary/90"
                        }`}
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </div>
              ))}
            </div>

            {/* Upgrade Note */}
            <div className="mt-8 text-center">
              <p className="text-muted-foreground">
                Need to add more children? Start with Single Child and upgrade anytime!
              </p>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                What Parents <span className="gradient-text">Say</span>
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {testimonials.map((testimonial) => (
                <div
                  key={testimonial.name}
                  className="bg-card rounded-2xl p-6 border border-border"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-2xl">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <p className="font-semibold">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                  <p className="text-muted-foreground">{testimonial.content}</p>
                  <div className="flex gap-1 mt-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-star text-star" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                Frequently Asked <span className="gradient-text">Questions</span>
              </h2>
            </div>

            <div className="max-w-2xl mx-auto">
              <Accordion type="single" collapsible>
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left">
                      <div className="flex items-center gap-3">
                        <HelpCircle className="w-5 h-5 text-primary flex-shrink-0" />
                        {faq.question}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pl-8">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Pricing;
