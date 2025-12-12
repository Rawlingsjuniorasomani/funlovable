import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BRANDING } from "@/config/branding";

const quickLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/subjects", label: "Our Subjects" },
  { href: "/pricing", label: "Tuition Plans" },
  { href: "/contact", label: "Contact" },
];

const supportLinks = [
  { href: "#", label: "Help Center" },
  { href: "#", label: "Terms of Service" },
  { href: "#", label: "Privacy Policy" },
  { href: "#", label: "FAQ" },
];

const socialLinks = [
  { icon: Facebook, href: "#", label: "Facebook" },
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Youtube, href: "#", label: "YouTube" },
];

export function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 mb-12">
          {/* Brand Column (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <Link to="/" className="block">
              <div className="bg-white p-2 rounded-xl inline-block w-auto">
                <img
                  src="/logo.png"
                  alt={BRANDING.schoolName}
                  className="h-20 w-auto object-contain"
                />
              </div>
            </Link>
            <p className="text-slate-400 leading-relaxed max-w-sm">
              Empowering the next generation of learners with interactive, personalized, and accessible digital education. Join our community today.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:bg-orange-600 hover:text-white hover:border-orange-600 transition-all duration-300 shadow-sm hover:shadow-md"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links (2 cols) */}
          <div className="lg:col-span-2">
            <h4 className="font-display font-bold text-lg text-white mb-6">Quick Links</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-slate-400 hover:text-orange-500 transition-colors flex items-center group"
                  >
                    <span className="w-0 group-hover:w-2 h-0.5 bg-orange-500 mr-0 group-hover:mr-2 transition-all duration-300"></span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links (2 cols) */}
          <div className="lg:col-span-2">
            <h4 className="font-display font-bold text-lg text-white mb-6">Support</h4>
            <ul className="space-y-3">
              {supportLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-slate-400 hover:text-orange-500 transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Newsletter (4 cols) */}
          <div className="lg:col-span-4 space-y-8">
            <div>
              <h4 className="font-display font-bold text-lg text-white mb-6">Contact Us</h4>
              <ul className="space-y-4">
                <li className="flex items-start gap-3 text-slate-400">
                  <MapPin className="w-5 h-5 text-orange-500 mt-0.5 shrink-0" />
                  <span>{BRANDING.contact.address}</span>
                </li>
                <li className="flex items-center gap-3 text-slate-400">
                  <Mail className="w-5 h-5 text-orange-500 shrink-0" />
                  <a href={`mailto:${BRANDING.contact.email}`} className="hover:text-orange-500 transition-colors">
                    {BRANDING.contact.email}
                  </a>
                </li>
                <li className="flex items-center gap-3 text-slate-400">
                  <Phone className="w-5 h-5 text-orange-500 shrink-0" />
                  <a href={`tel:${BRANDING.contact.phone}`} className="hover:text-orange-500 transition-colors">
                    {BRANDING.contact.phone}
                  </a>
                </li>
              </ul>
            </div>

            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
              <h5 className="font-bold text-white mb-2">Subscribe to our newsletter</h5>
              <p className="text-sm text-slate-400 mb-4">Get the latest updates and learning tips.</p>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Email address"
                  className="bg-slate-950 border-slate-800 focus:ring-orange-500 text-white placeholder:text-slate-600"
                />
                <Button size="icon" className="bg-orange-600 hover:bg-orange-700 text-white shrink-0">
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} {BRANDING.schoolName}. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span>Designed with</span>
            <span className="text-red-500">♥</span>
            <span>for education</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
