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
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white/95 backdrop-blur-md shadow-sm border-b border-orange-100"
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <img
              src="/logo.png"
              alt="E-Learning Platform"
              className="h-16 w-auto object-contain transition-transform group-hover:scale-105"
            />
          </Link>
          <h1>EduLearn Platform</h1>
          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-orange-500",
                  location.pathname === link.href
                    ? "text-orange-500 font-bold"
                    : "text-slate-700"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-6">
            <div className="flex items-center gap-2 border-r border-slate-200 pr-6">
              <Button variant="ghost" size="icon" className="text-slate-600 hover:text-orange-500 hover:bg-orange-50">
                <Search className="w-5 h-5" />
              </Button>

              <NotificationCenter />

              <Button
                variant="ghost"
                size="icon"
                onClick={toggleDarkMode}
                className="text-slate-600 hover:text-orange-500 hover:bg-orange-50 rounded-full"
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </Button>
            </div>

            <Link to="/login">
              <Button className="font-semibold bg-orange-600 hover:bg-orange-700 text-white rounded-full px-8 shadow-sm hover:shadow-md transition-all h-12">
                Login / Register
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center gap-2">
            <NotificationCenter />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-slate-700"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-background/95 backdrop-blur-md border-b border-border animate-fade-in">
            <nav className="container mx-auto px-4 py-4 flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "px-4 py-3 rounded-lg font-medium transition-all text-sm",
                    location.pathname === link.href
                      ? "text-orange-600 bg-orange-50 font-bold"
                      : "text-slate-600 hover:text-orange-600 hover:bg-orange-50"
                  )}
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex gap-2 pt-4 border-t border-orange-100 mt-2">
                <Link to="/login" className="flex-1" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full border-orange-200 text-orange-600 hover:bg-orange-50 hover:text-orange-700">
                    Login
                  </Button>
                </Link>
                <Link to="/register" className="flex-1" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white shadow-sm">
                    Sign Up
                  </Button>
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
