import { Users, Monitor, Trophy, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
    {
        title: "Exclusive Advisor",
        description: "Expert guidance from industry professionals to help you navigate your educational journey.",
        icon: Users,
        color: "bg-indigo-500",
        link: "#"
    },
    {
        title: "Digital Laboratory",
        description: "Access state-of-the-art virtual labs to practice and experiment safely from home.",
        icon: Monitor,
        color: "bg-blue-500",
        link: "#"
    },
    {
        title: "Reached Your Goals",
        description: "Track your progress and celebrate milestones as you achieve your learning objectives.",
        icon: Trophy,
        color: "bg-rose-500",
        link: "#"
    }
];

export function FeaturesSection() {
    return (
        <section className="relative py-24 overflow-hidden">
            { }
            <div className="absolute inset-0 z-0">
                <img
                    src="/WhatsApp Image 2025-12-07 at 09.32.46_55220def.jpg"
                    alt="Background"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-white/95" />
            </div>

            <div className="container relative z-10 mx-auto px-4 mt-6">
                <div className="text-center mb-16 max-w-2xl mx-auto">
                    <h2 className="font-display text-4xl font-bold mb-6 text-slate-900">What We Offer For Growth Your Study</h2>
                    <p className="text-slate-600 leading-relaxed">
                        Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam eaque ipsa quae ab illo inventore veritatis
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {features.map((feature, index) => {
                        const Icon = feature.icon;
                        return (
                            <div key={index} className="group bg-white rounded-2xl p-8 text-center transition-transform hover:-translate-y-2 duration-300 shadow-lg border border-slate-100">
                                <div className={`w-16 h-16 mx-auto mb-6 ${feature.color} rounded-full flex items-center justify-center shadow-lg`}>
                                    <Icon className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-xl font-bold mb-4 text-slate-900">{feature.title}</h3>
                                <p className="text-slate-600 mb-8 text-sm leading-relaxed min-h-[60px]">
                                    {feature.description}
                                </p>
                                <Button variant="ghost" className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 group">
                                    Ream More <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                                </Button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
