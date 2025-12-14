import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check, Star, ArrowRight } from "lucide-react";

const plans = [
  {
    name: "Single Child",
    price: "GH₵300",
    period: "/child",
    description: "Perfect for families with one child",
    features: [
      "Access to all subjects",
      "Interactive lessons & quizzes",
      "Live class sessions",
      "Progress tracking",
      "Parent dashboard",
      "24/7 support",
    ],
    popular: false,
    color: "border-slate-200",
  },
  {
    name: "Family Plan",
    price: "GH₵1,300",
    period: "/4 children",
    description: "Best value for larger families",
    features: [
      "Everything in Single Child",
      "Up to 4 children",
      "Family progress dashboard",
      "Priority support",
      "Offline downloads",
      "Certificate of completion",
    ],
    popular: true,
    color: "border-orange-500",
  },
];

export function PricingPreview() {
  return (
    <section className="relative py-20 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="/WhatsApp Image 2025-12-07 at 09.39.11_281f930c.jpg"
          alt="Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-white/95" />
      </div>

      <div className="container relative z-10 mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Simple, <span className="gradient-text">Affordable</span> Pricing
          </h2>
          <p className="text-lg text-muted-foreground">
            Choose the plan that works best for your family. All plans include full access to our learning platform.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={plan.name}
              className={`relative bg-white/80 backdrop-blur-sm rounded-2xl p-8 border-2 ${plan.color} card-hover animate-fade-in ${plan.popular ? "shadow-lg scale-105" : ""
                }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <div className="flex items-center gap-1 bg-orange-600 text-white px-4 py-1 rounded-full text-sm font-medium shadow-md">
                    <Star className="w-4 h-4" />
                    Most Popular
                  </div>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="font-display font-semibold text-xl mb-2">{plan.name}</h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold text-slate-900">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
                <p className="text-muted-foreground text-sm mt-2">{plan.description}</p>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full ${plan.popular ? "bg-orange-100 text-orange-600" : "bg-slate-100 text-slate-500"} flex items-center justify-center`}>
                      <Check className="w-3 h-3" />
                    </div>
                    <span className="text-sm text-slate-600">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link to="/pricing">
                <Button
                  className={`w-full btn-bounce ${plan.popular
                    ? "bg-orange-600 hover:bg-orange-700 text-white"
                    : "bg-slate-900 hover:bg-slate-800 text-white"
                    }`}
                >
                  Subscribe Now
                </Button>
              </Link>
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link to="/pricing">
            <Button variant="link" className="text-slate-800">
              View full pricing details
              <ArrowRight className="ml-1 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
