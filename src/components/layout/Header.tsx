import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Sun, Moon, GraduationCap, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import { cn } from "@/lib/utils";
import { BRANDING } from "@/config/branding";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/subjects", label: "Subjects" },
  { href: "/pricing", label: "Pricing" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains("dark");
    setIsDark(isDarkMode);
  }, []);

  const toggleDarkMode = () => {
    document.documentElement.classList.toggle("dark");
    setIsDark(!isDark);
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        isScrolled
          ? "bg-white/80 backdrop-blur-xl shadow-md border-b border-orange-100/50 py-2"
          : "bg-transparent py-4"
      )}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-3 group relative z-10">
            <div className="relative">
              <div className="absolute inset-0 bg-orange-500/20 rounded-full blur-xl group-hover:bg-orange-500/30 transition-all" />
              <img
                src="/logo.png"
                alt="LovableLearn"
                className="h-10 w-auto relative transform transition-transform duration-500 group-hover:rotate-[-5deg] group-hover:scale-110"
              />
            </div>
            <span className={cn(
              "font-bold text-xl tracking-tight transition-colors duration-300",
              isScrolled ? "text-slate-900" : "text-slate-800"
            )}>
              Lovable<span className="text-orange-600">Learn</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8 px-8 py-3 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 shadow-[0_4px_20px_-1px_rgba(0,0,0,0.02)]">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  "text-sm font-medium transition-all duration-300 relative group px-2 py-1",
                  location.pathname === link.href
                    ? "text-orange-600"
                    : "text-slate-600 hover:text-orange-600"
                )}
              >
                {link.label}
                <span className={cn(
                  "absolute -bottom-1 left-0 w-full h-0.5 bg-orange-500 rounded-full transform origin-left transition-transform duration-300",
                  location.pathname === link.href ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                )} />
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-4">
            <div className="flex items-center gap-1 pr-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-slate-500 hover:text-orange-600 hover:bg-orange-50 rounded-full w-10 h-10 transition-all duration-300"
              >
                <Search className="w-5 h-5" />
              </Button>

              <NotificationCenter />

              <Button
                variant="ghost"
                size="icon"
                onClick={toggleDarkMode}
                className="text-slate-500 hover:text-orange-600 hover:bg-orange-50 rounded-full w-10 h-10 transition-all duration-300"
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </Button>
            </div>

            <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
              <Link to="/login">
                <Button variant="ghost" className="font-semibold text-slate-700 hover:text-orange-600 hover:bg-orange-50 rounded-full px-6">
                  Log in
                </Button>
              </Link>
              <Link to="/register">
                <Button className="font-semibold bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white rounded-full px-6 shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all duration-300 transform hover:-translate-y-0.5">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center gap-3">
            <NotificationCenter />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-slate-700 hover:text-orange-600 hover:bg-orange-50 rounded-full"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={cn(
          "lg:hidden fixed inset-x-0 top-[70px] bottom-0 bg-white/95 backdrop-blur-xl border-t border-slate-100 transition-all duration-300 ease-in-out z-40",
          isMobileMenuOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-[-10px] pointer-events-none"
        )}>
          <div className="h-full overflow-y-auto px-6 py-8 flex flex-col gap-6">
            <nav className="flex flex-col gap-2">
              {navLinks.map((link, idx) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  style={{ transitionDelay: `${idx * 50}ms` }}
                  className={cn(
                    "flex items-center justify-between px-4 py-4 rounded-2xl font-medium text-lg transition-all border border-transparent",
                    location.pathname === link.href
                      ? "text-orange-600 bg-orange-50 border-orange-100 shadow-sm"
                      : "text-slate-600 hover:text-orange-600 hover:bg-slate-50"
                  )}
                >
                  {link.label}
                  {location.pathname === link.href && (
                    <div className="w-2 h-2 rounded-full bg-orange-500" />
                  )}
                </Link>
              ))}
            </nav>

            <div className="mt-auto flex flex-col gap-4 pb-8">
              <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
              <div className="grid grid-cols-2 gap-4">
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full h-12 rounded-xl text-base font-semibold border-slate-200 hover:border-orange-200 hover:text-orange-600 hover:bg-orange-50">
                    Log in
                  </Button>
                </Link>
                <Link to="/register" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button className="w-full h-12 rounded-xl text-base font-semibold bg-orange-600 hover:bg-orange-700 shadow-lg shadow-orange-500/20">
                    Sign up
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
