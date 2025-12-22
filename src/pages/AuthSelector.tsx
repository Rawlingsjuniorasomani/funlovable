import { Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { GraduationCap, School, Users, Shield, ArrowRight } from "lucide-react";

const authOptions = [
  {
    role: 'student',
    title: 'Student',
    description: 'Learn, take quizzes, and track your progress',
    icon: GraduationCap,
    href: '/student/auth',
    gradient: 'from-blue-500 via-indigo-500 to-sky-500',
    bgGradient: 'from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20',
  },
  {
    role: 'teacher',
    title: 'Teacher',
    description: 'Create lessons, manage classes, and grade students',
    icon: School,
    href: '/teacher/auth',
    gradient: 'from-emerald-500 via-teal-500 to-cyan-500',
    bgGradient: 'from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20',
  },
  {
    role: 'parent',
    title: 'Parent',
    description: 'Monitor your children\'s learning progress',
    icon: Users,
    href: '/parent/auth',
    gradient: 'from-violet-500 via-purple-500 to-fuchsia-500',
    bgGradient: 'from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/20',
  },
];

export default function AuthSelector() {
  return (
    <div className="min-h-screen relative flex flex-col">
      { }
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=2022&auto=format&fit=crop"
          alt="E-Learning Background"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-tertiary/90 to-secondary/90 mix-blend-multiply opacity-95 animate-gradient" />
      </div>

      { }
      <div className="relative z-10 w-full h-full flex-1 flex flex-col">
        <Header transparent />
        <main className="pt-24 md:pt-32 pb-12 px-4 flex-1 flex items-center justify-center">
          <div className="max-w-4xl mx-auto w-full">
            <div className="text-center mb-8 md:mb-16 animate-in fade-in slide-in-from-bottom-4 duration-1000">
              <h1 className="font-display text-4xl md:text-6xl font-bold mb-6 text-white drop-shadow-lg leading-tight">
                Welcome to E-Learning Platform
              </h1>
              <p className="text-lg md:text-2xl text-white/90 font-light drop-shadow">
                Choose your role to get started
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 px-2 md:px-4">
              {authOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <Link
                    key={option.role}
                    to={option.href}
                    className="group relative bg-white/10 backdrop-blur-md rounded-2xl md:rounded-3xl p-6 md:p-8 border border-white/20 hover:border-white/50 transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] hover:-translate-y-1 overflow-hidden"
                  >
                    { }
                    <div className={`absolute inset-0 bg-gradient-to-br ${option.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

                    <div className="flex items-center gap-4 md:gap-6 relative z-10">
                      <div className={`w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-gradient-to-br ${option.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 shrink-0`}>
                        <Icon className="w-6 h-6 md:w-8 md:h-8 text-white" />
                      </div>
                      <div className="flex-1 text-left">
                        <h2 className="font-display text-xl md:text-2xl font-bold mb-1 md:mb-2 flex items-center gap-2 text-white">
                          {option.title}
                          <ArrowRight className="w-5 h-5 md:w-6 md:h-6 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-white" />
                        </h2>
                        <p className="text-white/80 text-sm md:text-lg leading-relaxed">{option.description}</p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            <div className="text-center mt-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
              <p className="text-white/80 text-lg">
                Already have an account?{" "}
                <Link to="/auth" className="text-white hover:text-white/90 font-bold hover:underline transition-all">
                  Quick Login
                </Link>
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
