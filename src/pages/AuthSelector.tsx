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
    href: '/parent/register-flow',
    gradient: 'from-violet-500 via-purple-500 to-fuchsia-500',
    bgGradient: 'from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/20',
  },
];

export default function AuthSelector() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-tertiary/5 to-secondary/5">
      <Header />
      <main className="pt-24 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="font-display text-4xl font-bold mb-4">Welcome to E-Learning Platform</h1>
            <p className="text-xl text-muted-foreground">Choose your role to get started</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {authOptions.map((option) => {
              const Icon = option.icon;
              return (
                <Link
                  key={option.role}
                  to={option.href}
                  className={`group relative bg-gradient-to-br ${option.bgGradient} rounded-3xl p-6 border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:scale-[1.02]`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${option.gradient} flex items-center justify-center shadow-lg`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <h2 className="font-display text-xl font-bold mb-1 flex items-center gap-2">
                        {option.title}
                        <ArrowRight className="w-5 h-5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                      </h2>
                      <p className="text-muted-foreground">{option.description}</p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="text-center mt-8">
            <p className="text-muted-foreground">
              Already have an account?{" "}
              <Link to="/auth" className="text-primary hover:underline font-semibold">
                Quick Login
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
