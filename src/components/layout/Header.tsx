import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/subjects", label: "Subjects" },
  { href: "/pricing", label: "Pricing" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <header
      className={cn(
        "sticky top-0 left-0 right-0 z-40",
        "bg-slate-900 text-white"
      )}
    >
      <motion.div
        className="container mx-auto px-4 sm:px-6 lg:px-8 py-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <div className="flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-3 group relative z-10">
            <div className="relative">
              <div className="absolute inset-0 bg-orange-500/20 rounded-full blur-xl group-hover:bg-orange-500/30 transition-all" />
              <img
                src="/logo.png"
                alt="LovableLearn"
                className="h-16 w-auto relative transform transition-transform duration-500 group-hover:rotate-[-5deg] group-hover:scale-110"
              />
            </div>
            <span className="font-bold text-4xl tracking-tight transition-colors duration-300 text-white">
              Lovable <span className="text-orange-600">Learn</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  "px-3 py-2 rounded-md text-base font-medium transition-colors",
                  location.pathname === link.href
                    ? "bg-white/10 text-white"
                    : "text-slate-300 hover:text-white hover:bg-white/5"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-2">
            <Link to="/login">
              <Button variant="ghost" className="text-white/90 hover:text-white hover:bg-white/10">
                Log in
              </Button>
            </Link>
            <Link to="/register">
              <Button className="bg-orange-600 hover:bg-orange-700 text-white">
                Get Started
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center gap-3">
            <Button
              variant="ghost"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-white hover:text-orange-500 hover:bg-white/10 rounded-full w-20 h-20 flex items-center justify-center"
            >
              {isMobileMenuOpen ? <X className="w-16 h-16" /> : <Menu className="w-16 h-16" />}
            </Button>
          </div>
        </div>
        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <motion.nav
            className="mt-6 lg:hidden flex flex-col gap-4"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  "px-4 py-6 rounded-md text-3xl font-semibold",
                  location.pathname === link.href
                    ? "bg-white/10 text-white"
                    : "text-slate-200 hover:text-white hover:bg-white/5"
                )}
              >
                {link.label}
              </Link>
            ))}

            <div className="mt-2 flex gap-2">
              <Link to="/login" className="flex-1" onClick={() => setIsMobileMenuOpen(false)}>
                <Button
                  variant="outline"
                  className="w-full justify-center text-2xl h-20 border-white/30 text-white bg-transparent hover:bg-white/10"
                >
                  Log in
                </Button>
              </Link>
              <Link to="/register" className="flex-1" onClick={() => setIsMobileMenuOpen(false)}>
                <Button
                  className="w-full justify-center text-2xl h-20 bg-orange-600 hover:bg-orange-700 text-white"
                >
                  Get Started
                </Button>
              </Link>
            </div>
          </motion.nav>
        )}
      </motion.div>
    </header >
  );
}
